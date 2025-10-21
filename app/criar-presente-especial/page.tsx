"use client"

import { useState, useEffect } from "react"
import { FormSection } from "@/components/builder/form-section"
import { PreviewSection } from "@/components/builder/preview-section"
import { toast } from "sonner"
import { useUser } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export type BuilderData = {
  pageName: string
  pageTitle: string
  startDate: Date | null
  photos: Array<{ file?: File; preview: string; caption: string; public_id?: string; uploaded?: boolean }>
  loveText: string
  youtubeUrl: string
}

export default function BuilderPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [builderData, setBuilderData] = useState<BuilderData>({
    pageName: "",
    pageTitle: "",
    startDate: null,
    photos: [],
    loveText: "",
    youtubeUrl: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-rose-400 text-xl">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Auto-save to localStorage
  const saveToLocalStorage = (data: BuilderData) => {
    try {
      const dataToSave = {
        ...data,
        photos: data.photos.map(photo => ({
          // Save all previews including blob URLs for preview functionality
          preview: photo.preview,
          caption: photo.caption,
          public_id: photo.public_id,
          uploaded: photo.uploaded
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

  const handleSaveMemory = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar")
      return
    }

    try {
      // Generate unique slug
      const baseSlug = builderData.pageName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      let slug = baseSlug
      let counter = 1

      // Check if slug exists and make it unique
      while (true) {
        const { data: existing } = await supabase
          .from('memories')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!existing) break
        slug = `${baseSlug}-${counter}`
        counter++
      }

      // Prepare data for insertion
      const memoryData = {
        user_id: user.id,
        slug,
        title: builderData.pageTitle,
        relationship_start_date: builderData.startDate?.toISOString(),
        love_letter_content: builderData.loveText,
        youtube_music_url: builderData.youtubeUrl || null,
        photos_urls: builderData.photos.map(photo => photo.preview),
        payment_status: 'pending'
      }

      const { data, error } = await supabase
        .from('memories')
        .insert(memoryData)
        .select()
        .single()

      if (error) {
        console.error('Error saving memory:', error)
        toast.error('Erro ao salvar memória. Tente novamente.')
        return
      }

      toast.success('Memória salva com sucesso! Redirecionando para pagamento...')

      // Redirect to checkout page
      router.push(`/checkout`)

    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Erro inesperado. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent text-center mb-8">
          Crie Sua Página de Amor
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 items-start lg:items-start">
          <FormSection builderData={builderData} setBuilderData={handleDataChange} onSave={handleSaveMemory} />
          <PreviewSection builderData={builderData} />
        </div>
      </div>
    </div>
  )
}
