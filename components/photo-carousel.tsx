"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const photos = [
  {
    url: "/primeiro-encontro.png",
    caption: "Nosso primeiro encontro",
  },
  {
    url: "/dois-anos-namoro.png",
    caption: "Comemorando 2 anos juntos",
  },
  {
    url: "/natal-especial.png",
    caption: "Natal especial",
  },
]

export function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-rose-200">
      <h2 className="text-3xl md:text-4xl font-bold text-rose-900 mb-6 text-center">Nossas Memórias 📸</h2>

      <div className="relative group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <img
            src={photos[currentIndex].url || "/placeholder.svg"}
            alt={photos[currentIndex].caption}
            className="w-full h-full object-cover"
          />

          {/* Navigation Buttons */}
          <Button
            onClick={goToPrevious}
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={goToNext}
            variant="secondary"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Caption */}
        <p className="text-center text-xl text-rose-800 font-semibold mt-4">{photos[currentIndex].caption}</p>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-rose-600 w-8" : "bg-rose-300 hover:bg-rose-400"
              }`}
              aria-label={`Ir para foto ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
