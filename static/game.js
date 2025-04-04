let canvas;
let context;

let request_id;
let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

const tileSize = 32;

// player obj
let player = {
    x: tileSize,
    y: tileSize,
    size: tileSize,
    speed: 4
};

// movement Flags
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let score = 0;
let xhttp;

let health = 3;
let level = 1;
let gameTime = 0;
let camera = {
    x: 0,
    y: 0,
    zoom: 1.2
};

let maze = [];
let gridRows, gridCols;

// Load images
const playerImg = new Image();
playerImg.src = 'static/images/player.png';

const wallTexture = new Image();
wallTexture.src = 'static/images/wall.png';
const tileSprite = new Image();
tileSprite.src = 'static/images/tiles.png';


wallTexture.onload = playerImg.onload = function () {
    init();
};

let initCalled = false;

let enemies = [];

function init() {
    if (initCalled) return; // Prevent double execution
    initCalled = true;

    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    // Make canvas fullscreen (and remove from CSS)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // Adjust height
    
    // Generate maze
    generateMaze();
    generateEnemies();

    camera.zoom = 1.5;
    updateCamera();

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);

    request_id = requestAnimationFrame(gameLoop);
}

function generateMaze() {
    gridRows = Math.floor(canvas.height / tileSize);
    gridCols = Math.floor(canvas.width / tileSize);

    // Make sure rows and cols are at least 3
    gridRows = Math.max(3, gridRows);
    gridCols = Math.max(3, gridCols);

    maze = Array(gridRows).fill(null).map(() => Array(gridCols).fill(1)); // Initialize with walls

    let startX = 1;
    let startY = 1;

    maze[startY][startX] = 0; // Mark starting cell as path

    let frontier = [];

    // Add initial frontier cells
    addFrontier(startX, startY, frontier);

    while (frontier.length > 0) {
        let randomIndex = Math.floor(Math.random() * frontier.length);
        let [x, y, px, py] = frontier[randomIndex];
        frontier.splice(randomIndex, 1);

        if (maze[y][x] === 1) {
            maze[y][x] = 0;
            maze[py][px] = 0;

            addFrontier(x, y, frontier);
        }
    }

    // Ensure start and end are open
    maze[1][1] = 0;
    maze[gridRows - 2][gridCols - 2] = 0;
}

function addFrontier(x, y, frontier) {
    if (x + 2 < gridCols - 1 && maze[y][x + 2] === 1) frontier.push([x + 2, y, x + 1, y]);
    if (x - 2 > 0 && maze[y][x - 2] === 1) frontier.push([x - 2, y, x - 1, y]);
    if (y + 2 < gridRows - 1 && maze[y + 2][x] === 1) frontier.push([x, y + 2, x, y + 1]);
    if (y - 2 > 0 && maze[y - 2][x] === 1) frontier.push([x, y - 2, x, y - 1]);
}

function updateCamera() {
    const targetX = player.x - (canvas.width / (2 * camera.zoom));
    const targetY = player.y - (canvas.height / (2 * camera.zoom));

    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    const maxX = (gridCols * tileSize) - (canvas.width / camera.zoom);
    const maxY = (gridRows * tileSize) - (canvas.height / camera.zoom);

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}

function drawMaze() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    const startCol = Math.floor(camera.x / tileSize);
    const endCol = Math.ceil((camera.x + canvas.width / camera.zoom) / tileSize);
    const startRow = Math.floor(camera.y / tileSize);
    const endRow = Math.ceil((camera.y + canvas.height / camera.zoom) / tileSize);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
                if (maze[row][col] === 1) {
                    context.drawImage(wallTexture, col * tileSize, row * tileSize, tileSize, tileSize);
                } else {
                    context.drawImage(tileSprite, col * tileSize, row * tileSize, tileSize, tileSize);
                }
            }
        }
    }
    context.restore();
}

function drawPlayer() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);
    context.drawImage(playerImg, player.x, player.y, player.size, player.size);
    context.restore();
}

function drawHUD() {
    context.restore();
    context.save();

    const hudHeight = 60;
    const padding = 20;

    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, canvas.height - hudHeight, canvas.width, hudHeight);

    context.font = 'bold 20px Arial';

    context.fillStyle = '#ff4444';
    context.fillText(`❤️ ${health}`, padding, canvas.height - hudHeight / 2 + 8);

    context.fillStyle = '#ffff44';
    context.fillText(`Level ${level}`, canvas.width / 3, canvas.height - hudHeight / 2 + 8);

    context.fillStyle = '#ffffff';
    const minutes = Math.floor(gameTime / 60000);
    const seconds = Math.floor((gameTime % 60000) / 1000);
    context.fillText(`⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`,
        2 * canvas.width / 3, canvas.height - hudHeight / 2 + 8);
}

function updatePlayer() {
    let newX = player.x;
    let newY = player.y;

    let canMoveX = true;
    let canMoveY = true;

    if (moveLeft) newX -= player.speed;
    if (moveRight) newX += player.speed;
    if (moveUp) newY -= player.speed;
    if (moveDown) newY += player.speed;

    let colX = Math.floor(newX / tileSize);
    let rowX = Math.floor(player.y / tileSize);
    let colRightX = Math.floor((newX + player.size - 1) / tileSize);
    let rowBottomX = Math.floor((player.y + player.size - 1) / tileSize);

    if (maze[rowX][colX] === 1 || maze[rowBottomX][colRightX] === 1) {
        canMoveX = false;
    }

    let colY = Math.floor(player.x / tileSize);
    let rowY = Math.floor(newY / tileSize);
    let colRightY = Math.floor((player.x + player.size - 1) / tileSize);
    let rowBottomY = Math.floor((newY + player.size - 1) / tileSize);

    if (maze[rowY][colY] === 1 || maze[rowBottomY][colRightY] === 1) {
        canMoveY = false;
    }

    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;
}

function gameLoop() {
    request_id = requestAnimationFrame(gameLoop);

    console.log("Game Loop Running"); // Added log

    now = Date.now();
    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        gameTime += elapsed;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        updateCamera();
        drawMaze();
        updatePlayer();
        updateEnemies();
        drawPlayer();
        drawEnemies();

        drawHUD();
    }
}

function generateEnemies() {
    enemies = [];
    const minDistance = 5 * tileSize;
    const enemyCount = 2 + Math.floor(level / 2); // Increase enemies every 2 levels

    for (let i = 0; i < enemyCount; i++) {
        let validPosition = false;
        let x, y;

        while (!validPosition) {
            x = Math.floor(Math.random() * gridCols) * tileSize;
            y = Math.floor(Math.random() * gridRows) * tileSize;

            let col = Math.floor(x / tileSize);
            let row = Math.floor(y / tileSize);

            let distance = Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2));

            if (maze[row][col] === 0 && distance > minDistance) {
                validPosition = true;
            }
        }

        let enemy = {
            x: x,
            y: y,
            size: tileSize,
            speed: 2 + (level * 0.2), // Increase speed with level
            direction: Math.floor(Math.random() * 4)
        };
        enemies.push(enemy);
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        let playerRow = Math.floor(player.y / tileSize);
        let playerCol = Math.floor(player.x / tileSize);
        let enemyRow = Math.floor(enemy.y / tileSize);
        let enemyCol = Math.floor(enemy.x / tileSize);

        let canSeePlayer = false;

        // Simple distance check first. If too far, don't even bother with line of sight
        let distance = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
        if (distance < 300) { // Adjust this distance as needed
            if (hasLineOfSight(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, player.x + player.size / 2, player.y + player.size / 2)) {
                canSeePlayer = true;
            }
        }

        if (canSeePlayer) {
            let newX = enemy.x;
            let newY = enemy.y;

            if (player.x > enemy.x && isValidMove(enemy.x + enemy.speed, enemy.y)) newX += enemy.speed;
            else if (player.x < enemy.x && isValidMove(enemy.x - enemy.speed, enemy.y)) newX -= enemy.speed;

            if (player.y > enemy.y && isValidMove(enemy.x, enemy.y + enemy.speed)) newY += enemy.speed;
            else if (player.y < enemy.y && isValidMove(enemy.x, enemy.y - enemy.speed)) newY -= enemy.speed;

            if (isValidMove(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            }
        } else {
            let newX = enemy.x;
            let newY = enemy.y;

            switch (enemy.direction) {
                case 0: newY -= enemy.speed; break;
                case 1: newX += enemy.speed; break;
                case 2: newY += enemy.speed; break;
                case 3: newX -= enemy.speed; break;
            }

            if (isValidMove(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                enemy.direction = Math.floor(Math.random() * 4);
            }

            if (Math.random() < 0.01) {
                enemy.direction = Math.floor(Math.random() * 4);
            }
        }

        if (isValidMove(enemy.x, enemy.y) && player.x < enemy.x + enemy.size && player.x + player.size > enemy.x && player.y < enemy.y + enemy.size && player.y + player.size > enemy.y) {
            health--;
            player.x = tileSize;
            player.y = tileSize;
        }

        // if (player.x < doorX + tileSize && player.x + player.size > doorX && player.y < doorY + tileSize && player.y + player.size > doorY) {
        //     level++;
        //     generateMaze();
        //     generateEnemies();
        //     player.x = tileSize;
        //     player.y = tileSize;
        // }
    });
}

function drawEnemies() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);
    enemies.forEach(enemy => {
        context.drawImage(playerImg, enemy.x, enemy.y, enemy.size, enemy.size);
    });
    context.restore();
}

function isValidMove(x, y) {
    let col = Math.floor(x / tileSize);
    let row = Math.floor(y / tileSize);

    let colRight = Math.floor((x + tileSize - 1) / tileSize);
    let rowBottom = Math.floor((y + tileSize - 1) / tileSize);

    if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) return false;
    if (colRight < 0 || colRight >= gridCols || rowBottom < 0 || rowBottom >= gridRows) return false;

    return maze[row][col] === 0 && maze[rowBottom][colRight] === 0;
}

function hasLineOfSight(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return true;

    for (let i = 0; i <= steps; i++) {
        let currentX = x1 + (dx * i / steps);
        let currentY = y1 + (dy * i / steps);

        let col = Math.floor(currentX / tileSize);
        let row = Math.floor(currentY / tileSize);

        // Check if the tile is within the maze bounds
        if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
            if (maze[row][col] === 1) {
                return false; // Wall in the way
            }
        }
    }
    return true; // No walls in the way
}

function activate(event) {
    if (event.key === "ArrowLeft") moveLeft = true;
    if (event.key === "ArrowRight") moveRight = true;
    if (event.key === "ArrowUp") moveUp = true;
    if (event.key === "ArrowDown") moveDown = true;
}

function deactivate(event) {
    if (event.key === "ArrowLeft") moveLeft = false;
    if (event.key === "ArrowRight") moveRight = false;
    if (event.key === "ArrowUp") moveUp = false;
    if (event.key === "ArrowDown") moveDown = false;
}

function stop(outcome_txt) {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    cancelAnimationFrame(request_id);
    document.querySelector("#outcome").innerHTML = outcome_txt + " Score: " + score;

    let data = new FormData();
    data.append("score", score);

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", handle_response, false);
    xhttp.open("POST", "/store_score", true);
    xhttp.send(data);
}

function handle_response() {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
        console.log(xhttp.responseText === "success" ? "Yes" : "No");
    }
}