import { useEffect, useState } from "react";
import logoImg from "../assets/images/logo.png";
import { Send, TrendingUp, TrendingDown, Minus, Plus, FileText, X  } from "lucide-react";
import { Button } from "@/components/ui/button";

// Declaração de tipos para o Netlify Identity
declare global {
  interface Window {
    netlifyIdentity: any;
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{key: string, value: string, shared: boolean} | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<{key: string, value: string, shared: boolean} | null>;
      list: (prefix?: string, shared?: boolean) => Promise<{keys: string[], prefix?: string, shared: boolean} | null>;
    };
  }
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

interface Trade {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  result: 'gain' | 'loss' | 'breakeven';
  value: number;
  note: string;
  timestamp: number;
}

export default function LivePage() {
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState(""); 
  const [isLoadingLive, setIsLoadingLive] = useState(true);

  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isTradeSheetOpen, setIsTradeSheetOpen] = useState(false);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);

  // Estados do formulário
  const [tradeAsset, setTradeAsset] = useState("");
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeResult, setTradeResult] = useState<'gain' | 'loss' | 'breakeven'>('gain');
  const [tradeValue, setTradeValue] = useState("");
  const [tradeNote, setTradeNote] = useState("");
  
  const [redirectMessage, setRedirectMessage] = useState('');

  // Helper para storage com fallback para localStorage
  const storageHelper = {
    async get(key: string, shared: boolean = true) {
      if (window.storage) {
        return await window.storage.get(key, shared);
      } else {
        // Fallback para localStorage (desenvolvimento)
        const data = localStorage.getItem(key);
        return data ? { key, value: data, shared } : null;
      }
    },
    async set(key: string, value: string, shared: boolean = true) {
      if (window.storage) {
        return await window.storage.set(key, value, shared);
      } else {
        // Fallback para localStorage (desenvolvimento)
        localStorage.setItem(key, value);
        return { key, value, shared };
      }
    }
  };

  // Verifica autorização e carrega usuário
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (window.netlifyIdentity) {
          window.netlifyIdentity.init();
        }

        const currentUser = window.netlifyIdentity?.currentUser();
        
        console.log('Usuário atual:', currentUser);
        console.log('Roles:', currentUser?.app_metadata?.roles);
        
        if (currentUser?.app_metadata?.roles?.includes("Assinante")) {
          setAuthorized(true);
          setUser(currentUser);
        } else {
          // Mostra mensagem e redireciona depois
          setRedirectMessage('Este conteúdo é exclusivo para assinantes. Redirecionando...');
          
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
          
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setRedirectMessage('Erro ao verificar acesso. Redirecionando...');
        
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } finally {
        setChecking(false);
      }
    };

    // Aguarda um momento para garantir que o Netlify Identity está pronto
    if (window.netlifyIdentity) {
      checkAuth();
    } else {
      // Se o Netlify Identity ainda não carregou, aguarda
      const timer = setTimeout(() => {
        checkAuth();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Carrega mensagens do chat
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const result = await storageHelper.get('chat-messages', true);
        if (result) {
          const parsed = JSON.parse(result.value);
          setMessages(parsed);
        }
      } catch (error) {
        console.log('Nenhuma mensagem anterior encontrada');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (authorized) {
      loadMessages();
      // Atualiza mensagens a cada 3 segundos
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [authorized]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Carrega trades salvos
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const result = await storageHelper.get('user-trades', false); // false = privado
        if (result) {
          const parsed = JSON.parse(result.value);
          setTrades(parsed);
        }
      } catch (error) {
        console.log('Nenhum trade anterior encontrado');
      } finally {
        setIsLoadingTrades(false);
      }
    };

    if (authorized) {
      loadTrades();
    }
  }, [authorized]);

  // useEffect para carregar o ID da live do storage:
  useEffect(() => {
    const loadLiveId = async () => {
      try {
        const result = await storageHelper.get('current-live-id', true); // true = compartilhado
        if (result) {
          setLiveVideoId(result.value);
        }
      } catch (error) {
        console.log('Nenhuma live configurada');
      } finally {
        setIsLoadingLive(false);
      }
    };
  
    if (authorized) {
      loadLiveId();
      // Atualiza a cada 10 segundos para pegar mudanças
      const interval = setInterval(loadLiveId, 10000);
      return () => clearInterval(interval);
    }
  }, [authorized]);
  
  // Função para salvar o ID:
  const handleUpdateLiveId = async (newId: string) => {
    try {
      await storageHelper.set('current-live-id', newId, true); // true = compartilhado
      setLiveVideoId(newId);
    } catch (error) {
      console.error('Erro ao atualizar ID da live:', error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      user: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anônimo',
      text: newMessage.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, message].slice(-100); // Mantém apenas últimas 100 mensagens

    try {
      await storageHelper.set('chat-messages', JSON.stringify(updatedMessages), true);
      setMessages(updatedMessages);
      setNewMessage("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeAsset.trim() || !tradeValue) return;

    const newTrade: Trade = {
      id: Date.now().toString(),
      asset: tradeAsset.trim().toUpperCase(),
      type: tradeType,
      result: tradeResult,
      value: parseFloat(tradeValue),
      note: tradeNote.trim(),
      timestamp: Date.now()
    };

    const updatedTrades = [newTrade, ...trades].slice(0, 100);
    
    try {
      await storageHelper.set('user-trades', JSON.stringify(updatedTrades), false);
      setTrades(updatedTrades);
      
      // Limpa o formulário
      setTradeAsset("");
      setTradeValue("");
      setTradeNote("");
      setTradeResult('gain');
      setTradeType('buy');
    } catch (error) {
      console.error('Erro ao salvar trade:', error);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    const updatedTrades = trades.filter(t => t.id !== tradeId);
    try {
      await storageHelper.set('user-trades', JSON.stringify(updatedTrades), false);
      setTrades(updatedTrades);
    } catch (error) {
      console.error('Erro ao deletar trade:', error);
    }
  };

  const getTodayStats = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTrades = trades.filter(t => new Date(t.timestamp).setHours(0, 0, 0, 0) === today);
    
    const total = todayTrades.reduce((sum, t) => {
      if (t.result === 'gain') return sum + t.value;
      if (t.result === 'loss') return sum - t.value;
      return sum;
    }, 0);
    
    const gains = todayTrades.filter(t => t.result === 'gain').length;
    const losses = todayTrades.filter(t => t.result === 'loss').length;
    const winRate = todayTrades.length > 0 ? (gains / todayTrades.length) * 100 : 0;
    
    return { total, gains, losses, winRate, count: todayTrades.length };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Se não autorizado, mostra mensagem (enquanto redireciona)
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
          <div className="hidden md:flex items-center gap-8">
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

            <a href="/#features" className="text-sm text-slate-300 hover:text-white transition">Funcionalidades</a>
            <a href="/#pricing" className="text-sm text-slate-300 hover:text-white transition">Planos</a>
            <a href="/#faq" className="text-sm text-slate-300 hover:text-white transition">FAQ</a>

            <button 
              onClick={() => user ? window.netlifyIdentity.logout() : window.netlifyIdentity.open('login')} 
              className="text-sm text-slate-300 hover:text-white transition bg-transparent border-none p-0 cursor-pointer"
            >
              {user ? 'Sair' : 'Login'}
            </button>

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
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)]">
          {/* Video Section - Modo Teatro */}
          <div className="flex-1 px-4">
            <div className="h-full flex flex-col">
              <h1 className="text-3xl font-bold mb-4 text-cyan-400">BookVision Live</h1>
              <div className="flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-2xl shadow-cyan-500/10 bg-slate-900">
              {isLoadingLive ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              ) : liveVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${liveVideoId}`} 
                  className="w-full h-full"
                  allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Nenhuma Live Ativa</h3>
                      <p className="text-slate-400">A transmissão ao vivo começará em breve.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Painel Admin - Logo após fechar a div do iframe */}
              {user?.email === "rolguer@rogautomacao.net" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg">
                  <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    🔧 Painel Admin
                  </h3>
                  <label className="block text-xs text-slate-400 mb-2">
                    ID da Live Atual: {liveVideoId || "Nenhuma"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={liveVideoId}
                      onBlur={(e) => handleUpdateLiveId(e.target.value)}
                      placeholder="Cole o ID do YouTube (ex: XYZ123ABC)"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => handleUpdateLiveId("")}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition"
                    >
                      Limpar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Cole apenas o ID (ex: dQw4w9WgXcQ). Todos os assinantes verão automaticamente.
                  </p>
                </div>
              )}
              <div className="mt-4 text-center">
                <a href="/" className="text-slate-400 hover:text-white transition">← Voltar para Home</a>
              </div>
            </div>
          </div>

          {/* Chat Section - Lateral Direita */}
          <div className="w-full lg:w-96 pr-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-slate-700 p-4">
                <h2 className="font-bold text-lg">Chat Ao Vivo</h2>
                <p className="text-xs text-slate-400">Interaja com outros traders</p>               
              </div>

              {/* Messages Container */}
              <div 
                id="chat-container"
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Carregando mensagens...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-center">Seja o primeiro a enviar uma mensagem!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-semibold text-cyan-400 text-sm">
                          {msg.user}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm break-words">
                        {msg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form 
                onSubmit={handleSendMessage}
                className="border-t border-slate-700 p-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Flutuante - Gerenciador de Trades */}
      <button
        onClick={() => setIsTradeSheetOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl shadow-cyan-500/50 transition-all hover:scale-110 z-40"
        title="Gerenciar Trades"
      >
        <FileText className="w-6 h-6" />
      </button>      

      {/* Sheet Lateral - Gerenciador de Trades */}
      {isTradeSheetOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsTradeSheetOpen(false)}
          />
          
          {/* Sheet Content */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto animate-slide-in-right">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    Meus Trades
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Registre seus trades do dia</p>
                </div>
                <button
                  onClick={() => setIsTradeSheetOpen(false)}
                  className="text-slate-400 hover:text-white transition p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Dashboard do Dia */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Resumo do Dia</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Resultado</p>
                    <p className={`text-2xl font-bold ${getTodayStats().total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(getTodayStats().total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Taxa de Acerto</p>
                    <p className="text-2xl font-bold text-white">
                      {getTodayStats().winRate.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Gains</p>
                    <p className="text-xl font-bold text-green-400">{getTodayStats().gains}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Losses</p>
                    <p className="text-xl font-bold text-red-400">{getTodayStats().losses}</p>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleAddTrade} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-white mb-4">Adicionar Trade</h3>
                
                <div className="space-y-4">
                  {/* Ativo */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Ativo</label>
                    <input
                      type="text"
                      value={tradeAsset}
                      onChange={(e) => setTradeAsset(e.target.value)}
                      placeholder="Ex: WDO, WIN, PETR4"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                      required
                    />
                  </div>

                  {/* Tipo e Resultado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Tipo</label>
                      <select
                        value={tradeType}
                        onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
                      >
                        <option value="buy">Compra</option>
                        <option value="sell">Venda</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Resultado</label>
                      <select
                        value={tradeResult}
                        onChange={(e) => setTradeResult(e.target.value as 'gain' | 'loss' | 'breakeven')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
                      >
                        <option value="gain">Gain</option>
                        <option value="loss">Loss</option>
                        <option value="breakeven">Break-even</option>
                      </select>
                    </div>
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeValue}
                      onChange={(e) => setTradeValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                      required
                    />
                  </div>

                  {/* Nota */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Anotação (Opcional)</label>
                    <textarea
                      value={tradeNote}
                      onChange={(e) => setTradeNote(e.target.value)}
                      placeholder="Ex: Entrada por fluxo, setup perfeito..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm resize-none"
                      rows={2}
                      maxLength={200}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Trade
                  </Button>
                </div>
              </form>

              {/* Histórico */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Histórico Recente</h3>
                
                {isLoadingTrades ? (
                  <p className="text-center text-slate-500 py-8">Carregando...</p>
                ) : trades.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum trade registrado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trades.slice(0, 20).map((trade) => (
                      <div
                        key={trade.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{trade.asset}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.type === 'buy' ? 'Compra' : 'Venda'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="text-slate-500 hover:text-red-400 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {trade.result === 'gain' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {trade.result === 'loss' && <TrendingDown className="w-4 h-4 text-red-400" />}
                          {trade.result === 'breakeven' && <Minus className="w-4 h-4 text-slate-400" />}
                          
                          <span className={`font-semibold ${
                            trade.result === 'gain' ? 'text-green-400' : 
                            trade.result === 'loss' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {trade.result === 'loss' ? '-' : ''}{formatCurrency(trade.value)}
                          </span>
                        </div>
                        
                        {trade.note && (
                          <p className="text-xs text-slate-400 mb-2">{trade.note}</p>
                        )}
                        
                        <p className="text-xs text-slate-500">{formatDate(trade.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

}



