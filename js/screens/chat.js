function initChat() {
    console.log("Initializing chat...");
    
    // Инициализация элементов
    const chatScreen = document.getElementById('chat-screen');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input-field');
    const sendBtn = document.getElementById('chat-send-btn');
    
    // Загрузка истории
    let messageHistory = [];
    try {
        messageHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        console.log("Loaded history:", messageHistory);
    } catch (e) {
        console.error("Failed to load chat history:", e);
        localStorage.setItem('chatHistory', JSON.stringify([]));
    }
    
    // Отображение истории
    messageHistory.forEach(msg => {
        addMessage(msg.sender, msg.text, msg.timestamp);
    });
    
    // Функция добавления сообщения
    function addMessage(sender, text, timestamp) {
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
    
    // Отправка сообщения
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const sender = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'You';
            
            // Добавление в историю
            messageHistory.push({sender, text, timestamp});
            if (messageHistory.length > 10) {
                messageHistory.shift();
            }
            
            localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
            addMessage(sender, text, timestamp);
            chatInput.value = '';
        }
    }
    
    // Обработчики событий
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Применение перевода
    applyChatTranslations();
    
    console.log("Chat initialized successfully");
}

function applyChatTranslations() {
    const lang = window.currentSettings?.language || 'ru';
    const translations = window.translations[lang] || {};
    
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[key];
            } else {
                el.textContent = translations[key];
            }
        }
    });
}

window.initChat = initChat;
