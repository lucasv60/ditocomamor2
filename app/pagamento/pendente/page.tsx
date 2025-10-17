"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function PaymentPendingPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'checking' | 'completed'>('pending')

  useEffect(() => {
    // Check payment status every 10 seconds
    const checkPaymentStatus = async () => {
      try {
        // This would typically check a status endpoint, but for now we'll simulate
        // In a real implementation, you'd have an API endpoint to check payment status
        setStatus('checking')

        // Simulate checking - in real app, call an API
        setTimeout(() => {
          setStatus('pending') // Keep pending for demo
        }, 2000)
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    const interval = setInterval(checkPaymentStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-yellow-500/20 p-8 text-center">
          {status === 'checking' ? (
            <CheckCircle className="w-20 h-20 text-blue-400 mx-auto mb-6 animate-pulse" />
          ) : (
            <Clock className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          )}

          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            {status === 'checking' ? 'Verificando Pagamento...' : 'Pagamento Pendente'}
          </h1>

          <p className="text-gray-300 mb-8">
            {status === 'checking'
              ? 'Estamos verificando o status do seu pagamento...'
              : 'Seu pagamento está sendo processado pelo Mercado Pago. A página será liberada automaticamente assim que o pagamento for confirmado.'
            }
          </p>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-300">
              <strong>Importante:</strong> Não feche esta página. Ela será atualizada automaticamente quando o pagamento for aprovado.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-lg py-6"
            >
              Voltar para Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
