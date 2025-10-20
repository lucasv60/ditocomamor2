import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase'
import { Memory } from '@/lib/types'
import { RomanticPreview } from '@/components/builder/romantic-preview'

// Helper function to get signed URLs for photos
async function getSignedUrls(photoUrls: string[]) {
  console.log('Original photo URLs:', photoUrls)

  const signedUrls = await Promise.all(
    photoUrls.map(async (url) => {
      // Extract file path from Supabase URL using URL constructor for robustness
      let fileName = ''

      try {
        const fullUrl = url
        const urlParts = new URL(fullUrl)
        // pathname will be something like /storage/v1/object/public/memories-photos/123-foto.png
        const path = urlParts.pathname

        // Extract only the part that starts after the bucket name ('memories-photos/')
        const BUCKET_NAME = 'memories-photos'
        const bucketIndex = path.indexOf(BUCKET_NAME)

        if (bucketIndex !== -1) {
          fileName = path.substring(bucketIndex + BUCKET_NAME.length + 1) // +1 for the slash
        } else {
          // Fallback: if bucket name not found, take the last part
          const pathParts = path.split('/')
          fileName = pathParts[pathParts.length - 1]
        }

        console.log('Extracted fileName from URL:', url, '->', fileName, '(from path:', path, ')')
      } catch (error) {
        console.error('Error parsing URL:', url, error)
        // Fallback for non-URL strings
        if (url.includes('/')) {
          const urlParts = url.split('/')
          fileName = urlParts[urlParts.length - 1]
        } else {
          fileName = url
        }
        console.log('Fallback extraction for URL:', url, '->', fileName)
      }

      if (!fileName) {
        console.error('Could not extract filename from URL:', url)
        return url // fallback to original URL
      }

      try {
        console.log('Calling API with filePath:', fileName)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-signed-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: fileName }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Got signed URL for', fileName, ':', data.data?.signedUrl)
          return data.data.signedUrl
        } else {
          const errorText = await response.text()
          console.error('Failed to get signed URL for:', fileName, 'Response:', response.status, errorText)
          return url // fallback to original URL
        }
      } catch (error) {
        console.error('Error getting signed URL for', fileName, ':', error)
        return url // fallback to original URL
      }
    })
  )

  console.log('Final signed URLs:', signedUrls)
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
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