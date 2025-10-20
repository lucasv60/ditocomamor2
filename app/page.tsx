import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check, Heart, Globe } from "lucide-react"
import Image from "next/image"
import { LetterCard } from "@/components/letter-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 py-3 text-center">
        <p className="text-sm md:text-base font-medium">
          Dia Internacional da Namorada! Todos os planos com 50% de desconto!
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold">Dito com Amor</span>
          </Link>
          <nav className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <Link href="/criar-presente-especial" className="text-gray-400 hover:text-white transition-colors text-sm">
              Galeria de Memórias
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Não dê um presente tradicional.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">
                Dê algo que faz o coração bater mais forte.
              </span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed">
              Transforme momentos simples em surpresas emocionantes.
            </p>

            <p className="text-base text-gray-400 leading-relaxed">
              Seja um aniversário, casamento ou só porque você lembra — crie sua memória única agora e envie pra quem
              você ama.
            </p>

            <p className="text-base text-gray-400 leading-relaxed">
              Em minutos, você tem tudo pronto pra eternizar um sentimento.
            </p>

            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">50% de desconto! - Dia Internacional da Namorada!</p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-pink-500/50"
              >
                <Link href="/criar-presente-especial">Crie sua memória</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Mockups */}
          <div className="relative min-h-[400px] lg:min-h-[500px]">
            <div className="relative z-10">
              {/* Mobile Mockup */}
              <div className="relative w-[280px] mx-auto">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl border border-gray-700">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-black px-6 py-3 flex items-center justify-between text-xs">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-3 bg-white rounded-sm" />
                        <div className="w-4 h-3 bg-white rounded-sm" />
                        <div className="w-4 h-3 bg-white rounded-sm" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="bg-gradient-to-br from-gray-900 to-black p-4 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span>Sua memória está pronta</span>
                      </div>
                      <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-2xl p-4 border border-pink-500/20">
                        <Image
                          src="/romantic-couple-illustration.jpg"
                          alt="Couple"
                          width={200}
                          height={200}
                          className="w-full rounded-xl mb-3"
                        />
                        <div className="space-y-2">
                          <h3 className="font-bold text-sm">Eu te amei por</h3>
                          <p className="text-xs text-gray-400">2 anos, 4 meses, 22 dias, 10 horas e 26 segundos</p>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            A cada dia que passa meu coração se enche de ainda mais carinho e admiração por você...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Mockup - Positioned behind */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] hidden lg:block z-0">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 shadow-2xl border border-gray-700">
                  <div className="bg-black rounded-xl overflow-hidden">
                    <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-800">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black">
                      <Image
                        src="/romantic-couple.png"
                        alt="Couple photo"
                        width={400}
                        height={300}
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Counter */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center z-20">
              <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-full px-6 py-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-gray-900" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-gray-900" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-gray-900" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 border-2 border-gray-900" />
                </div>
                <span className="text-sm text-gray-300">+45.000 memórias eternizadas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 md:py-32 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-balance">Como funciona</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <CardTitle className="text-xl text-white">Preencha os campos</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-400">
                    Siga os passos do formulário e construa sua memória.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <CardTitle className="text-xl text-white">Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-400">
                    Faça o pagamento seguro com Cartão de Crédito ou PIX.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <CardTitle className="text-xl text-white">QR Code e Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-400">
                    Você receberá instantaneamente o QR code e um link via email para acessar sua memória.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <CardTitle className="text-xl text-white">Compartilhe a Memória</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-400">
                    Faça uma surpresa ou guarde sua memória compartilhando o link ou o QR code.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-balance">Investimento</h2>
            <Card className="bg-gray-900 border-gray-800 shadow-2xl max-w-md mx-auto">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold mb-2 text-white">Presente Personalizado</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">
                    R$ 10,00
                  </span>
                </div>
                <CardDescription className="text-base mt-2 text-gray-400">Pagamento único</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Página personalizada com suas fotos e mensagens</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Contador de tempo do relacionamento</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Música de fundo personalizada (YouTube)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">QR Code exclusivo para compartilhar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Link permanente da sua memória</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Entrega instantânea por email</span>
                  </li>
                </ul>
                <div className="pt-6">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  >
                    <Link href="/criar-presente-especial">Começar Agora</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-balance">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  Como funciona o presente personalizado?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Você preenche um formulário simples com informações sobre seu relacionamento, adiciona fotos, escreve
                  uma mensagem especial e escolhe uma música. Criamos uma página única e emocionante que você pode
                  compartilhar através de um link ou QR code.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  Quantas fotos posso adicionar?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Você pode adicionar até 10 fotos especiais com legendas personalizadas para cada uma delas. As fotos
                  serão exibidas em um carrossel elegante na página.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  Quando recebo o link e QR code?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Assim que o pagamento for confirmado, você receberá instantaneamente por email o link da sua página
                  personalizada e o QR code para compartilhar. O processo é totalmente automático e rápido.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  A página fica disponível para sempre?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Sim! Sua página personalizada fica hospedada permanentemente e pode ser acessada a qualquer momento
                  através do link ou QR code. É uma memória eterna que você pode revisitar sempre que quiser.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  Posso editar depois de criar?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Após a criação, a página fica permanente para garantir a autenticidade da memória. Mas você pode criar
                  quantas páginas diferentes quiser para diferentes ocasiões ou pessoas especiais.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-gray-800 rounded-lg px-6 bg-gray-900">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-white">
                  Quais formas de pagamento são aceitas?
                </AccordionTrigger>
                <AccordionContent className="text-base text-gray-400">
                  Aceitamos pagamento via Cartão de Crédito (todas as bandeiras) e PIX. O pagamento é processado de
                  forma segura através da plataforma Stripe.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Pronto para criar uma memória inesquecível?</h2>
            <p className="text-xl text-gray-400 text-pretty">
              Comece agora e surpreenda quem você ama com um presente único e emocionante.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-pink-500/50"
            >
              <Link href="/criar-presente-especial">Criar Meu Presente</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">Pronto para surpreender quem você ama?</h2>
              <p className="text-xl text-gray-400 text-pretty max-w-2xl mx-auto">
                Crie uma página personalizada com fotos, mensagens e músicas especiais. Um presente único e inesquecível.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-pink-500/50"
                >
                  <Link href="/criar-presente-especial">
                    <Heart className="w-5 h-5 mr-2" />
                    Criar Presente Especial
                  </Link>
                </Button>
                <div className="text-sm text-gray-500">
                  A partir de <span className="text-pink-400 font-semibold">R$ 10,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 Dito com Amor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
