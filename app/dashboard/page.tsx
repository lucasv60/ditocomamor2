"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, LogOut, User, Eye, Edit, Plus } from "lucide-react"
import { useUser } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Memory {
  id: string
  slug: string
  title: string
  payment_status: string
  created_at: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useUser()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [memoriesLoading, setMemoriesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchMemories = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('memories')
          .select('id, slug, title, payment_status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching memories:', error)
          toast.error('Erro ao carregar memórias')
          return
        }

        setMemories(data || [])
      } catch (error) {
        console.error('Unexpected error:', error)
        toast.error('Erro inesperado ao carregar memórias')
      } finally {
        setMemoriesLoading(false)
      }
    }

    if (user) {
      fetchMemories()
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Logout realizado com sucesso!")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Erro ao fazer logout")
    }
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold">Dito com Amor</span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent mb-4">
              Bem-vindo(a) ao seu Dashboard!
            </h1>
            <p className="text-xl text-gray-400">
              Aqui você poderá gerenciar suas memórias e criar novas experiências.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Info Card */}
            <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Informações da Conta</CardTitle>
                    <CardDescription className="text-gray-400">
                      Detalhes do seu perfil
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">ID do Usuário</label>
                  <p className="text-white font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Último Login</label>
                  <p className="text-white">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                      : 'Primeiro acesso'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie suas memórias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  onClick={() => router.push("/criar-presente-especial")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Nova Memória
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                >
                  Configurações
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Memories List Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent mb-8 text-center">
              Suas Memórias Criadas
            </h2>

            {memoriesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-rose-400 text-xl">Carregando suas memórias...</p>
              </div>
            ) : memories.length === 0 ? (
              <Card className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20 max-w-2xl mx-auto">
                <CardContent className="text-center py-12">
                  <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-white mb-2">Você ainda não tem memórias</h3>
                  <p className="text-gray-400 mb-6">
                    Que tal criar a primeira memória especial para alguém que você ama?
                  </p>
                  <Button
                    onClick={() => router.push("/criar-presente-especial")}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Minha Primeira Memória
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {memories.map((memory) => (
                  <Card key={memory.id} className="bg-gray-900/80 backdrop-blur-sm border-rose-500/20 hover:border-rose-400/40 transition-colors min-w-0">
                    <CardHeader>
                      <CardTitle className="text-white text-lg line-clamp-2">{memory.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Criada em {new Date(memory.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          memory.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-sm text-gray-400">
                          {memory.payment_status === 'paid' ? 'Publicado' : 'Aguardando pagamento'}
                        </span>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {memory.payment_status !== 'paid' && (
                          <Link href={`/checkout?memoryId=${memory.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            >
                              Ir para o pagamento
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => router.push(`/memory/${memory.slug}`)}
                          disabled={memory.payment_status !== 'paid'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => toast.info("Edição em desenvolvimento")}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}