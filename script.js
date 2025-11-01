(() => {
    const appState = window.appState || {};
    const isAuthenticated = !!appState.isAuthenticated;

    const dom = {
        board: document.getElementById('game-board'),
        timer: document.getElementById('timer'),
        mineCounter: document.getElementById('mine-counter'),
        difficulty: document.getElementById('difficulty-select'),
        newGame: document.getElementById('new-game'),
        scoreBanner: document.getElementById('score-banner'),
        scoreTitle: document.getElementById('score-title'),
        scoreValue: document.getElementById('score-value'),
        scoreDetails: document.getElementById('score-details'),
        playAgain: document.getElementById('play-again'),
        customSettings: document.getElementById('custom-settings'),
        customWidth: document.getElementById('custom-width'),
        customHeight: document.getElementById('custom-height'),
        customMines: document.getElementById('custom-mines'),
        personalLeaderboard: document.getElementById('personal-leaderboard'),
        globalLeaderboard: document.getElementById('global-leaderboard'),
        themeSelect: document.getElementById('theme-select'),
        winStreak: document.getElementById('win-streak'),
    };

    const difficultyPresets = {
        easy: { width: 9, height: 9, mines: 10 },
        medium: { width: 16, height: 16, mines: 40 },
        hard: { width: 24, height: 20, mines: 99 },
    };

    let gameState = null;
    let timerInterval = null;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function stopTimer() {
        if (timerInterval) {
            window.clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer() {
        stopTimer();
        timerInterval = window.setInterval(() => {
            if (!gameState) {
                return;
            }
            const elapsed = Math.floor((Date.now() - gameState.startTimestamp) / 1000);
            gameState.elapsedSeconds = elapsed;
            if (dom.timer) {
                dom.timer.textContent = formatTime(elapsed);
            }
        }, 1000);
    }

    function updateMineCounter() {
        if (!dom.mineCounter || !gameState) {
            return;
        }
        const remaining = Math.max(0, gameState.mines - gameState.flags);
        dom.mineCounter.textContent = remaining.toString().padStart(2, '0');
    }

    function renderLeaderboards(leaderboards) {
        if (!leaderboards) return;

        const renderList = (target, entries, emptyMessage) => {
            if (!target) return;
            target.innerHTML = '';

            if (!entries || entries.length === 0) {
                const li = document.createElement('li');
                li.className = 'empty';
                li.textContent = emptyMessage;
                target.appendChild(li);
                return;
            }

            entries.forEach((entry) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="score-user">${entry.username ? escapeHtml(entry.username) : 'You'}</span>
                    <span class="score-meta">
                        <span class="difficulty-tag diff-${escapeHtml(entry.difficulty)}">${formatDifficultyLabel(entry.difficulty)}</span>
                        <span class="score-points">${entry.innovative_score ?? entry.score}</span>
                        <span class="score-time">${formatTime(entry.time_taken ?? 0)}</span>
                    </span>
                `;
                target.appendChild(li);
            });

            target.classList.add('pulse');
            window.setTimeout(() => target.classList.remove('pulse'), 800);
        };

        renderList(dom.personalLeaderboard, leaderboards.personal, 'Play a game to record your first victory.');
        renderList(dom.globalLeaderboard, leaderboards.global, 'Be the first to claim the global board.');
    }

    function escapeHtml(value) {
        return (value ?? '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDifficultyLabel(diff) {
        switch (diff) {
            case 'easy':
                return 'Easy';
            case 'medium':
                return 'Medium';
            case 'hard':
                return 'Hard';
            default:
                return 'Custom';
        }
    }

    function buildBoard(config) {
        const { width, height, mines } = config;
        const totalCells = width * height;
        const cells = Array.from({ length: totalCells }, (_, index) => ({
            x: index % width,
            y: Math.floor(index / width),
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacent: 0,
            element: null,
        }));

        const mineIndices = new Set();
        while (mineIndices.size < mines) {
            const rand = Math.floor(Math.random() * totalCells);
            mineIndices.add(rand);
        }

        mineIndices.forEach((index) => {
            cells[index].isMine = true;
        });

        const neighborOffsets = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], /*self*/ [1, 0],
            [-1, 1], [0, 1], [1, 1],
        ];

        cells.forEach((cell) => {
            if (cell.isMine) return;
            let count = 0;
            neighborOffsets.forEach(([dx, dy]) => {
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                    return;
                }
                const neighbor = cells[ny * width + nx];
                if (neighbor.isMine) {
                    count += 1;
                }
            });
            cell.adjacent = count;
        });

        return cells;
    }

    function renderBoard(cells, config) {
        if (!dom.board) return;
        dom.board.innerHTML = '';
        dom.board.style.setProperty('--grid-columns', config.width);
        dom.board.style.setProperty('--grid-rows', config.height);

        cells.forEach((cell) => {
            const button = document.createElement('button');
            button.className = 'cell';
            button.setAttribute('data-x', String(cell.x));
            button.setAttribute('data-y', String(cell.y));
            button.setAttribute('aria-label', 'Hidden cell');

            button.addEventListener('click', (event) => {
                event.preventDefault();
                handleReveal(cell);
            });

            button.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                toggleFlag(cell);
            });

            cell.element = button;
            dom.board.appendChild(button);
        });
    }

    function getNeighbors(cell) {
        const { width, height, cells } = gameState || {};
        if (!cells) return [];
        const neighbors = [];
        for (let dx = -1; dx <= 1; dx += 1) {
            for (let dy = -1; dy <= 1; dy += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                neighbors.push(cells[ny * width + nx]);
            }
        }
        return neighbors;
    }

    function revealCell(cell) {
        if (!cell || cell.isRevealed || cell.isFlagged) {
            return;
        }

        cell.isRevealed = true;
        cell.element.classList.add('revealed');
        cell.element.classList.add('pop-in');
        cell.element.setAttribute('aria-label', cell.isMine ? 'Mine' : `Revealed ${cell.adjacent}`);
        setTimeout(() => cell.element && cell.element.classList.remove('pop-in'), 400);

        if (cell.isMine) {
            cell.element.classList.add('mine');
            cell.element.innerHTML = '\u{1F4A3}';
            return;
        }

        gameState.revealedSafe += 1;

        if (cell.adjacent > 0) {
            cell.element.textContent = cell.adjacent;
            cell.element.dataset.count = String(cell.adjacent);
        } else {
            cell.element.classList.add('clear');
        }

        if (cell.adjacent === 0) {
            const queue = [cell];
            while (queue.length) {
                const current = queue.shift();
                getNeighbors(current).forEach((neighbor) => {
                    if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
                        neighbor.isRevealed = true;
                        neighbor.element.classList.add('revealed', 'cascade');
                        neighbor.element.setAttribute('aria-label', neighbor.adjacent ? `Revealed ${neighbor.adjacent}` : 'Cleared');
                        if (neighbor.adjacent > 0) {
                            neighbor.element.textContent = neighbor.adjacent;
                            neighbor.element.dataset.count = String(neighbor.adjacent);
                        } else {
                            neighbor.element.classList.add('clear');
                            queue.push(neighbor);
                        }
                        gameState.revealedSafe += 1;
                    }
                });
            }
        }
    }

    function handleReveal(cell) {
        if (!gameState || gameState.status !== 'playing') {
            return;
        }
        if (cell.isFlagged || cell.isRevealed) {
            return;
        }

        if (!gameState.started) {
            gameState.started = true;
            gameState.startTimestamp = Date.now();
            startTimer();
        }

        if (cell.isMine) {
            revealCell(cell);
            handleGameOver(false, cell);
            return;
        }

        revealCell(cell);
        checkForWin();
    }

    function toggleFlag(cell) {
        if (!gameState || gameState.status !== 'playing') {
            return;
        }
        if (cell.isRevealed) {
            return;
        }

        cell.isFlagged = !cell.isFlagged;
        if (cell.isFlagged) {
            cell.element.classList.add('flagged');
            cell.element.innerHTML = '\u{1F6A9}';
            cell.element.setAttribute('aria-label', 'Flagged');
            gameState.flags += 1;
        } else {
            cell.element.classList.remove('flagged');
            cell.element.innerHTML = '';
            cell.element.setAttribute('aria-label', 'Hidden cell');
            gameState.flags -= 1;
        }
        updateMineCounter();
    }

    function revealAllMines(triggerCell) {
        if (!gameState) return;
        gameState.cells.forEach((cell) => {
            if (cell.isMine && !cell.isRevealed) {
                cell.element.classList.add('revealed', 'mine');
                cell.element.innerHTML = '\u{1F4A3}';
            }
        });
        if (triggerCell) {
            triggerCell.element.classList.add('detonated');
        }
    }

    function handleGameOver(victory, triggerCell = null) {
        if (!gameState || gameState.status !== 'playing') {
            return;
        }
        gameState.status = victory ? 'won' : 'lost';
        stopTimer();

        if (victory) {
            showScoreBanner('Victory!', 'You conquered the field.');
            persistScore();
        } else {
            revealAllMines(triggerCell);
            showScoreBanner('Boom!', 'A mine was triggered. Win streak reset.');
            if (dom.winStreak) {
                dom.winStreak.textContent = '0';
            }
            fetch('save_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ victory: false }),
            }).catch(() => {});
        }
    }

    function showScoreBanner(title, subtitle) {
        if (!dom.scoreBanner) return;
        dom.scoreBanner.hidden = false;
        dom.scoreBanner.classList.add('visible');
        dom.scoreTitle.textContent = title;
        dom.scoreDetails.innerHTML = subtitle;
    }

    function checkForWin() {
        if (!gameState) return;
        const totalSafeCells = (gameState.width * gameState.height) - gameState.mines;
        if (gameState.revealedSafe >= totalSafeCells) {
            handleGameOver(true);
        }
    }

    function persistScore() {
        if (!isAuthenticated || !gameState) return;

        const payload = {
            difficulty: gameState.difficulty,
            timeTaken: gameState.elapsedSeconds,
            cellsCleared: gameState.revealedSafe,
            boardWidth: gameState.width,
            boardHeight: gameState.height,
            mines: gameState.mines,
            victory: true,
        };

        fetch('save_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data || !data.success) {
                    throw new Error(data?.error || 'Score not saved.');
                }
                dom.scoreDetails.innerHTML = `Your total score: <strong id="score-value">${data.score}</strong>`;
                if (dom.winStreak) {
                    dom.winStreak.textContent = data.streak;
                }
                renderLeaderboards(data.leaderboards);
            })
            .catch((error) => {
                dom.scoreDetails.textContent = error.message;
            });
    }

    function getConfigFromDifficulty() {
        const selected = dom.difficulty?.value || 'easy';
        if (selected === 'custom') {
            const width = clamp(parseInt(dom.customWidth.value, 10) || 12, 6, 35);
            const height = clamp(parseInt(dom.customHeight.value, 10) || 12, 6, 30);
            const maxMines = Math.max(5, Math.floor(width * height * 0.4));
            const mines = clamp(parseInt(dom.customMines.value, 10) || 25, 5, maxMines);
            dom.customWidth.value = width;
            dom.customHeight.value = height;
            dom.customMines.value = mines;
            return { width, height, mines, difficulty: 'custom' };
        }
        const preset = difficultyPresets[selected] || difficultyPresets.easy;
        return { ...preset, difficulty: selected };
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function resetScoreBanner() {
        if (!dom.scoreBanner) return;
        dom.scoreBanner.hidden = true;
        dom.scoreBanner.classList.remove('visible');
    }

    function initializeGame() {
        if (!dom.board || !dom.newGame) return;

        dom.newGame.addEventListener('click', () => {
            startNewGame();
        });

        dom.playAgain?.addEventListener('click', () => {
            startNewGame();
        });

        dom.difficulty?.addEventListener('change', () => {
            if (dom.difficulty.value === 'custom') {
                dom.customSettings.hidden = false;
                dom.customSettings.classList.add('unfold');
            } else {
                dom.customSettings.hidden = true;
                dom.customSettings.classList.remove('unfold');
            }
            startNewGame();
        });

        ['input', 'change'].forEach((eventName) => {
            dom.customWidth?.addEventListener(eventName, () => liveValidateCustomSettings());
            dom.customHeight?.addEventListener(eventName, () => liveValidateCustomSettings());
            dom.customMines?.addEventListener(eventName, () => liveValidateCustomSettings());
        });

        startNewGame();
    }

    function liveValidateCustomSettings() {
        const width = clamp(parseInt(dom.customWidth.value, 10) || 12, 6, 35);
        const height = clamp(parseInt(dom.customHeight.value, 10) || 12, 6, 30);
        const maxMines = Math.max(5, Math.floor(width * height * 0.4));
        const mines = clamp(parseInt(dom.customMines.value, 10) || 25, 5, maxMines);
        dom.customWidth.value = width;
        dom.customHeight.value = height;
        dom.customMines.value = mines;
    }

    function startNewGame() {
        if (!isAuthenticated) return;

        const config = getConfigFromDifficulty();
        const cells = buildBoard(config);
        renderBoard(cells, config);

        gameState = {
            difficulty: config.difficulty,
            width: config.width,
            height: config.height,
            mines: config.mines,
            cells,
            status: 'playing',
            started: false,
            startTimestamp: null,
            elapsedSeconds: 0,
            revealedSafe: 0,
            flags: 0,
        };

        stopTimer();
        if (dom.timer) dom.timer.textContent = '00:00';
        if (dom.scoreBanner) {
            resetScoreBanner();
        }

        updateMineCounter();
        dom.board.classList.add('board-intro');
        window.setTimeout(() => dom.board.classList.remove('board-intro'), 600);
    }

    function bindThemeSwitcher() {
        if (!dom.themeSelect) return;
        dom.themeSelect.addEventListener('change', () => {
            const selected = dom.themeSelect.value;
            const body = document.body;
            Object.keys(window.themeOptions || {}).forEach((key) => {
                body.classList.remove(`theme-${key}`);
            });
            body.classList.add(`theme-${selected}`);

            fetch('update_theme.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: selected }),
            }).catch(() => {
                // do nothing, best effort
            });
        });
    }

    function init() {
        if (isAuthenticated) {
            initializeGame();
            renderLeaderboards(appState.leaderboards);
            bindThemeSwitcher();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();

