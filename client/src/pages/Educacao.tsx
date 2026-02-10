import { useEffect, useState } from "react";
import logoImg from "../assets/images/logo.png";
import { Play, CheckCircle, Lock, Clock, BookOpen } from "lucide-react";

// Declaração de tipos para o Netlify Identity
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

interface VideoAula {
  id: number;
  titulo: string;
  descricao: string;
  duracao: string;
  youtubeId: string;
  thumbnail: string;
  liberado: boolean;
  concluido: boolean;
}

export default function Educacao() {
  // ========================================
  // CONTROLE DE ACESSO - MUDE AQUI
  // ========================================
  // true = APENAS ASSINANTES (conteúdo pago)
  // false = LIBERADO PARA TODOS (conteúdo grátis)
  const REQUER_ASSINATURA = false; // ← MUDE AQUI!
  // ========================================

  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [videoSelecionado, setVideoSelecionado] = useState<VideoAula | null>(null);
  const [videosAssistidos, setVideosAssistidos] = useState<number[]>([]);

  // Lista de vídeo aulas
  const videoAulas: VideoAula[] = [
    {
      id: 1,
      titulo: "Aula 01 - BookVision como tomada de decisão",
      descricao: "Setup profissional de entrada com BookVision - Como utilizo o BookVision na tomada de decisão.",
      duracao: "22:30",
      youtubeId: "1ACpKdXiepg", // Substitua pelo ID real do vídeo
      thumbnail: `https://img.youtube.com/vi/1ACpKdXiepg/maxresdefault.jpg`,
      liberado: true,
      concluido: false
    }
  ];

  // Verifica autorização
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (window.netlifyIdentity) {
          window.netlifyIdentity.init();
        }

        const currentUser = window.netlifyIdentity?.currentUser();
        
        // Se não requer assinatura, libera para todos
        if (!REQUER_ASSINATURA) {
          setAuthorized(true);
          setUser(currentUser || { email: 'visitante' });
          
          // Carrega progresso salvo
          const progresso = localStorage.getItem('bookvision-progresso');
          if (progresso) {
            setVideosAssistidos(JSON.parse(progresso));
          }
          
          setChecking(false);
          return;
        }
        
        // Se requer assinatura, verifica se é assinante
        if (currentUser?.app_metadata?.roles?.includes("Assinante")) {
          setAuthorized(true);
          setUser(currentUser);
          
          // Carrega progresso salvo
          const progresso = localStorage.getItem('bookvision-progresso');
          if (progresso) {
            setVideosAssistidos(JSON.parse(progresso));
          }
        } else {
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        
        // Se não requer assinatura, libera mesmo com erro
        if (!REQUER_ASSINATURA) {
          setAuthorized(true);
          setUser({ email: 'visitante' });
        } else {
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      } finally {
        setChecking(false);
      }
    };

    if (window.netlifyIdentity) {
      checkAuth();
    } else {
      const timer = setTimeout(() => {
        checkAuth();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [REQUER_ASSINATURA]);

  // Seleciona primeiro vídeo liberado ao carregar
  useEffect(() => {
    if (authorized && !videoSelecionado) {
      const primeiroLiberado = videoAulas.find(v => v.liberado);
      if (primeiroLiberado) {
        setVideoSelecionado(primeiroLiberado);
      }
    }
  }, [authorized]);

  const handleVideoClick = (video: VideoAula) => {
    if (video.liberado) {
      setVideoSelecionado(video);
    }
  };

  const marcarComoConcluido = (videoId: number) => {
    if (!videosAssistidos.includes(videoId)) {
      const novosAssistidos = [...videosAssistidos, videoId];
      setVideosAssistidos(novosAssistidos);
      localStorage.setItem('bookvision-progresso', JSON.stringify(novosAssistidos));
    }
  };

  const calcularProgresso = () => {
    const videosLiberados = videoAulas.filter(v => v.liberado).length;
    const progresso = (videosAssistidos.length / videosLiberados) * 100;
    return Math.round(progresso);
  };

  // Tela de carregamento
  if (checking) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não autorizado
  if (!authorized) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Este conteúdo é exclusivo para assinantes.</p>
          <p className="text-slate-400">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a1e2c]/95 backdrop-blur-md border-b border-slate-800">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <a href="/">
              <img 
                src={logoImg} 
                alt="BookVision Logo" 
                className="h-12 w-auto object-contain"
              />
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href="/live" className="text-sm text-slate-300 hover:text-white transition">
              Ao Vivo
            </a>
            <a href="/educacao" className="text-sm text-cyan-400 font-bold">
              Educação
            </a>
            
            <a href="/#features" className="text-sm text-slate-300 hover:text-white transition">Funcionalidades</a>
            <a href="/#pricing" className="text-sm text-slate-300 hover:text-white transition">Planos</a>
            <a href="/#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>
            
            {user && user.email !== 'visitante' ? (
              <button 
                onClick={() => window.netlifyIdentity.logout()} 
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Sair
              </button>
            ) : (
              <button 
                onClick={() => window.netlifyIdentity.open('login')} 
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Login
              </button>      
            )}
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

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="container px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold">Centro de Educação</h1>
            </div>
            <p className="text-slate-400 mb-4">
              Aprenda Order Flow do zero com nossa metodologia exclusiva
            </p>
            
            {/* Barra de Progresso */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Seu Progresso</span>
                <span className="text-sm font-bold text-cyan-400">{calcularProgresso()}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calcularProgresso()}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {videosAssistidos.length} de {videoAulas.filter(v => v.liberado).length} aulas concluídas
              </p>
            </div>
          </div>

          {/* Layout: Video Player + Playlist */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                {videoSelecionado ? (
                  <>
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoSelecionado.youtubeId}?rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {videoSelecionado.titulo}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {videoSelecionado.duracao}
                            </span>
                            {videosAssistidos.includes(videoSelecionado.id) && (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                Concluída
                              </span>
                            )}
                          </div>
                        </div>
                        {!videosAssistidos.includes(videoSelecionado.id) && (
                          <button
                            onClick={() => marcarComoConcluido(videoSelecionado.id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-sm font-semibold transition"
                          >
                            Marcar como Concluída
                          </button>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {videoSelecionado.descricao}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-slate-800">
                    <p className="text-slate-500">Selecione uma aula para começar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Playlist */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-slate-700 p-4">
                  <h3 className="font-bold text-lg">Conteúdo do Curso</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {videoAulas.length} aulas disponíveis
                  </p>
                </div>
                
                <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                  {videoAulas.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoClick(video)}
                      disabled={!video.liberado}
                      className={`w-full text-left p-4 transition ${
                        videoSelecionado?.id === video.id
                          ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                          : video.liberado
                          ? 'hover:bg-slate-800/50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.titulo}
                            className="w-24 h-14 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="68"%3E%3Crect fill="%23334155" width="120" height="68"/%3E%3C/svg%3E';
                            }}
                          />
                          {!video.liberado && (
                            <div className="absolute inset-0 bg-black/70 rounded flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {video.liberado && !videosAssistidos.includes(video.id) && (
                            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {videosAssistidos.includes(video.id) && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-white mb-1 truncate">
                            {video.titulo}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{video.duracao}</span>
                            {!video.liberado && (
                              <>
                                <span>•</span>
                                <Lock className="w-3 h-3" />
                                <span>Em breve</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
