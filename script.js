let score = 0;
let isGameRunning = false;
let scoreInterval, speedInterval, nextObstacleTimeoutId;
let speed = 10; // Initial speed of obstacles set to 10
let isJumping = false;
let jumpUpInterval; // Tracks the interval for the jump ascent
const speedIncrease = 0.1;
const dino = document.getElementById('dino');
const gameContainer = document.getElementById('gameContainer');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Separate listeners for keydown and keyup to handle the jump start and end
    document.addEventListener('keydown', (event) => {
        if ((event.key === ' ' || event.key === 'ArrowUp') && !isJumping) {
            handleJumpStart();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === ' ' || event.key === 'ArrowUp') {
            handleJumpEnd();
        }
    });

    gameContainer.addEventListener('mousedown', handleJumpStart);
    gameContainer.addEventListener('mouseup', handleJumpEnd);

    // Touch events for jump
    gameContainer.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent scrolling or other default touch behaviors
        handleJumpStart();
    });
    gameContainer.addEventListener('touchend', (event) => {
        event.preventDefault(); // It's good practice to prevent default behavior
        handleJumpEnd();
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

function handleJumpStart() {
    if (!isGameRunning || isJumping) return;
    isJumping = true;
    let position = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));
    let maxJumpHeight = position + 150; // Define how high the dino can jump

    clearInterval(jumpUpInterval); // Clear previous interval if it exists
    jumpUpInterval = setInterval(() => {
        if (position >= maxJumpHeight) {
            clearInterval(jumpUpInterval); // Stop ascent
            handleJumpEnd(); // Start descent immediately if needed
        } else {
            position += 15;
            dino.style.bottom = position + 'px';
        }
    }, 20);
}

function handleJumpEnd() {
    clearInterval(jumpUpInterval); // Ensure ascent is stopped
    let position = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));
    let downInterval = setInterval(() => {
        if (position <= 0) {
            clearInterval(downInterval);
            isJumping = false; // Reset jumping state when landing
            dino.style.bottom = '0px'; // Ensure dino lands properly
        } else {
            position -= 5;
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
