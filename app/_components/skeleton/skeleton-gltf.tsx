"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Box3, Mesh, Vector3, type Group } from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// The supplied GLB packages the assembled skeleton next to a separated
// "anatomy showcase" of named parts (Skull, RibCage, Spine, Pelvis, Jaw,
// SK_Pelvis, Teeth.*). We hide the showcase so only the assembled figure
// (the Plane.XXX nodes) is visible.
const HIDE_NODES = /^(RibCage|SK_Pelvis|Skull|Spine|Pelvis|Jaw|Teeth)(\b|\.|$)/

export function SkeletonGLTF({ walking }: { walking: boolean }) {
  const root = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATH) as unknown as { scene: Group }

  // Hide the showcase parts and compute a tight bounding box around what
  // remains so we can scale-and-center the assembled skeleton on the ground.
  const { scale, offset } = useMemo(() => {
    scene.traverse((obj) => {
      if (HIDE_NODES.test(obj.name)) obj.visible = false
    })
    scene.updateMatrixWorld(true)

    const box = new Box3()
    const tmp = new Box3()
    scene.traverseVisible((obj) => {
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

    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const targetHeight = 1.8
    const s = size.y > 0 ? targetHeight / size.y : 1
    return {
      scale: s,
      offset: new Vector3(-center.x * s, -(center.y - size.y / 2) * s, -center.z * s),
    }
  }, [scene])

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
