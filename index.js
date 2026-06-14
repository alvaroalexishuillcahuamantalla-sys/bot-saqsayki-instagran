const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// 1. Verificación del Webhook (Lo que Meta te pedirá)
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).send('Error de verificación');
    }
});

// 2. Recepción de mensajes
app.post('/webhook', (req, res) => {
    const body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;
            const message_text = webhook_event.message.text;

            handleMessage(sender_psid, message_text);
        });
        res.status(200).send('EVENT_RECEIVED');
    }
});

// 3. Lógica del Menú
async function handleMessage(sender_psid, received_message) {
    let response;
    const text = received_message ? received_message.trim().toLowerCase() : '';

    switch (text) {
        case '1':
            response = { "text": "🕒 HORARIOS E INGRESO\n\n📅 Lunes a domingo (incluyendo feriados)\n⏰ 9:30 a.m. a 5:30 p.m.\n\n🎟️ Precios:\n* Adultos: S/ 7.00\n* Niños: S/ 4.00\n\n💬 Escriba 'menu' para volver" };
            break;
        case '2':
            response = { "text": "💰 PRECIOS UNITARIOS\n\n🌊 Acuáticos: Caminata S/ 5, Puente S/ 5, Tirolesa S/ 8.\n⛰️ Altura: Columpio S/ 20, Circuito S/ 20.\n\n💬 Escriba 'menu' para volver" };
            break;
        case '3':
            response = { "text": "🎒 PAQUETES PROMOCIONALES\n\n💦 Paquete Acuático: S/ 25.00\n🧗 Paquete Aventurero: S/ 35.00\n🔥 Paquete Full: S/ 45.00\n\n💬 Escriba 'menu' para volver" };
            break;
        case '4':
            response = { "text": "📍 CÓMO LLEGAR\n\nEstamos a 30 min a pie o 15 min en taxi desde Chicana Grande.\n📞 Taxis: 926 050 769 / 991 972 382\n\n💬 Escriba 'menu' para volver" };
            break;
        case '5':
            response = { "text": "🍽️ RESTAURANTE\n\nCarta disponible. Reservas solo en fechas especiales.\n\n💬 Escriba 'menu' para volver" };
            break;
        case 'menu':
        case 'hola':
        default:
            response = { "text": "Bienvenido a Saqsayki. Elige una opción:\n1. Horarios\n2. Precios\n3. Paquetes\n4. Ubicación\n5. Restaurante" };
            break;
    }
    callSendAPI(sender_psid, response);
}

// 4. Enviar respuesta a Meta
function callSendAPI(sender_psid, response) {
    axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: sender_psid },
        message: response
    }).catch(err => console.error(err));
}

app.listen(process.env.PORT || 1337, () => console.log('Webhook listo'));