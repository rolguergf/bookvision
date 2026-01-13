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
    console.log('✅ Atribuindo role Assinante automaticamente');

    // Sempre atribui a role para testar
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          roles: ['Assinante']
        }
      })
    };
  } catch (error: any) {
    console.error('❌ Erro ao processar signup:', error.message);
    
    // Mesmo com erro, retorna sucesso com role vazia
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

export { handler };
