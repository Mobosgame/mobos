function initCalls() { // или initSms/initSettings для других экранов
    document.querySelector('#sms-screen .close-btn').addEventListener('click', goBack);
    // остальная инициализация
}
