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
