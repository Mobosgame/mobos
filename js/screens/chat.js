function initChat() {
    // 1. Обработчик закрытия
    document.querySelector('#chat-screen .close-btn').addEventListener('click', goBack);
}
window.initChat = initChat;

// chat.js
function initChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input-field');
    const sendBtn = document.getElementById('chat-send-btn');
    
    // Храним последние 10 сообщений
    const messageHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Отображаем историю при загрузке
    messageHistory.forEach(msg => {
        addMessageToChat(msg.sender, msg.text, msg.timestamp);
    });
    
    // Обработчик отправки сообщения
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            const timestamp = new Date().toLocaleTimeString();
            const sender = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'You';
            
            // Добавляем в историю (максимум 10 сообщений)
            messageHistory.push({ sender, text, timestamp });
            if (messageHistory.length > 10) {
                messageHistory.shift();
            }
            localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
            
            addMessageToChat(sender, text, timestamp);
            chatInput.value = '';
            
            // Здесь можно добавить отправку на сервер, если нужно
        }
    }
    
    // Добавление сообщения в чат
    function addMessageToChat(sender, text, timestamp) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="chat-sender">${sender}:</span>
            <span class="chat-text">${text}</span>
            <span class="chat-time">${timestamp}</span>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Обработчики событий
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    document.querySelector('#chat-screen .close-btn').addEventListener('click', goBack);
}

window.initChat = initChat;
