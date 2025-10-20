"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ShoppingCart, CreditCard, Check } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    const data = sessionStorage.getItem("pendingLovePage")
    if (!data) {
      router.push("/criar-presente-especial")
      return
    }
    setPageData(JSON.parse(data))
  }, [router])

  const handlePayment = async () => {
    if (!email.trim() || !name.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Por favor, insira um email válido")
      return
    }

    setLoading(true)

    try {
      // TEMPORARY: Skip Mercado Pago and create memory directly with paid status
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageData,
          customerEmail: email.trim(),
          customerName: name.trim(),
          skipPayment: true, // Flag to skip Mercado Pago
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API Error:", data)
        toast.error(data.error || "Erro ao criar página. Tente novamente.")
        return
      }

      if (data.data && data.data.slug) {
        toast.success("Página criada com sucesso!")

        // Clear session storage after successful creation
        sessionStorage.removeItem("pendingLovePage")

        // Redirect directly to success page with slug
        router.push(`/pagamento/sucesso?slug=${data.data.slug}`)
      } else {
        console.error("No slug in response:", data)
        toast.error("Erro ao criar página. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao processar criação:", error)
      toast.error("Erro ao processar criação. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-rose-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent mb-4">
            Finalizar Compra
          </h1>
          <p className="text-gray-400">Complete seu pedido para criar sua página de amor</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="text-rose-400" />
              <h2 className="text-2xl font-bold text-rose-400">Resumo do Pedido</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-rose-500/20">
                <Heart className="text-rose-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">Página de Amor Personalizada</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Título: {pageData.pageTitle}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      {pageData.photos.length} fotos incluídas
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Carta de amor personalizada
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      Contador de tempo juntos
                    </li>
                    {pageData.youtubeUrl && (
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        Música especial incluída
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="border-t border-rose-500/20 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-semibold">R$ 10,00</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold mt-2">
                  <span className="text-rose-400">Total:</span>
                  <span className="text-rose-400">R$ 10,00</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="text-rose-400" />
              <h2 className="text-2xl font-bold text-rose-400">Informações de Pagamento</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-rose-400">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
                  required
                  aria-required="true"
                  aria-describedby="name-error"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-rose-400">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
                  required
                  aria-required="true"
                  aria-describedby="email-error"
                />
              </div>

              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mt-6">
                <p className="text-sm text-green-300">
                  Sua página será criada imediatamente após confirmar os dados.
                </p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 font-semibold mt-6"
              >
                {loading ? "Criando página..." : "Criar Página de Amor"}
              </Button>

            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
