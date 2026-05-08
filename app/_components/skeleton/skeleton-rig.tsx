"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group } from "three"

const BONE_COLOR = "#f1ead2"

// First-iteration humanoid rig built from primitives. Refine later by
// swapping individual bones for higher-fidelity meshes or a GLTF skeleton.
export function SkeletonRig({ walking }: { walking: boolean }) {
  const root = useRef<Group>(null)
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
  const leftKnee = useRef<Group>(null)
  const rightKnee = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftElbow = useRef<Group>(null)
  const rightElbow = useRef<Group>(null)

  // Smoothly ramp the walk amplitude so starting/stopping doesn't snap.
  const amp = useRef(0)
  const phase = useRef(0)

  useFrame((_, delta) => {
    const target = walking ? 1 : 0
    amp.current += (target - amp.current) * Math.min(1, delta * 6)

    if (amp.current > 0.001) {
      phase.current += delta * 5 // walking cadence
    }
    const t = phase.current

    const swing = Math.sin(t) * 0.7 * amp.current
    const opposite = -swing

    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = opposite
    if (leftArm.current) leftArm.current.rotation.x = opposite
    if (rightArm.current) rightArm.current.rotation.x = swing

    // Knees bend more on the back-swing of each leg (negative rotation phase).
    const leftBend = Math.max(0, -Math.sin(t)) * 1.1 * amp.current
    const rightBend = Math.max(0, Math.sin(t)) * 1.1 * amp.current
    if (leftKnee.current) leftKnee.current.rotation.x = leftBend
    if (rightKnee.current) rightKnee.current.rotation.x = rightBend

    // Slight elbow bend mirrors knees.
    if (leftElbow.current) leftElbow.current.rotation.x = -rightBend * 0.5
    if (rightElbow.current) rightElbow.current.rotation.x = -leftBend * 0.5

    // Subtle pelvis bounce as legs swing.
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(t * 2)) * 0.05 * amp.current
    }
  })

  return (
    <group ref={root}>
      {/* Skull */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
      </mesh>
      {/* Eye sockets */}
      <mesh position={[-0.08, 1.72, 0.18]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.08, 1.72, 0.18]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Jaw */}
      <mesh position={[0, 1.55, 0.04]}>
        <boxGeometry args={[0.18, 0.06, 0.16]} />
        <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
      </mesh>

      {/* Cervical spine */}
      <Bone position={[0, 1.42, 0]} size={[0.06, 0.12, 0.06]} />

      {/* Ribcage — a stack of subtle ribs */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 1.3 - i * 0.08, 0]}>
          <torusGeometry args={[0.18 - i * 0.005, 0.018, 8, 24]} />
          <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
        </mesh>
      ))}
      {/* Sternum */}
      <Bone position={[0, 1.18, 0.16]} size={[0.05, 0.4, 0.04]} />

      {/* Lumbar spine */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[0, 0.86 - i * 0.06, 0]}>
          <boxGeometry args={[0.07, 0.05, 0.07]} />
          <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
        </mesh>
      ))}

      {/* Pelvis */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.36, 0.14, 0.22]} />
        <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
      </mesh>

      {/* Legs — pivot at hip */}
      <group ref={leftLeg} position={[-0.11, 0.62, 0]}>
        <Bone position={[0, -0.25, 0]} size={[0.07, 0.5, 0.07]} />
        <group ref={leftKnee} position={[0, -0.5, 0]}>
          <Bone position={[0, -0.25, 0]} size={[0.06, 0.5, 0.06]} />
          {/* Foot */}
          <mesh position={[0, -0.52, 0.06]}>
            <boxGeometry args={[0.09, 0.05, 0.22]} />
            <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
          </mesh>
        </group>
      </group>
      <group ref={rightLeg} position={[0.11, 0.62, 0]}>
        <Bone position={[0, -0.25, 0]} size={[0.07, 0.5, 0.07]} />
        <group ref={rightKnee} position={[0, -0.5, 0]}>
          <Bone position={[0, -0.25, 0]} size={[0.06, 0.5, 0.06]} />
          <mesh position={[0, -0.52, 0.06]}>
            <boxGeometry args={[0.09, 0.05, 0.22]} />
            <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Arms — pivot at shoulder */}
      <group ref={leftArm} position={[-0.24, 1.32, 0]}>
        <Bone position={[0, -0.2, 0]} size={[0.05, 0.4, 0.05]} />
        <group ref={leftElbow} position={[0, -0.4, 0]}>
          <Bone position={[0, -0.2, 0]} size={[0.045, 0.4, 0.045]} />
          {/* Hand */}
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[0.07, 0.08, 0.04]} />
            <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
          </mesh>
        </group>
      </group>
      <group ref={rightArm} position={[0.24, 1.32, 0]}>
        <Bone position={[0, -0.2, 0]} size={[0.05, 0.4, 0.05]} />
        <group ref={rightElbow} position={[0, -0.4, 0]}>
          <Bone position={[0, -0.2, 0]} size={[0.045, 0.4, 0.045]} />
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[0.07, 0.08, 0.04]} />
            <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Bone({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={BONE_COLOR} roughness={0.7} />
    </mesh>
  )
}
