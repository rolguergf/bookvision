import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    body: string;
  }>;
}

const handler: Handler = async (event, context) => {
  // Só aceita POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];

  let stripeEvent: Stripe.Event;

  try {
    // Verifica a assinatura do webhook
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log('✅ Evento recebido:', stripeEvent.type);

  // Processa os eventos
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'invoice.payment_succeeded':
        await handleSubscriptionActive(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        await handleSubscriptionInactive(stripeEvent.data.object);
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error: any) {
    console.error('❌ Erro ao processar evento:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Função para processar checkout completado
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  
  if (!customerEmail) {
    console.error('❌ Email não encontrado no checkout');
    return;
  }

  console.log(`💳 Checkout completado para: ${customerEmail}`);
  
  // Atribui role de assinante
  await assignSubscriberRole(customerEmail);
}

// Função para processar assinatura ativa
async function handleSubscriptionActive(data: any) {
  let customerEmail: string | null = null;

  // Tenta obter email de diferentes formas
  if (data.customer_email) {
    customerEmail = data.customer_email;
  } else if (data.customer) {
    // Busca dados do customer no Stripe
    const customer = await stripe.customers.retrieve(data.customer as string);
    if ('email' in customer && customer.email) {
      customerEmail = customer.email;
    }
  }

  if (!customerEmail) {
    console.error('❌ Email não encontrado na assinatura');
    return;
  }

  console.log(`✅ Assinatura ativa para: ${customerEmail}`);
  
  // Atribui role de assinante
  await assignSubscriberRole(customerEmail);
}

// Função para processar assinatura inativa
async function handleSubscriptionInactive(data: any) {
  let customerEmail: string | null = null;

  if (data.customer_email) {
    customerEmail = data.customer_email;
  } else if (data.customer) {
    const customer = await stripe.customers.retrieve(data.customer as string);
    if ('email' in customer && customer.email) {
      customerEmail = customer.email;
    }
  }

  if (!customerEmail) {
    console.error('❌ Email não encontrado');
    return;
  }

  console.log(`❌ Assinatura cancelada para: ${customerEmail}`);
  
  // Remove role de assinante
  await removeSubscriberRole(customerEmail);
}

// Função para atribuir role "Assinante" no Netlify Identity
async function assignSubscriberRole(email: string) {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log(`⚠️ Usuário ${email} ainda não cadastrado. Role será atribuída no próximo login.`);
      return;
    }

    // Verifica se já tem a role
    const roles = user.app_metadata?.roles || [];
    if (roles.includes('Assinante')) {
      console.log(`✅ Usuário ${email} já possui role Assinante`);
      return;
    }

    // Atribui a role
    await updateUserMetadata(user.id, { roles: ['Assinante'] });
    console.log(`✅ Role "Assinante" atribuída para: ${email}`);
  } catch (error) {
    console.error('❌ Erro ao atribuir role:', error);
  }
}

// Função para remover role "Assinante"
async function removeSubscriberRole(email: string) {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log(`⚠️ Usuário ${email} não encontrado`);
      return;
    }

    await updateUserMetadata(user.id, { roles: [] });
    console.log(`✅ Role "Assinante" removida de: ${email}`);
  } catch (error) {
    console.error('❌ Erro ao remover role:', error);
  }
}

// Busca usuário por email no Netlify Identity
async function findUserByEmail(email: string): Promise<any> {
  const siteUrl = process.env.URL || 'https://bookvision.netlify.app';
  
  const response = await fetch(
    `${siteUrl}/.netlify/identity/admin/users`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_IDENTITY_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar usuários: ${response.statusText}`);
  }

  const data = await response.json();
  const users = data.users || [];
  
  return users.find((u: any) => u.email === email) || null;
}

// Atualiza metadados do usuário
async function updateUserMetadata(userId: string, appMetadata: any) {
  const siteUrl = process.env.URL || 'https://bookvision.netlify.app';
  
  const response = await fetch(
    `${siteUrl}/.netlify/identity/admin/users/${userId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_IDENTITY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_metadata: appMetadata
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao atualizar usuário: ${response.statusText}`);
  }

  return response.json();
}

export { handler };