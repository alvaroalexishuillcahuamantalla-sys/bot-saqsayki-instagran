const express = require('express');
const axios = require('axios');

// Servidor HTTP
const app = express();
const PORT = process.env.PORT || 8080;

// Variables globales
let botStatus = 'Iniciando el bot de Messenger, por favor espera...';

// ============================================================
// CONFIGURACIÓN DE FACEBOOK MESSENGER
// ============================================================
// IMPORTANTE: Reemplaza con tus tokens de Facebook Developers
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'TU_PAGE_ACCESS_TOKEN_AQUI';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'MI_TOKEN_SECRETO_123';

// URL de la carta (misma que usas en WhatsApp)
const CARTA_URL = 'https://raw.githubusercontent.com/alvaroalexishuillcahuamantalla-sys/bot-saqsayki/main/carta.jpeg';

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// FUNCIÓN PARA OBTENER SALUDO SEGÚN LA HORA
// ============================================================
function obtenerSaludo() {
    const hora = new Date().getHours();
    
    if (hora >= 6 && hora < 12) {
        return "🌅 Buenos días";
    } else if (hora >= 12 && hora < 19) {
        return "🌤️ Buenas tardes";
    } else {
        return "🌙 Buenas noches";
    }
}

// ============================================================
// FUNCIÓN PARA ENVIAR MENSAJE DE TEXTO A MESSENGER
// ============================================================
async function sendTextMessage(senderId, texto) {
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: { text: texto }
            }
        );
        console.log('✅ Mensaje enviado a Messenger');
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
    }
}

// ============================================================
// FUNCIÓN PARA ENVIAR MENSAJE CON BOTONES (QUICK REPLIES)
// ============================================================
async function sendQuickReplies(senderId, texto, opciones) {
    // opciones es un array de objetos: { title: "Texto", payload: "valor" }
    const quickReplies = opciones.map(op => ({
        content_type: "text",
        title: op.title.substring(0, 20), // Máximo 20 caracteres
        payload: op.payload
    }));

    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: {
                    text: texto,
                    quick_replies: quickReplies
                }
            }
        );
        console.log('✅ Mensaje con botones enviado a Messenger');
    } catch (error) {
        console.error('❌ Error enviando botones:', error.response?.data || error.message);
    }
}

// ============================================================
// FUNCIÓN PARA ENVIAR IMAGEN DE LA CARTA
// ============================================================
async function sendImageMessage(senderId, imageUrl, caption) {
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: senderId },
                messaging_type: "RESPONSE",
                message: {
                    attachment: {
                        type: "image",
                        payload: {
                            url: imageUrl,
                            is_reusable: true
                        }
                    }
                }
            }
        );
        
        // Enviamos el caption por separado (como mensaje de texto)
        if (caption) {
            await esperar(500);
            await sendTextMessage(senderId, caption);
        }
        
        console.log('✅ Imagen enviada a Messenger');
    } catch (error) {
        console.error('❌ Error enviando imagen:', error.response?.data || error.message);
        await sendTextMessage(senderId, "📌 Lo sentimos, no pudimos cargar la imagen de la carta en este momento. Por favor, inténtalo de nuevo más tarde.");
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

// ============================================================
// MENÚ SOLO TEXTO (FALLBACK)
// ============================================================
async function enviarMenuTexto(senderId) {
    const saludo = obtenerSaludo();
    
    const menuTexto = `${saludo} ✨

*Bienvenido(a) al Parque Temático Saqsayki*

Vive una experiencia única llena de aventura, diversión y naturaleza.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Seleccione una opción escribiendo el número:*

1️⃣ *Horarios e ingreso*
2️⃣ *Precios unitarios de juegos*
3️⃣ *Paquetes promocionales*
4️⃣ *Cómo llegar*
5️⃣ *Restaurante* 🍽️

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Ejemplo:* Escriba *1* para ver los horarios

📌 *Comandos:* Escriba *menu* para ver este mensaje nuevamente

📍 *Saqsayki - Tu mejor experiencia*`;

    await sendTextMessage(senderId, menuTexto);
}

// ============================================================
// FUNCIÓN PARA ENVIAR INFORMACIÓN ESPECÍFICA
// ============================================================
async function enviarInformacion(senderId, opcion) {
    await esperar(1000);
    
    let texto = '';
    
    switch(opcion) {
        case '1':
            texto = `
🕒 *HORARIOS E INGRESO*

📅 Lunes a domingo (incluyendo feriados)
⏰ 9:30 a.m. a 5:30 p.m.

🎟️ *Precios de ingreso:*
• Adultos: S/ 7.00
• Niños: S/ 4.00

✅ *El ingreso incluye:*
• Mano Gigante del Inca
• Bosque Encantado de los Duendes
• Mano de Choclo de Oro
• Trilogía Andina
• Diversos miradores turísticos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Escriba *menu* para volver al inicio
`;
            break;
        case '2':
            texto = `
💰 *PRECIOS UNITARIOS DE JUEGOS*

🌊 *Juegos Acuáticos*
• Caminata en línea — S/ 5.00
• Puente acuático — S/ 5.00
• Tirolesa acuática — S/ 8.00
• Puente aéreo — S/ 8.00

⛰️ *Juegos de Altura*
• Columpio Extremo "Vuelo del Cóndor" — S/ 20.00
• Circuito de 21 obstáculos extremos — S/ 20.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Escriba *menu* para volver al inicio
`;
            break;
        case '3':
            texto = `
🎒 *PAQUETES PROMOCIONALES*

💦 *Paquete Acuático* — S/ 25.00
• Entrada al parque
• Puente acuático
• Caminata en línea
• Tirolesa acuática
• Puente aéreo

🧗 *Paquete Aventurero* — S/ 35.00
• Entrada al parque
• Columpio extremo
• Circuito de 21 obstáculos
• Puente acuático

🔥 *Paquete Full* — S/ 45.00
• Entrada al parque
• Columpio extremo
• Circuito de 21 obstáculos
• Tirolesa acuática
• Caminata en línea
• Puente aéreo
• Puente acuático

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Escriba *menu* para volver al inicio
`;
            break;
        case '4':
            texto = `
📍 *CÓMO LLEGAR A SAQSAYKI*

🚗 Nos encontramos aproximadamente a 30 minutos de Chicana Grande.

🚕 En taxi podrás llegar en aproximadamente 15 minutos desde Chicana Grande.

🗺️ *Google Maps:*
https://maps.google.com/?q=-16.4000,-71.5000

📞 *Taxis recomendados:*
926 050 769
991 972 382

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Escriba *menu* para volver al inicio
`;
            break;
        case '5':
            // Enviar imagen de la carta
            await sendImageMessage(senderId, CARTA_URL, `🍽️ *CARTA DEL RESTAURANTE SAQSAYKI*

Aquí está nuestra carta completa con todos nuestros platillos.

📌 *Nota:* Solo realizamos reservas para días festivos y eventos especiales.

¿Tienes alguna consulta? Escríbenos sin problema, estamos para ayudarte.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Escriba *menu* para volver al inicio`);
            return;
        default:
            texto = `
❌ *Opción no válida*

Por favor, seleccione una opción del 1 al 5.

Escriba *menu* para ver las opciones disponibles.`;
    }
    
    await sendTextMessage(senderId, texto);
    
    // Preguntar si quiere volver al menú
    await esperar(1500);
    await sendQuickReplies(senderId, "🔙 ¿Deseas volver al menú principal?", [
        { title: "🔙 Volver al menú", payload: "VOLVER_MENU" }
    ]);
}

// ============================================================
// WEBHOOK - VERIFICACIÓN (GET)
// ============================================================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verificado correctamente');
        botStatus = '✅ Bot de Messenger conectado y funcionando';
        res.status(200).send(challenge);
    } else {
        console.log('❌ Error de verificación del webhook');
        res.sendStatus(403);
    }
});

// ============================================================
// WEBHOOK - RECIBIR MENSAJES (POST)
// ============================================================
app.post('/webhook', async (req, res) => {
    const body = req.body;
    
    if (body.object === 'page') {
        for (const entry of body.entry) {
            for (const messagingEvent of entry.messaging) {
                const senderId = messagingEvent.sender.id;
                
                // Verificar si es un mensaje
                if (messagingEvent.message) {
                    const message = messagingEvent.message;
                    let textoRecibido = message.text || '';
                    let payload = null;
                    
                    // Verificar si es respuesta de un botón (quick reply)
                    if (message.quick_reply) {
                        payload = message.quick_reply.payload;
                        console.log(`🔘 Botón presionado: ${payload}`);
                    }
                    
                    const opcionTexto = textoRecibido.trim().toLowerCase();
                    
                    console.log(`💬 Mensaje recibido de ${senderId}: "${textoRecibido}"`);
                    
                    // Procesar según payload (botón) o texto
                    if (payload === 'OPCION_1') {
                        await enviarInformacion(senderId, '1');
                    }
                    else if (payload === 'OPCION_2') {
                        await enviarInformacion(senderId, '2');
                    }
                    else if (payload === 'OPCION_3') {
                        await enviarInformacion(senderId, '3');
                    }
                    else if (payload === 'OPCION_4') {
                        await enviarInformacion(senderId, '4');
                    }
                    else if (payload === 'OPCION_5') {
                        await enviarInformacion(senderId, '5');
                    }
                    else if (payload === 'VOLVER_MENU') {
                        await enviarMenuConBotones(senderId);
                    }
                    // Procesar comandos de texto
                    else if (opcionTexto === '1') {
                        await enviarInformacion(senderId, '1');
                    }
                    else if (opcionTexto === '2') {
                        await enviarInformacion(senderId, '2');
                    }
                    else if (opcionTexto === '3') {
                        await enviarInformacion(senderId, '3');
                    }
                    else if (opcionTexto === '4') {
                        await enviarInformacion(senderId, '4');
                    }
                    else if (opcionTexto === '5') {
                        await enviarInformacion(senderId, '5');
                    }
                    else if (opcionTexto === 'menu' || opcionTexto === 'hola' || opcionTexto === 'info') {
                        await enviarMenuConBotones(senderId);
                    }
                    else if (opcionTexto.includes('horario')) {
                        await enviarInformacion(senderId, '1');
                    }
                    else if (opcionTexto.includes('precio')) {
                        await enviarInformacion(senderId, '2');
                    }
                    else if (opcionTexto.includes('paquete')) {
                        await enviarInformacion(senderId, '3');
                    }
                    else if (opcionTexto.includes('ubicacion') || opcionTexto.includes('donde') || opcionTexto.includes('llegar')) {
                        await enviarInformacion(senderId, '4');
                    }
                    else if (opcionTexto.includes('restaurante') || opcionTexto.includes('comida') || opcionTexto.includes('carta')) {
                        await enviarInformacion(senderId, '5');
                    }
                    else if (opcionTexto === 'buenos dias' || opcionTexto === 'buen dia') {
                        await enviarMenuConBotones(senderId);
                    }
                    else if (opcionTexto === 'buenas tardes' || opcionTexto === 'buena tarde') {
                        await enviarMenuConBotones(senderId);
                    }
                    else if (opcionTexto === 'buenas noches' || opcionTexto === 'buena noche') {
                        await enviarMenuConBotones(senderId);
                    }
                    else {
                        await enviarMenuConBotones(senderId);
                    }
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// ============================================================
// PANEL WEB DE ESTADO
// ============================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot Saqsayki - Facebook Messenger</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; text-align: center; background: #f0f2f5; padding: 40px; margin: 0; }
                .card { background: white; padding: 30px; border-radius: 16px; max-width: 500px; margin: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                h1 { color: #0084ff; margin-top: 0; font-size: 24px; }
                .status { background: #e3f2fd; padding: 12px; border-radius: 10px; margin: 20px 0; color: #0d47a1; font-weight: 500; }
                .webhook { background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 15px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
                .footer { margin-top: 25px; font-size: 12px; color: #777; }
                .btn { display: inline-block; padding: 10px 20px; background: #0084ff; color: white; text-decoration: none; border-radius: 8px; margin-top: 15px; font-weight: bold; }
                .info { font-size: 13px; color: #555; margin-top: 15px; text-align: left; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🤖 Bot Saqsayki</h1>
                <h3>📱 Facebook Messenger</h3>
                <div class="status">${botStatus}</div>
                <div class="webhook">
                    🌐 Webhook URL:<br>
                    <strong>https://tu-bot-messenger.onrender.com/webhook</strong>
                </div>
                <div class="info">
                    📌 <strong>Configuración en Facebook Developers:</strong><br>
                    • Callback URL: https://tu-bot-messenger.onrender.com/webhook<br>
                    • Verify Token: ${VERIFY_TOKEN}<br>
                    • Suscripciones: messages, messaging_postbacks
                </div>
                <a href="/" class="btn">🔄 Actualizar</a>
                <div class="footer">Parque Temático Saqsayki | Bot con botones interactivos</div>
            </div>
        </body>
        </html>
    `);
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🤖 BOT DE FACEBOOK MESSENGER - SAQSAYKI                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   🌐 Servidor web: http://localhost:${PORT}                   ║
║   📡 Webhook: http://localhost:${PORT}/webhook                ║
║                                                              ║
║   📌 Para conectar con Facebook:                             ║
║      1. Crea una App en developers.facebook.com              ║
║      2. Activa Messenger y configura el webhook              ║
║      3. Usa este Verify Token: ${VERIFY_TOKEN}               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});