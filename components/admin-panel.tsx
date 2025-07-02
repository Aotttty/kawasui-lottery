"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, RefreshCw } from "lucide-react"
import type { PrizeTier } from "@/lib/supabase"

interface AdminPanelProps {
  prizeTiers: PrizeTier[]
  updatePrizeTier: (tier: PrizeTier) => Promise<boolean>
  onClose: () => void
  calculateProbability: (tier: PrizeTier) => number
  onRefresh: () => Promise<void>
  onTestEffect: (prizeId: string) => void
}

export default function AdminPanel({
  prizeTiers,
  updatePrizeTier,
  onClose,
  calculateProbability,
  onRefresh,
  onTestEffect,
}: AdminPanelProps) {
  const [editingTier, setEditingTier] = useState<PrizeTier | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleInventoryChange = async (tierId: string, newInventory: number) => {
    const tier = prizeTiers.find((t) => t.id === tierId)
    if (tier) {
      setUpdating(tierId)
      const success = await updatePrizeTier({
        ...tier,
        inventory: newInventory >= 0 ? newInventory : 0,
      })

      if (success) {
        console.log(`Successfully updated ${tier.name} inventory to ${newInventory}`)
      } else {
        console.error(`Failed to update ${tier.name} inventory`)
      }

      setUpdating(null)
    }
  }

  const startEditing = (tier: PrizeTier) => {
    setEditingTier({ ...tier })
  }

  const saveEditing = async () => {
    if (editingTier) {
      setUpdating(editingTier.id)
      const success = await updatePrizeTier(editingTier)

      if (success) {
        console.log(`Successfully updated ${editingTier.name}`)
        setEditingTier(null)
      } else {
        console.error(`Failed to update ${editingTier.name}`)
      }

      setUpdating(null)
    }
  }

  const cancelEditing = () => {
    setEditingTier(null)
  }

  const handleQuickAdd = async (tierId: string, amount: number) => {
    const tier = prizeTiers.find((t) => t.id === tierId)
    if (tier) {
      await handleInventoryChange(tierId, tier.inventory + amount)
    }
  }

  const handleQuickSubtract = async (tierId: string, amount: number) => {
    const tier = prizeTiers.find((t) => t.id === tierId)
    if (tier) {
      await handleInventoryChange(tierId, Math.max(0, tier.inventory - amount))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
      console.log("Data refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Calculate total inventory
  const totalInventory = prizeTiers.reduce((sum, tier) => sum + tier.inventory, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#008069]">管理画面 (Supabase連携)</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-[#008069] border-[#008069] hover:bg-[#008069] hover:text-white bg-transparent"
              title="データを更新"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">確率は在庫数に基づいて自動計算されます。総在庫数: {totalInventory}</p>
              <p className="text-sm mt-1">※ データはSupabaseでリアルタイム同期されます</p>
            </div>
            {refreshing && <div className="text-sm text-blue-600 font-medium">更新中...</div>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">等級</th>
                <th className="p-3 text-right">確率 (%)</th>
                <th className="p-3 text-right">在庫数</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {prizeTiers.map((tier) => (
                <tr key={tier.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{tier.name}</td>
                  <td className="p-3 text-right font-mono">{calculateProbability(tier).toFixed(1)}</td>
                  <td className="p-3 text-right">
                    {editingTier?.id === tier.id ? (
                      <Input
                        type="number"
                        value={editingTier.inventory}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            inventory: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-24 inline-block"
                        disabled={updating === tier.id}
                      />
                    ) : (
                      <span className={`font-mono text-lg ${updating === tier.id ? "opacity-50" : ""}`}>
                        {tier.inventory}
                        {updating === tier.id && <RefreshCw className="inline ml-2 h-4 w-4 animate-spin" />}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingTier?.id === tier.id ? (
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-[#008069] hover:bg-[#006c59]"
                          onClick={saveEditing}
                          disabled={updating === tier.id}
                        >
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} disabled={updating === tier.id}>
                          キャンセル
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(tier)}
                          disabled={updating === tier.id}
                        >
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAdd(tier.id, 1)}
                          disabled={updating === tier.id}
                          className="text-green-600 hover:text-green-700"
                        >
                          +1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAdd(tier.id, 10)}
                          disabled={updating === tier.id}
                          className="text-green-600 hover:text-green-700"
                        >
                          +10
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickSubtract(tier.id, 1)}
                          disabled={updating === tier.id || tier.inventory === 0}
                          className="text-red-600 hover:text-red-700"
                        >
                          -1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickSubtract(tier.id, 10)}
                          disabled={updating === tier.id || tier.inventory === 0}
                          className="text-red-600 hover:text-red-700"
                        >
                          -10
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3 text-[#008069]">在庫状況 (リアルタイム)</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {prizeTiers.map((tier) => (
              <div key={tier.id} className="bg-gray-50 p-4 rounded-md border">
                <div className="font-medium text-sm text-gray-600">{tier.name}</div>
                <div className="text-2xl font-bold text-[#008069]">{tier.inventory}</div>
                <div className="text-sm text-gray-500">{calculateProbability(tier).toFixed(1)}%</div>
                {updating === tier.id && <div className="text-xs text-blue-600 mt-1">更新中...</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3 text-[#008069]">エフェクトテスト</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {prizeTiers.map((tier) => (
              <Button
                key={`test-${tier.id}`}
                variant="outline"
                size="sm"
                onClick={() => onTestEffect(tier.id)}
                className="text-[#008069] border-[#008069] hover:bg-[#008069] hover:text-white"
              >
                {tier.name}テスト
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ※ 各ボタンをクリックすると、その賞のエフェクトと音声をテストできます
          </p>
        </div>

        <div className="mt-6 p-3 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">操作ガイド</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 編集ボタンで在庫数を直接入力できます</li>
            <li>• +1/+10ボタンで在庫を増やせます</li>
            <li>• -1/-10ボタンで在庫を減らせます</li>
            <li>• 🔄ボタンで最新データを手動更新できます</li>
            <li>• 変更は即座にSupabaseに保存され、他のデバイスにも反映されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
