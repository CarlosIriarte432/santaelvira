// Apunta a tu backend desplegado en Render (Seguridad total, sin API keys expuestas)
const API_URL = "https://santaelvira.onrender.com/api/chat";

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();

        if (response.ok && data.choices && data.choices[0].message.content) {
            let botReply = data.choices[0].message.content;
            
            // Limpieza de formato markdown de la IA
            botReply = botReply.replaceAll('**', '').replaceAll('*', '');
            appendMessage(botReply, "bot");

            // Evaluación de intención de contacto
            const contactKeywords = ['whatsapp', 'contacto', 'formulario', 'pedido'];
            const requiresContact = contactKeywords.some(keyword => botReply.toLowerCase().includes(keyword));

            if (requiresContact) {
                appendContactActions();
            }
        } else {
            console.error("Error API:", data.error || data);
            appendMessage(`Ocurrió un error al procesar tu solicitud.`, "bot");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        const loadingElem = document.getElementById(loadingId);
        if (loadingElem) loadingElem.remove();
        appendMessage("Error al conectar con el asistente.", "bot");
    }
}

function appendContactActions() {
    const chatBox = document.getElementById("chatBox");
    const actionsDiv = document.createElement("div");
    
    // Contenedor minimalista alineado al bot
    actionsDiv.classList.add("flex", "gap-2", "mt-2", "mb-3", "self-start");

    // Enlace a WhatsApp
    const waBtn = document.createElement("a");
    waBtn.href = "https://wa.me/56900000000"; // Reemplazar con el número real del cliente
    waBtn.target = "_blank";
    waBtn.classList.add("bg-green-600", "text-white", "text-xs", "font-bold", "px-4", "py-2", "rounded-lg", "shadow-sm", "hover:bg-green-700", "transition-colors");
    waBtn.textContent = "WhatsApp";

    // Botón de redirección al formulario
    const formBtn = document.createElement("button");
    formBtn.onclick = () => {
        // Redirige al id="contacto" ya existente en tu index.html y oculta el chat
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
        toggleChat(); 
    };
    formBtn.classList.add("bg-red-600", "text-white", "text-xs", "font-bold", "px-4", "py-2", "rounded-lg", "shadow-sm", "hover:bg-red-700", "transition-colors");
    formBtn.textContent = "Ir al Formulario";

    actionsDiv.appendChild(waBtn);
    actionsDiv.appendChild(formBtn);
    chatBox.appendChild(actionsDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    const uniqueId = "msg-" + Date.now() + Math.floor(Math.random() * 1000);
    
    msgDiv.id = uniqueId;
    msgDiv.classList.add("message", "p-3", "rounded-2xl", "max-w-[85%]", "text-sm", "leading-relaxed", "shadow-sm");
    
    if (sender === "user") {
        // Estilo de burbuja del usuario (Rojo corporativo)
        msgDiv.classList.add("bg-red-600", "text-white", "self-end", "rounded-br-sm");
    } else {
        // Estilo de burbuja del bot (Fondo blanco, diseño limpio)
        msgDiv.classList.add("bg-white", "border", "border-stone-200", "text-stone-700", "self-start", "rounded-bl-sm");
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