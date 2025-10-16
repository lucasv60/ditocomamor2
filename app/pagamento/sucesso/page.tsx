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
        // SIMULAÇÃO: Sempre processar como se o pagamento foi aprovado
        // Em produção, verificar payment_id e preference_id do Mercado Pago

        // Primeiro tentar obter dados da URL (método mais confiável)
        const dataParam = searchParams.get("data")
        let pageDataStr = null

        console.log("Checking URL parameter 'data':", dataParam ? "PRESENT" : "NOT FOUND")

        if (dataParam) {
          try {
            pageDataStr = decodeURIComponent(atob(dataParam))
            console.log("Successfully decoded data from URL, length:", pageDataStr.length)
          } catch (decodeError) {
            console.error("Error decoding URL data:", decodeError)
          }
        }

        // Fallback: tentar localStorage/sessionStorage (para compatibilidade)
        if (!pageDataStr) {
          console.log("No URL data, trying storage fallback...")
          const tempKey = localStorage.getItem("temp_love_page_key")

          if (tempKey) {
            pageDataStr = localStorage.getItem(tempKey)
            console.log("Found data in localStorage with key:", tempKey)
          }

          if (!pageDataStr) {
            pageDataStr = sessionStorage.getItem("pendingLovePage")
            console.log("Fallback to sessionStorage:", pageDataStr ? "FOUND" : "NOT FOUND")
          }
        }

        if (!pageDataStr) {
          console.error("Page data not found in URL, localStorage, or sessionStorage")
          console.log("URL params:", Object.fromEntries(searchParams.entries()))
          console.log("localStorage keys:", Object.keys(localStorage))
          console.log("sessionStorage keys:", Object.keys(sessionStorage))
          toast.error("Dados da página não encontrados. Volte e tente novamente.")
          router.push("/criar-presente-especial")
          return
        }

        console.log("Successfully obtained pageDataStr:", pageDataStr.substring(0, 100) + "...")

        const pageData = JSON.parse(pageDataStr)

        // Save to database with retry logic
        let saveAttempts = 0
        const maxAttempts = 3

        while (saveAttempts < maxAttempts) {
          try {
            const response = await fetch("/api/pages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(pageData),
            })

            if (response.ok) {
              console.log("Page saved to database successfully")
              break
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
          } catch (dbError) {
            saveAttempts++
            console.error(`Database save attempt ${saveAttempts} failed:`, dbError)

            if (saveAttempts >= maxAttempts) {
              console.error("All database save attempts failed")
              toast.error("Página salva localmente. Pode não funcionar em outros dispositivos.")
            } else {
              // Wait 1 second before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }

        // Save to localStorage for backup with expiração
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
        const dataWithExpiry = {
          data: pageData,
          expiry: expiryTime
        }
        localStorage.setItem(`love-page-${pageData.pageName}`, JSON.stringify(dataWithExpiry))

        // Generate clean URL without data parameter
        const cleanUrl = `${window.location.origin}/${pageData.pageName}`
        const shortUrl = `/${pageData.pageName}` // For display
        setGeneratedUrl(cleanUrl)

        console.log("Generated clean URL:", cleanUrl)

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
          console.log("QR Code generated successfully with clean URL")
        } catch (qrError) {
          console.error("Error generating QR code:", qrError)
          toast.error("Erro ao gerar QR code, mas o link está disponível")
        }

        // Clear temporary data
        const tempKeyToRemove = localStorage.getItem("temp_love_page_key")
        if (tempKeyToRemove) {
          localStorage.removeItem(tempKeyToRemove)
          localStorage.removeItem("temp_love_page_key")
        }
        sessionStorage.removeItem("pendingLovePage")

        toast.success("Página criada com sucesso!")
      } catch (error) {
        console.error("Error processing payment:", error)
        toast.error("Erro ao processar pagamento. Tente novamente.")
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
