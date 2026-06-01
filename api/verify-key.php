<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-API-Key, Content-Type');

// В реальном приложении храните ключи в безопасном месте
$valid_keys = [
    'sk_live_1234567890abcdef' => ['user_id' => 1, 'expires' => null],
    'sk_test_0987654321fedcba' => ['user_id' => 2, 'expires' => '2024-12-31']
];

// Получаем ключ из заголовка
$api_key = $_SERVER['HTTP_X_API_KEY'] ?? '';

// Проверяем ключ
if (isset($valid_keys[$api_key])) {
    $key_data = $valid_keys[$api_key];
    
    // Проверка срока действия
    if ($key_data['expires'] && strtotime($key_data['expires']) < time()) {
        echo json_encode(['valid' => false, 'error' => 'Key expired']);
        exit;
    }
    
    echo json_encode([
        'valid' => true,
        'user_id' => $key_data['user_id'],
        'permissions' => ['read', 'write']
    ]);
} else {
    echo json_encode(['valid' => false, 'error' => 'Invalid key']);
}
?>