import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    body: string;
  }>;
}

const handler: Handler = async (event, context) => {
  // Verifica se é uma requisição POST válida
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Verifica se há body
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No body provided' })
    };
  }

  try {
    const { user } = JSON.parse(event.body);
    const userEmail = user.email;
    
    console.log('📝 Novo cadastro:', userEmail);

    // Verifica se o usuário tem assinatura ativa no Stripe (incluindo trial)
    const subscriptionInfo = await checkStripeSubscription(userEmail);

    if (subscriptionInfo.hasSubscription) {
      console.log(`✅ Assinatura encontrada para ${userEmail} - Status: ${subscriptionInfo.status}`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: ['Assinante'],
            subscription_status: subscriptionInfo.status,
            is_trial: subscriptionInfo.isTrial
          }
        })
      };
    } else {
      console.log('⚠️ Nenhuma assinatura ativa para', userEmail);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: [] // Sem role até iniciar assinatura
          }
        })
      };
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar assinatura:', error.message);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          roles: []
        }
      })
    };
  }
};

// Verifica se o email tem assinatura ativa no Stripe (incluindo trial)
async function checkStripeSubscription(email: string): Promise<{
  hasSubscription: boolean;
  status?: string;
  isTrial?: boolean;
}> {
  try {
    console.log('🔍 Buscando customer no Stripe:', email);
    
    // Busca customers com esse email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('❌ Nenhum customer encontrado');
      return { hasSubscription: false };
    }

    const customerId = customers.data[0].id;
    console.log('✅ Customer encontrado:', customerId);

    // Busca TODAS as assinaturas desse customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      console.log('❌ Nenhuma assinatura encontrada');
      return { hasSubscription: false };
    }

    const subscription = subscriptions.data[0];
    const status = subscription.status;

    // Status válidos para ter acesso:
    // - 'trialing': período de teste gratuito
    // - 'active': assinatura paga ativa
    const validStatuses = ['trialing', 'active'];
    const hasValidSubscription = validStatuses.includes(status);

    if (hasValidSubscription) {
      console.log(`✅ Assinatura válida - Status: ${status}`);
      return {
        hasSubscription: true,
        status: status,
        isTrial: status === 'trialing'
      };
    } else {
      console.log(`⚠️ Assinatura com status inválido: ${status}`);
      return { hasSubscription: false };
    }

  } catch (error: any) {
    console.error('❌ Erro ao verificar no Stripe:', error.message);
    return { hasSubscription: false };
  }
}

export { handler };
