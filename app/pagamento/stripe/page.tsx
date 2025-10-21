"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutForm } from "@/components/stripe-checkout-form"
import { Card } from "@/components/ui/card"
import { Heart, CreditCard } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function StripePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState("")
  const [slug, setSlug] = useState("")

  useEffect(() => {
    const clientSecretParam = searchParams.get("client_secret")
    const slugParam = searchParams.get("slug")

    if (!clientSecretParam || !slugParam) {
      router.push("/criar-presente-especial")
      return
    }

    setClientSecret(clientSecretParam)
    setSlug(slugParam)
  }, [searchParams, router])

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#ec4899', // rose-500
      colorBackground: '#111827', // gray-900
      colorText: '#f9fafb', // gray-50
      colorDanger: '#ef4444', // red-500
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-rose-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent mb-4">
            Pagamento Seguro
          </h1>
          <p className="text-gray-400">Complete seu pagamento para finalizar sua página de amor</p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20 p-8">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-rose-400" />
            <h2 className="text-2xl font-bold text-rose-400">Informações de Pagamento</h2>
          </div>

          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm slug={slug} />
          </Elements>
        </Card>
      </div>
    </div>
  )
}