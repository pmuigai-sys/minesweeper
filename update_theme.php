<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$allowedThemes = ['classic', 'midnight', 'neon', 'forest'];

$input = file_get_contents('php://input');
$payload = json_decode($input ?: '[]', true);

if (!is_array($payload)) {
    $payload = $_POST;
}

$theme = $payload['theme'] ?? null;

if (!in_array($theme, $allowedThemes, true)) {
    http_response_code(422);
    echo json_encode(['error' => 'Unsupported theme selection.']);
    exit;
}

$db = get_db();
$stmt = $db->prepare('UPDATE users SET theme = :theme WHERE id = :id');
$stmt->execute([
    ':theme' => $theme,
    ':id' => $_SESSION['user_id'],
]);

$_SESSION['theme'] = $theme;

echo json_encode(['success' => true, 'theme' => $theme]);

