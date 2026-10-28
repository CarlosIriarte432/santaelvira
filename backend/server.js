require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Resend y capturar la llave de Groq desde las variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// --- ENDPOINT 1: CHATBOT ---
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const SYSTEM_INSTRUCTION = ` Eres el asistente virtual comercial de nuestra distribuidora de huevos frescos.

TUS REGLAS DE COMPORTAMIENTO:
Limítate ÚNICAMENTE a responder información sobre nuestro catálogo de productos, formatos, precios y despachos. Si te preguntan sobre temas ajenos, responde amablemente que solo puedes asesorar sobre los productos de nuestra avícola.
Da respuestas concisas, breves y directas al grano (máximo 2 a 3 párrafos cortos).
NUNCA uses asteriscos (**) ni formato Markdown para resaltar texto. Escribe todo en texto plano y natural.

CATÁLOGO OFICIAL DE PRODUCTOS:
Presentaciones de 6 Unidades:
6 Unidades - Huevos Grandes
6 Unidades - Huevos Extra Grandes - Enriquecido en Omega 3
6 Unidades - Gallinas Libres

Presentaciones de 12 Unidades:
12 Unidades - Huevos Grandes
12 Unidades - Huevos Extra Grandes - Enriquecido en Omega 3
12 Unidades - Gallinas Libres

Presentaciones de 20 Unidades:
20 Unidades - Huevos Grandes
20 Unidades - Huevos Extra Grandes

Presentaciones de 30 Unidades (Cajas/Cartones):
30 Unidades - Huevos Medianos
30 Unidades - Huevos Grandes
30 Unidades - Huevos Extra Grandes

Presentaciones de 60 unidades:
60 Unidades - Huevos Medianos

DESPACHOS Y ATENCIÓN:
Ofrecemos entregas a domicilio y formatos ideales tanto para consumo familiar como para negocios o almacenes.
Invita siempre al cliente a realizar su pedido o consultar disponibilidad detallando cuántas unidades y qué tipo de huevo necesita a través del formulario de contacto o WhatsApp indicado en la web.
 REGLA DE CONTACTO: Siempre que invites al usuario a comunicarse por WhatsApp o mediante el sitio web, debes incluir textualmente la palabra 'contacto' en tu respuesta.`;

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "qwen/qwen3.8-27b",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.5,
                max_tokens: 300
            })
        });

        const data = await groqResponse.json();
        res.json(data);
    } catch (error) {
        console.error("Error en Chatbot:", error);
        res.status(500).json({ error: 'Error comunicándose con el asistente' });
    }
});

// --- ENDPOINT 2: FORMULARIO DE CONTACTO ---
app.post('/api/contact', async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    try {
        const data = await resend.emails.send({
            from: 'Web Santa Elvira <onboarding@resend.dev>', // Cambia esto cuando verifiques el dominio en Resend
            to: ['ventas@santaelvira.cl'], // Reemplaza con el correo de destino de Santa Elvira o el de Zero Ping para pruebas
            subject: `Nuevo Mensaje Web: ${asunto}`,
            html: `
                <h2>Nuevo contacto desde la Landing Page</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${asunto}</p>
                <p><strong>Mensaje:</strong><br/>${mensaje}</p>
            `
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error enviando correo:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Zero Ping corriendo en puerto ${PORT}`));