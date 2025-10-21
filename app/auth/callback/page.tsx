"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== AUTH CALLBACK STARTED ===')

        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Erro na autenticação. Tente novamente.')
          router.push('/login')
          return
        }

        if (data.session) {
          console.log('=== AUTH SUCCESSFUL ===')
          console.log('User:', data.session.user.email)
          toast.success('Login realizado com sucesso!')
          router.push('/dashboard')
        } else {
          console.log('=== NO SESSION FOUND ===')
          toast.error('Sessão não encontrada. Tente fazer login novamente.')
          router.push('/login')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        toast.error('Erro inesperado. Tente novamente.')
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="text-rose-400 text-xl">Verificando autenticação...</p>
      </div>
    </div>
  )
}