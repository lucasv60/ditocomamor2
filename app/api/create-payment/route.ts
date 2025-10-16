import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
          unit_price: 0.01,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: customerEmail,
        name: customerName,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/falha`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pagamento/pendente`,
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

    // Salvar página no banco de dados
    try {
      await prisma.lovePage.create({
        data: {
          pageName: pageData.pageName,
          pageTitle: pageData.pageTitle,
          startDate: new Date(pageData.startDate),
          loveText: pageData.loveText,
          youtubeUrl: pageData.youtubeUrl || null,
          photos: pageData.photos,
        }
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Não falhar o pagamento se der erro no banco, apenas logar
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
