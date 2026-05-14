"use client"

import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import {
  Box3,
  Color,
  type Group,
  type Mesh,
  MeshPhysicalMaterial,
  Vector3,
} from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// Render the GLB the way Mac Preview / Quick Look does: native orientation,
// auto-fit to a target size, and play the first embedded animation clip.
export function SkeletonGLTF({ walking }: { walking: boolean }) {
  const { scene, animations } = useGLTF(MODEL_PATH) as unknown as {
    scene: Group
    animations: import("three").AnimationClip[]
  }

  const group = useRef<Group>(null)
  const { actions, names } = useAnimations(animations, group)

  // Override every mesh's material with a glossy translucent blue PBR
  // material — matches the medical-render reference image.
  useEffect(() => {
    const blue = new MeshPhysicalMaterial({
      color: new Color("#2da6ff"),
      roughness: 0.25,
      metalness: 0.0,
      transmission: 0.35,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    })
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh) {
        mesh.material = blue
        mesh.castShadow = false
        mesh.receiveShadow = false
      }
    })
  }, [scene])

  // Auto-fit: scale so the model's longest dimension is ~2 units, then drop
  // it onto y=0 so it stands on the ground plane.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const longest = Math.max(size.x, size.y, size.z) || 1
    const s = 2 / longest
    return {
      scale: s,
      offset: new Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    }
  }, [scene])

  useEffect(() => {
    const name = names[0]
    if (!name) return
    const action = actions[name]
    if (!action) return
    if (walking) {
      action.reset().play()
    } else {
      action.stop()
    }
    return () => {
      action.stop()
    }
  }, [walking, actions, names])

  return (
    <group ref={group} position={offset} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}
