// Apunta a tu backend desplegado
const API_URL = "https://tu-api-en-render.onrender.com/api/chat";

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
            botReply = botReply.replaceAll('**', '').replaceAll('*', '');
            appendMessage(botReply, "bot");
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

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    const uniqueId = "msg-" + Date.now() + Math.floor(Math.random() * 1000);
    
    msgDiv.id = uniqueId;
    msgDiv.classList.add("message", "p-3", "rounded-2xl", "max-w-[85%]", "text-sm", "leading-relaxed", "shadow-sm");
    
    if (sender === "user") {
        msgDiv.classList.add("bg-red-600", "text-white", "self-end", "rounded-br-sm");
    } else {
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