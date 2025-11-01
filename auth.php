<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$action = $_POST['action'] ?? '';
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    set_flash('Please provide both username and password.', 'error');
    redirect_home();
}

if ($action === 'register') {
    handle_registration($username, $password);
} elseif ($action === 'login') {
    handle_login($username, $password);
} else {
    set_flash('Unknown action requested.', 'error');
    redirect_home();
}

function handle_registration(string $username, string $password): void
{
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        set_flash('Username must be 3-20 characters and contain only letters, numbers, or underscores.', 'error');
        redirect_home();
    }

    if (strlen($password) < 6) {
        set_flash('Password must be at least 6 characters long.', 'error');
        redirect_home();
    }

    $db = get_db();

    $stmt = $db->prepare('SELECT id FROM users WHERE username = :username');
    $stmt->execute([':username' => $username]);
    if ($stmt->fetchColumn()) {
        set_flash('That username is already taken.', 'error');
        redirect_home();
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $db->prepare('INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)');
    $insert->execute([
        ':username' => $username,
        ':password_hash' => $passwordHash,
    ]);

    $_SESSION['user_id'] = (int)$db->lastInsertId();
    $_SESSION['username'] = $username;
    $_SESSION['theme'] = 'classic';
    $_SESSION['win_streak'] = 0;

    set_flash('Welcome aboard! You are now registered and signed in.', 'success');
    redirect_home();
}

function handle_login(string $username, string $password): void
{
    $db = get_db();

    $stmt = $db->prepare('SELECT id, password_hash, theme FROM users WHERE username = :username');
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        set_flash('Invalid username or password.', 'error');
        redirect_home();
    }

    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['username'] = $username;
    $_SESSION['theme'] = $user['theme'] ?? 'classic';
    $_SESSION['win_streak'] = $_SESSION['win_streak'] ?? 0;

    set_flash('Login successful. Ready to sweep some mines!', 'success');
    redirect_home();
}

function set_flash(string $message, string $type = 'info'): void
{
    $_SESSION['flash'] = [
        'message' => $message,
        'type' => $type,
    ];
}

function redirect_home(): void
{
    header('Location: index.php');
    exit;
}

