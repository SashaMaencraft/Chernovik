<?php
// api/detect-origin.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

// Получаем информацию о запросе
$data = [
    'timestamp' => date('Y-m-d H:i:s'),
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? '',
    'referer' => $_SERVER['HTTP_REFERER'] ?? '',
    'remote_addr' => $_SERVER['REMOTE_ADDR'] ?? '',
    'http_host' => $_SERVER['HTTP_HOST'] ?? '',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
];

// Для AJAX запросов возвращаем JSON
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    
    // Устанавливаем заголовки для определения origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Origin: " . $_SERVER['HTTP_ORIGIN']);
    }
    if (isset($_SERVER['HTTP_REFERER'])) {
        header("Referer: " . $_SERVER['HTTP_REFERER']);
    }
    
    echo json_encode($data);
} else {
    // Для обычных запросов
    echo json_encode($data);
}
?>