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
    <div className="min-h-screen bg-white relative">
      <Canvas
        camera={{ position: [0, 1.0, 3.0], fov: 50 }}
        className="!fixed inset-0"
      >
        <color attach="background" args={["#ffffff"]} />

        {/* Studio lighting + envmap for the glossy translucent blue look. */}
        <Environment preset="studio" environmentIntensity={0.8} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 6, 4]} intensity={1.2} />
        <directionalLight position={[-4, 3, -2]} intensity={0.6} />

        <Suspense fallback={null}>
          <SkeletonGLTF walking={walking} />
        </Suspense>

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

      <div className="fixed bottom-[6vh] left-0 right-0 z-10 text-center font-mono pointer-events-none">
        <div
          className="text-[4.5vh] tracking-[0.4em] font-bold uppercase"
          style={{
            color: "#2da6ff",
            opacity: walking ? 1 : 0.45,
            textShadow: walking ? "0 0 18px rgba(45, 166, 255, 0.7)" : "none",
          }}
        >
          {walking ? "in motion" : "not in motion"}
        </div>
      </div>

      <audio ref={audioRef} hidden />
    </div>
  )
}
