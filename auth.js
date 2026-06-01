// auth-simple.js - упрощенная версия
const CONFIG = {
    STORAGE_KEY: 'draft_notes_api_key',
    VALID_KEYS: ['sk_demo_notes_2024', 'sk_live_private_notes'],
    REDIRECT_DELAY: 800
};

// DOM элементы
const apiKeyInput = document.getElementById('apiKey');
const loginBtn = document.getElementById('loginBtn');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const loginError = document.getElementById('loginError');

// Проверка ключа
function isValidKey(key) {
    // Загружаем ключи из localStorage
    try {
        const savedKeys = localStorage.getItem('api_keys');
        const validKeys = savedKeys ? JSON.parse(savedKeys) : CONFIG.VALID_KEYS;
        return validKeys.includes(key.trim());
    } catch (e) {
        return CONFIG.VALID_KEYS.includes(key.trim());
    }
}

// Сохранить ключ
function saveKey(key) {
    localStorage.setItem(CONFIG.STORAGE_KEY, key);
    sessionStorage.setItem('notes_auth', 'true');
}

// Получить сохраненный ключ
function getSavedKey() {
    return localStorage.getItem(CONFIG.STORAGE_KEY);
}

// Проверить, если уже авторизован
function checkAuth() {
    const savedKey = getSavedKey();
    if (savedKey && isValidKey(savedKey)) {
        window.location.href = 'notes.html';
    }
}

// Копировать демо-ключ
function copyDemoKey() {
    const demoKey = 'sk_demo_notes_2024';
    navigator.clipboard.writeText(demoKey);
    
    const btn = event.target.closest('.copy-btn');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Скопировано!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 1500);
    }
}

// Войти в систему
async function login() {
    const key = apiKeyInput.value.trim();
    loginError.textContent = '';
    
    if (!key) {
        loginError.textContent = 'Введите API-ключ';
        return;
    }
    
    // Показать состояние загрузки
    loginText.textContent = 'Проверка ключа...';
    loginSpinner.style.display = 'inline-block';
    loginBtn.disabled = true;
    
    // Имитация проверки
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (isValidKey(key)) {
        saveKey(key);
        
        // Успешный вход
        loginText.textContent = 'Доступ разрешен!';
        loginError.style.color = '#4ade80';
        loginError.textContent = 'Перенаправляем...';
        
        // Редирект с задержкой
        setTimeout(() => {
            window.location.href = 'notes.html';
        }, CONFIG.REDIRECT_DELAY);
    } else {
        // Ошибка ключа
        loginText.textContent = 'Войти в редактор';
        loginSpinner.style.display = 'none';
        loginBtn.disabled = false;
        loginError.textContent = 'Неверный API-ключ';
        apiKeyInput.value = '';
        apiKeyInput.focus();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверить авторизацию
    checkAuth();
    
    // Автофокус на поле ввода
    apiKeyInput.focus();
    
    // Обработчики событий
    loginBtn.addEventListener('click', login);
    
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Показать сохраненный ключ (замаскированный)
    const savedKey = getSavedKey();
    if (savedKey) {
        apiKeyInput.value = savedKey.replace(/./g, '•');
        apiKeyInput.style.color = '#94a3b8';
    }
    
    // Очистка поля при клике если показывается маска
    apiKeyInput.addEventListener('click', () => {
        if (apiKeyInput.value.includes('•')) {
            apiKeyInput.value = '';
            apiKeyInput.style.color = '#f1f5f9';
        }
    });
});