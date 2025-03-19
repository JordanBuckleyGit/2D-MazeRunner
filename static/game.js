const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');

const tileSize = 40;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1]
];

const playerImg = new Image();
playerImg.src = 'images/player.png';

const wallTexture = new Image();
wallTexture.src = 'static/images/wall.jpg';

const itemImages = {
    health: 'images/health.png',
    bomb: 'images/bomb.png'
};

const player = { x: tileSize, y: tileSize, width: tileSize, height: tileSize };

const items = [
    { type: 'health', x: 5 * tileSize, y: 2 * tileSize },
    { type: 'bomb', x: 8 * tileSize, y: 4 * tileSize }
];

// Draw Functions
function drawMaze() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (maze[row][col] === 1) {
                ctx.drawImage(wallTexture, col * tileSize, row * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawItems() {
    items.forEach(item => {
        const img = new Image();
        img.src = itemImages[item.type];
        ctx.drawImage(img, item.x, item.y, tileSize, tileSize);
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawItems();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();