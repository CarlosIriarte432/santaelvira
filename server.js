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
        const SYSTEM_INSTRUCTION = ` Eres el asistente virtual comercial de una empresa dedicada a la venta y distribución de huevos frescos de alta calidad.  
        TUS REGLAS DE COMPORTAMIENTO: 1. Limítate ÚNICAMENTE a responder información sobre tipos de huevos, 
        formatos de venta, precios estimados, despacho a domicilio y disponibilidad. Si te preguntan sobre 
        temas ajenos, responde amablemente que solo puedes asesorar sobre los productos y pedidos de nuestra 
        avícola/distribuidora. 
        2. Da respuestas concisas, breves y directas al grano (máximo 2 a 3 párrafos cortos). 
        3. NUNCA uses asteriscos (**) ni formato Markdown para resaltar texto. Escribe todo en texto plano y natural.  
        INFORMACIÓN DE NUESTROS PRODUCTOS Y SERVICIOS: - 
        PRODUCTOS:   1. Huevos de Gallina Feliz / Campo (Yema más amarilla, libres de jaula o semilibres).   
        2. Formatos de venta: Bandejas/Cartones de 30 unidades (Tamaños: Mediano, Grande / L, Extra Grande / XL, y Jumbo). 
        También ventas por mayor para almacenes, botillerías y minimarkets. - 
        DESPACHOS Y ENTREGAS:   
        1. Envíos a domicilio (revisa zonas y días de reparto directo).   
        2. Despachos gratis por compras sobre un monto mínimo al por mayor o en comunas cercanas. - 
        ATENCIÓN Y PEDIDOS:   Invitamos siempre al cliente a realizar su pedido o consultar stock directamente completando 
        el formulario de contacto o escribiendo a nuestro WhatsApp oficial indicado en la web. `;

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