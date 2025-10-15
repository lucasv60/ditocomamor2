"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import type { BuilderData } from "@/app/criar-presente-especial/page"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  builderData: BuilderData
  setBuilderData: (data: BuilderData) => void
}

export function FormSection({ builderData, setBuilderData }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateData = (field: keyof BuilderData, value: any) => {
    setBuilderData({ ...builderData, [field]: value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validações de arquivo
    const maxFiles = 10
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (builderData.photos.length + files.length > maxFiles) {
      toast.error(`Você pode adicionar no máximo ${maxFiles} fotos`)
      return
    }

    const invalidFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        toast.error(`Arquivo "${file.name}" é muito grande. Tamanho máximo: 5MB`)
        return true
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: "${file.name}". Use apenas JPG, PNG, GIF ou WebP`)
        return true
      }
      return false
    })

    if (invalidFiles.length > 0) return

    setLoading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro no upload')
        }

        const result = await response.json()

        return {
          file,
          preview: result.url,
          caption: "",
          public_id: result.public_id,
        }
      })

      const newPhotos = await Promise.all(uploadPromises)

      updateData("photos", [...builderData.photos, ...newPhotos])
      toast.success(`${files.length} foto(s) enviada(s) com sucesso!`)
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar fotos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = builderData.photos.filter((_, i) => i !== index)
    updateData("photos", newPhotos)
  }

  const updatePhotoCaption = (index: number, caption: string) => {
    const newPhotos = [...builderData.photos]
    newPhotos[index].caption = caption
    updateData("photos", newPhotos)
  }

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return builderData.pageName.length > 0
      case 2:
        return builderData.pageTitle.length > 0
      case 3:
        return builderData.startDate !== null
      case 4:
        return builderData.photos.length > 0
      case 5:
        return builderData.loveText.length > 0
      default:
        return false
    }
  }

  const handleProceedToCheckout = async () => {
    // Validações mais robustas
    if (!builderData.pageName.trim()) {
      toast.error("Por favor, preencha o nome da página")
      return
    }

    if (builderData.pageName.length < 3) {
      toast.error("O nome da página deve ter pelo menos 3 caracteres")
      return
    }

    if (!builderData.pageTitle.trim()) {
      toast.error("Por favor, preencha o título da página")
      return
    }

    if (!builderData.startDate) {
      toast.error("Por favor, selecione a data de início do relacionamento")
      return
    }

    if (builderData.photos.length === 0) {
      toast.error("Por favor, adicione pelo menos uma foto")
      return
    }

    if (!builderData.loveText.trim()) {
      toast.error("Por favor, escreva sua carta de amor")
      return
    }

    if (builderData.loveText.length < 10) {
      toast.error("A carta de amor deve ter pelo menos 10 caracteres")
      return
    }

    // Validar URL do YouTube se fornecida
    if (builderData.youtubeUrl.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/
      if (!youtubeRegex.test(builderData.youtubeUrl.trim())) {
        toast.error("Por favor, insira uma URL válida do YouTube")
        return
      }
    }

    const pageData = {
      ...builderData,
      pageName: builderData.pageName.trim(),
      pageTitle: builderData.pageTitle.trim(),
      loveText: builderData.loveText.trim(),
      youtubeUrl: builderData.youtubeUrl.trim(),
      photos: builderData.photos.map((photo) => ({
        preview: photo.preview,
        caption: photo.caption.trim(),
      })),
    }

    // Salvar dados no sessionStorage para o checkout
    sessionStorage.setItem("pendingLovePage", JSON.stringify(pageData))

    toast.success("Redirecionando para checkout...")

    // Pequeno delay para mostrar o toast
    await new Promise(resolve => setTimeout(resolve, 500))

    // Redirect para checkout
    router.push("/checkout")
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-rose-500/20 lg:sticky lg:top-8 h-fit">
      <div className="space-y-6">
        {/* Step 1: Page Name */}
        <div className="space-y-3">
          <Label htmlFor="pageName" className="text-lg font-semibold text-rose-400">
            1. Nome da Página (URL) *
          </Label>
          <Input
            id="pageName"
            placeholder="ex: nosso-amor"
            value={builderData.pageName}
            onChange={(e) => updateData("pageName", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))}
            className="text-lg bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
            required
            aria-required="true"
            aria-describedby="pageName-help"
            maxLength={50}
          />
          {builderData.pageName && (
            <p id="pageName-help" className="text-sm text-rose-400">
              URL: /{builderData.pageName || "nome-da-pagina"}
            </p>
          )}
        </div>

        {/* Step 2: Page Title */}
        {currentStep >= 2 && (
          <div className="space-y-3 animate-fadeIn">
            <Label htmlFor="pageTitle" className="text-lg font-semibold text-rose-400">
              2. Título da Página *
            </Label>
            <Input
              id="pageTitle"
              placeholder="ex: Nosso Amor Eterno"
              value={builderData.pageTitle}
              onChange={(e) => updateData("pageTitle", e.target.value)}
              className="text-lg bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
              required
              aria-required="true"
              maxLength={100}
            />
          </div>
        )}

        {/* Step 3: Start Date */}
        {currentStep >= 3 && (
          <div className="space-y-3 animate-fadeIn">
            <Label htmlFor="startDate" className="text-lg font-semibold text-rose-400">
              3. Data de Início do Relacionamento *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={builderData.startDate ? builderData.startDate.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value + "T00:00:00") : null
                updateData("startDate", dateValue)
              }}
              className="text-lg h-12 bg-gray-800/50 border-rose-500/30 text-white"
              required
              aria-required="true"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        )}

        {/* Step 4: Photos */}
        {currentStep >= 4 && (
          <div className="space-y-3 animate-fadeIn">
            <Label className="text-lg font-semibold text-rose-400">4. Fotos Especiais *</Label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-rose-500/30 rounded-lg p-6 text-center hover:border-rose-400/50 transition-colors bg-gray-800/30">
                <input
                  type="file"
                  id="photoUpload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  aria-describedby="photo-help"
                />
                <label htmlFor="photoUpload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-rose-400 mb-2" aria-hidden="true" />
                  <p className="text-rose-300">Clique para adicionar fotos (até 10 fotos)</p>
                  <p id="photo-help" className="text-xs text-gray-400 mt-1">Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB por foto</p>
                </label>
              </div>

              {builderData.photos.map((photo, index) => (
                <div key={index} className="relative border border-rose-500/20 rounded-lg p-3 space-y-2 bg-gray-800/30">
                  <div className="flex items-start gap-3">
                    <img
                      src={photo.preview || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Input
                        placeholder="Legenda da foto"
                        value={photo.caption}
                        onChange={(e) => updatePhotoCaption(index, e.target.value)}
                        className="bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhoto(index)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Love Text */}
        {currentStep >= 5 && (
          <div className="space-y-3 animate-fadeIn">
            <Label htmlFor="loveText" className="text-lg font-semibold text-rose-400">
              5. Carta de Amor *
            </Label>
            <Textarea
              id="loveText"
              placeholder="Escreva sua mensagem de amor aqui..."
              value={builderData.loveText}
              onChange={(e) => updateData("loveText", e.target.value)}
              className="min-h-[200px] text-base bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
              required
              aria-required="true"
              maxLength={2000}
              aria-describedby="loveText-count"
            />
            <p id="loveText-count" className="text-xs text-gray-400">
              {builderData.loveText.length}/2000 caracteres
            </p>
          </div>
        )}

        {/* Step 6: YouTube URL */}
        {currentStep >= 6 && (
          <div className="space-y-3 animate-fadeIn">
            <Label htmlFor="youtubeUrl" className="text-lg font-semibold text-rose-400">
              6. Música do YouTube (opcional)
            </Label>
            <Input
              id="youtubeUrl"
              placeholder="ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={builderData.youtubeUrl}
              onChange={(e) => updateData("youtubeUrl", e.target.value)}
              className="text-lg bg-gray-800/50 border-rose-500/30 text-white placeholder:text-gray-500"
              type="url"
              aria-describedby="youtube-help"
            />
            <p id="youtube-help" className="text-xs text-gray-400">
              Cole o link completo do vídeo do YouTube. O vídeo tocará automaticamente na página.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="pt-4">
          {currentStep < 6 && canProceed(currentStep) && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-lg py-6 font-semibold"
            >
              Próximo
            </Button>
          )}

          {currentStep === 6 && canProceed(5) && (
            <Button
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg py-6 font-semibold"
            >
              Seguir para Finalização da Compra
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
