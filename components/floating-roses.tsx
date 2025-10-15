"use client"

export function FloatingRoses() {
  const symbols = ["🌹", "❤️", "💕", "🌹", "💖", "🌹", "💗", "❤️", "🌹", "💝", "🌹", "💓", "❤️", "🌹", "💞"]

  const items = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    symbol: symbols[i],
    left: `${Math.random() * 100}%`,
    initialY: `${-100 - Math.random() * 100}vh`,
    delay: `${Math.random() * 5}s`,
    duration: `${10 + Math.random() * 10}s`,
    size: 20 + Math.random() * 30,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-petalFall"
          style={{
            left: item.left,
            top: item.initialY,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: `${item.size}px`,
          }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  )
}
