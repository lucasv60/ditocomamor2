"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { BuilderData } from "@/app/criar-presente-especial/page"

type Props = {
  builderData: BuilderData
}

export function RomanticPreview({ builderData }: Props) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Memoizar cálculo do tempo para evitar recálculos desnecessários
  const timeElapsed = useMemo(() => {
    if (!builderData.startDate) {
      return {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    }

    const now = new Date()
    const diff = now.getTime() - builderData.startDate.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30.44)
    const years = Math.floor(months / 12)

    return {
      years,
      months: months % 12,
      days: days % 30,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    }
  }, [builderData.startDate])

  // Atualizar apenas a cada 10 segundos para reduzir CPU
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    if (!builderData.startDate) return

    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1)
    }, 10000) // Atualizar a cada 10 segundos

    return () => clearInterval(interval)
  }, [builderData.startDate])

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}` : null
  }, [])

  const embedUrl = useMemo(() =>
    builderData.youtubeUrl ? getYouTubeEmbedUrl(builderData.youtubeUrl) : null,
    [builderData.youtubeUrl, getYouTubeEmbedUrl]
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-black via-gray-900 to-black p-4 relative overflow-hidden">
      {/* Floating Roses and Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-petalFall opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 100}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            {i % 3 === 0 ? "🌹" : i % 3 === 1 ? "❤️" : "💕"}
          </div>
        ))}
      </div>

      {/* YouTube Player */}
      {embedUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <iframe
            width="200"
            height="113"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
            {builderData.pageTitle || "Preencha o título da página"}
          </h1>
        </div>

        {/* Counter */}
        {builderData.startDate && (
          <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-rose-500/20">
            <h2 className="text-lg font-light mb-4 text-center text-rose-400">Nosso Tempo Juntos</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-light text-rose-400">{timeElapsed.years}</div>
                <div className="text-xs text-rose-300/70">{timeElapsed.years === 1 ? "ano" : "anos"}</div>
              </div>
              <div>
                <div className="text-2xl font-light text-rose-400">{timeElapsed.months}</div>
                <div className="text-xs text-rose-300/70">{timeElapsed.months === 1 ? "mês" : "meses"}</div>
              </div>
              <div>
                <div className="text-2xl font-light text-rose-400">{timeElapsed.days}</div>
                <div className="text-xs text-rose-300/70">{timeElapsed.days === 1 ? "dia" : "dias"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Photos Carousel */}
        {builderData.photos.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-rose-500/20">
            <h2 className="text-xl font-bold text-rose-400 mb-3 text-center">Nossas Memórias</h2>
            <div className="relative group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src={builderData.photos[currentPhotoIndex].preview || "/placeholder.svg"}
                  alt="Foto"
                  className="w-full h-full object-cover"
                />
                {builderData.photos.length > 1 && (
                  <>
                    <Button
                      onClick={() =>
                        setCurrentPhotoIndex((prev) => (prev === 0 ? builderData.photos.length - 1 : prev - 1))
                      }
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPhotoIndex((prev) => (prev === builderData.photos.length - 1 ? 0 : prev + 1))
                      }
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {builderData.photos[currentPhotoIndex].caption && (
                <p className="text-center text-sm text-rose-800 font-semibold mt-2">
                  {builderData.photos[currentPhotoIndex].caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Love Text */}
        {builderData.loveText && (
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-rose-500/20">
            <h2 className="text-xl font-bold text-rose-400 mb-3 text-center">Minha Carta de Amor</h2>
            <p className="text-rose-300 text-sm leading-relaxed whitespace-pre-wrap">{builderData.loveText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
