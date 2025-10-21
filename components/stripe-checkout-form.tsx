"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface CheckoutFormProps {
  slug: string
}

export function CheckoutForm({ slug }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "client_secret"
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          break
        case "processing":
          setMessage("Your payment is processing.")
          break
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.")
          break
        default:
          setMessage("Something went wrong.")
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pagamento/sucesso?slug=${slug}`,
      },
    })

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.")
      } else {
        setMessage("An unexpected error occurred.")
      }
      toast.error(error.message || "Erro no pagamento")
      setIsLoading(false)
    } else {
      setMessage("Payment processing...")
      toast.success("Pagamento processado com sucesso!")
    }
  }

  const paymentElementOptions = {
    layout: "tabs" as const,
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <div className="mt-6 space-y-4">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Pagamento seguro processado pela Stripe</span>
          </div>
        </div>

        <Button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg py-6 font-semibold"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pagar R$ 1,00
              </div>
            )}
          </span>
        </Button>

        {message && (
          <div className="text-center text-sm text-gray-400 mt-4">
            {message}
          </div>
        )}
      </div>
    </form>
  )
}