function initCalls() {
    const closeBtn = document.querySelector('#calls-screen .close-btn');
    if (closeBtn) {
        // Удаляем старый обработчик, если есть
        closeBtn.onclick = null;
        closeBtn.addEventListener('click', goBack);
    }
}

window.initCalls = initCalls;
