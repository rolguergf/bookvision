// netlify/functions/pagbank-webhook.js

export async function handler(event) {
  // Apenas POST é permitido
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method not allowed" }) 
    };
  }

  try {
    // Parse do payload do PagBank
    const payload = JSON.parse(event.body);
    
    console.log("Webhook recebido:", JSON.stringify(payload, null, 2));

    // Extrair dados relevantes
    // ATENÇÃO: Adapte esses campos ao payload REAL do PagBank
    const status = payload?.charges?.[0]?.status || payload?.status;
    const email = payload?.customer?.email || payload?.sender?.email;

    // Validação básica
    if (!email) {
      console.error("Email não encontrado no payload");
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Email não encontrado no payload" })
      };
    }

    // Token admin do Netlify Identity
    const adminToken = process.env.NETLIFY_IDENTITY_ADMIN_TOKEN;
    
    if (!adminToken) {
      console.error("NETLIFY_IDENTITY_ADMIN_TOKEN não configurado");
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Configuração inválida" })
      };
    }

    // PASSO 1: Buscar usuário no Netlify Identity pelo email
    console.log(`Buscando usuário com email: ${email}`);
    
    const searchUrl = `https://identity.netlify.com/admin/users?email=${encodeURIComponent(email)}`;
    const userRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    if (!userRes.ok) {
      console.error(`Erro ao buscar usuário: ${userRes.status}`);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Erro ao buscar usuário no Identity" })
      };
    }

    const users = await userRes.json();

    // Usuário não existe no Identity
    if (!users || users.length === 0) {
      console.log(`Usuário com email ${email} não encontrado no Identity`);
      
      // 🆕 ARMAZENAR PAGAMENTO PENDENTE
      // Guarda que este email pagou, para quando ele se cadastrar
      if (status === "PAID" || status === "paid" || status === "APPROVED" || status === "approved") {
        try {
          await fetch(`${process.env.URL}/.netlify/blobs/payments-pending/${encodeURIComponent(email)}`, {
            method: 'PUT',
            body: JSON.stringify({
              email,
              status,
              timestamp: Date.now(),
              paid: true
            })
          });
          console.log(`Pagamento de ${email} armazenado para atribuição futura`);
        } catch (err) {
          console.error("Erro ao armazenar pagamento pendente:", err);
        }
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Usuário não existe ainda. Pagamento registrado para atribuição futura.",
          email: email
        })
      };
    }

    const user = users[0];
    const userId = user.id;
    
    console.log(`Usuário encontrado: ${userId}`);

    // PASSO 2: Determinar ação baseada no status do pagamento
    let roles = [];
    let action = "nenhuma";

    // Status do PagBank (ajuste conforme documentação real)
    // Exemplos: "PAID", "APPROVED", "paid", "approved", etc.
    if (status === "PAID" || status === "paid" || status === "APPROVED" || status === "approved") {
      roles = ["assinante"];
      action = "atribuir role assinante";
    } 
    else if (status === "CANCELED" || status === "canceled" || status === "REFUNDED" || status === "refunded") {
      roles = []; // Remove todas as roles
      action = "remover role assinante";
    }
    else {
      console.log(`Status ${status} não requer ação`);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Status não requer atualização de role",
          status: status
        })
      };
    }

    // PASSO 3: Atualizar roles do usuário
    console.log(`Executando ação: ${action}`);
    
    const updateUrl = `https://identity.netlify.com/admin/users/${userId}`;
    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_metadata: {
          roles: roles
        }
      })
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error(`Erro ao atualizar usuário: ${updateRes.status} - ${errorText}`);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Erro ao atualizar role do usuário" })
      };
    }

    const updatedUser = await updateRes.json();
    console.log("Usuário atualizado com sucesso:", updatedUser.email);

    // Sucesso!
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: `Role atualizada com sucesso para ${email}`,
        action: action,
        roles: roles
      })
    };

  } catch (error) {
    console.error("Erro no processamento:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Erro interno no processamento",
        details: error.message 
      })
    };
  }
}
