"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export function LetterCard() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-full max-w-sm mx-auto cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label="Clique para abrir sua carta de amor"
      aria-describedby="letter-instruction"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // O clique é tratado pelo onClick do componente pai
        }
      }}
    >
      <div className="relative w-full h-80 flex items-center justify-center">
        {/* Envelope completo - corpo e tampa juntos */}
        <div className={`relative w-72 h-56 transition-all duration-300 ${
          isHovered ? 'transform translate-y-[-8px] scale-105' : ''
        }`}>
          {/* Envelope body */}
          <div className="relative w-full h-full bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 rounded-lg shadow-2xl border-4 border-rose-400">
            {/* Inner decorative border */}
            <div className="absolute inset-4 border-2 border-rose-400/30 rounded" />

            {/* Floating hearts on hover */}
            {isHovered && (
              <>
                <div className="absolute top-8 left-8 animate-float-up">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                </div>
                <div className="absolute top-12 right-12 animate-float-up animation-delay-200">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                </div>
                <div className="absolute bottom-12 left-16 animate-float-up animation-delay-400">
                  <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                </div>
              </>
            )}
          </div>

          {/* Envelope flap - posição ideal */}
          <div
            className="absolute top-4 left-0 w-full h-24 bg-gradient-to-br from-rose-300 to-pink-300 border-4 border-rose-400 border-t-0 origin-bottom"
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            }}
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl z-30">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Enhanced glow effect */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/40 via-pink-400/40 to-rose-400/40 blur-2xl rounded-full animate-pulse" />
        )}
      </div>

      {/* Text below */}
      <div className="text-center mt-4">
        <p className="text-rose-300 text-lg font-medium" id="letter-instruction">
          Clique para abrir sua carta de amor
        </p>
      </div>
    </div>
  )
}
