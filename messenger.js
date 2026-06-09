const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================
// CONFIGURACIÓN - VARIABLES DE ENTORNO
// ============================================================
// ¡IMPORTANTE! En Render define:
//   PAGE_ACCESS_TOKEN = token generado en Meta para la página de Saqsayki Adventure
//   VERIFY_TOKEN = MI_TOKEN_SECRETO_123
// ============================================================
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || '';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'MI_TOKEN_SECRETO_123';  // <-- Token correcto

const CARTA_URL = 'https://raw.githubusercontent.com/alvaroalexishuillcahuamantalla-sys/bot-saqsayki/main/carta.jpeg';

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Estado del bot para la web
let botStatus = '🟡 Iniciando... Esperando conexión con Messenger';

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================
function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "🌅 Buenos días";
    if (hora >= 12 && hora < 19) return "🌤️ Buenas tardes";
    return "🌙 Buenas noches";
}

// Enviar mensaje de texto
async function sendTextMessage(senderId, texto) {
    if (!PAGE_ACCESS_TOKEN) {
        console.error('❌ PAGE_ACCESS_TOKEN no configurado');
        return;
    }
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: { text: texto }
            }
        );
        console.log(`✅ Mensaje enviado a ${senderId}: ${texto.substring(0, 50)}`);
    } catch (error) {
        console.error('❌ Error enviando texto:', error.response?.data || error.message);
    }
}

// Enviar botones (quick replies)
async function sendQuickReplies(senderId, texto, opciones) {
    if (!PAGE_ACCESS_TOKEN) return;
    const quickReplies = opciones.map(op => ({
        content_type: "text",
        title: op.title.substring(0, 20),
        payload: op.payload
    }));
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: { text: texto, quick_replies: quickReplies }
            }
        );
        console.log(`✅ Botones enviados a ${senderId}`);
    } catch (error) {
        console.error('❌ Error enviando botones:', error.response?.data || error.message);
    }
}

// Enviar imagen
async function sendImageMessage(senderId, imageUrl, caption) {
    if (!PAGE_ACCESS_TOKEN) return;
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: {
                    attachment: {
                        type: "image",
                        payload: { url: imageUrl, is_reusable: true }
                    }
                }
            }
        );
        if (caption) {
            await esperar(500);
            await sendTextMessage(senderId, caption);
        }
        console.log(`✅ Imagen enviada a ${senderId}`);
    } catch (error) {
        console.error('❌ Error enviando imagen:', error.response?.data || error.message);
        await sendTextMessage(senderId, "📌 No se pudo cargar la imagen. Intenta más tarde.");
    }
}

// ============================================================
// MENÚ PRINCIPAL CON BOTONES
// ============================================================
async function enviarMenuConBotones(senderId) {
    const saludo = obtenerSaludo();
    const menuTexto = `${saludo} ✨

*Bienvenido(a) al Parque Temático Saqsayki*

Vive una experiencia única llena de aventura, diversión y naturaleza.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Seleccione una opción:*

💬 Escriba *menu* para ver este mensaje nuevamente

📍 *Saqsayki - Tu mejor experiencia*`;

    const opciones = [
        { title: "🕒 Horarios", payload: "OPCION_1" },
        { title: "💰 Precios", payload: "OPCION_2" },
        { title: "🎒 Paquetes", payload: "OPCION_3" },
        { title: "📍 Ubicación", payload: "OPCION_4" },
        { title: "🍽️ Restaurante", payload: "OPCION_5" }
    ];
    await sendQuickReplies(senderId, menuTexto, opciones);
}

async function enviarMenuTexto(senderId) {
    const saludo = obtenerSaludo();
    const menuTexto = `${saludo} ✨

*Bienvenido(a) al Parque Temático Saqsayki*

Vive una experiencia única...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Escriba el número:*
1️⃣ Horarios
2️⃣ Precios
3️⃣ Paquetes
4️⃣ Ubicación
5️⃣ Restaurante

💬 Escriba *menu* para ver este mensaje nuevamente`;
    await sendTextMessage(senderId, menuTexto);
}

async function enviarInformacion(senderId, opcion) {
    await esperar(1000);
    let texto = '';
    switch (opcion) {
        case '1':
            texto = `🕒 *HORARIOS*
📅 Lunes a domingo: 9:30 a.m. a 5:30 p.m.
🎟️ Ingreso: Adultos S/7, Niños S/4
✅ Incluye zonas temáticas y miradores.`;
            break;
        case '2':
            texto = `💰 *PRECIOS UNITARIOS*
🌊 Acuáticos: S/5 a S/8
⛰️ Columpio Extremo: S/20
🧗 Circuito 21 obstáculos: S/20`;
            break;
        case '3':
            texto = `🎒 *PAQUETES*
💦 Acuático S/25
🧗 Aventurero S/35
🔥 Full S/45`;
            break;
        case '4':
            texto = `📍 *UBICACIÓN*
A 30 min de Chicana Grande. Taxis: 926 050 769, 991 972 382
Mapa: https://maps.google.com/?q=-16.4000,-71.5000`;
            break;
        case '5':
            await sendImageMessage(senderId, CARTA_URL, `🍽️ *CARTA DEL RESTAURANTE*
Aquí nuestra carta. ¿Consultas? Escríbenos.
Escriba *menu* para volver.`);
            return;
        default:
            texto = `❌ Opción no válida. Escriba *menu*.`;
    }
    await sendTextMessage(senderId, texto);
    await esperar(1500);
    await sendQuickReplies(senderId, "🔙 ¿Volver al menú principal?", [
        { title: "🔙 Volver al menú", payload: "VOLVER_MENU" }
    ]);
}

// ============================================================
// WEBHOOKS
// ============================================================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log(`🔐 Verificación webhook - Mode: ${mode}, Token recibido: ${token}, Esperado: ${VERIFY_TOKEN}`);
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verificado correctamente');
        botStatus = '✅ Bot conectado y funcionando';
        res.status(200).send(challenge);
    } else {
        console.log('❌ Error de verificación: tokens no coinciden');
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;
    console.log('📩 POST recibido en webhook:', JSON.stringify(body, null, 2));
    
    if (body.object === 'page') {
        for (const entry of body.entry) {
            for (const messagingEvent of entry.messaging) {
                const senderId = messagingEvent.sender.id;
                if (messagingEvent.message) {
                    const message = messagingEvent.message;
                    let textoRecibido = message.text || '';
                    let payload = message.quick_reply ? message.quick_reply.payload : null;
                    
                    console.log(`💬 Mensaje de ${senderId}: texto="${textoRecibido}" payload="${payload}"`);
                    
                    // Lógica de respuestas (igual que antes)
                    if (payload === 'OPCION_1') await enviarInformacion(senderId, '1');
                    else if (payload === 'OPCION_2') await enviarInformacion(senderId, '2');
                    else if (payload === 'OPCION_3') await enviarInformacion(senderId, '3');
                    else if (payload === 'OPCION_4') await enviarInformacion(senderId, '4');
                    else if (payload === 'OPCION_5') await enviarInformacion(senderId, '5');
                    else if (payload === 'VOLVER_MENU') await enviarMenuConBotones(senderId);
                    else {
                        const txt = textoRecibido.trim().toLowerCase();
                        if (txt === '1') await enviarInformacion(senderId, '1');
                        else if (txt === '2') await enviarInformacion(senderId, '2');
                        else if (txt === '3') await enviarInformacion(senderId, '3');
                        else if (txt === '4') await enviarInformacion(senderId, '4');
                        else if (txt === '5') await enviarInformacion(senderId, '5');
                        else if (txt === 'menu' || txt === 'hola' || txt === 'info') await enviarMenuConBotones(senderId);
                        else if (txt.includes('horario')) await enviarInformacion(senderId, '1');
                        else if (txt.includes('precio')) await enviarInformacion(senderId, '2');
                        else if (txt.includes('paquete')) await enviarInformacion(senderId, '3');
                        else if (txt.includes('ubicacion') || txt.includes('donde') || txt.includes('llegar')) await enviarInformacion(senderId, '4');
                        else if (txt.includes('restaurante') || txt.includes('comida') || txt.includes('carta')) await enviarInformacion(senderId, '5');
                        else await enviarMenuConBotones(senderId);
                    }
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Página de estado
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Bot Saqsayki - Messenger</title>
        <style>body{font-family:Arial;text-align:center;background:#f0f2f5;padding:40px}.card{background:white;padding:30px;border-radius:16px;max-width:500px;margin:auto;box-shadow:0 4px 20px rgba(0,0,0,0.1)}h1{color:#0084ff}.status{background:#e3f2fd;padding:12px;border-radius:10px;margin:20px 0}.webhook{background:#f5f5f5;padding:15px;border-radius:10px;word-break:break-all}</style>
        </head>
        <body>
        <div class="card">
        <h1>🤖 Bot Saqsayki (Messenger)</h1>
        <div class="status">${botStatus}</div>
        <div class="webhook">
        <strong>Webhook URL:</strong><br>
        https://bot-saqsayki-messenger.onrender.com/webhook<br>
        <strong>Verify Token:</strong> ${VERIFY_TOKEN}
        </div>
        <p>✅ Esperando mensajes de Messenger</p>
        </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`🔑 Verify Token configurado: ${VERIFY_TOKEN}`);
    if (!PAGE_ACCESS_TOKEN) console.warn('⚠️ PAGE_ACCESS_TOKEN no está definido. El bot no podrá responder.');
});
