# amaran-bridge

Redis-backed worker that connects the Vercel-hosted `/trs80` page to your local Amaran lights. **No public port, no tunnel.** All connections are outbound from this machine.

```
Vercel /api/trs80/amaran/*   ---RPUSH cmd---->   Upstash Redis
                             <--polled snap----
                                                  ^
                                                  | LPOP cmd
                                                  | SET reply
                                                  |
                                       this worker on your Mac
                                                  |
                                                  v
                                       ws://localhost:60124
                                                  |
                                                  v
                                       amaran desktop app -> lights
```

## Prereqs

- macOS with the **amaran desktop app** installed and running
- Lights paired in the desktop app
- Node 22+ (`node --version`)
- The project's root `.env.local` contains `KV_REST_API_URL` + `KV_REST_API_TOKEN` (auto-provisioned by the Vercel ↔ Upstash Marketplace integration). The worker reads them via `--env-file=../.env.local`.

If your root `.env.local` is missing those, pull from Vercel:

```bash
cd ..
vercel env pull .env.local
cd amaran-bridge
```

## Run

```bash
npm install
npm start
```

You should see:
```
[bridge] amaran websocket: ws://localhost:60124
[bridge] worker started, polling Redis…
```

Open `/trs80` on Vercel — the AMARAN section should populate within ~5 seconds.

## Keep it running

The worker has to be alive for the buttons to work. Easiest persistent setup:

```bash
npm i -g pm2
pm2 start "node --env-file=../.env.local --experimental-strip-types worker.ts" --name amaran-bridge --cwd $(pwd)
pm2 save
pm2 startup    # follow the printed sudo command
```

Stop the Mac from sleeping while plugged in: System Settings → Battery → Options → "Prevent automatic sleeping…".

## Protocol

- `amaran:cmds` — Redis list. Vercel `RPUSH`es JSON commands; worker `LPOP`s and executes.
- `amaran:reply:<reqId>` — short-lived (60s TTL). Worker writes the result; Vercel polls for it.
- `amaran:snapshot` — full device list with current on/off state. Refreshed every 5s by the worker, TTL 30s. The Vercel `/devices` endpoint just reads this — no round-trip when the worker is healthy.

Commands:

```ts
{ type: "toggle", deviceId: string, reqId: string }
{ type: "refresh", reqId: string }
```
