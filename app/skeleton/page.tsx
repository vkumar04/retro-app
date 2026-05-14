"use client"

import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import Link from "next/link"
import { Suspense, useEffect, useRef } from "react"
import { SkeletonGLTF } from "@/app/_components/skeleton/skeleton-gltf"
import { useSpeaker } from "@/hooks/use-speaker"
import { useGertyActions, useGertyStore } from "@/lib/gerty-store"

export default function SkeletonPage() {
  // Source of truth: the global gerty store. Admin's WALK / STOP buttons
  // update `skeletonWalking` and the change broadcasts here via SSE.
  const walking = useGertyStore((s) => s.skeletonWalking)
  const { setSkeletonWalking } = useGertyActions()
  const { audioRef, speak } = useSpeaker()
  const prevWalking = useRef(walking)

  // Speak "in motion" when the skeleton transitions into walking.
  useEffect(() => {
    if (walking && !prevWalking.current) {
      speak("in motion")
    }
    prevWalking.current = walking
  }, [walking, speak])

  // Auto-start walking when the page first opens — most visits want to see
  // movement, not the bind pose. After this, the admin toggle takes over.
  useEffect(() => {
    if (!walking) setSkeletonWalking(true)
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      <Canvas
        shadows
        // Camera framed for a tall (portrait) viewport — model sits on the
        // ground plane and stays fully visible without head clipping.
        camera={{ position: [0, 1.0, 3.0], fov: 50 }}
        className="!fixed inset-0"
      >
        <color attach="background" args={["#08120c"]} />
        <fog attach="fog" args={["#08120c", 5, 14]} />

        {/* Environment provides an IBL envmap so PBR materials (metallic/rough)
            actually render. Without it, Meshy/glTF models often appear black or
            invisible because they rely on reflected ambient light. */}
        <Environment preset="city" environmentIntensity={0.6} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#7fffb2" />

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

      <audio ref={audioRef} hidden />
    </div>
  )
}
