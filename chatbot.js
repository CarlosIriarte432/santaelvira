const GROQ_API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Prompt del sistema adaptado al negocio de huevos
const SYSTEM_INSTRUCTION = `
Eres el asistente virtual comercial de una empresa dedicada a la venta y distribución de huevos frescos de alta calidad.

TUS REGLAS DE COMPORTAMIENTO:
1. Limítate ÚNICAMENTE a responder información sobre tipos de huevos, formatos de venta, precios estimados, despacho a domicilio y disponibilidad. Si te preguntan sobre temas ajenos, responde amablemente que solo puedes asesorar sobre los productos y pedidos de nuestra avícola/distribuidora.
2. Da respuestas concisas, breves y directas al grano (máximo 2 a 3 párrafos cortos).
3. NUNCA uses asteriscos (**) ni formato Markdown para resaltar texto. Escribe todo en texto plano y natural.

INFORMACIÓN DE NUESTROS PRODUCTOS Y SERVICIOS:
- PRODUCTOS:
  1. Huevos de Gallina Feliz / Campo (Yema más amarilla, libres de jaula o semilibres).
  2. Formatos de venta: Bandejas/Cartones de 30 unidades (Tamaños: Mediano, Grande / L, Extra Grande / XL, y Jumbo). También ventas por mayor para almacenes, botillerías y minimarkets.
- DESPACHOS Y ENTREGAS:
  1. Envíos a domicilio (revisa zonas y días de reparto directo).
  2. Despachos gratis por compras sobre un monto mínimo al por mayor o en comunas cercanas.
- ATENCIÓN Y PEDIDOS:
  Invitamos siempre al cliente a realizar su pedido o consultar stock directamente completando el formulario de contacto o escribiendo a nuestro WhatsApp oficial indicado en la web.
`;

function toggleChat() {
    const chatWindow = document.getElementById("chat-window");
    const iconOpen = document.getElementById("chat-icon-open");
    const iconClose = document.getElementById("chat-icon-close");

    chatWindow.classList.toggle("hidden");
    iconOpen.classList.toggle("hidden");
    iconClose.classList.toggle("hidden");

    if (!chatWindow.classList.contains("hidden")) {
        document.getElementById("userInput").focus();
    }
}

async function sendMessage() {
    const inputField = document.getElementById("userInput");
    const userMessage = inputField.value.trim();

    if (!userMessage) return;

    appendMessage(userMessage, "user");
    inputField.value = "";

    const loadingId = appendMessage("Buscando información...", "bot");

    try {
        const response = await fetch(API_URL, {
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

        const data = await response.json();

        // Quitar mensaje de carga
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        if (response.ok && data.choices && data.choices[0].message.content) {
            let botReply = data.choices[0].message.content;
            
            // Limpieza automática de asteriscos
            botReply = botReply.replaceAll('**', '').replaceAll('*', '');

            appendMessage(botReply, "bot");
        } else if (data.error) {
            console.error("Error API:", data.error);
            appendMessage(`Ocurrió un error al procesar tu solicitud.`, "bot");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();
        appendMessage("Error al conectar con el asistente.", "bot");
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    const uniqueId = "msg-" + Date.now() + Math.floor(Math.random() * 1000);
    
    msgDiv.id = uniqueId;
    msgDiv.classList.add("message", "p-3", "rounded-2xl", "max-w-[85%]", "text-sm", "leading-relaxed");
    
    if (sender === "user") {
        // Estilo de burbuja del usuario (Rojo corporativo)
        msgDiv.classList.add("bg-red-600", "text-white", "self-end", "rounded-br-sm");
    } else {
        // Estilo de burbuja del bot (Gris oscuro o tono neutro que contraste)
        msgDiv.classList.add("bg-zinc-800", "text-slate-200", "self-start", "rounded-bl-sm");
    }
    
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return uniqueId;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function handleContactSubmit(event) {
    event.preventDefault();
    const feedback = document.getElementById("form-feedback");
    feedback.textContent = "¡Pedido o mensaje enviado con éxito! Nos comunicaremos contigo en breve.";
    feedback.classList.remove("hidden");
    document.getElementById("contact-form").reset();
}