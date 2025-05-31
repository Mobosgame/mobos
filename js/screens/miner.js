function initMiner() {
    // 1. Обработчик закрытия
    document.querySelector('#miner-screen .close-btn').addEventListener('click', goBack);
}
window.initMiner = initMiner;
