import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const pageData = await request.json()

    const page = await prisma.lovePage.create({
      data: {
        pageName: pageData.pageName,
        pageTitle: pageData.pageTitle,
        startDate: pageData.startDate,
        loveText: pageData.loveText,
        youtubeUrl: pageData.youtubeUrl || null,
        photos: JSON.stringify(pageData.photos),
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Erro ao salvar página' }, { status: 500 })
  }
}