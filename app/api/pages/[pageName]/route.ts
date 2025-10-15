import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const pageName = params.pageName

    const page = await prisma.lovePage.findUnique({
      where: { pageName }
    })

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}