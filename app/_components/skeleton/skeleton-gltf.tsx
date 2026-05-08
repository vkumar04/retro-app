"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Box3, Vector3, type Group } from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// The supplied anatomical skeleton has no rig or animation clips, so we
// display it static and animate the whole figure with a subtle sway when
// "walking" is on. Once we have a rigged model we'll swap this for true
// per-bone animation.
export function SkeletonGLTF({ walking }: { walking: boolean }) {
  const root = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATH) as unknown as { scene: Group }

  // The source GLB is exported from FBX in cm and not centered. Compute its
  // world-space bounding box once and derive a scale + offset so the model
  // is ~1.8 units tall and stands on y = 0.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const targetHeight = 1.8
    const s = size.y > 0 ? targetHeight / size.y : 1
    return {
      scale: s,
      offset: new Vector3(-center.x * s, -(center.y - size.y / 2) * s, -center.z * s),
    }
  }, [scene])

  // Smoothly ramp the sway amplitude on toggle so it doesn't pop.
  const amp = useRef(0)

  useFrame((state, dt) => {
    const target = walking ? 1 : 0
    amp.current += (target - amp.current) * Math.min(1, dt * 5)
    if (!root.current) return
    if (amp.current < 0.001) {
      root.current.rotation.set(0, 0, 0)
      root.current.position.y = 0
      return
    }
    const t = state.clock.elapsedTime * 2.6
    root.current.rotation.z = Math.sin(t) * 0.045 * amp.current
    root.current.rotation.y = Math.sin(t * 0.5) * 0.06 * amp.current
    root.current.position.y = Math.abs(Math.sin(t)) * 0.04 * amp.current
  })

  return (
    <group ref={root}>
      <group scale={scale} position={offset}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
