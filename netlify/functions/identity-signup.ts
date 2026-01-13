interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    body: string;
  }>;
}

const handler: Handler = async (event, context) => {
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
