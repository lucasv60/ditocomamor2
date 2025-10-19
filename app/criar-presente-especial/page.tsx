"use client"

import { useState, useEffect } from "react"
import { FormSection } from "@/components/builder/form-section"
import { PreviewSection } from "@/components/builder/preview-section"
import { toast } from "sonner"

export type BuilderData = {
  pageName: string
  pageTitle: string
  startDate: Date | null
  photos: Array<{ file: File; preview: string; caption: string }>
  loveText: string
  youtubeUrl: string
}

export default function BuilderPage() {
  const [builderData, setBuilderData] = useState<BuilderData>({
    pageName: "",
    pageTitle: "",
    startDate: null,
    photos: [],
    loveText: "",
    youtubeUrl: "",
  })

  // Auto-save to localStorage
  const saveToLocalStorage = (data: BuilderData) => {
    try {
      const dataToSave = {
        ...data,
        photos: data.photos.map(photo => ({
          // Blob URLs won't persist across sessions, so we save null for preview
          preview: photo.preview && photo.preview.startsWith && photo.preview.startsWith('blob:') ? null : photo.preview,
          caption: photo.caption
        }))
      }
      localStorage.setItem('love-page-draft', JSON.stringify(dataToSave))
    } catch (error) {
      console.warn('Failed to save draft to localStorage:', error)
    }
  }

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('love-page-draft')
        if (saved) {
          const parsedData = JSON.parse(saved)
          setBuilderData({
            ...parsedData,
            startDate: parsedData.startDate ? new Date(parsedData.startDate) : null,
            photos: parsedData.photos.map((photo: any) => ({
              ...photo,
              file: null // File objects can't be serialized
            }))
          })
          toast.info('Rascunho carregado automaticamente')
        }
      } catch (error) {
        console.warn('Failed to load draft from localStorage:', error)
      }
    }
  }, [])

  const handleDataChange = (data: BuilderData) => {
    setBuilderData(data)
    saveToLocalStorage(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent text-center mb-8">
          Crie Sua Página de Amor
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 items-start lg:items-start">
          <FormSection builderData={builderData} setBuilderData={handleDataChange} />
          <PreviewSection builderData={builderData} />
        </div>
      </div>
    </div>
  )
}
