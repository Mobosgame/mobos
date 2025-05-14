// Упрощенная версия без ожидания загрузки изображений
document.addEventListener('DOMContentLoaded', function() {
    // Показываем загрузку
    document.getElementById('loading-screen').classList.add('active');
    
    // Через 2 секунды переключаемся
    setTimeout(() => {
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
    }, 2000);
});
    
    // Элементы интерфейса
    const screens = {
        loading: document.getElementById('loading-screen'),
        main: document.getElementById('main-screen'),
        sms: document.getElementById('sms-screen'),
        call: document.getElementById('call-screen')
    };
    
    // Навигация
    document.querySelectorAll('.app-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const app = this.dataset.app;
            switchScreen(app);
        });
    });
    
    // Кнопки закрытия
    document.getElementById('close-sms').addEventListener('click', () => switchScreen('main'));
    document.getElementById('close-call').addEventListener('click', () => switchScreen('main'));
    
    // Имитация загрузки
    setTimeout(() => {
        switchScreen('main');
        
        // Тестовые данные
        setTimeout(() => {
            document.getElementById('user-points').textContent = '100 points';
        }, 500);
    }, 2500);
    
    // Функция переключения экранов
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (screenName === 'sms') {
            screens.sms.classList.add('active');
            loadSMS();
        } else if (screenName === 'call') {
            screens.call.classList.add('active');
            loadCalls();
        } else if (screenName === 'main') {
            screens.main.classList.add('active');
        }
    }
    
    // Загрузка сообщений (заглушка)
    function loadSMS() {
        const messageList = document.querySelector('.message-list');
        messageList.innerHTML = '';
        
        // Тестовые сообщения
        const testMessages = [
            { name: 'Хакер', count: 3 },
            { name: 'Друг', count: 1 },
            { name: 'Неизвестный', count: 0 }
        ];
        
        testMessages.forEach(msg => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            messageItem.innerHTML = `
                <div class="sender-info">
                    <span class="sender-name">${msg.name}</span>
                    ${msg.count > 0 ? `<span class="new-message-count">${msg.count}</span>` : ''}
                </div>
            `;
            messageList.appendChild(messageItem);
        });
    }
    
    // Загрузка звонков (заглушка)
    function loadCalls() {
        const callList = document.querySelector('.call-list');
        callList.innerHTML = '';
        
        // Тестовые звонки
        const testCalls = [
            { name: 'Хакер', type: 'incoming' },
            { name: 'Друг', type: 'outgoing' },
            { name: 'Неизвестный', type: 'missed' }
        ];
        
        testCalls.forEach(call => {
            const callItem = document.createElement('div');
            callItem.className = 'call-item';
            callItem.innerHTML = `
                <span class="caller-name">${call.name}</span>
                <span class="call-type ${call.type}">
                    ${call.type === 'incoming' ? 'входящий' : 
                      call.type === 'outgoing' ? 'исходящий' : 'пропущенный'}
                </span>
            `;
            callList.appendChild(callItem);
        });
    }
    
    // Предзагрузка изображений
 function switchScreen(screenName) {
    console.log(`Attempting to switch to: ${screenName}`);
    
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        console.log(`Hiding screen: ${screen.id}`);
    });
    
    const targetScreen = screens[screenName];
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`Showing screen: ${targetScreen.id}`);
    } else {
        console.error(`Screen not found: ${screenName}`);
    }
}
    
    preloadImages();
});
    
    initTestData();
});
