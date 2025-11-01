<?php

declare(strict_types=1);

function get_db(): PDO
{
    static $db = null;

    if ($db instanceof PDO) {
        return $db;
    }

    $dbPath = __DIR__ . '/data';
    if (!is_dir($dbPath)) {
        mkdir($dbPath, 0775, true);
    }

    $dsn = 'sqlite:' . $dbPath . '/app.db';
    $db = new PDO($dsn);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    initialize_schema($db);

    return $db;
}

function initialize_schema(PDO $db): void
{
    $db->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            theme TEXT NOT NULL DEFAULT "classic",
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            time_taken INTEGER NOT NULL,
            cells_cleared INTEGER NOT NULL,
            board_width INTEGER NOT NULL,
            board_height INTEGER NOT NULL,
            mines INTEGER NOT NULL,
            innovative_score INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )'
    );
}

function fetch_user_theme(int $userId): string
{
    $db = get_db();
    $stmt = $db->prepare('SELECT theme FROM users WHERE id = :id');
    $stmt->execute([':id' => $userId]);
    $theme = $stmt->fetchColumn();
    return is_string($theme) ? $theme : 'classic';
}

function get_leaderboards(int $userId): array
{
    $db = get_db();

    $personalStmt = $db->prepare(
        'SELECT difficulty, time_taken, cells_cleared, innovative_score, created_at
         FROM scores
         WHERE user_id = :user_id
         ORDER BY innovative_score DESC, time_taken ASC
         LIMIT 8'
    );
    $personalStmt->execute([':user_id' => $userId]);
    $personal = $personalStmt->fetchAll();

    $globalStmt = $db->query(
        'SELECT s.difficulty, s.innovative_score, s.time_taken, u.username, s.created_at
         FROM scores s
         INNER JOIN users u ON u.id = s.user_id
         ORDER BY s.innovative_score DESC, s.created_at DESC
         LIMIT 10'
    );

    return [
        'personal' => $personal,
        'global' => $globalStmt->fetchAll(),
    ];
}

function get_global_leaderboard(int $limit = 10): array
{
    $limit = max(1, $limit);
    $db = get_db();
    $query = sprintf(
        'SELECT s.difficulty, s.innovative_score, s.time_taken, u.username, s.created_at
         FROM scores s
         INNER JOIN users u ON u.id = s.user_id
         ORDER BY s.innovative_score DESC, s.created_at DESC
         LIMIT %d',
        $limit
    );

    $stmt = $db->query($query);
    return $stmt->fetchAll();
}

