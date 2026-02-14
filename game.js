// Game State
const GameState = {
    MENU: 'menu',
    GOALKEEPER_TURN: 'goalkeeper',
    SHOOTER_TURN: 'shooter',
    ANIMATING: 'animating',
    GAMEOVER: 'gameover'
};

// Game Configuration
const Game = {
    state: GameState.MENU,
    canvas: null,
    ctx: null,
    width: 800,
    height: 500,

    // Player Data
    player1: { name: 'Player 1', score: 0, color: '#FF6B6B', isShooter: true },
    player2: { name: 'Player 2', score: 0, color: '#4ECDC4', isShooter: false },

    // Game Logic
    currentRound: 1,
    maxRounds: 5,
    shotsPerRound: 2, // Each player shoots once per round
    currentShot: 0,
    isSuddenDeath: false,

    // Goalkeeper State
    gkPosition: 'center', // left, center, right
    gkSelectedPosition: null,
    gkDiving: false,

    // Ball State
    ball: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 15,
        active: false
    },

    // Shooter State
    shooterAiming: false,
    aimX: 0,
    aimY: 0,

    // Animation State
    resultText: '',
    resultTimer: 0,
    celebrationActive: false
};

// Initialize Game
function init() {
    Game.canvas = document.getElementById('game-canvas');
    Game.ctx = Game.canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('replay-btn').addEventListener('click', resetGame);

    // Goalkeeper button controls
    document.querySelectorAll('.gk-btn').forEach(btn => {
        btn.addEventListener('click', () => selectGoalkeeperPosition(btn.dataset.position));
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyboard);

    // Mouse/Touch controls for shooting
    Game.canvas.addEventListener('click', handleShoot);
    Game.canvas.addEventListener('touchstart', handleTouchShoot);
    Game.canvas.addEventListener('mousemove', handleAimMove);
    Game.canvas.addEventListener('touchmove', handleTouchMove);

    // Start game loop
    gameLoop();
}

function resizeCanvas() {
    const container = Game.canvas.parentElement;
    const maxWidth = Math.min(800, container.clientWidth - 40);
    const maxHeight = Math.min(500, window.innerHeight - 250);

    Game.canvas.width = maxWidth;
    Game.canvas.height = maxHeight;
    Game.width = maxWidth;
    Game.height = maxHeight;
}

function startGame() {
    // Get player colors
    Game.player1.color = document.getElementById('p1-color').value;
    Game.player2.color = document.getElementById('p2-color').value;

    // Switch to game screen
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    Game.state = GameState.GOALKEEPER_TURN;
    updateUI();
    showGoalkeeperControls();
}

function resetGame() {
    Game.player1.score = 0;
    Game.player2.score = 0;
    Game.currentRound = 1;
    Game.currentShot = 0;
    Game.isSuddenDeath = false;
    Game.player1.isShooter = true;
    Game.player2.isShooter = false;

    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');

    Game.state = GameState.MENU;
    updateUI();
}

// Goalkeeper Controls
function showGoalkeeperControls() {
    document.getElementById('gk-controls').classList.add('active');
    document.getElementById('shooter-instructions').classList.remove('active');

    // Reset selection
    document.querySelectorAll('.gk-btn').forEach(btn => btn.classList.remove('selected'));
    Game.gkSelectedPosition = null;
}

function hideGoalkeeperControls() {
    document.getElementById('gk-controls').classList.remove('active');
}

function selectGoalkeeperPosition(position) {
    Game.gkSelectedPosition = position;

    // Visual feedback
    document.querySelectorAll('.gk-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.position === position) {
            btn.classList.add('selected');
        }
    });

    // Automatically proceed to shooter turn
    setTimeout(() => {
        hideGoalkeeperControls();
        Game.state = GameState.SHOOTER_TURN;
        document.getElementById('shooter-instructions').classList.add('active');
        updateUI();
    }, 500);
}

// Keyboard Controls
let selectedGKIndex = 1; // 0=left, 1=center, 2=right

function handleKeyboard(e) {
    if (Game.state === GameState.GOALKEEPER_TURN) {
        if (e.key === 'ArrowLeft') {
            selectedGKIndex = 0;
            highlightGKButton(0);
        } else if (e.key === 'ArrowRight') {
            selectedGKIndex = 2;
            highlightGKButton(2);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            selectedGKIndex = 1;
            highlightGKButton(1);
        } else if (e.key === 'Enter') {
            const positions = ['left', 'center', 'right'];
            selectGoalkeeperPosition(positions[selectedGKIndex]);
        }
    }
}

function highlightGKButton(index) {
    const buttons = document.querySelectorAll('.gk-btn');
    buttons.forEach((btn, i) => {
        btn.classList.remove('selected');
        if (i === index) btn.classList.add('selected');
    });
}

// Shooter Controls
function handleAimMove(e) {
    if (Game.state === GameState.SHOOTER_TURN) {
        const rect = Game.canvas.getBoundingClientRect();
        Game.aimX = e.clientX - rect.left;
        Game.aimY = e.clientY - rect.top;
        Game.shooterAiming = true;
    }
}

function handleTouchMove(e) {
    if (Game.state === GameState.SHOOTER_TURN) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = Game.canvas.getBoundingClientRect();
        Game.aimX = touch.clientX - rect.left;
        Game.aimY = touch.clientY - rect.top;
        Game.shooterAiming = true;
    }
}

function handleShoot(e) {
    if (Game.state === GameState.SHOOTER_TURN) {
        const rect = Game.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        shoot(x, y);
    }
}

function handleTouchShoot(e) {
    if (Game.state === GameState.SHOOTER_TURN) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = Game.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        shoot(x, y);
    }
}

function shoot(targetX, targetY) {
    if (Game.ball.active) return;

    document.getElementById('shooter-instructions').classList.remove('active');
    Game.shooterAiming = false;
    Game.state = GameState.ANIMATING;

    // Calculate ball trajectory
    const startX = Game.width / 2;
    const startY = Game.height - 50;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speed = 12;
    Game.ball.x = startX;
    Game.ball.y = startY;
    Game.ball.vx = (dx / distance) * speed;
    Game.ball.vy = (dy / distance) * speed;
    Game.ball.active = true;

    // Goalkeeper dives to selected position
    Game.gkPosition = Game.gkSelectedPosition;
    Game.gkDiving = true;
}

// Game Loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (Game.state === GameState.ANIMATING) {
        // Update ball position
        if (Game.ball.active) {
            Game.ball.x += Game.ball.vx;
            Game.ball.y += Game.ball.vy;

            // Check if ball reached goal line
            if (Game.ball.y <= 100) {
                checkGoal();
            }

            // Ball out of bounds
            if (Game.ball.x < 0 || Game.ball.x > Game.width || Game.ball.y < -50) {
                Game.ball.active = false;
                Game.resultTimer = 60;
            }
        }

        // Handle result display
        if (Game.resultTimer > 0) {
            Game.resultTimer--;
            if (Game.resultTimer === 0) {
                nextTurn();
            }
        }
    }
}

function checkGoal() {
    Game.ball.active = false;

    // Determine shot zone
    const goalWidth = Game.width * 0.6;
    const goalLeft = Game.width * 0.2;
    const shotPosition = (Game.ball.x - goalLeft) / goalWidth;

    let shotZone = 'center';
    if (shotPosition < 0.33) shotZone = 'left';
    else if (shotPosition > 0.66) shotZone = 'right';

    // Check if goalkeeper saved it
    const saved = (Game.gkPosition === shotZone);

    if (saved) {
        Game.resultText = '🧤 SAVED!';
        playSound('save');
    } else {
        Game.resultText = '⚽ GOAL!';

        // Award point to current shooter
        const shooter = Game.player1.isShooter ? Game.player1 : Game.player2;
        shooter.score++;

        playSound('goal');
        celebrate();
    }

    updateUI();
    Game.resultTimer = 90;
}

function nextTurn() {
    Game.resultText = '';
    Game.gkDiving = false;
    Game.currentShot++;

    // Check if round is complete (both players have shot)
    if (Game.currentShot >= Game.shotsPerRound) {
        Game.currentShot = 0;
        Game.currentRound++;

        // Swap roles
        Game.player1.isShooter = !Game.player1.isShooter;
        Game.player2.isShooter = !Game.player2.isShooter;

        // Check if game should end
        if (Game.currentRound > Game.maxRounds) {
            checkGameOver();
            return;
        }
    }

    // Next turn
    Game.state = GameState.GOALKEEPER_TURN;
    showGoalkeeperControls();
    updateUI();
}

function checkGameOver() {
    if (Game.player1.score === Game.player2.score) {
        // Sudden Death!
        Game.isSuddenDeath = true;
        Game.currentRound = Game.maxRounds + 1;
        Game.currentShot = 0;
        Game.maxRounds++;

        Game.state = GameState.GOALKEEPER_TURN;
        showGoalkeeperControls();
        updateUI();
    } else {
        // Game Over
        endGame();
    }
}

function endGame() {
    Game.state = GameState.GAMEOVER;

    const winner = Game.player1.score > Game.player2.score ? Game.player1 : Game.player2;

    document.getElementById('winner-text').textContent = `${winner.name.toUpperCase()} WINS!`;
    document.getElementById('final-score').textContent =
        `${Game.player1.name}: ${Game.player1.score} - ${Game.player2.name}: ${Game.player2.score}`;

    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.add('active');

    celebrateBig();
}

function updateUI() {
    document.getElementById('p1-score').textContent = Game.player1.score;
    document.getElementById('p2-score').textContent = Game.player2.score;

    const roundText = Game.isSuddenDeath ? 'SUDDEN DEATH!' : `Round ${Game.currentRound}`;
    document.getElementById('round-display').textContent = roundText;

    const shooter = Game.player1.isShooter ? Game.player1.name : Game.player2.name;
    document.getElementById('turn-display').textContent = `${shooter} Shooting`;
}

// Rendering
function render() {
    const ctx = Game.ctx;
    const w = Game.width;
    const h = Game.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Draw field
    drawField(ctx, w, h);

    // Draw goal
    drawGoal(ctx, w, h);

    // Draw goalkeeper
    drawGoalkeeper(ctx, w, h);

    // Draw shooter
    drawShooter(ctx, w, h);

    // Draw ball
    if (Game.ball.active) {
        drawBall(ctx);
    }

    // Draw aiming line
    if (Game.shooterAiming && Game.state === GameState.SHOOTER_TURN) {
        drawAimingLine(ctx, w, h);
    }

    // Draw result text
    if (Game.resultText) {
        drawResultText(ctx, w, h);
    }
}

function drawField(ctx, w, h) {
    // Grass gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Field lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    // Penalty box
    ctx.strokeRect(w * 0.15, 50, w * 0.7, 150);

    // Center circle (decorative)
    ctx.beginPath();
    ctx.arc(w / 2, h - 100, 50, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGoal(ctx, w, h) {
    const goalWidth = w * 0.6;
    const goalHeight = 150;
    const goalX = w * 0.2;
    const goalY = 50;

    // Goal frame
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.strokeRect(goalX, goalY, goalWidth, goalHeight);

    // Net
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(goalX + (goalWidth / 10) * i, goalY);
        ctx.lineTo(goalX + (goalWidth / 10) * i, goalY + goalHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(goalX, goalY + (goalHeight / 8) * i);
        ctx.lineTo(goalX + goalWidth, goalY + (goalHeight / 8) * i);
        ctx.stroke();
    }
}

function drawGoalkeeper(ctx, w, h) {
    const gkColor = Game.player1.isShooter ? Game.player2.color : Game.player1.color;

    let gkX = w / 2;
    if (Game.gkDiving) {
        if (Game.gkPosition === 'left') gkX = w * 0.3;
        else if (Game.gkPosition === 'right') gkX = w * 0.7;
    }

    const gkY = 150;

    // Body
    ctx.fillStyle = gkColor;
    ctx.fillRect(gkX - 20, gkY - 30, 40, 50);

    // Head
    ctx.fillStyle = '#FFD4A3';
    ctx.beginPath();
    ctx.arc(gkX, gkY - 40, 15, 0, Math.PI * 2);
    ctx.fill();

    // Arms (extended if diving)
    ctx.strokeStyle = gkColor;
    ctx.lineWidth = 8;
    if (Game.gkDiving) {
        ctx.beginPath();
        ctx.moveTo(gkX, gkY - 20);
        ctx.lineTo(gkX + (Game.gkPosition === 'left' ? -40 : Game.gkPosition === 'right' ? 40 : 0), gkY - 10);
        ctx.stroke();
    }

    // Gloves
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(gkX + (Game.gkPosition === 'left' ? -40 : Game.gkPosition === 'right' ? 40 : -25), gkY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gkX + (Game.gkPosition === 'left' ? -40 : Game.gkPosition === 'right' ? 40 : 25), gkY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawShooter(ctx, w, h) {
    const shooterColor = Game.player1.isShooter ? Game.player1.color : Game.player2.color;
    const shooterX = w / 2;
    const shooterY = h - 100;

    // Body
    ctx.fillStyle = shooterColor;
    ctx.fillRect(shooterX - 20, shooterY - 30, 40, 50);

    // Head
    ctx.fillStyle = '#FFD4A3';
    ctx.beginPath();
    ctx.arc(shooterX, shooterY - 40, 15, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = shooterColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shooterX - 10, shooterY + 20);
    ctx.lineTo(shooterX - 15, shooterY + 40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(shooterX + 10, shooterY + 20);
    ctx.lineTo(shooterX + 15, shooterY + 40);
    ctx.stroke();
}

function drawBall(ctx) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(Game.ball.x, Game.ball.y, Game.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soccer ball pattern
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Game.ball.x, Game.ball.y);
        const angle = (Math.PI * 2 / 5) * i;
        ctx.lineTo(
            Game.ball.x + Math.cos(angle) * Game.ball.radius * 0.6,
            Game.ball.y + Math.sin(angle) * Game.ball.radius * 0.6
        );
        ctx.stroke();
    }
}

function drawAimingLine(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255,255,0,0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);

    ctx.beginPath();
    ctx.moveTo(w / 2, h - 50);
    ctx.lineTo(Game.aimX, Game.aimY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Target circle
    ctx.strokeStyle = 'rgba(255,0,0,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Game.aimX, Game.aimY, 20, 0, Math.PI * 2);
    ctx.stroke();
}

function drawResultText(ctx, w, h) {
    ctx.save();
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(Game.resultText, w / 2 + 4, h / 2 + 4);

    // Main text
    ctx.fillStyle = Game.resultText.includes('GOAL') ? '#FFD700' : '#FF6B6B';
    ctx.fillText(Game.resultText, w / 2, h / 2);

    ctx.restore();
}

// Sound Effects (placeholder - can be replaced with actual audio)
function playSound(type) {
    // You can add audio files and play them here
    // For now, this is a placeholder
    console.log(`Playing sound: ${type}`);
}

// Celebration Effects
function celebrate() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '-10px';
            particle.style.background = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][Math.floor(Math.random() * 4)];
            container.appendChild(particle);

            setTimeout(() => particle.remove(), 2000);
        }, i * 30);
    }
}

function celebrateBig() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '-10px';
            particle.style.background = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][Math.floor(Math.random() * 4)];
            particle.style.width = Math.random() * 15 + 5 + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);

            setTimeout(() => particle.remove(), 2000);
        }, i * 20);
    }
}

// Initialize when page loads
window.addEventListener('load', init);
