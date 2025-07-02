"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PrizeTier } from "@/lib/supabase"

interface DrawResultProps {
  isDrawing: boolean
  result: PrizeTier | null
  calculateProbability: (tier: PrizeTier) => number
}

// パーティクル用のコンポーネント
const Particle = ({
  color,
  size,
  startX,
  startY,
  endX,
  endY,
  duration,
  delay = 0,
  shape = "circle",
}: {
  color: string
  size: number
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  delay?: number
  shape?: "circle" | "star" | "heart"
}) => {
  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: 0,
        scale: 0.3,
        rotate: 360,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: shape === "circle" ? color : "transparent",
        borderRadius: shape === "circle" ? "50%" : "0",
        zIndex: 10000,
      }}
    >
      {shape === "star" && (
        <div
          className="w-full h-full"
          style={{
            background: color,
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        />
      )}
      {shape === "heart" && (
        <div
          className="w-full h-full"
          style={{
            background: color,
            clipPath:
              "path('M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z')",
          }}
        />
      )}
    </motion.div>
  )
}

// 花火エフェクトコンポーネント
const Firework = ({ x, y, colors, delay = 0 }: { x: number; y: number; colors: string[]; delay?: number }) => {
  const particleCount = 20
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * 2 * Math.PI
    const distance = 100 + Math.random() * 100
    const endX = x + Math.cos(angle) * distance
    const endY = y + Math.sin(angle) * distance

    return {
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      endX,
      endY,
      duration: 1 + Math.random() * 0.5,
      particleDelay: Math.random() * 0.2,
    }
  })

  return (
    <>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          color={particle.color}
          size={particle.size}
          startX={x}
          startY={y}
          endX={particle.endX}
          endY={particle.endY}
          duration={particle.duration}
          delay={delay + particle.particleDelay}
          shape="star"
        />
      ))}
    </>
  )
}

// セレブレーションエフェクトコンポーネント
const CelebrationEffect = ({ prizeId }: { prizeId: string }) => {
  const [particles, setParticles] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const newParticles: any[] = []

    // 特賞エフェクト - 最も派手
    if (prizeId === "special") {
      // 金色の大量パーティクル
      for (let i = 0; i < 200; i++) {
        newParticles.push({
          id: `special-${i}`,
          color: ["#FFD700", "#FFC800", "#FFEC40", "#FFFFFF", "#FFE55C"][Math.floor(Math.random() * 5)],
          size: 6 + Math.random() * 8,
          startX: centerX + (Math.random() - 0.5) * 100,
          startY: centerY + (Math.random() - 0.5) * 100,
          endX: Math.random() * rect.width,
          endY: Math.random() * rect.height,
          duration: 2 + Math.random() * 2,
          delay: Math.random() * 1,
          shape: Math.random() > 0.5 ? "star" : "circle",
        })
      }

      // 花火エフェクト
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const fireworkX = Math.random() * rect.width
          const fireworkY = Math.random() * rect.height * 0.6
          setParticles((prev) => [
            ...prev,
            <Firework
              key={`firework-${i}`}
              x={fireworkX}
              y={fireworkY}
              colors={["#FFD700", "#FFC800", "#FFEC40", "#FFFFFF"]}
              delay={0}
            />,
          ])
        }, i * 300)
      }
    }

    // 1等エフェクト - とても派手
    else if (prizeId === "first") {
      for (let i = 0; i < 150; i++) {
        newParticles.push({
          id: `first-${i}`,
          color: ["#C0C0C0", "#E0E0E0", "#FFFFFF", "#B8B8B8", "#D3D3D3"][Math.floor(Math.random() * 5)],
          size: 5 + Math.random() * 7,
          startX: centerX + (Math.random() - 0.5) * 80,
          startY: centerY + (Math.random() - 0.5) * 80,
          endX: Math.random() * rect.width,
          endY: Math.random() * rect.height,
          duration: 1.5 + Math.random() * 1.5,
          delay: Math.random() * 0.8,
          shape: Math.random() > 0.6 ? "star" : "circle",
        })
      }

      // 銀色の花火
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const fireworkX = Math.random() * rect.width
          const fireworkY = Math.random() * rect.height * 0.6
          setParticles((prev) => [
            ...prev,
            <Firework
              key={`firework-first-${i}`}
              x={fireworkX}
              y={fireworkY}
              colors={["#C0C0C0", "#E0E0E0", "#FFFFFF"]}
              delay={0}
            />,
          ])
        }, i * 400)
      }
    }

    // 2等エフェクト - 派手
    else if (prizeId === "second") {
      for (let i = 0; i < 120; i++) {
        newParticles.push({
          id: `second-${i}`,
          color: ["#CD7F32", "#D89855", "#E0A370", "#B87333", "#DAA520"][Math.floor(Math.random() * 5)],
          size: 4 + Math.random() * 6,
          startX: centerX + (Math.random() - 0.5) * 60,
          startY: centerY + (Math.random() - 0.5) * 60,
          endX: Math.random() * rect.width,
          endY: Math.random() * rect.height,
          duration: 1.2 + Math.random() * 1.2,
          delay: Math.random() * 0.6,
          shape: Math.random() > 0.7 ? "star" : "circle",
        })
      }

      // 銅色の花火
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const fireworkX = Math.random() * rect.width
          const fireworkY = Math.random() * rect.height * 0.6
          setParticles((prev) => [
            ...prev,
            <Firework
              key={`firework-second-${i}`}
              x={fireworkX}
              y={fireworkY}
              colors={["#CD7F32", "#D89855", "#E0A370"]}
              delay={0}
            />,
          ])
        }, i * 500)
      }
    }

    // 3等エフェクト - 中程度
    else if (prizeId === "third") {
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: `third-${i}`,
          color: ["#008069", "#00a389", "#00c2a3", "#20B2AA", "#48D1CC"][Math.floor(Math.random() * 5)],
          size: 3 + Math.random() * 5,
          startX: centerX + (Math.random() - 0.5) * 40,
          startY: centerY + (Math.random() - 0.5) * 40,
          endX: Math.random() * rect.width,
          endY: Math.random() * rect.height,
          duration: 1 + Math.random() * 1,
          delay: Math.random() * 0.4,
          shape: "circle",
        })
      }

      // 緑色の花火
      setTimeout(() => {
        const fireworkX = centerX
        const fireworkY = centerY - 50
        setParticles((prev) => [
          ...prev,
          <Firework
            key="firework-third"
            x={fireworkX}
            y={fireworkY}
            colors={["#008069", "#00a389", "#00c2a3"]}
            delay={0}
          />,
        ])
      }, 200)
    }

    // 4等エフェクト - 控えめ
    else if (prizeId === "fourth") {
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: `fourth-${i}`,
          color: ["#008069", "#00a389", "#87CEEB", "#B0E0E6"][Math.floor(Math.random() * 4)],
          size: 3 + Math.random() * 4,
          startX: centerX + (Math.random() - 0.5) * 30,
          startY: centerY + (Math.random() - 0.5) * 30,
          endX: centerX + (Math.random() - 0.5) * 200,
          endY: centerY + (Math.random() - 0.5) * 200,
          duration: 0.8 + Math.random() * 0.8,
          delay: Math.random() * 0.3,
          shape: "circle",
        })
      }
    }

    // 5等エフェクト - 軽い
    else if (prizeId === "fifth") {
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: `fifth-${i}`,
          color: ["#008069", "#87CEEB", "#B0E0E6"][Math.floor(Math.random() * 3)],
          size: 2 + Math.random() * 3,
          startX: centerX + (Math.random() - 0.5) * 20,
          startY: centerY + (Math.random() - 0.5) * 20,
          endX: centerX + (Math.random() - 0.5) * 150,
          endY: centerY + (Math.random() - 0.5) * 150,
          duration: 0.6 + Math.random() * 0.6,
          delay: Math.random() * 0.2,
          shape: "circle",
        })
      }
    }

    // 参加賞エフェクト - 最小限
    else if (prizeId === "participation") {
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: `participation-${i}`,
          color: ["#008069", "#B0E0E6"][Math.floor(Math.random() * 2)],
          size: 2 + Math.random() * 2,
          startX: centerX + (Math.random() - 0.5) * 15,
          startY: centerY + (Math.random() - 0.5) * 15,
          endX: centerX + (Math.random() - 0.5) * 100,
          endY: centerY + (Math.random() - 0.5) * 100,
          duration: 0.5 + Math.random() * 0.5,
          delay: Math.random() * 0.1,
          shape: "circle",
        })
      }
    }

    // パーティクルを設定
    const particleElements = newParticles.map((particle) => (
      <Particle
        key={particle.id}
        color={particle.color}
        size={particle.size}
        startX={particle.startX}
        startY={particle.startY}
        endX={particle.endX}
        endY={particle.endY}
        duration={particle.duration}
        delay={particle.delay}
        shape={particle.shape}
      />
    ))

    setParticles(particleElements)

    // 5秒後にクリア
    const clearTimer = setTimeout(() => {
      setParticles([])
    }, 5000)

    return () => {
      clearTimeout(clearTimer)
    }
  }, [prizeId])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10000 }}>
      {particles}
    </div>
  )
}

export default function DrawResult({ isDrawing, result, calculateProbability }: DrawResultProps) {
  const [showResult, setShowResult] = useState(false)
  const [drawingStep, setDrawingStep] = useState(0)
  const [playSound, setPlaySound] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const specialSoundRef = useRef<HTMLAudioElement | null>(null)
  const highPrizeSoundRef = useRef<HTMLAudioElement | null>(null)
  const normalPrizeSoundRef = useRef<HTMLAudioElement | null>(null)
  const drawingSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== "undefined") {
      specialSoundRef.current = new window.Audio("/sounds/special-prize.mp3")
      highPrizeSoundRef.current = new window.Audio("/sounds/high-prize.mp3")
      normalPrizeSoundRef.current = new window.Audio("/sounds/normal-prize.mp3")
      drawingSoundRef.current = new window.Audio("/sounds/drawing.mp3")

      // Set loop for drawing sound
      if (drawingSoundRef.current) {
        drawingSoundRef.current.loop = true
      }

      setPlaySound(true)
    }

    return () => {
      // Clean up audio elements
      if (specialSoundRef.current) {
        specialSoundRef.current.pause()
        specialSoundRef.current = null
      }
      if (highPrizeSoundRef.current) {
        highPrizeSoundRef.current.pause()
        highPrizeSoundRef.current = null
      }
      if (normalPrizeSoundRef.current) {
        normalPrizeSoundRef.current.pause()
        normalPrizeSoundRef.current = null
      }
      if (drawingSoundRef.current) {
        drawingSoundRef.current.pause()
        drawingSoundRef.current.loop = false
        drawingSoundRef.current = null
      }
    }
  }, [])

  // Reset and manage drawing animation steps
  useEffect(() => {
    if (isDrawing) {
      setShowResult(false)
      setShowCelebration(false)
      setDrawingStep(0)

      // Play drawing sound
      if (playSound && drawingSoundRef.current) {
        drawingSoundRef.current.currentTime = 0
        drawingSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
      }

      // Create a sequence of animation steps
      const stepTimers = [
        setTimeout(() => setDrawingStep(1), 800),
        setTimeout(() => setDrawingStep(2), 1600),
        setTimeout(() => setDrawingStep(3), 2400),
      ]

      return () => {
        stepTimers.forEach((timer) => clearTimeout(timer))
        // Stop drawing sound
        if (drawingSoundRef.current) {
          drawingSoundRef.current.pause()
          drawingSoundRef.current.currentTime = 0
        }
      }
    }
  }, [isDrawing, playSound])

  // Handle result display and effects
  useEffect(() => {
    if (!isDrawing && result) {
      setShowResult(true)

      // Stop drawing sound
      if (drawingSoundRef.current) {
        drawingSoundRef.current.pause()
        drawingSoundRef.current.currentTime = 0
      }

      // Play appropriate sound based on prize tier
      if (playSound) {
        if (result.id === "special" && specialSoundRef.current) {
          specialSoundRef.current.currentTime = 0
          specialSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
        } else if ((result.id === "first" || result.id === "second") && highPrizeSoundRef.current) {
          highPrizeSoundRef.current.currentTime = 0
          highPrizeSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
        } else if (normalPrizeSoundRef.current) {
          normalPrizeSoundRef.current.currentTime = 0
          normalPrizeSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
        }
      }

      // Show celebration effects
      setShowCelebration(true)

      // Hide result after 5 seconds for all prize tiers
      const timer = setTimeout(() => {
        setShowResult(false)
        setShowCelebration(false)

        // Stop all sounds
        if (specialSoundRef.current) {
          specialSoundRef.current.pause()
          specialSoundRef.current.currentTime = 0
        }
        if (highPrizeSoundRef.current) {
          highPrizeSoundRef.current.pause()
          highPrizeSoundRef.current.currentTime = 0
        }
        if (normalPrizeSoundRef.current) {
          normalPrizeSoundRef.current.pause()
          normalPrizeSoundRef.current.currentTime = 0
        }
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isDrawing, result, playSound])

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9998 }}>
      {/* Celebration Effects */}
      {showCelebration && result && <CelebrationEffect prizeId={result.id} />}

      {/* Drawing animation sequence */}
      {isDrawing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center" style={{ zIndex: 9998 }}>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Initial spinning circle - MUCH LARGER */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 1.2, 1],
                rotate: [0, 180, 360, 720],
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="w-80 h-80 bg-[#008069] rounded-full flex items-center justify-center"
              style={{ zIndex: 9999 }}
            >
              <div className="text-white text-4xl font-bold">抽選中...</div>
            </motion.div>

            {/* Suspenseful animation elements - ENHANCED */}
            <AnimatePresence>
              {drawingStep >= 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-96 h-96 rounded-full border-8 border-white opacity-30"
                  style={{ zIndex: 9999 }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {drawingStep >= 2 && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [1, 2.5, 2],
                      opacity: [0.2, 0.5, 0.2],
                      rotate: [0, 180, 360],
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    className="absolute w-60 h-60 bg-white opacity-20 rounded-full"
                    style={{ zIndex: 9999 }}
                  />

                  {/* Additional light rays */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute w-full h-full flex items-center justify-center"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="w-full h-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform rotate-45"></div>
                    <div className="w-full h-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -rotate-45"></div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {drawingStep >= 3 && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={`text-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      className="absolute text-3xl font-bold"
                      style={{
                        top: i === 0 ? "20%" : i === 1 ? "70%" : i === 2 ? "30%" : "80%",
                        left: i === 0 ? "20%" : i === 1 ? "70%" : i === 2 ? "70%" : "25%",
                        color: "#ffffff",
                        textShadow: "0 0 10px #008069, 0 0 20px #008069, 0 0 30px #000000",
                        zIndex: 9999,
                      }}
                    >
                      {i % 2 === 0 ? "ドキドキ..." : "ワクワク..."}
                    </motion.div>
                  ))}

                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      initial={{
                        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                        opacity: 0,
                      }}
                      animate={{
                        y: [null, Math.random() * -200 + 100],
                        opacity: [0, 0.7, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                      }}
                      className="absolute w-3 h-3 rounded-full bg-white"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        zIndex: 9999,
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Result display with LARGER, MORE DYNAMIC animations */}
      <AnimatePresence>
        {showResult && result && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
            style={{ zIndex: 9998 }}
          >
            {/* Dynamic background effects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: 9998 }}
            >
              {(result.id === "special" || result.id === "first") && (
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                    scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ opacity: 0.3, zIndex: 9998 }}
                >
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-[200vh] w-4 bg-gradient-to-b from-transparent via-white to-transparent"
                      style={{
                        transform: `rotate(${i * 20}deg)`,
                        opacity: result.id === "special" ? 0.7 : 0.4,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Main result card - MUCH LARGER */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{
                scale: result.id === "special" ? [0, 1.2, 1] : [0, 1.1, 1],
                opacity: 1,
                y: 0,
              }}
              exit={{ scale: 0, opacity: 0, y: 50 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: result.id === "special" ? 300 : 200,
              }}
              className="bg-white rounded-xl p-12 shadow-2xl border-8 max-w-3xl w-[90vw] flex flex-col items-center"
              style={{
                borderColor:
                  result.id === "special"
                    ? "gold"
                    : result.id === "first"
                      ? "silver"
                      : result.id === "second"
                        ? "#cd7f32"
                        : "#008069",
                boxShadow:
                  result.id === "special"
                    ? "0 0 50px 20px rgba(255, 215, 0, 0.7)"
                    : result.id === "first"
                      ? "0 0 40px 15px rgba(192, 192, 192, 0.7)"
                      : result.id === "second"
                        ? "0 0 30px 10px rgba(205, 127, 50, 0.7)"
                        : "0 0 20px 5px rgba(0, 128, 105, 0.5)",
                zIndex: 9999,
              }}
            >
              <h2
                className={`text-4xl font-bold mb-6 text-center ${
                  result.id === "special" ? "text-[#FFD700]" : "text-[#008069]"
                }`}
              >
                抽選結果
              </h2>

              {/* Prize name with enhanced animations based on tier */}
              {result.id === "special" ? (
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    textShadow: [
                      "0 0 0px rgba(255,215,0,0)",
                      "0 0 20px rgba(255,215,0,0.8)",
                      "0 0 10px rgba(255,215,0,0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="text-8xl font-bold text-center my-8 text-[#FFD700]"
                  style={{ textShadow: "0 0 10px rgba(255,215,0,0.5)" }}
                >
                  {result.name}
                </motion.div>
              ) : result.id === "first" ? (
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      "0 0 0px rgba(192,192,192,0)",
                      "0 0 15px rgba(192,192,192,0.8)",
                      "0 0 5px rgba(192,192,192,0.5)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="text-7xl font-bold text-center my-8 text-[silver]"
                  style={{ textShadow: "0 0 5px rgba(192,192,192,0.5)" }}
                >
                  {result.name}
                </motion.div>
              ) : result.id === "second" ? (
                <motion.div
                  animate={{
                    scale: [1, 1.03, 1],
                    textShadow: [
                      "0 0 0px rgba(205,127,50,0)",
                      "0 0 10px rgba(205,127,50,0.8)",
                      "0 0 5px rgba(205,127,50,0.5)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="text-7xl font-bold text-center my-8 text-[#cd7f32]"
                  style={{ textShadow: "0 0 5px rgba(205,127,50,0.5)" }}
                >
                  {result.name}
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    scale: result.id === "third" ? [1, 1.02, 1] : [1, 1.01, 1],
                  }}
                  transition={{
                    duration: result.id === "third" ? 2 : 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className={`text-${result.id === "third" ? "6xl" : result.id === "fourth" ? "5xl" : "4xl"} font-bold text-center my-8`}
                  style={{
                    color: result.id === "third" ? "#008069" : result.id === "fourth" ? "#008069" : "#666666",
                    textShadow: result.id === "third" ? "0 0 5px rgba(0,128,105,0.3)" : "none",
                  }}
                >
                  {result.name}
                </motion.div>
              )}

              {/* Congratulations message with tier-based styling */}
              <div
                className={`text-center ${
                  result.id === "special"
                    ? "text-2xl font-bold"
                    : result.id === "first" || result.id === "second"
                      ? "text-xl font-bold"
                      : "text-lg"
                }`}
                style={{
                  color:
                    result.id === "special"
                      ? "#FFD700"
                      : result.id === "first"
                        ? "#A0A0A0"
                        : result.id === "second"
                          ? "#CD7F32"
                          : "#666666",
                }}
              >
                {result.id === "special"
                  ? "大当たり！おめでとうございます！"
                  : result.id === "first" || result.id === "second"
                    ? "おめでとうございます！"
                    : "おめでとうございます"}
              </div>

              {(result.id === "special" || result.id === "first" || result.id === "second") && (
                <div className="absolute -inset-4 pointer-events-none" style={{ zIndex: 9999 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-full h-full"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          delay: i * 0.2,
                        }}
                        className="absolute w-8 h-8 rounded-full"
                        style={{
                          backgroundColor:
                            result.id === "special" ? "#FFD700" : result.id === "first" ? "#C0C0C0" : "#CD7F32",
                          top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 12)}%`,
                          left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 12)}%`,
                          boxShadow: `0 0 15px ${
                            result.id === "special" ? "#FFD700" : result.id === "first" ? "#C0C0C0" : "#CD7F32"
                          }`,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audio elements for sound effects */}
      <audio src="/sounds/drawing.mp3" preload="auto" />
      <audio src="/sounds/special-prize.mp3" preload="auto" />
      <audio src="/sounds/high-prize.mp3" preload="auto" />
      <audio src="/sounds/normal-prize.mp3" preload="auto" />
    </div>
  )
}
