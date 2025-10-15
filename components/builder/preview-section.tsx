"use client"

import { RomanticPreview } from "./romantic-preview"
import type { BuilderData } from "@/app/criar-presente-especial/page"

type Props = {
  builderData: BuilderData
}

export function PreviewSection({ builderData }: Props) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-rose-500/20 lg:sticky lg:top-8 h-fit">
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent text-center">
          Preview ao Vivo
        </h2>
        <p className="text-center text-rose-300 text-sm">Veja como sua página está ficando</p>
      </div>

      {/* Mobile: Preview em modal/colapsível */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl p-4 text-center transition-colors">
            <span className="text-rose-300 font-medium">👀 Ver Preview</span>
            <span className="ml-2 text-rose-400 group-open:rotate-180 transition-transform inline-block">▼</span>
          </summary>
          <div className="mt-4 border-4 border-rose-500/30 rounded-2xl overflow-hidden bg-black max-h-96 overflow-y-auto">
            <RomanticPreview builderData={builderData} />
          </div>
        </details>
      </div>

      {/* Desktop: Preview fixo */}
      <div className="hidden lg:block border-4 border-rose-500/30 rounded-2xl overflow-hidden bg-black">
        <div className="aspect-[3/4] overflow-y-auto">
          <RomanticPreview builderData={builderData} />
        </div>
      </div>
    </div>
  )
}
