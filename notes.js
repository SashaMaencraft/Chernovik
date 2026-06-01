// Полный рабочий скрипт заметок
// Конфигурация
const CONFIG = {
    STORAGE_KEY: 'draft_notes_data',
    AUTO_SAVE_DELAY: 1500
};

// DOM элементы
const notesList = document.getElementById('notesList');
const newNoteBtn = document.getElementById('newNoteBtn');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const lastSaved = document.getElementById('lastSaved');
const saveStatus = document.getElementById('saveStatus');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Состояние
let currentNoteId = null;
let notes = {};
let autoSaveTimer = null;

// Проверка авторизации
function checkAuth() {
    // Проверяем временную авторизацию
    const isAuthenticated = localStorage.getItem('notes_auth_temp') === 'true';
    const hasKey = sessionStorage.getItem('current_api_key');
    
    if (!isAuthenticated || !hasKey) {
        // Если нет авторизации - на страницу входа
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Загрузить все заметки
function loadNotes() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        notes = saved ? JSON.parse(saved) : {};
        
        if (Object.keys(notes).length === 0) {
            // Создаем первую заметку
            createNewNote(true);
        } else {
            // Загружаем последнюю заметку
            const noteIds = Object.keys(notes);
            currentNoteId = noteIds[noteIds.length - 1];
            loadNote(currentNoteId);
        }
        
        renderNotesList();
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        notes = {};
        createNewNote(true);
    }
}

// Загрузить конкретную заметку
function loadNote(noteId) {
    const note = notes[noteId];
    if (!note) return;
    
    currentNoteId = noteId;
    noteTitle.value = note.title || '';
    noteContent.value = note.content || '';
    
    updateStats();
    renderNotesList();
}

// Создать новую заметку
function createNewNote(isFirst = false) {
    const noteId = 'note_' + Date.now();
    const defaultTitle = isFirst ? 'Добро пожаловать!' : 'Новая заметка';
    const defaultContent = isFirst ? 
        'Добро пожаловать в Черновик-Заметки!\n\nЗдесь вы можете безопасно хранить свои мысли и идеи.\n\nВАЖНО:\n• Это приложение для обычных заметок\n• НЕ рекомендуется хранить пароли, банковские данные\n• Все данные хранятся локально в вашем браузере\n\nФункции:\n• Создавайте новые заметки кнопкой "Новая заметка"\n• Редактируйте их в правой части\n• Удаляйте ненужные заметки кнопкой "🗑️"\n• Экспортируйте заметки через кнопку "📤 Экспорт"\n\nВаши заметки автоматически сохраняются.' : 
        '';
    
    notes[noteId] = {
        id: noteId,
        title: defaultTitle,
        content: defaultContent,
        created: Date.now(),
        updated: Date.now()
    };
    
    currentNoteId = noteId;
    loadNote(noteId);
    saveNotes();
    
    // Фокус на редактор
    setTimeout(() => {
        noteContent.focus();
        noteContent.setSelectionRange(noteContent.value.length, noteContent.value.length);
    }, 100);
}

// Сохранить заметки
function saveNotes() {
    if (!currentNoteId) return;
    
    notes[currentNoteId] = {
        ...notes[currentNoteId],
        title: noteTitle.value.trim() || 'Без названия',
        content: noteContent.value,
        updated: Date.now()
    };
    
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(notes));
        
        // Обновить статус
        const now = new Date();
        lastSaved.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        saveStatus.textContent = '✓ Сохранено';
        
        renderNotesList();
        
        // Через 2 секунды возвращаем обычный статус
        setTimeout(() => {
            saveStatus.textContent = '✓ Автосохранение';
        }, 2000);
    } catch (e) {
        saveStatus.textContent = '❌ Ошибка';
        console.error('Ошибка сохранения:', e);
    }
}

// Удалить заметку
function deleteNote(noteId) {
    if (Object.keys(notes).length <= 1) {
        alert('Нельзя удалить последнюю заметку!');
        return;
    }
    
    if (!confirm('Удалить эту заметку?')) return;
    
    delete notes[noteId];
    
    // Если удаляем текущую заметку, переключаемся на другую
    if (noteId === currentNoteId) {
        const remainingIds = Object.keys(notes);
        if (remainingIds.length > 0) {
            currentNoteId = remainingIds[0];
            loadNote(currentNoteId);
        }
    }
    
    saveNotes();
}

// Очистить текущую заметку
function clearCurrentNote() {
    if (!noteContent.value.trim()) return;
    
    if (!confirm('Очистить текст заметки?')) return;
    
    noteContent.value = '';
    updateStats();
    saveNotes();
}

// Экспортировать все заметки
function exportNotes() {
    const data = {
        exportedAt: new Date().toISOString(),
        noteCount: Object.keys(notes).length,
        notes: notes
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const fileName = `notes_export_${Date.now()}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
}

// Обновить статистику
function updateStats() {
    const content = noteContent.value;
    const chars = content.length;
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    
    charCount.textContent = `${chars} символов`;
    wordCount.textContent = `${words} слов`;
}

// Отрендерить список заметок
function renderNotesList() {
    if (!notesList) return;
    
    if (Object.keys(notes).length === 0) {
        notesList.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 40px 20px;">Нет заметок</div>';
        return;
    }
    
    // Сортировка по дате обновления
    const sortedNotes = Object.values(notes).sort((a, b) => b.updated - a.updated);
    
    notesList.innerHTML = '';
    
    sortedNotes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = `note-item ${note.id === currentNoteId ? 'active' : ''}`;
        
        // Превью текста
        const preview = note.content.substring(0, 120).replace(/\n/g, ' ');
        const title = note.title || 'Без названия';
        
        // Форматирование даты
        const date = new Date(note.updated);
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateStr = date.toLocaleDateString();
        
        noteEl.innerHTML = `
            <div class="note-item-header">
                <div class="note-item-title" title="${title}">${title}</div>
                <button class="delete-btn" data-note-id="${note.id}" title="Удалить">🗑️</button>
            </div>
            <div class="note-item-preview">${preview}${note.content.length > 120 ? '...' : ''}</div>
            <div class="note-item-footer">
                <span>${dateStr} ${timeStr}</span>
            </div>
        `;
        
        // Клик по заметке
        noteEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                loadNote(note.id);
            }
        });
        
        // Кнопка удаления
        const deleteBtn = noteEl.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });
        
        notesList.appendChild(noteEl);
    });
}

// Настроить автосохранение
function setupAutoSave() {
    [noteTitle, noteContent].forEach(input => {
        input.addEventListener('input', () => {
            updateStats();
            
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
            
            saveStatus.textContent = '⏳ Изменения...';
            
            autoSaveTimer = setTimeout(() => {
                saveNotes();
            }, CONFIG.AUTO_SAVE_DELAY);
        });
    });
}

// Выйти из системы
function logout() {
    if (confirm('Выйти из системы?')) {
        localStorage.removeItem('notes_auth_temp');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Настроить горячие клавиши
function setupHotkeys() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S - сохранить
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNotes();
        }
        
        // Ctrl/Cmd + N - новая заметка
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewNote();
        }
        
        // Escape - убрать фокус
        if (e.key === 'Escape') {
            noteContent.blur();
        }
    });
}

// Инициализация
function init() {
    // Проверяем авторизацию
    if (!checkAuth()) return;
    
    // Загружаем заметки
    loadNotes();
    setupAutoSave();
    setupHotkeys();
    
    // Обработчики кнопок
    newNoteBtn.addEventListener('click', () => createNewNote());
    saveBtn.addEventListener('click', () => saveNotes());
    clearBtn.addEventListener('click', () => clearCurrentNote());
    exportBtn.addEventListener('click', () => exportNotes());
    logoutBtn.addEventListener('click', () => logout());
    
    // Фокус на редактор
    setTimeout(() => {
        noteContent.focus();
    }, 300);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);