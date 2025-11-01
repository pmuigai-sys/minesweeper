<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in to save scores.']);
    exit;
}

$input = file_get_contents('php://input');
$payload = json_decode($input ?: '[]', true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload.']);
    exit;
}

$difficulty = $payload['difficulty'] ?? null;
$timeTaken = (int)($payload['timeTaken'] ?? -1);
$cellsCleared = (int)($payload['cellsCleared'] ?? -1);
$boardWidth = (int)($payload['boardWidth'] ?? 0);
$boardHeight = (int)($payload['boardHeight'] ?? 0);
$mines = (int)($payload['mines'] ?? 0);
$victory = filter_var($payload['victory'] ?? false, FILTER_VALIDATE_BOOL);

$validDifficulties = ['easy', 'medium', 'hard', 'custom'];

if (!$victory) {
    $_SESSION['win_streak'] = 0;
    echo json_encode(['message' => 'Streak reset.']);
    exit;
}

$difficulty = $difficulty ?? 'easy';

if (!in_array($difficulty, $validDifficulties, true)) {
    http_response_code(422);
    echo json_encode(['error' => 'Unknown difficulty supplied.']);
    exit;
}

if ($timeTaken < 0 || $cellsCleared < 0 || $boardWidth <= 0 || $boardHeight <= 0 || $mines < 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Score data is incomplete.']);
    exit;
}

$safeCells = max(1, ($boardWidth * $boardHeight) - $mines);
$completionRate = min(1, $cellsCleared / $safeCells);

$difficultyMultipliers = [
    'easy' => 1.0,
    'medium' => 1.6,
    'hard' => 2.4,
    'custom' => 1.8,
];

$multiplier = $difficultyMultipliers[$difficulty] ?? 1.0;
$baseScore = (int)round($completionRate * 600 * $multiplier);
$speedBonus = (int)max(0, round(($multiplier * 450) - ($timeTaken * 3)));
$boardBonus = (int)round(($boardWidth * $boardHeight) / 8);

$currentStreak = (int)($_SESSION['win_streak'] ?? 0);
$comboBonus = $currentStreak * 150;

$totalScore = max(0, $baseScore + $speedBonus + $boardBonus + $comboBonus);

$_SESSION['win_streak'] = $currentStreak + 1;

$db = get_db();
$stmt = $db->prepare(
    'INSERT INTO scores (user_id, difficulty, time_taken, cells_cleared, board_width, board_height, mines, innovative_score)
     VALUES (:user_id, :difficulty, :time_taken, :cells_cleared, :board_width, :board_height, :mines, :innovative_score)'
);

$stmt->execute([
    ':user_id' => $_SESSION['user_id'],
    ':difficulty' => $difficulty,
    ':time_taken' => $timeTaken,
    ':cells_cleared' => $cellsCleared,
    ':board_width' => $boardWidth,
    ':board_height' => $boardHeight,
    ':mines' => $mines,
    ':innovative_score' => $totalScore,
]);

$leaderboards = get_leaderboards((int)$_SESSION['user_id']);

echo json_encode([
    'success' => true,
    'score' => $totalScore,
    'streak' => $_SESSION['win_streak'],
    'leaderboards' => $leaderboards,
]);

