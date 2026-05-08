"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Box3, Mesh, Object3D, Vector3, type Group } from "three"

const MODEL_PATH = "/models/skeleton.glb"

useGLTF.preload(MODEL_PATH)

// The supplied GLB packages an "assembled skeleton" subtree (named SK_Pelvis,
// containing SK_Spine → SK_Cranium → SK_RibCage → SK_Clavicle → ... and
// SK_Femur → SK_Tibia → SK_Tarsal → ...) alongside a separated "anatomy
// showcase" of the same parts laid out next to it. We isolate the assembled
// subtree by hiding everything that isn't a descendant of SK_Pelvis.
const ASSEMBLED_ROOT_NAME = "SK_Pelvis"

export function SkeletonGLTF({ walking }: { walking: boolean }) {
  const root = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATH) as unknown as { scene: Group }

  const { scale, offset } = useMemo(() => {
    const assembled = scene.getObjectByName(ASSEMBLED_ROOT_NAME) as Object3D | undefined

    if (assembled) {
      // Mark every node visible by default, then hide anything not under the
      // assembled root.
      const keep = new Set<Object3D>()
      assembled.traverse((o) => keep.add(o))
      scene.traverse((o) => {
        // Don't hide ancestors of the assembled root or we lose its transform.
        if (keep.has(o)) {
          o.visible = true
          return
        }
        let n: Object3D | null = o
        let isAncestor = false
        while (n) {
          if (n === assembled) {
            isAncestor = true
            break
          }
          n = n.parent
        }
        if (!isAncestor) {
          // If `o` is itself an ancestor of `assembled`, leave it visible (its
          // direct mesh contributions are what we want to keep transparent).
          // Otherwise hide it.
          let cursor: Object3D | null = assembled
          let oIsAncestorOfAssembled = false
          while (cursor) {
            if (cursor === o) {
              oIsAncestorOfAssembled = true
              break
            }
            cursor = cursor.parent
          }
          if (!oIsAncestorOfAssembled) o.visible = false
        }
      })
    }

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
