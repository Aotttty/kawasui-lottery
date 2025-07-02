import LotteryGame from "@/components/lottery-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-[#e6f7f3]">
      <LotteryGame />
    </main>
  )
}
