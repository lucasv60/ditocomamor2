import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pageData, customerEmail, customerName } = await request.json()

    // Mercado Pago API configuration
    const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 })
    }

    // Create payment preference
    const preference = {
      items: [
        {
          title: `Página de Amor: ${pageData.pageTitle}`,
          description: "Página de amor personalizada com fotos e mensagens",
          quantity: 1,
          unit_price: 10.0,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: customerEmail,
        name: customerName,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pagamento/pendente`,
      },
      auto_return: "approved",
      metadata: {
        page_name: pageData.pageName,
        page_data: JSON.stringify(pageData),
      },
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Mercado Pago error:", data)
      return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 })
    }

    return NextResponse.json({
      init_point: data.init_point,
      preference_id: data.id,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
