# Guia de Configuração - Página de Cadastro BookVision

## 📋 Arquivos Criados

1. **Cadastro.tsx** - Página de cadastro personalizada
2. **input.tsx** - Componente de input (vai em `/src/components/ui/`)
3. **label.tsx** - Componente de label (vai em `/src/components/ui/`)

---

## 🔧 Passos para Implementação

### 1. Adicionar os arquivos ao projeto

```bash
# Copie os arquivos para os seguintes locais:
src/pages/Cadastro.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
```

### 2. Configurar a rota no seu Router

No seu arquivo de rotas (geralmente `App.tsx` ou `routes.tsx`), adicione:

```typescript
import Cadastro from './pages/Cadastro';

// Dentro das suas rotas:
<Route path="/cadastro" element={<Cadastro />} />
```

### 3. Configurar o Stripe para redirecionar para a página

No seu painel do Stripe:

1. Vá em **Products** → Seu produto de teste gratuito
2. Em **Payment Links** ou **Checkout Settings**
3. Configure o **Success URL** para: `https://bookvision.com.br/cadastro`

Ou, se estiver usando Stripe Checkout programaticamente:

```javascript
const session = await stripe.checkout.sessions.create({
  success_url: 'https://bookvision.com.br/cadastro',
  cancel_url: 'https://bookvision.com.br',
  // ... outras configurações
});
```

### 4. Instalar dependências necessárias (se ainda não tiver)

```bash
npm install react-router-dom lucide-react
```

---

## 🎯 Como Funciona

### Fluxo do Usuário:

1. **Usuário clica no botão "Quero ser Trader de Elite"**
   - Abre o checkout da Stripe

2. **Usuário preenche dados de pagamento na Stripe**
   - Assina o teste gratuito de 7 dias

3. **Stripe redireciona para**: `https://bookvision.com.br/cadastro`
   - Página personalizada do BookVision aparece

4. **Usuário preenche o formulário**:
   - Nome completo
   - Email (mesmo da Stripe)
   - Senha
   - Confirmar senha

5. **Netlify Identity cria a conta**
   - Backend do Netlify gerencia tudo

6. **Usuário é redirecionado para**: `/live`
   - Acessa a transmissão ao vivo

---

## 🔐 Segurança e Validações

A página inclui:

✅ Validação de campos obrigatórios
✅ Validação de senha (mínimo 6 caracteres)
✅ Validação de confirmação de senha
✅ Mensagens de erro amigáveis
✅ Loading states
✅ Proteção contra submissão duplicada
✅ Redirecionamento automático se já logado

---

## 🎨 Personalização

### Mudar a URL de redirecionamento após cadastro:

Na linha 35 do `Cadastro.tsx`, altere:

```typescript
navigate('/live'); // Para onde você quiser
```

### Alterar o tempo de exibição da mensagem de sucesso:

Na linha 40 do `Cadastro.tsx`:

```typescript
setTimeout(() => {
  navigate('/live');
}, 2000); // 2 segundos, ajuste como quiser
```

### Customizar as cores:

Os componentes já usam as cores do BookVision (cyan/blue), mas você pode ajustar no próprio componente.

---

## ⚠️ Importante

### Email do Stripe x Email do Cadastro

**Recomendação**: Peça ao usuário para usar o **mesmo email** que usou na Stripe. Assim:
1. Fica mais fácil identificar assinaturas
2. Você pode fazer validações cruzadas
3. Evita confusão de contas

### Netlify Identity - Configurações necessárias:

1. No painel do Netlify, ative o **Identity**
2. Configure as **Email Templates** (confirmação, recuperação)
3. Defina as **External Providers** se quiser (Google, GitHub)
4. Configure **Registration preferences** como "Open" ou "Invite only"

---

## 🧪 Testando

### Teste local:

1. Execute o projeto: `npm run dev`
2. Acesse: `http://localhost:5173/cadastro`
3. Preencha o formulário
4. Verifique se a conta foi criada no Netlify Identity

### Teste de produção:

1. Faça deploy do site
2. Configure a URL de sucesso no Stripe
3. Faça uma compra teste
4. Verifique o redirecionamento

---

## 🐛 Troubleshooting

### "Netlify Identity não está funcionando"

Certifique-se de que o script está no HTML:

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

Geralmente vai no `index.html` do projeto.

### "Página não encontece cadastro"

Verifique se:
1. A rota foi configurada corretamente
2. O arquivo `Cadastro.tsx` está no local correto
3. O import está correto

### "Erro ao criar conta"

Verifique:
1. Netlify Identity está ativado
2. As configurações de email estão corretas
3. O domínio está configurado no Netlify

---

## 📧 Email de Confirmação

O Netlify Identity envia automaticamente um email de confirmação. Configure o template no painel do Netlify:

1. Vá em **Identity** → **Emails**
2. Personalize os templates
3. Use variáveis como `{{ .SiteURL }}`, `{{ .Token }}`, etc.

---

## 🎁 Próximos Passos

Após implementar isso, você pode:

1. **Criar dashboard de usuário**
2. **Adicionar recuperação de senha**
3. **Integrar Stripe Customer Portal** para gerenciar assinatura
4. **Adicionar verificação de email**
5. **Criar sistema de onboarding**

---

## 💡 Dicas Extras

### Capturar email da URL (opcional)

Se quiser pré-preencher o email vindo da Stripe:

```typescript
// No Cadastro.tsx, adicione:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email) {
    setFormData(prev => ({ ...prev, email }));
  }
}, []);
```

Então na Stripe, configure:
```
success_url: 'https://bookvision.com.br/cadastro?email={CUSTOMER_EMAIL}'
```

---

## ✅ Checklist de Implementação

- [ ] Copiar arquivos para o projeto
- [ ] Configurar rota `/cadastro`
- [ ] Adicionar script do Netlify Identity no HTML
- [ ] Configurar URL de sucesso no Stripe
- [ ] Testar cadastro local
- [ ] Fazer deploy
- [ ] Testar fluxo completo em produção
- [ ] Configurar templates de email
- [ ] Adicionar página de recuperação de senha (opcional)

---

Está tudo pronto! Se tiver dúvidas ou precisar de ajustes, é só falar.
