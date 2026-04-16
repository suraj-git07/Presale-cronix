import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

export function ScrollTracker() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollY } = useScroll()

  // Extended scroll range to reach footer (4000px instead of 2500px)
  // Create spiral motion using multiple transform layers
  
  // ORB 1 - Right spiral (clockwise)
  const orb1Y = useTransform(scrollY, [0, 4000], [0, 4000])
  const orb1X = useTransform(scrollY, [0, 4000], [0, 200])
  const orb1Rotate = useTransform(scrollY, [0, 4000], [0, 720])
  const orb1Scale = useTransform(scrollY, [0, 400, 2000, 3600, 4000], [0.5, 1, 1.1, 1, 0.5])
  const orb1Opacity = useTransform(scrollY, [0, 200, 3800, 4000], [0, 1, 1, 0])

  // ORB 2 - Left spiral (counter-clockwise) 
  const orb2Y = useTransform(scrollY, [200, 4200], [100, 4100])
  const orb2X = useTransform(scrollY, [200, 4200], [-150, -350])
  const orb2Rotate = useTransform(scrollY, [200, 4200], [-360, -1080])
  const orb2Scale = useTransform(scrollY, [200, 600, 2200, 3700, 4200], [0.3, 1.2, 1, 1, 0.3])
  const orb2Opacity = useTransform(scrollY, [200, 400, 3800, 4200], [0, 1, 1, 0])

  // ORB 3 - Wavy spiral (sine wave pattern)
  const orb3Y = useTransform(scrollY, [400, 4300], [200, 4100])
  const orb3X = useTransform(scrollY, [400, 4300], [100, -150])
  const orb3Rotate = useTransform(scrollY, [400, 4300], [0, -720])
  const orb3Scale = useTransform(scrollY, [400, 800, 2100, 3800, 4300], [0.4, 1.3, 1.1, 1, 0.4])
  const orb3Opacity = useTransform(scrollY, [400, 600, 3900, 4300], [0, 1, 1, 0])

  // Connecting line animation
  const lineHeight = useTransform(scrollY, [0, 4000], [0, 4000])
  const lineOpacity = useTransform(scrollY, [0, 300, 3700, 4000], [0, 0.6, 0.6, 0])

  // Particle trail effect transforms
  const particleY = useTransform(scrollY, [0, 4000], [0, 4000])
  const particleOpacity = useTransform(scrollY, [0, 300, 3700, 4000], [0, 0.4, 0.4, 0])

  if (reduceMotion) return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ height: '100vh', zIndex: 5 }}
    >
      {/* Central connecting line */}
      <motion.div
        className="absolute left-1/2 top-0 w-1 -translate-x-1/2 bg-gradient-to-b from-cyan-500/30 via-purple-500/30 to-transparent"
        style={{
          height: lineHeight,
          opacity: lineOpacity,
          boxShadow: '0 0 20px rgba(34,211,238,0.4), 0 0 40px rgba(168,85,247,0.2)',
        }}
      />

      {/* Orb 1 - Right spiral (clockwise) */}
      <motion.div
        className="absolute left-1/2 top-0 h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 -translate-x-1/2 -translate-y-1/2 shadow-2xl"
        style={{
          y: orb1Y,
          x: orb1X,
          rotate: orb1Rotate,
          scale: orb1Scale,
          opacity: orb1Opacity,
          boxShadow: '0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.3), inset 0 0 20px rgba(255,255,255,0.3)',
          filter: 'blur(1px)',
        }}
      />

      {/* Orb 2 - Left spiral (counter-clockwise) */}
      <motion.div
        className="absolute left-1/2 top-0 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 -translate-x-1/2 -translate-y-1/2 shadow-2xl"
        style={{
          y: orb2Y,
          x: orb2X,
          rotate: orb2Rotate,
          scale: orb2Scale,
          opacity: orb2Opacity,
          boxShadow: '0 0 40px rgba(168,85,247,0.7), 0 0 80px rgba(168,85,247,0.4), inset 0 0 25px rgba(255,255,255,0.2)',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Orb 3 - Wavy spiral */}
      <motion.div
        className="absolute left-1/2 top-0 h-16 w-16 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-cyan-600 -translate-x-1/2 -translate-y-1/2 shadow-2xl"
        style={{
          y: orb3Y,
          x: orb3X,
          rotate: orb3Rotate,
          scale: orb3Scale,
          opacity: orb3Opacity,
          boxShadow: '0 0 25px rgba(34,211,238,0.5), 0 0 50px rgba(168,85,247,0.3), inset 0 0 15px rgba(255,255,255,0.4)',
          filter: 'blur(1.5px)',
        }}
      />

      {/* Particle trail effect */}
      <motion.div
        className="absolute left-1/2 top-0 h-2 w-2 rounded-full bg-cyan-300 -translate-x-1/2 -translate-y-1/2"
        style={{
          y: particleY,
          opacity: particleOpacity,
          boxShadow: '0 0 10px rgba(34,211,238,0.8)',
        }}
      />
    </div>
  )
}
