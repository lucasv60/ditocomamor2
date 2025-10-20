"use client"

import { useState, useEffect } from "react"

interface EnvelopeWrapperProps {
  children: React.ReactNode
}

export function EnvelopeWrapper({ children }: EnvelopeWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if envelope was already opened in this session
    const envelopeOpened = sessionStorage.getItem('envelope-opened')
    if (envelopeOpened === 'true') {
      setIsOpen(true)
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="container relative w-full max-w-3xl mx-auto cursor-pointer" onClick={handleOpenEnvelope}>
        <div className="perspective-wrapper w-full h-[500px] flex items-center justify-center" style={{ perspective: '1000px' }}>
          <div className="card-wrapper relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d', transition: 'all 0.5s ease' }}>
            <div className="envelope-container relative w-[450px] h-[320px] overflow-hidden rounded-md border-4 border-rose-500">
              <div className="envelope-body absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-200 to-rose-300 shadow-2xl" style={{ transition: 'all 0.5s ease' }}>
                <div className="inner-border absolute inset-4 border-2 border-rose-500/30 rounded-sm"></div>

                {/* Floating hearts */}
                <div className="floating-heart absolute opacity-0 top-20 left-8" style={{ animation: 'floatUp 2s ease-out forwards' }}>
                  <svg className="w-6 h-6 text-rose-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="floating-heart absolute opacity-0 top-20 right-12" style={{ animation: 'floatUp 2s ease-out forwards', animationDelay: '0.2s' }}>
                  <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="floating-heart absolute opacity-0 bottom-12 left-16" style={{ animation: 'floatUp 2s ease-out forwards', animationDelay: '0.4s' }}>
                  <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                  </svg>
                </div>
              </div>

              {/* Envelope flap */}
              <div className="envelope-flap absolute top-0 left-1/2 transform -translate-x-1/2 w-[450px] h-40 z-20">
                <div className="flap-background absolute inset-0 bg-gradient-to-br from-rose-300 to-pink-300" style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}></div>
                <div className="flap-border-left absolute top-0 left-0 w-full h-full border-l-4 border-red-700" style={{ clipPath: 'polygon(0 0, 50% 100%, 50% 100%, 0 0)', transformOrigin: 'top left' }}></div>
                <div className="flap-border-right absolute top-0 right-0 w-full h-full border-r-4 border-red-700" style={{ clipPath: 'polygon(100% 0, 50% 100%, 50% 100%, 100% 0)', transformOrigin: 'top right' }}></div>
              </div>

              {/* Seal */}
              <div className="seal absolute top-16 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl z-30">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="glow-effect absolute inset-0 bg-rose-500/30 rounded-full blur-[60px] opacity-0" style={{ animation: 'pulse 2s ease-in-out infinite' }}></div>
        </div>

        {/* Click message */}
        <div className="text-center mt-8">
          <p className="text-white text-xl font-medium">Clique para abrir</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .container:hover .card-wrapper {
          transform: translateZ(50px) scale(1.1);
        }

        .container:hover .envelope-body {
          box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.5);
        }

        .container:hover .glow-effect {
          opacity: 1;
        }

        .container:hover .floating-heart {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .envelope-container {
            width: 350px !important;
            height: 250px !important;
          }

          .envelope-flap {
            width: 350px !important;
            height: 125px !important;
          }
        }
      `}</style>
    </div>
  )
}