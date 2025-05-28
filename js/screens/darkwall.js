function initDarkwall() {
    // Обработчик закрытия
    document.querySelector('#darkwall-screen .close-btn').addEventListener('click', function() {
        // Отправляем сообщение в игру о закрытии
        const iframe = document.querySelector('#darkwall-screen .darkwall-iframe');
        iframe.contentWindow.postMessage({ action: 'closeGame' }, '*');
        goBack();
    });
    function initDarkwall() {
    // Адаптация размера игры под экран
    function resizeGame() {
        const iframe = document.querySelector('#darkwall-screen .game-iframe');
        if (!iframe) return;
        
        const headerHeight = document.querySelector('#darkwall-screen .app-header').offsetHeight;
        const availableHeight = window.innerHeight - headerHeight - 20;
        const availableWidth = window.innerWidth - 40;
        
        // Сохраняем пропорции игры (примерно 4:5)
        const gameRatio = 4/5;
        let gameWidth = availableWidth;
        let gameHeight = gameWidth * gameRatio;
        
        if (gameHeight > availableHeight) {
            gameHeight = availableHeight;
            gameWidth = gameHeight / gameRatio;
        }
        
        iframe.style.width = `${gameWidth}px`;
        iframe.style.height = `${gameHeight}px`;
    }
    
    // Инициализация размера
    resizeGame();
    
    // Обновление при изменении размера окна
    window.addEventListener('resize', resizeGame);
    
    // Очистка при закрытии
    return () => {
        window.removeEventListener('resize', resizeGame);
    };
}

    // Обработчик сообщений от игры
    window.addEventListener('message', function(event) {
        if (event.data === 'gameClosed') {
            goBack();
        }
    });
}
