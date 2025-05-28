function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', function() {
        // Отправляем сообщение в игру о закрытии
        const iframe = document.querySelector('#darkwall-screen .darkwall-iframe');
        iframe.contentWindow.postMessage({ action: 'closeGame' }, '*');
        goBack();
    });

    // Обработчик сообщений от игры
    window.addEventListener('message', function(event) {
        if (event.data === 'gameClosed') {
            goBack();
        }
    });
}
