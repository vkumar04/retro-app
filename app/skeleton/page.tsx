"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import Link from "next/link"
import { Suspense } from "react"
import { SkeletonRig } from "@/app/_components/skeleton/skeleton-rig"
import { useGertyStore } from "@/lib/gerty-store"

export default function SkeletonPage() {
  const walking = useGertyStore((s) => s.skeletonWalking)

  return (
    <div className="min-h-screen bg-background relative">
      <Canvas
        shadows
        camera={{ position: [0, 1.4, 3.5], fov: 40 }}
        className="!fixed inset-0"
      >
        <color attach="background" args={["#08120c"]} />
        <fog attach="fog" args={["#08120c", 4, 12]} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.25} color="#7fffb2" />

        <Suspense fallback={null}>
          <SkeletonRig walking={walking} />
        </Suspense>

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 64]} />
          <meshStandardMaterial color="#0d1a12" roughness={1} />
        </mesh>
        {/* Subtle grid lines */}
        <gridHelper args={[6, 12, "#1c2a20", "#162018"]} position={[0, 0.001, 0]} />

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0.9, 0]}
        />
      </Canvas>

      <header className="fixed top-0 left-0 right-0 p-4 z-10 flex items-center justify-between font-mono text-xs">
        <Link href="/admin" className="text-terminal-green hover:underline">
          {"<"} ADMIN
        </Link>
        <div className="text-terminal-amber tracking-[0.4em]">SKELETON</div>
        <div className="text-muted-foreground">
          {walking ? (
            <span className="text-terminal-green">● WALKING</span>
          ) : (
            <span>○ IDLE</span>
          )}
        </div>
      </header>

      <footer className="fixed bottom-0 left-0 right-0 p-4 z-10 text-center font-mono text-[10px] text-muted-foreground">
        v0 // primitives rig // refine on next pass
      </footer>
    </div>
  )
}
