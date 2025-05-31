function initChat() {
    // 1. Обработчик закрытия
    document.querySelector('#chat-screen .close-btn').addEventListener('click', goBack);
}
window.initChat = initChat;
