import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    body: string;
  }>;
}

const handler: Handler = async (event, context) => {
  const { user } = JSON.parse(event.body);
  const userEmail = user.email;

  console.log(`📝 Novo cadastro: ${userEmail}`);

  try {
    // Verifica se o usuário tem assinatura ativa no Stripe
    const hasActiveSubscription = await checkStripeSubscription(userEmail);

    if (hasActiveSubscription) {
      console.log(`✅ Assinatura ativa encontrada para ${userEmail}`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: ['Assinante']
          }
        })
      };
    } else {
      console.log(`⚠️ Nenhuma assinatura ativa para ${userEmail}`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          app_metadata: {
            roles: []
          }
        })
      };
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar assinatura:', error);
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
    // Busca customers com esse email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return false;
    }

    const customerId = customers.data[0].id;

    // Busca assinaturas ativas desse customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    return subscriptions.data.length > 0;
  } catch (error) {
    console.error('❌ Erro ao verificar assinatura no Stripe:', error);
    return false;
  }
}

export { handler };