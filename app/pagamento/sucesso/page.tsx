"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Copy, Download } from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Check for Stripe session_id parameter
        const sessionId = searchParams.get("session_id")
        const slug = searchParams.get("slug")

        console.log("Payment success params:", { sessionId, slug })

        let memory: any = null

        if (sessionId) {
          // Stripe flow - verify payment session
          console.log("Stripe flow - verifying session:", sessionId)

          try {
            // Retrieve session from Stripe API
            const response = await fetch(`/api/verify-stripe-session?session_id=${sessionId}`)
            const sessionData = await response.json()

            if (!response.ok || !sessionData.success) {
              console.error("Failed to verify Stripe session:", sessionData)
              toast.error("Erro ao verificar pagamento. Entre em contato com o suporte.")
              return
            }

            const { memory_slug, memory_id } = sessionData.metadata

            if (!memory_slug && !memory_id) {
              console.error("No memory identifier in session metadata")
              toast.error("Informações da memória não encontradas.")
              return
            }

            // Get memory by slug or id
            const identifier = memory_slug || memory_id
            const memoryResponse = await fetch(`/api/memory/${identifier}`)
            const memoryData = await memoryResponse.json()

            if (!memoryResponse.ok || !memoryData) {
              console.error("Memory not found:", identifier, memoryData)
              toast.error("Página não encontrada. Entre em contato com o suporte.")
              return
            }

            memory = memoryData

            // Update payment status if not already paid
            if (memory.payment_status !== 'paid') {
              console.log("Updating payment status to 'paid' for memory:", memory.id)
              const updateResponse = await fetch(`/api/memory/${identifier}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_status: 'paid' }),
              })

              if (!updateResponse.ok) {
                console.error("Failed to update payment status")
                // Continue anyway
              } else {
                console.log("Payment status updated successfully")
                memory.payment_status = 'paid'
              }
            }
          } catch (stripeError) {
            console.error("Stripe verification error:", stripeError)
            toast.error("Erro ao verificar pagamento Stripe.")
            return
          }
        } else if (slug) {
          // Direct access - get memory by slug (for testing or direct links)
          console.log("Direct access - fetching memory by slug:", slug)
          const memoryResponse = await fetch(`/api/memory/${slug}`)
          const memoryData = await memoryResponse.json()

          if (!memoryResponse.ok || !memoryData) {
            console.error("Memory not found for slug:", slug, memoryData)
            toast.error("Página não encontrada. Entre em contato com o suporte.")
            return
          }

          memory = memoryData
        } else {
          toast.error("Parâmetros de acesso inválidos.")
          router.push("/")
          return
        }

        // Generate clean URL for the memory page
        const cleanUrl = `${window.location.origin}/memory/${memory.slug}`
        setGeneratedUrl(cleanUrl)

        console.log("Generated memory URL:", cleanUrl)

        // Generate QR Code with clean URL
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(cleanUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#dc2626', // rose-600
              light: '#ffffff'
            }
          })
          setQrCodeUrl(qrCodeDataUrl)
          console.log("QR Code generated successfully")
        } catch (qrError) {
          console.error("Error generating QR code:", qrError)
          toast.error("Erro ao gerar QR code, mas o link está disponível")
        }

        toast.success("Página criada com sucesso! Sua página de amor está pronta.")
      } catch (error) {
        console.error("Error processing payment success:", error)
        toast.error("Erro ao processar confirmação.")
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [searchParams, router])

  const copyToClipboard = async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl)
        toast.success("URL copiada para a área de transferência!")
      } catch (error) {
        // Fallback para execCommand se clipboard API falhar
        const textArea = document.createElement("textarea")
        textArea.value = generatedUrl
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          toast.success("URL copiada para a área de transferência!")
        } catch (fallbackError) {
          toast.error("Erro ao copiar URL. Copie manualmente.")
        }
        document.body.removeChild(textArea)
      }
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = 'qrcode-presente-amor.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("QR Code baixado com sucesso!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-rose-400">Processando pagamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-green-500/20 p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />

          <h1 className="text-4xl font-bold text-green-400 mb-4">Pagamento Confirmado!</h1>

          <p className="text-gray-300 mb-8">
            Sua página de amor foi criada com sucesso. Compartilhe o link abaixo com quem você ama!
          </p>

          {generatedUrl && (
            <div className="space-y-6">
              {/* Link Section */}
              <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-300 mb-3">Seu link exclusivo:</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedUrl}
                      readOnly
                      className="flex-1 bg-gray-900/50 border border-green-500/30 rounded px-4 py-2 text-white text-sm"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="shrink-0 bg-transparent border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-green-400/70">
                    💡 Use este link completo para compartilhar: {generatedUrl}
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              {qrCodeUrl && (
                <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300 mb-3">QR Code para compartilhar:</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code da página de amor"
                        className="w-48 h-48"
                      />
                    </div>
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="bg-transparent border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar QR Code
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => window.open(generatedUrl, "_blank")}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg py-6"
              >
                Visualizar Página
              </Button>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                Voltar para Home
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
