import "dotenv/config"
import IORedis from "ioredis"

const SRC = process.env.UPSTASH_REDIS_URL
const DST = process.env.RAILWAY_REDIS_URL

if (!SRC || !DST) {
  console.error("Set UPSTASH_REDIS_URL and RAILWAY_REDIS_URL in env")
  process.exit(1)
}

async function main() {
  const src = new IORedis(SRC!, { lazyConnect: true })
  const dst = new IORedis(DST!, { lazyConnect: true })
  await src.connect()
  await dst.connect()

  let cursor = "0"
  let copied = 0
  let skipped = 0

  do {
    const [next, batch] = await src.scan(cursor, "COUNT", 200)
    cursor = next
    if (batch.length === 0) continue

    for (const key of batch) {
      const type = await src.type(key)
      const ttl = await src.pttl(key)

      try {
        if (type === "string") {
          const value = await src.get(key)
          if (value === null) {
            skipped++
            continue
          }
          if (ttl > 0) await dst.set(key, value, "PX", ttl)
          else await dst.set(key, value)
        } else if (type === "hash") {
          const all = await src.hgetall(key)
          if (Object.keys(all).length > 0) {
            await dst.hset(key, all)
            if (ttl > 0) await dst.pexpire(key, ttl)
          }
        } else if (type === "list") {
          const items = await src.lrange(key, 0, -1)
          if (items.length > 0) {
            await dst.del(key)
            await dst.rpush(key, ...items)
            if (ttl > 0) await dst.pexpire(key, ttl)
          }
        } else if (type === "set") {
          const members = await src.smembers(key)
          if (members.length > 0) {
            await dst.del(key)
            await dst.sadd(key, ...members)
            if (ttl > 0) await dst.pexpire(key, ttl)
          }
        } else if (type === "zset") {
          const items = await src.zrange(key, 0, -1, "WITHSCORES")
          if (items.length > 0) {
            await dst.del(key)
            const args: (string | number)[] = []
            for (let i = 0; i < items.length; i += 2) args.push(Number(items[i + 1]), items[i])
            await dst.zadd(key, ...args)
            if (ttl > 0) await dst.pexpire(key, ttl)
          }
        } else {
          console.warn(`unsupported type for ${key}: ${type}`)
          skipped++
          continue
        }
        copied++
        if (copied % 50 === 0) console.log(`copied ${copied}…`)
      } catch (err) {
        console.error(`failed on ${key}:`, err)
        skipped++
      }
    }
  } while (cursor !== "0")

  console.log(`done. copied=${copied} skipped=${skipped}`)

  const srcCount = await src.dbsize()
  const dstCount = await dst.dbsize()
  console.log(`src dbsize=${srcCount} dst dbsize=${dstCount}`)

  await src.quit()
  await dst.quit()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
