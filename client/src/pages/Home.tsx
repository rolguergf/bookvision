import { Button } from "@/components/ui/button";
import logoImg from "../assets/images/logo.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Zap, Eye, TrendingUp, Lock, Users, Headphones, ArrowRight, Loader2, FileText } from "lucide-react";
import { useState, useEffect } from "react";

// Declaração de tipos para o Netlify Identity
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect para Gestão dos assinantes
  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.init();
      
      // Define o usuário inicial
      setUser(window.netlifyIdentity.currentUser());

      // Escuta eventos de login e logout
      window.netlifyIdentity.on('login', (user: any) => setUser(user));
      window.netlifyIdentity.on('logout', () => setUser(null));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (email) {
      try {
        // Envia como FormData ao invés de JSON
        const formData = new URLSearchParams();
        formData.append('email', email);
        
        await fetch('https://script.google.com/macros/s/AKfycbxJos4PgFVkD6N0lCDPBNsvPfwRNkVAXDtYHfZDFEHlz_1-Z9PhHXFQa9kC9pblq53i/exec', {
          method: 'POST',
          body: formData
        });
        
        // --- CÓDIGO DO GOOGLE ADS AQUI ---
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'send_to': 'AW-17858495642/GgmaCO-k3d4bEJqJzMNC'
          });
        }
        // ---------------------------------

        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 3000);
      } catch (error) {
        console.error('Erro ao salvar email:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a1e2c]/95 backdrop-blur-md border-b border-slate-800">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img 
              src={logoImg} 
              alt="BookVision Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="hidden md:flex items-center gap-8">

            {/* Botão Assistir ao vivo */}            
            <a 
              href="/live" 
              className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Assistir Ao Vivo
            </a>            

            <a href="#features" className="text-sm text-slate-300 hover:text-white transition">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition">Planos</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>            

            {/* Botão de Login/Logout dinâmico */}
            <button 
              onClick={() => user ? window.netlifyIdentity.logout() : window.netlifyIdentity.open('login')} 
              className="text-sm text-slate-300 hover:text-white transition bg-transparent border-none p-0 cursor-pointer"
            >
              {user ? 'Sair' : 'Login'}
            </button>

            {/* Ícones de redes sociais */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
              <a 
                href="https://www.instagram.com/bookvision_br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-pink-500 transition"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@bookvision_br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-red-500 transition"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
              <a 
                href="https://discord.gg/uBatxMZ2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-indigo-400 transition"
                aria-label="Discord"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <span className="text-sm text-cyan-300 font-medium">Tecnologia Institucional para transformar Traders em Elite</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Pare de operar no escuro. <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Veja a liquidez real do mercado.</span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              BookVision é a primeira plataforma brasileira de Order Flow de nível institucional. Desenvolvida por um trader profissional que entende o mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-8"
                asChild
              >
                <a href="#pricing">
                  Quero acesso ao BookVision <ChevronRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              ⚡ Se você já perdeu dinheiro em rompimentos falsos, isso é para você.
            </p>
          </div>

          {/* Hero Video */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/50 backdrop-blur">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/EhuKzfDk0rE?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&playlist=EhuKzfDk0rE&rel=0"
                className="w-full h-full rounded-2xl"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta1" className="py-20 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-t border-slate-700">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Você entra no rompimento… e o preço volta contra você?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Veja onde o institucional usa o varejo como liquidez — antes do candle fechar.
          </p>

          <Button 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-3 h-auto text-lg font-semibold"
            asChild
          >
            <a href="#pricing">
              Ver a manipulação de mercado
            </a>
          </Button>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Por que BookVision?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-400">❌ O Problema</h3>
              <ul className="space-y-4">
                {[
                  "Apenas candles e indicadores atrasados",
                  "Movimentos sem entender a causa",
                  "Entradas baseadas em rompimentos falsos",
                  "Stops constantes por falta de contexto",
                  "Preço se movendo sem explicação aparente"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300">
                    <span className="text-red-400 font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-cyan-400">✅ A Solução</h3>
              <ul className="space-y-4">
                {[
                  "Onde a liquidez realmente está posicionada",
                  "Agressão compradora e vendedora em tempo real",
                  "Absorções e defesas de preço",
                  "Desequilíbrios antes do movimento acontecer",
                  "Contexto para operar com mais precisão"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-300">
                    <span className="text-cyan-400 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>                
            <div className="mt-32">
              <h2 className="text-4xl font-bold text-center">
                Preço é consequência.{" "}
                <span className="text-cyan-400">Liquidez é a causa.</span>
              </h2>
            </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Funcionalidades Principais</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="w-8 h-8" />,
                title: "Nunca mais caia em rompimento falso",
                description:
                  "Veja exatamente onde estão as ordens de defesa antes do preço testar a região. Identifique armadilhas antes de entrar."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Saiba se o movimento é real ou manipulação",
                description:
                  "Veja se há agressão compradora sustentando a subida ou se é apenas varejo sendo liquidado. Pare de ficar preso em falsos movimentos."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Absorções e Defesas",
                description:
                  "Identificação visual de absorções, defesas de preço e possíveis armadilhas antes de rompimentos falsos."
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Contexto Institucional",
                description:
                  "Entenda se o movimento é continuidade, correção ou distribuição com base no comportamento da liquidez."
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Diário de Trades Individual",
                description:
                  "Registre suas operações, acompanhe sua taxa de acerto e tenha um relatório completo da sua performance diária de forma organizada."
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "Feedback Contínuo",
                description:
                  "O BookVision evolui com base no uso real e no feedback dos traders que utilizam a ferramenta diariamente."
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition">
                <CardHeader>
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            O que os traders estão dizendo no chat ao vivo
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                    RC
                  </div>
                  <div>
                    <p className="font-bold text-white">Ricardo C.</p>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "Mano, a leitura de hoje foi bizarra. Eu teria boletado na compra naquele topo, mas o BookVision mostrou a absorção gigante lá. 
                  Esperei o fluxo virar e peguei a volta toda. Ver o mapa de liquidez muda o jogo."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                    MF
                  </div>
                  <div>
                    <p className="font-bold text-white">Marcos F.</p>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "O que eu mais curto é que finalmente parei de adivinhar fundo. O mapa de ordens não mente. 
                  O preço bate nas zonas que a ferramenta marca e respeita demais. Vale cada centavo da assinatura."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                    F
                  </div>
                  <div>
                    <p className="font-bold text-white">Francisco</p>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "Pra quem faz scalp no BTC, isso aqui é obrigatório. Ontem peguei 3 reversões seguidas só olhando a absorção no mapa de liquidez. 
                  O preço chegava na zona de liquidez, o book 'encorpava' e o fluxo de venda morria. 
                  Sem a ferramenta, eu teria sido stopado em todas tentando adivinhar o rompimento."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-slate-900/50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Planos de Acesso
          </h2>
          <p className="text-center text-slate-400 mb-16">
            Escolha o plano que melhor se adequa ao seu estilo de trading
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Acesso Essencial */}
            <Card className="relative bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  DISPONÍVEL AGORA
                </span>
              </div>

              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Acesso Essencial
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Para quem quer sair do óbvio
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">R$ 147</span>
                  <span className="text-slate-300 ml-2">/mês</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Acesso às transmissões ao vivo do BookVision",
                    "Leitura institucional do Bitcoin",
                    "Mapa de liquidez e agressão em tempo real",
                    "Sinais de absorções institucionais",
                    "Evoluções contínuas da ferramenta"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-slate-200 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => {
                    // PRIMEIRO: Abre o link de pagamento (prioridade = venda)
                    window.open('https://buy.stripe.com/8x200j6ZP8Yu24F5It4AU01', '_blank');
                    
                    // DEPOIS: Dispara evento de conversão do Google Ads
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'conversion', {
                        'send_to': 'AW-17858495642/GgmaCO-k3d4bEJqJzMNC'
                      });
                    }
                  }}
                >
                  Quero ser Trader de Elite
                </Button>
              </CardContent>
            </Card>

            {/* Acesso Profissional */}
            <Card className="relative bg-slate-900/30 border-slate-800 opacity-60">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-1 rounded-full">
                  EM BREVE
                </span>
              </div>

              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Acesso Profissional
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Recomendado para quem opera ativamente
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">R$ 247</span>
                  <span className="text-slate-400 ml-2">/mês</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Tudo do Acesso Essencial",
                    "Salas exclusivas no Discord",
                    "Comentários de leitura e contexto",
                    "Prioridade em novas funcionalidades",
                    "Execução de ordens através do BookVision",
                    "Canal direto para feedback"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button disabled className="w-full bg-slate-800 cursor-not-allowed">
                  Indisponível
                </Button>
              </CardContent>
            </Card>

            {/* Acesso Fundadores */}
            <Card className="relative bg-slate-900/30 border-slate-800 opacity-60">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-1 rounded-full">
                  ENCERRADO
                </span>
              </div>

              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Acesso Antecipado
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Encerrado em 20/01/2026.
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">R$ 97</span>
                  <span className="text-slate-300 ml-2">/mês</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Acesso completo ao BookVision",
                    "Preço congelado vitalício",
                    "Prioridade no acesso à plataforma",
                    "Canal direto para feedback do produto",
                    "Acesso antecipado a novas funcionalidades",
                    "Vagas limitadas"
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-slate-200 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button disabled className="w-full bg-slate-800 cursor-not-allowed">
                  Indisponível
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-t border-slate-700">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">O mercado não se move por acaso.</h2>
          <p className="text-xl text-slate-300 mb-8">
            Veja a liquidez antes do preço e opere com a mesma leitura usada por players institucionais.
          </p>       
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Perguntas Frequentes</h2>

          <div className="space-y-6">
            {[
              {
                q: "O que exatamente é o BookVision?",
                a: "O BookVision é uma ferramenta visual de Order Flow e Liquidez, desenvolvida para leitura institucional do mercado. Ele mostra, em tempo real, onde estão as ordens relevantes, a dinâmica de agressões e o comportamento do preço, indo muito além de gráficos tradicionais."
              },
              {
                q: "O BookVision executa ordens automaticamente?",
                a: "Não. O BookVision não é um robô de trade e não executa ordens por você. Ele é uma ferramenta de leitura e tomada de decisão, usada para identificar contexto, zonas de liquidez, absorções e possíveis pontos de reação do preço."
              },
              {
                q: "Como funciona o acesso ao BookVision no início?",
                a: "O BookVision é transmitido diretamente pelo site, por meio de uma transmissão ao vivo exclusiva, onde os assinantes acompanham a leitura do mercado em tempo real."
              },
              {
                q: "Em quais mercados o BookVision funciona atualmente?",
                a: "Atualmente, o BookVision opera exclusivamente no Bitcoin (BTC), utilizando dados diretos da BitMEX, uma das exchanges com maior qualidade de dados de Order Flow do mercado."
              },
              {
                q: "O BookVision mostra sinais de compra e venda?",
                a: "O BookVision não entrega sinais prontos. Ele mostra o que o mercado está fazendo, não o que você deve fazer."
              },
              {
                q: "Terei acesso direto ao software no meu computador?",
                a: "Não é necessário instalar nenhum software. O desenvolvimento da versão com acesso individual e integração via API da Binance já faz parte do roadmap do BookVision e será liberado em fases futuras."
              },
              {
                q: "O BookVision é indicado para scalp, day trade ou swing?",
                a: "O foco principal do BookVision é scalp / day trade. Ele também pode auxiliar swing trade como ferramenta de contexto, mas não é voltado para operações de longo prazo."
              },
              {
                q: "Como funciona o suporte?",
                a: "O suporte é feito diretamente pelo desenvolvedor do BookVision, via Discord ou Telegram. Sugestões, feedbacks e melhorias são analisados constantemente, o produto evolui com base no uso real."
              },
              {
                q: "Preciso ter experiência para usar o BookVision?",
                a: "Sim, conhecimento intermediário de trading é recomendado. O BookVision não é uma ferramenta para iniciantes absolutos. Ele foi criado para traders que já operam gráfico e buscam evoluir para Order Flow e leitura institucional."
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition">
                <h3 className="font-bold text-white mb-3">{item.q}</h3>
                <p className="text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-4 bg-[#0a1e2c]/95 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img 
                  src={logoImg} 
                  alt="BookVision" 
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-slate-400">Tecnologia institucional para traders de elite.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Planos</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>            
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 BookVision. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
