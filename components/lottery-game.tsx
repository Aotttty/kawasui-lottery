"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import AdminPanel from "@/components/admin-panel"
import DrawResult from "@/components/draw-result"
import { motion } from "framer-motion"
import { supabase, type PrizeTier } from "@/lib/supabase"

export default function LotteryGame() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinError, setPinError] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState<PrizeTier | null>(null)
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([])
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<PrizeTier | null>(null)

  // Audio refs for testing
  const specialSoundRef = useRef<HTMLAudioElement | null>(null)
  const highPrizeSoundRef = useRef<HTMLAudioElement | null>(null)
  const normalSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements for testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      specialSoundRef.current = new window.Audio("/sounds/special-prize.mp3")
      highPrizeSoundRef.current = new window.Audio("/sounds/high-prize.mp3")
      normalSoundRef.current = new window.Audio("/sounds/normal-prize.mp3")
    }

    return () => {
      if (specialSoundRef.current) {
        specialSoundRef.current.pause()
        specialSoundRef.current = null
      }
      if (highPrizeSoundRef.current) {
        highPrizeSoundRef.current.pause()
        highPrizeSoundRef.current = null
      }
      if (normalSoundRef.current) {
        normalSoundRef.current.pause()
        normalSoundRef.current = null
      }
    }
  }, [])

  // Load prize tiers from Supabase on component mount
  useEffect(() => {
    fetchPrizeTiers()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("prize_tiers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prize_tiers",
        },
        (payload) => {
          console.log("Real-time update:", payload)
          fetchPrizeTiers()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPrizeTiers = async () => {
    try {
      const { data, error } = await supabase.from("prize_tiers").select("*").order("id")

      if (error) {
        console.error("Error fetching prize tiers:", error)
        return
      }

      if (data) {
        setPrizeTiers(data)
        console.log("Fetched prize tiers:", data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate probability for a prize tier based on current inventory
  const calculateProbability = (tier: PrizeTier): number => {
    const totalInventory = prizeTiers.reduce((sum, t) => sum + t.inventory, 0)
    return totalInventory > 0 ? (tier.inventory / totalInventory) * 100 : 0
  }

  // Check if all prizes are out of stock
  const isOutOfStock = prizeTiers.every((tier) => tier.inventory <= 0)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Enterキーで抽選開始（管理画面やPINモーダルが開いている時は無効化）
      if (event.key === "Enter" && !isDrawing && !isOutOfStock && !showAdmin && !showPinModal) {
        handleDraw()
      }

      // Escキーで管理画面を開く（抽選中、結果表示中、管理画面表示中、PINモーダル表示中は無効化）
      if (event.key === "Escape" && !isDrawing && !result && !showAdmin && !showPinModal) {
        handleAdminOpen()
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [isDrawing, isOutOfStock, showAdmin, showPinModal, result, prizeTiers])

  const handleDraw = async () => {
    if (isDrawing || isOutOfStock || showAdmin || showPinModal) return

    setIsDrawing(true)
    setResult(null)

    // Filter out prizes with no inventory
    const availablePrizes = prizeTiers.filter((tier) => tier.inventory > 0)

    // If no prizes available, show "本日終了" message
    if (availablePrizes.length === 0) {
      setTimeout(() => {
        setIsDrawing(false)
        setResult({ id: "out", name: "本日終了", inventory: 0 })
      }, 3000)
      return
    }

    // Calculate total inventory for probability calculation
    const totalInventory = availablePrizes.reduce((sum, tier) => sum + tier.inventory, 0)

    // Generate random number between 0 and total inventory
    const random = Math.random() * totalInventory

    // Determine which prize was won based on inventory-weighted probability
    let cumulativeInventory = 0
    let winningPrize: PrizeTier | null = null

    for (const prize of availablePrizes) {
      cumulativeInventory += prize.inventory
      if (random <= cumulativeInventory) {
        winningPrize = prize
        break
      }
    }

    // If no prize was selected (shouldn't happen), default to first available prize
    if (!winningPrize) {
      winningPrize = availablePrizes[0]
    }

    // Simulate drawing animation
    setTimeout(async () => {
      // Update inventory in Supabase
      if (winningPrize) {
        const newInventory = winningPrize.inventory - 1
        const { error } = await supabase
          .from("prize_tiers")
          .update({ inventory: newInventory })
          .eq("id", winningPrize.id)

        if (error) {
          console.error("Error updating inventory:", error)
        } else {
          console.log(`Updated ${winningPrize.name} inventory to ${newInventory}`)

          // 抽選後にデータベースと同期
          await fetchPrizeTiers()
        }
      }

      setResult(winningPrize)

      // Reset after showing result - consistent 5 seconds for all prizes
      setTimeout(() => {
        setIsDrawing(false)
      }, 5000)
    }, 3000)
  }

  const handleAdminOpen = () => {
    setShowPinModal(true)
    setPinError("")
  }

  const handlePinSubmit = () => {
    if (pinInput === "9999") {
      setShowPinModal(false)
      setShowAdmin(true)
      setPinError("")
    } else {
      setPinError("PINコードが間違っています")
    }
    setPinInput("")
  }

  const handlePinModalClose = () => {
    setShowPinModal(false)
    setPinInput("")
    setPinError("")
  }

  const updatePrizeTier = async (updatedTier: PrizeTier) => {
    try {
      console.log("Updating prize tier:", updatedTier)

      const { data, error } = await supabase
        .from("prize_tiers")
        .update({
          name: updatedTier.name,
          inventory: updatedTier.inventory,
        })
        .eq("id", updatedTier.id)
        .select()

      if (error) {
        console.error("Error updating prize tier:", error)
        alert(`更新に失敗しました: ${error.message}`)
        return false
      }

      console.log("Successfully updated prize tier:", data)

      // Force refresh the data
      await fetchPrizeTiers()

      return true
    } catch (error) {
      console.error("Error:", error)
      alert("更新に失敗しました")
      return false
    }
  }

  const handleTestEffect = (prizeId: string) => {
    const testPrize = prizeTiers.find((tier) => tier.id === prizeId)
    if (!testPrize) return

    console.log(`Testing effect for: ${testPrize.name} (${testPrize.id})`)

    // Play appropriate sound
    try {
      if (testPrize.id === "special" && specialSoundRef.current) {
        specialSoundRef.current.currentTime = 0
        specialSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
      } else if ((testPrize.id === "first" || testPrize.id === "second") && highPrizeSoundRef.current) {
        highPrizeSoundRef.current.currentTime = 0
        highPrizeSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
      } else if (normalSoundRef.current) {
        normalSoundRef.current.currentTime = 0
        normalSoundRef.current.play().catch((e) => console.log("Audio play failed:", e))
      }
    } catch (error) {
      console.log("Audio error:", error)
    }

    // Show test result with effects
    setTestResult(testPrize)
    setTimeout(() => {
      setTestResult(null)
    }, 3000)
  }

  // リフレッシュ用のハンドラー
  const handleRefresh = async () => {
    await fetchPrizeTiers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e6f7f3] flex items-center justify-center">
        <div className="text-[#008069] text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e6f7f3] relative overflow-hidden">
      {/* Left decoration */}
      <div className="fixed left-0 top-0 h-full w-48 pointer-events-none z-10 -ml-4">
        <img src="/images/grass-left.png" alt="左装飾" className="h-full w-full object-cover opacity-70" />
      </div>

      {/* Right decoration */}
      <div className="fixed right-0 top-0 h-full w-48 pointer-events-none z-10 -mr-4">
        <img src="/images/grass-right.png" alt="右装飾" className="h-full w-full object-cover opacity-70" />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo and Title Section */}
        <div className="w-full mb-8 text-center">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img src="/images/kawasui-logo.png" alt="カワスイ 川崎水族館" className="h-20 mx-auto mb-4" />
            <div
              className="text-5xl font-extrabold tracking-wider"
              style={{
                color: "#008069",
                textShadow: "3px 3px 0px rgba(0,128,105,0.2), -1px -1px 0px #fff",
                WebkitTextStroke: "1px rgba(0,128,105,0.3)",
              }}
            >
              大抽選会
            </div>
          </motion.div>
        </div>

        {/* Central Earth Circle - Clickable */}
        <motion.div
          whileHover={{ scale: isOutOfStock || showAdmin || showPinModal ? 1 : 1.05 }}
          whileTap={{ scale: isOutOfStock || showAdmin || showPinModal ? 1 : 0.95 }}
          className="relative mb-8"
        >
          <button
            onClick={handleDraw}
            disabled={isDrawing || isOutOfStock || showAdmin || showPinModal}
            className={`relative ${isOutOfStock || showAdmin || showPinModal ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            <img src="/images/earth-circle.png" alt="抽選ボタン" className="w-80 h-80 object-contain" />

            {/* Drawing overlay */}
            {isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-2xl font-bold bg-[#008069] bg-opacity-80 px-6 py-3 rounded-lg">
                  抽選中...
                </div>
              </div>
            )}

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-2xl font-bold bg-red-600 bg-opacity-80 px-6 py-3 rounded-lg">
                  本日終了
                </div>
              </div>
            )}

            {/* Admin panel open overlay */}
            {showAdmin && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-blue-600 bg-opacity-80 px-6 py-3 rounded-lg">
                  管理画面使用中
                </div>
              </div>
            )}

            {/* PIN modal open overlay */}
            {showPinModal && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-xl font-bold bg-gray-600 bg-opacity-80 px-6 py-3 rounded-lg">
                  認証中
                </div>
              </div>
            )}
          </button>
        </motion.div>

        {/* Out of stock message */}
        {isOutOfStock && !isDrawing && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-red-50 rounded-lg border border-red-200 max-w-md"
          >
            <h3 className="text-3xl font-bold text-red-600 mb-2">本日終了</h3>
            <p className="text-gray-600 text-lg">抽選の景品がすべて終了しました。</p>
          </motion.div>
        )}

        {/* Instructions */}
        {!isOutOfStock && !isDrawing && !result && !showAdmin && !showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[#008069] text-xl"
          >
            <p className="font-bold" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>
              円をタップまたはEnterキーで抽選開始！
            </p>
          </motion.div>
        )}

        {/* Admin panel active message */}
        {showAdmin && !isDrawing && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200 max-w-md"
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-2">管理画面使用中</h3>
            <p className="text-gray-600 text-lg">管理画面を閉じると抽選を再開できます。</p>
          </motion.div>
        )}

        {/* PIN modal active message */}
        {showPinModal && !isDrawing && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 max-w-md"
          >
            <h3 className="text-2xl font-bold text-gray-600 mb-2">認証中</h3>
            <p className="text-gray-600 text-lg">PINコードを入力してください。</p>
          </motion.div>
        )}
      </div>

      {/* Result display */}
      {(isDrawing || result || testResult) && (
        <DrawResult isDrawing={isDrawing} result={result || testResult} calculateProbability={calculateProbability} />
      )}

      {/* PIN modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-xl font-bold mb-4 text-[#008069]">管理者認証</h2>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
              placeholder="PINコードを入力"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
            />

            {/* エラーメッセージ表示 */}
            {pinError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">{pinError}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handlePinModalClose}>
                キャンセル
              </Button>
              <Button onClick={handlePinSubmit} className="bg-[#008069] hover:bg-[#006c59]">
                確認
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Admin panel */}
      {showAdmin && (
        <AdminPanel
          prizeTiers={prizeTiers}
          updatePrizeTier={updatePrizeTier}
          onClose={() => setShowAdmin(false)}
          calculateProbability={calculateProbability}
          onRefresh={handleRefresh}
          onTestEffect={handleTestEffect}
        />
      )}
    </div>
  )
}
