function initSms() {
    // Обработчик кнопки закрытия
    document.querySelector('#sms-screen .close-btn').addEventListener('click', goBack);
    
    // Загрузка сообщений
    loadMessages();
    
    // Дополнительная инициализация
    // ...
}

function loadMessages() {
    const messageList = document.querySelector('#sms-screen .message-list');
    if (!messageList) return;
    
    messageList.innerHTML = '';
    
    // Загрузка сообщений (заглушка)
    const messages = [
        { sender: "Система", text: "Добро пожаловать!", time: "10:30", unread: true },
        { sender: "Поддержка", text: "Ваш запрос обработан", time: "09:15", unread: false }
    ];
    
    // Генерация списка сообщений
    messages.forEach(msg => {
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${msg.unread ? 'unread' : ''}`;
        messageItem.innerHTML = `
            <div class="sender-info">
                <span class="sender-name">${msg.sender}</span>
                <span class="message-time">${msg.time}</span>
            </div>
            <div class="message-preview">${msg.text}</div>
        `;
        messageList.appendChild(messageItem);
    });
}

window.initSms = initSms;
