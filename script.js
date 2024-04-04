let score = 0;
let isGameRunning = false;
let scoreInterval, speedInterval, nextObstacleTimeoutId;
let speed = 10; // Initial speed of obstacles set to 10
let isJumping = false;
const speedIncrease = 0.1;
const dino = document.getElementById('dino');
const gameContainer = document.getElementById('gameContainer');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.addEventListener('keydown', handleJumpEvent);
    gameContainer.addEventListener('click', function() {
        handleJump();
    });
});

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    resetGameState();
    scoreInterval = setInterval(updateScore, 100);
    speedInterval = setInterval(() => speed += speedIncrease, 5000);
    scheduleNextObstacle();
}

function resetGameState() {
    clearObstacles();
    speed = 10; // Reset speed to initial value
    score = 0;
    updateDOMElementsForStart();
}

function updateDOMElementsForStart() {
    dino.style.bottom = '0px'; // Reset dino position
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('score').innerText = `Score: ${score}`;
}

function handleJumpEvent(event) {
    if (event.key === ' ' || event.key === 'ArrowUp') {
        handleJump();
    }
}

function handleJump() {
    if (!isGameRunning || isJumping) return;
    isJumping = true;
    let position = 0;
    let upInterval = setInterval(() => {
        if (position >= 150) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                } else {
                    position -= 3;
                    dino.style.bottom = position + 'px';
                }
            }, 20);
        } else {
            position += 30;
            dino.style.bottom = position + 'px';
        }
    }, 20);
}

function createObstacle() {
    if (!isGameRunning) return;
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    const height = Math.floor(Math.random() * (100 - 20 + 1) + 20);
    obstacle.style.height = `${height}px`;
    obstacle.style.left = `${gameContainer.offsetWidth}px`;

    let moveObstacle = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(moveObstacle);
            obstacle.remove();
        } else {
            let obstacleLeft = parseInt(obstacle.style.left) - speed;
            obstacle.style.left = `${obstacleLeft}px`;
            if (checkCollision(obstacle)) endGame();
        }
    }, 20);
}

function checkCollision(obstacle) {
    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    return !(dinoRect.right < obstacleRect.left || dinoRect.left > obstacleRect.right || 
             dinoRect.bottom < obstacleRect.top || dinoRect.top > obstacleRect.bottom);
}

function scheduleNextObstacle() {
    const interval = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
    nextObstacleTimeoutId = setTimeout(() => {
        if (isGameRunning) {
            createObstacle();
            scheduleNextObstacle();
        }
    }, interval);
}

function clearObstacles() {
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
}

function updateScore() {
    score++;
    document.getElementById('score').innerText = `Score: ${score}`;
}

function endGame() {
    clearInterval(scoreInterval);
    clearInterval(speedInterval);
    clearTimeout(nextObstacleTimeoutId);
    clearObstacles();
    isGameRunning = false;
    document.getElementById('finalScore').innerText = `Final Score: ${score}`;
    document.getElementById('scoreboard').style.display = 'flex';
    document.getElementById('startBtn').style.display = 'block';
}

function restartGame() {
    endGame(); // Ensure all game state is reset and cleared
    startGame(); // Reinitialize the game
}
