"use client"

import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import { Box3, Mesh, Vector3, type Group } from "three"
import { LoopRepeat } from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// Loads the rigged skeleton GLB, auto-fits it to a sensible camera-friendly
// size on the ground plane, and plays a walk clip on toggle.
//
// Clip selection:
// - Walk: prefer a clip whose name contains "walk", then "run". If neither
//   exists but there's at least one clip, use the first as the walk cycle
//   (handles FBX→GLTF exports that name everything "Take 001").
// - Idle: prefer a clip whose name contains "idle". If none exists, no clip
//   plays in the idle state — the skeleton stops in its last pose.
export function SkeletonGLTF({ walking }: { walking: boolean }) {
  // The animation mixer attaches to `group`, the inner scene wrapper.
  // The auto-fit lives on a parent so we don't disturb skinning transforms.
  const fit = useRef<Group>(null)
  const group = useRef<Group>(null)

  const { scene, animations } = useGLTF(MODEL_PATH) as unknown as {
    scene: Group
    animations: import("three").AnimationClip[]
  }
  const { actions, names } = useAnimations(animations, group)

  // Compute scale + offset once per scene so the model is ~1.8 units tall and
  // sits on y = 0. Some FBX→GLTF exports come out at cm scale or shifted.
  const { scale, offset } = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new Box3()
    const tmp = new Box3()
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.computeBoundingBox()
        const localBox = mesh.geometry.boundingBox
        if (localBox) {
          tmp.copy(localBox).applyMatrix4(mesh.matrixWorld)
          box.union(tmp)
        }
      }
    })
    if (box.isEmpty()) return { scale: 1, offset: new Vector3() }
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const targetHeight = 1.8
    const s = size.y > 0 ? targetHeight / size.y : 1
    return {
      scale: s,
      offset: new Vector3(-center.x * s, -(center.y - size.y / 2) * s, -center.z * s),
    }
  }, [scene])

  const walkClip =
    names.find((n) => /walk/i.test(n)) ??
    names.find((n) => /run/i.test(n)) ??
    (names.length ? names[0] : null)

  const idleClip = names.find((n) => /idle/i.test(n)) ?? null

  useEffect(() => {
    if (!names.length) return

    if (walking) {
      const a = walkClip ? actions[walkClip] : null
      if (!a) return
      a.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.25).play()
      return () => {
        a.fadeOut(0.25)
      }
    }

    if (idleClip) {
      const a = actions[idleClip]
      if (!a) return
      a.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.25).play()
      return () => {
        a.fadeOut(0.25)
      }
    }

    const stops: Array<() => void> = []
    for (const name of names) {
      const a = actions[name]
      if (a && a.isRunning()) {
        a.fadeOut(0.25)
        stops.push(() => a.stop())
      }
    }
    const t = setTimeout(() => stops.forEach((fn) => fn()), 300)
    return () => clearTimeout(t)
  }, [walking, actions, names, walkClip, idleClip])

  return (
    <group ref={fit} scale={scale} position={offset}>
      <group ref={group} dispose={null}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
