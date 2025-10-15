"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function PaymentPendingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-yellow-500/20 p-8 text-center">
          <Clock className="w-20 h-20 text-yellow-400 mx-auto mb-6" />

          <h1 className="text-4xl font-bold text-yellow-400 mb-4">Pagamento Pendente</h1>

          <p className="text-gray-300 mb-8">
            Seu pagamento está sendo processado. Você receberá um email assim que for confirmado.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg py-6"
            >
              Voltar para Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
