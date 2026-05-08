"use client"

import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useRef } from "react"
import type { Group } from "three"
import { LoopRepeat } from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// KayKit Skeleton (CC0). Rigged with bundled animation clips. We pick a
// "walk" clip when walking is true, otherwise an "idle" clip; the active
// clip crossfades on toggle.
export function SkeletonGLTF({ walking }: { walking: boolean }) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(MODEL_PATH) as unknown as {
    scene: Group
    animations: import("three").AnimationClip[]
  }
  const { actions, names } = useAnimations(animations, group)

  const walkClip =
    names.find((n) => /walk/i.test(n)) ??
    names.find((n) => /run/i.test(n)) ??
    null
  const idleClip =
    names.find((n) => /idle/i.test(n)) ??
    names.find((n) => /^stand/i.test(n)) ??
    (names.length ? names[0] : null)

  useEffect(() => {
    if (!names.length) return
    const target = walking ? walkClip : idleClip
    if (!target) return
    const targetAction = actions[target]
    if (!targetAction) return
    targetAction.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.25).play()
    return () => {
      targetAction.fadeOut(0.25)
    }
  }, [walking, actions, names, walkClip, idleClip])

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}
