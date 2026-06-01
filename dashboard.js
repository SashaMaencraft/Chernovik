const CONFIG = {
    STORAGE_KEY: 'site_api_key',
    VALID_KEYS: ['sk_live_1234567890abcdef', 'sk_test_0987654321fedcba']
};

function getSavedKey() {
    return localStorage.getItem(CONFIG.STORAGE_KEY);
}

function validateKey(key) {
    return CONFIG.VALID_KEYS.includes(key);
}

function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    window.location.href = 'index.html';
}

function displayApiKey() {
    const key = getSavedKey();
    const display = document.getElementById('apiKeyDisplay');
    
    if (key) {
        // Показываем только часть ключа для безопасности
        const visiblePart = key.substring(0, 8);
        const hiddenPart = '*'.repeat(key.length - 8);
        display.textContent = `${visiblePart}${hiddenPart}`;
    }
}

// Защита доступа
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = getSavedKey();
    
    // Если нет ключа или он невалидный - редирект на авторизацию
    if (!savedKey || !validateKey(savedKey)) {
        logout();
        return;
    }
    
    // Отображение информации
    displayApiKey();
    
    // Кнопка выхода
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Защита от копирования
    document.addEventListener('contextmenu', (e) => {
        if (e.target.id === 'apiKeyDisplay') {
            e.preventDefault();
            alert('Копирование ключа запрещено');
        }
    });
});