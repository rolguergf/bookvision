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

    // Verifica se o usuário tem assinatura ativa no Stripe
    const hasActiveSubscription = await checkStripeSubscription(userEmail);

    if (hasActiveSubscription) {
      console.log('✅ Assinatura ativa encontrada para', userEmail);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: ['Assinante']
          }
        })
      };
    } else {
      console.log('⚠️ Nenhuma assinatura ativa para', userEmail);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: [] // Sem role até pagar
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

// Verifica se o email tem assinatura ativa no Stripe
async function checkStripeSubscription(email: string): Promise<boolean> {
  try {
    console.log('🔍 Buscando customer no Stripe:', email);
    
    // Busca customers com esse email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('❌ Nenhum customer encontrado');
      return false;
    }

    const customerId = customers.data[0].id;
    console.log('✅ Customer encontrado:', customerId);

    // Busca assinaturas ativas desse customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    const hasActive = subscriptions.data.length > 0;
    console.log(hasActive ? '✅ Assinatura ativa encontrada' : '❌ Nenhuma assinatura ativa');
    
    return hasActive;
  } catch (error: any) {
    console.error('❌ Erro ao verificar no Stripe:', error.message);
    return false;
  }
}

export { handler };
