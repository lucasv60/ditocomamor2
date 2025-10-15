"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function PaymentFailurePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-red-500/20 p-8 text-center">
          <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />

          <h1 className="text-4xl font-bold text-red-400 mb-4">Pagamento Não Aprovado</h1>

          <p className="text-gray-300 mb-8">Houve um problema com seu pagamento. Por favor, tente novamente.</p>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/checkout")}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg py-6"
            >
              Tentar Novamente
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              Voltar para Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
