"use client"

import { useEffect, useState } from "react"

type LoveCounterProps = {
  startDate?: Date
}

export function LoveCounter({ startDate: propStartDate }: LoveCounterProps = {}) {
  const startDate = propStartDate || new Date("2018-03-26")

  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date()
      const diff = now.getTime() - startDate.getTime()

      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const months = Math.floor(days / 30.44)
      const years = Math.floor(months / 12)

      setTimeElapsed({
        years,
        months: months % 12,
        days: days % 30,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60,
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [startDate])

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-lg border border-rose-500/20">
      <h2 className="text-2xl md:text-3xl font-light mb-8 text-center text-rose-400">Nosso Tempo Juntos</h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.years}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.years === 1 ? "ano" : "anos"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.months}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.months === 1 ? "mês" : "meses"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.days}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.days === 1 ? "dia" : "dias"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.hours}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.hours === 1 ? "hora" : "horas"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.minutes}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.minutes === 1 ? "min" : "mins"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-light text-rose-400 mb-1">{timeElapsed.seconds}</div>
          <div className="text-xs md:text-sm text-rose-300/70 font-light">
            {timeElapsed.seconds === 1 ? "seg" : "segs"}
          </div>
        </div>
      </div>
    </div>
  )
}
