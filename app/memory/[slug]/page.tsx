import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase'
import { Memory } from '@/lib/types'
import { RomanticPreview } from '@/components/builder/romantic-preview'

// Helper function to get signed URLs for photos
async function getSignedUrls(photoUrls: string[]) {
  const signedUrls = await Promise.all(
    photoUrls.map(async (url) => {
      // Extract file path from Supabase URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-signed-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: fileName }),
        })

        if (response.ok) {
          const data = await response.json()
          return data.data.signedUrl
        } else {
          console.error('Failed to get signed URL for:', fileName)
          return url // fallback to original URL
        }
      } catch (error) {
        console.error('Error getting signed URL:', error)
        return url // fallback to original URL
      }
    })
  )

  return signedUrls
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function MemoryPage({ params }: PageProps) {
  const { slug } = params

  // Fetch memory data from Supabase
  const { data: memory, error } = await supabaseServer
    .from('memories')
    .select('*')
    .eq('slug', slug)
    .eq('payment_status', 'paid')
    .single()

  if (error || !memory) {
    notFound()
  }

  // Get signed URLs for photos if they exist
  let signedPhotoUrls = memory.photos_urls || []
  if (memory.photos_urls && memory.photos_urls.length > 0) {
    signedPhotoUrls = await getSignedUrls(memory.photos_urls)
  }

  // Transform data to match the expected format for RomanticPreview
  const pageData = {
    pageName: memory.slug,
    pageTitle: memory.title,
    startDate: memory.relationship_start_date ? new Date(memory.relationship_start_date) : null,
    loveText: memory.love_letter_content,
    youtubeUrl: memory.youtube_music_url || '',
    photos: signedPhotoUrls.map((url: string, index: number) => ({
      preview: url,
      caption: `Foto ${index + 1}`,
      public_id: `photo-${index}`
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <RomanticPreview builderData={pageData} />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params

  const { data: memory } = await supabaseServer
    .from('memories')
    .select('title')
    .eq('slug', slug)
    .eq('payment_status', 'paid')
    .single()

  if (!memory) {
    return {
      title: 'Página não encontrada'
    }
  }

  return {
    title: memory.title,
    description: 'Uma página especial de amor e memórias',
    openGraph: {
      title: memory.title,
      description: 'Uma página especial de amor e memórias',
      type: 'website',
    },
  }
}