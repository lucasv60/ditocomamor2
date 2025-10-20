"use client"

import { useState, useEffect, useCallback } from "react"
import { LoveCounter } from "@/components/love-counter"
import { FloatingRoses } from "@/components/floating-roses"
import { LetterCard } from "@/components/letter-card"
import { useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

type PageData = {
  pageName: string
  pageTitle: string
  startDate: string | null
  photos: Array<{ preview: string; caption: string }>
  loveText: string
  youtubeUrl: string
}

export default function DynamicRomanticPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const pageName = params.pageName as string
  const [revealed, setRevealed] = useState(false)
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const loadPageData = useCallback(async () => {
    console.log("Loading page data for:", pageName)

    try {
      // Primeiro tentar buscar do banco de dados
      console.log("Trying to fetch from database...")
      const response = await fetch(`/api/pages/${pageName}`)
      console.log("Database response status:", response.status)

      if (response.ok) {
        const dbData = await response.json()
        console.log("Database data received:", dbData)

        // Parse photos if it's a string
        let photos = dbData.photos
        if (typeof photos === 'string') {
          try {
            photos = JSON.parse(photos)
          } catch (parseError) {
            console.error("Error parsing photos from database:", parseError)
            photos = []
          }
        }

        setPageData({
          pageName: dbData.pageName,
          pageTitle: dbData.pageTitle,
          startDate: dbData.startDate,
          photos: photos,
          loveText: dbData.loveText,
          youtubeUrl: dbData.youtubeUrl,
        })
        console.log("Page data set from database")
        setLoading(false)
        return
      } else {
        console.log("Database response not OK, trying fallback...")
      }
    } catch (error) {
      console.error("Error loading from database:", error)
    }

    // Fallback para URL/localStorage (para compatibilidade)
    console.log("No database data, trying URL/localStorage fallback...")
    const dataParam = searchParams.get("data")

    if (dataParam) {
      console.log("Found data parameter in URL")
      try {
        // Decode data from URL
        const decodedData = JSON.parse(decodeURIComponent(atob(dataParam)))
        console.log("Successfully decoded URL data")
        setPageData(decodedData)
        // Save to localStorage for future visits with expiração
        const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias
        const dataWithExpiry = {
          data: decodedData,
          expiry: expiryTime
        }
        localStorage.setItem(`love-page-${pageName}`, JSON.stringify(dataWithExpiry))
      } catch (error) {
        console.error("[v0] Error decoding URL data:", error)
        toast.error("Erro ao carregar dados da página. Tente novamente.")
        // Fallback to localStorage
        const savedData = localStorage.getItem(`love-page-${pageName}`)
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            // Verificar se não expirou
            if (parsedData.expiry && Date.now() < parsedData.expiry) {
              setPageData(parsedData.data)
            } else {
              localStorage.removeItem(`love-page-${pageName}`)
            }
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError)
            localStorage.removeItem(`love-page-${pageName}`)
          }
        }
      }
    } else {
      console.log("No URL data parameter, trying localStorage")
      // No URL data, try localStorage
      const savedData = localStorage.getItem(`love-page-${pageName}`)
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          // Verificar se não expirou
          if (parsedData.expiry && Date.now() < parsedData.expiry) {
            console.log("Found valid data in localStorage")
            setPageData(parsedData.data)
          } else {
            console.log("localStorage data expired, removing")
            localStorage.removeItem(`love-page-${pageName}`)
          }
        } catch (parseError) {
          console.error("Error parsing localStorage data:", parseError)
          localStorage.removeItem(`love-page-${pageName}`)
        }
      } else {
        console.log("No data found in localStorage either")
      }
    }

    setLoading(false)
  }, [pageName, searchParams])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <p className="text-rose-400 text-xl">Carregando...</p>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center space-y-4">
          <p className="text-rose-400 text-2xl font-bold">Página não encontrada 💔</p>
          <p className="text-rose-300">Esta página de amor ainda não foi criada.</p>
        </div>
      </div>
    )
  }

  if (!revealed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div onClick={() => setRevealed(true)} className="cursor-pointer">
          <LetterCard />
        </div>
      </div>
    )
  }

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : null
  }

  const youtubeId = pageData.youtubeUrl ? getYouTubeId(pageData.youtubeUrl) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      <FloatingRoses />

      {/* YouTube Player */}
      {youtubeId && (
        <div className="fixed bottom-4 right-4 z-50">
          <iframe
            width="300"
            height="170"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="rounded-lg shadow-2xl"
          />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent text-balance">
              {pageData.pageTitle} 💕
            </h1>
            <p className="text-lg md:text-xl text-rose-300 text-pretty">Cada momento ao seu lado é uma bênção</p>
          </div>

          {/* Counter */}
          {pageData.startDate && <LoveCounter startDate={new Date(pageData.startDate)} />}

          {/* Photo Carousel */}
          {pageData.photos.length > 0 && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-rose-500/20">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-6 text-center">
                Nossas Memórias
              </h2>

              <div className="relative group">
                {/* Main Image */}
                <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl">
                  <img
                    src={pageData.photos[currentPhotoIndex].preview || "/placeholder.svg"}
                    alt={pageData.photos[currentPhotoIndex].caption || `Foto ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Navigation Buttons */}
                  {pageData.photos.length > 1 && (
                    <>
                      <Button
                        onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? pageData.photos.length - 1 : prev - 1))}
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>

                      <Button
                        onClick={() => setCurrentPhotoIndex((prev) => (prev === pageData.photos.length - 1 ? 0 : prev + 1))}
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white shadow-lg"
                        aria-label="Próxima foto"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Caption */}
                {pageData.photos[currentPhotoIndex].caption && (
                  <p className="text-center text-rose-300 text-lg font-medium mt-4">
                    {pageData.photos[currentPhotoIndex].caption}
                  </p>
                )}

                {/* Dots Indicator */}
                {pageData.photos.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {pageData.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentPhotoIndex ? "bg-rose-400 w-8" : "bg-rose-300/50 hover:bg-rose-300"
                        }`}
                        aria-label={`Ir para foto ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Love Letter */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-rose-500/20">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-6 text-center">
              Minha Carta de Amor
            </h2>
            <div className="space-y-4 text-rose-300 text-lg leading-relaxed text-pretty whitespace-pre-wrap">
              {pageData.loveText}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
