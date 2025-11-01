<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/db.php';

$userId = $_SESSION['user_id'] ?? null;
$username = $_SESSION['username'] ?? null;

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

$theme = 'classic';
$leaderboards = [
    'personal' => [],
    'global' => get_global_leaderboard(10),
];

if ($userId) {
    $theme = $_SESSION['theme'] ?? fetch_user_theme((int)$userId);
    $_SESSION['theme'] = $theme;
    $leaderboards = get_leaderboards((int)$userId);
}

$themeOptions = [
    'classic' => 'Classic Daybreak',
    'midnight' => 'Midnight Aurora',
    'neon' => 'Neon Pulse',
    'forest' => 'Forest Breeze',
];

$initialState = [
    'isAuthenticated' => (bool)$userId,
    'username' => $username,
    'theme' => $theme,
    'leaderboards' => $leaderboards,
    'streak' => $_SESSION['win_streak'] ?? 0,
];

function h(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minesweeper Odyssey</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Changa:wght@400;600;700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="theme-<?= h($theme) ?>">
    <div class="background-orbs"></div>
    <div class="container">
        <header class="site-header">
            <div class="branding">
                <div class="logo">&#128163;</div>
                <div>
                    <h1>Minesweeper Odyssey</h1>
                    <p>Skill, style, and strategic sweeps.</p>
                </div>
            </div>
            <?php if ($userId): ?>
                <div class="user-panel">
                    <div class="user-meta">
                        <span class="welcome">Hi, <?= h($username) ?>!</span>
                        <span class="streak">Win streak: <strong id="win-streak"><?= (int)($initialState['streak']) ?></strong></span>
                    </div>
                    <div class="theme-switcher">
                        <label for="theme-select">Theme</label>
                        <select id="theme-select" name="theme">
                            <?php foreach ($themeOptions as $value => $label): ?>
                                <option value="<?= h($value) ?>" <?= $value === $theme ? 'selected' : '' ?>><?= h($label) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <a class="logout" href="logout.php">Log out</a>
                </div>
            <?php endif; ?>
        </header>

        <?php if ($flash): ?>
            <div class="flash flash-<?= h($flash['type'] ?? 'info') ?>"><?= h($flash['message'] ?? '') ?></div>
        <?php endif; ?>

        <?php if (!$userId): ?>
            <main class="auth-grid">
                <section class="card auth-card">
                    <h2>Create an account</h2>
                    <form action="auth.php" method="post" autocomplete="off">
                        <input type="hidden" name="action" value="register">
                        <label for="register-username">Username</label>
                        <input id="register-username" name="username" type="text" required>
                        <label for="register-password">Password</label>
                        <input id="register-password" name="password" type="password" required>
                        <button type="submit" class="primary">Launch Odyssey</button>
                    </form>
                </section>
                <section class="card auth-card">
                    <h2>Welcome back</h2>
                    <form action="auth.php" method="post" autocomplete="off">
                        <input type="hidden" name="action" value="login">
                        <label for="login-username">Username</label>
                        <input id="login-username" name="username" type="text" required>
                        <label for="login-password">Password</label>
                        <input id="login-password" name="password" type="password" required>
                        <button type="submit" class="secondary">Resume Sweeping</button>
                    </form>
                </section>
                <section class="card info-card">
                    <h2>Why Minesweeper Odyssey?</h2>
                    <ul>
                        <li>Adaptive scoring that rewards daring play.</li>
                        <li>Gorgeous handcrafted themes and interactions.</li>
                        <li>Track your progression with personal stats.</li>
                        <li>Compete against the global elite.</li>
                    </ul>
                </section>
            </main>
        <?php else: ?>
            <main class="game-layout">
                <section class="card gameplay">
                    <div class="control-bar">
                        <div class="difficulty">
                            <label for="difficulty-select">Difficulty</label>
                            <select id="difficulty-select">
                                <option value="easy">Easy (9x9 &middot; 10 mines)</option>
                                <option value="medium">Medium (16x16 &middot; 40 mines)</option>
                                <option value="hard">Hard (24x20 &middot; 99 mines)</option>
                                <option value="custom">Custom Challenge</option>
                            </select>
                        </div>
                        <div class="stats">
                            <span class="timer">&#9201; <strong id="timer">00:00</strong></span>
                            <span class="mine-count">&#128163; <strong id="mine-counter">0</strong></span>
                        </div>
                        <div class="custom-settings" id="custom-settings" hidden>
                            <label>Width <input type="number" id="custom-width" min="6" max="35" value="12"></label>
                            <label>Height <input type="number" id="custom-height" min="6" max="30" value="12"></label>
                            <label>Mines <input type="number" id="custom-mines" min="5" max="250" value="25"></label>
                        </div>
                        <button id="new-game" class="primary">Start New Game</button>
                    </div>
                    <div class="board-wrapper">
                        <div id="game-board" class="board" role="grid" aria-label="Minesweeper board"></div>
                    </div>
                    <div class="score-banner" id="score-banner" hidden>
                        <div class="score-message">
                            <h3 id="score-title">Victory!</h3>
                            <p id="score-details">Your total score: <strong id="score-value">0</strong></p>
                        </div>
                        <button id="play-again" class="secondary">Play Again</button>
                    </div>
                </section>

                <aside class="card leaderboards">
                    <div class="leaderboard personal">
                        <h2>Your highlights</h2>
                        <ol id="personal-leaderboard" class="score-list"></ol>
                    </div>
                    <div class="leaderboard global">
                        <h2>Global legends</h2>
                        <ol id="global-leaderboard" class="score-list"></ol>
                    </div>
                </aside>
            </main>
        <?php endif; ?>
    </div>

    <script>
        window.appState = <?= json_encode($initialState, JSON_THROW_ON_ERROR) ?>;
        window.themeOptions = <?= json_encode($themeOptions, JSON_THROW_ON_ERROR) ?>;
    </script>
    <script src="script.js" defer></script>
</body>
</html>

