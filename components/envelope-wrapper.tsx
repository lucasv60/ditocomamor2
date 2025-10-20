"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface EnvelopeWrapperProps {
  children: React.ReactNode
}

export function EnvelopeWrapper({ children }: EnvelopeWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // Check if envelope was already opened in this session
    const envelopeOpened = sessionStorage.getItem('envelope-opened')
    if (envelopeOpened === 'true') {
      setIsOpen(true)
    } else {
      setShowAnimation(true)
    }
  }, [])

  const handleOpenEnvelope = () => {
    setIsOpen(true)
    sessionStorage.setItem('envelope-opened', 'true')
  }

  if (isOpen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Floating Roses and Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
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

      <div className="text-center space-y-8 relative z-10">
        {/* Envelope SVG */}
        <div className="mx-auto w-64 h-48 relative">
          <svg
            viewBox="0 0 256 192"
            className={`w-full h-full transition-all duration-1000 ${showAnimation ? 'animate-pulse' : ''}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Envelope body */}
            <path
              d="M20 40 L236 40 L236 152 L20 152 Z"
              fill="#DC2626"
              stroke="#B91C1C"
              strokeWidth="2"
            />
            {/* Envelope flap */}
            <path
              d="M20 40 L128 96 L236 40"
              fill="#F87171"
              stroke="#B91C1C"
              strokeWidth="2"
            />
            {/* Heart on envelope */}
            <path
              d="M128 80 C118 70, 108 70, 108 78 C108 82, 113 86, 118 90 C113 94, 108 98, 108 102 C108 110, 118 110, 128 100 C138 110, 148 110, 148 102 C148 98, 143 94, 138 90 C143 86, 148 82, 148 78 C148 70, 138 70, 128 80 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
            Você Recebeu uma Carta de Amor! 💌
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Uma mensagem especial está esperando por você. Clique no envelope para abrir e descobrir o que seu amor preparou.
          </p>
        </div>

        {/* Open Button */}
        <Button
          onClick={handleOpenEnvelope}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xl py-6 px-12 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Heart className="w-6 h-6 mr-3" />
          Abrir Carta de Amor
        </Button>

        {/* Additional decorative elements */}
        <div className="flex justify-center space-x-4 mt-8">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🌹</div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>💕</div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🌹</div>
        </div>
      </div>
    </div>
  )
}