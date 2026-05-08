"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import Link from "next/link"
import { Suspense } from "react"
import { SkeletonGLTF } from "@/app/_components/skeleton/skeleton-gltf"
import { useGertyStore } from "@/lib/gerty-store"

export default function SkeletonPage() {
  const walking = useGertyStore((s) => s.skeletonWalking)

  return (
    <div className="min-h-screen bg-background relative">
      <Canvas
        shadows
        // Camera framed for a tall (portrait) viewport — model sits on the
        // ground plane and stays fully visible without head clipping.
        camera={{ position: [0, 1.6, 4.2], fov: 35 }}
        className="!fixed inset-0"
      >
        <color attach="background" args={["#08120c"]} />
        <fog attach="fog" args={["#08120c", 5, 14]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.3} color="#7fffb2" />

        <Suspense fallback={null}>
          <SkeletonGLTF walking={walking} />
        </Suspense>

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3.5, 64]} />
          <meshStandardMaterial color="#0d1a12" roughness={1} />
        </mesh>
        <gridHelper args={[7, 14, "#1c2a20", "#162018"]} position={[0, 0.001, 0]} />

        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 1.0, 0]}
        />
      </Canvas>

      <header className="fixed top-0 left-0 right-0 px-4 py-3 z-10 flex items-center justify-between font-mono text-[11px]">
        <Link href="/admin" className="text-terminal-green hover:underline">
          {"<"} ADMIN
        </Link>
        <div className="text-terminal-amber tracking-[0.4em]">SKELETON</div>
        <div>
          {walking ? (
            <span className="text-terminal-green">● WALKING</span>
          ) : (
            <span className="text-muted-foreground">○ IDLE</span>
          )}
        </div>
      </header>

      <footer className="fixed bottom-0 left-0 right-0 px-4 py-3 z-10 text-center font-mono text-[10px] text-muted-foreground">
        anatomical skeleton (static mesh) // walk = sway placeholder until rig
      </footer>
    </div>
  )
}
