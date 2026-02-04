import { useEffect, useState } from "react";
import logoImg from "../assets/images/logo.png";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Declaração de tipos para o Netlify Identity
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export default function Cadastro() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.init();

      // Se já estiver logado, redireciona
      const user = window.netlifyIdentity.currentUser();
      if (user) {
        window.location.href = '/live';
      }

      // Escuta evento de signup
      window.netlifyIdentity.on('signup', () => {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/live';
        }, 2000);
      });

      window.netlifyIdentity.on('error', (err: any) => {
        setError(err.message || 'Erro ao criar conta');
        setLoading(false);
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validações
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    // Cria conta direto via API do Netlify Identity
    try {
      if (window.netlifyIdentity) {
        await window.netlifyIdentity.signup({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            full_name: formData.fullName
          }
        });
        
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/live';
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img 
              src={logoImg} 
              alt="BookVision Logo" 
              className="h-16 w-auto mx-auto mb-6"
            />
          </a>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao BookVision</h1>
          <p className="text-slate-400">Complete seu cadastro para acessar</p>
        </div>

        {/* Card de Cadastro */}
        <div className="bg-slate-900/50 border border-slate-700 backdrop-blur-sm rounded-xl p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Conta criada!</h3>
              <p className="text-slate-400">Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Nome Completo</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  disabled={loading}
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Senha</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  disabled={loading}
                />
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-slate-300 text-sm mb-2">Confirmar Senha</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  disabled={loading}
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Botão de Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white h-12 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              {/* Link para Login */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-400">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => window.netlifyIdentity?.open('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Informação sobre o teste */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            🎉 Você tem <span className="text-cyan-400 font-bold">7 dias de teste grátis</span>
          </p>
        </div>

        {/* Voltar para Home */}
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition">
            ← Voltar para página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
