// netlify/functions/identity-signup.js
import { getStore } from "@netlify/blobs";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405 };
  }

  try {
    const payload = JSON.parse(event.body);
    
    console.log("Novo usuário cadastrado:", JSON.stringify(payload, null, 2));

    // Evento de signup do Netlify Identity
    const eventType = payload.event;
    const user = payload.user;
    const email = user?.email;

    // Só processa evento de signup/validate
    if (eventType !== "signup" && eventType !== "validate") {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Evento ignorado" })
      };
    }

    if (!email) {
      console.error("Email não encontrado no evento");
      return { statusCode: 400 };
    }

    console.log(`Verificando se ${email} tem pagamento pendente...`);

    // 🔍 VERIFICAR SE ESTE EMAIL JÁ PAGOU ANTES
    let paymentData;
    try {
      const store = getStore("payments-pending");
      const data = await store.get(email);
      
      if (data) {
        paymentData = JSON.parse(data);
        console.log(`Pagamento pendente encontrado para ${email}:`, paymentData);
      }
    } catch (err) {
      console.log("Nenhum pagamento pendente encontrado:", err.message);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Sem pagamento pendente" })
      };
    }

    // Se não tem pagamento pendente, não faz nada
    if (!paymentData || !paymentData.paid) {
      console.log(`${email} não tem pagamento pendente`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Sem pagamento pendente para este usuário" })
      };
    }

    // ✅ TEM PAGAMENTO PENDENTE! Atribuir role
    console.log(`${email} tem pagamento pendente. Atribuindo role assinante...`);

    const adminToken = process.env.NETLIFY_IDENTITY_ADMIN_TOKEN;
    
    if (!adminToken) {
      console.error("NETLIFY_IDENTITY_ADMIN_TOKEN não configurado");
      return { statusCode: 500 };
    }

    // Buscar o usuário completo (precisamos do ID)
    const searchUrl = `https://identity.netlify.com/admin/users?email=${encodeURIComponent(email)}`;
    const userRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    if (!userRes.ok) {
      console.error(`Erro ao buscar usuário: ${userRes.status}`);
      return { statusCode: 500 };
    }

    const users = await userRes.json();
    if (!users || users.length === 0) {
      console.error("Usuário não encontrado (estranho, acabou de se cadastrar)");
      return { statusCode: 404 };
    }

    const userId = users[0].id;

    // Atualizar role
    const updateUrl = `https://identity.netlify.com/admin/users/${userId}`;
    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_metadata: {
          roles: ["assinante"]
        }
      })
    });

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error(`Erro ao atualizar usuário: ${updateRes.status} - ${errorText}`);
      return { statusCode: 500 };
    }

    console.log(`✅ Role assinante atribuída com sucesso para ${email}`);

    // 🗑️ REMOVER PAGAMENTO PENDENTE (já foi processado)
    try {
      const store = getStore("payments-pending");
      await store.delete(email);
      console.log(`Pagamento pendente de ${email} removido`);
    } catch (err) {
      console.error("Erro ao remover pagamento pendente:", err);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: `Role assinante atribuída automaticamente para ${email}`,
        reason: "Pagamento anterior detectado"
      })
    };

  } catch (error) {
    console.error("Erro no processamento:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Erro interno",
        details: error.message 
      })
    };
  }
}
