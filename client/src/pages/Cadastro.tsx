import { Button } from "@/components/ui/button";
import logoImg from "../assets/images/logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

// Declaração de tipos para o Netlify Identity
declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

export default function Cadastro() {
  const navigate = useNavigate();
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
    // Inicializa o Netlify Identity
    if (window.netlifyIdentity) {
      window.netlifyIdentity.init();

      // Se já estiver logado, redireciona para /live
      const user = window.netlifyIdentity.currentUser();
      if (user) {
        navigate('/live');
      }

      // Escuta eventos de signup
      window.netlifyIdentity.on('signup', (user: any) => {
        setSuccess(true);
        setTimeout(() => {
          navigate('/live');
        }, 2000);
      });

      window.netlifyIdentity.on('error', (err: any) => {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
        setLoading(false);
      });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Limpa erro ao digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validações
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    // Cria conta via Netlify Identity
    try {
      if (window.netlifyIdentity) {
        window.netlifyIdentity.open('signup');
        
        // Preenche os campos automaticamente
        setTimeout(() => {
          const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
          const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
          const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
          
          if (emailInput) emailInput.value = formData.email;
          if (passwordInput) passwordInput.value = formData.password;
          if (nameInput) nameInput.value = formData.fullName;
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
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
          <img 
            src={logoImg} 
            alt="BookVision Logo" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo ao BookVision
          </h1>
          <p className="text-slate-400">
            Complete seu cadastro para acessar a plataforma
          </p>
        </div>

        {/* Card de Cadastro */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Criar Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Conta criada com sucesso!
                </h3>
                <p className="text-slate-400">
                  Redirecionando para a plataforma...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome Completo */}
                <div>
                  <Label htmlFor="fullName" className="text-slate-300">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                    disabled={loading}
                  />
                </div>

                {/* Senha */}
                <div>
                  <Label htmlFor="password" className="text-slate-300">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                    disabled={loading}
                  />
                </div>

                {/* Confirmar Senha */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
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
          </CardContent>
        </Card>

        {/* Informação sobre o teste */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            🎉 Você tem <span className="text-cyan-400 font-bold">7 dias de teste grátis</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Após criar sua conta, você terá acesso completo à plataforma
          </p>
        </div>

        {/* Voltar para Home */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Voltar para página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
