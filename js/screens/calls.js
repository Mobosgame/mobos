function initCalls() { // или initSms/initSettings для других экранов
    document.querySelector('#calls-screen .close-btn').addEventListener('click', goBack);
    // остальная инициализация
}
