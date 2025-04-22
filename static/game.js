let canvas;
let context;

let request_id;
let fpsInterval = 1000 / 30;
let now;
let then = Date.now();

let tileSize = 32; // Size of each tile in the tileset
let tilesetCols = 4; // Number of columns in the tileset
let tilesetRows = 2; // Number of rows in the tileset

// Tile mapping (using let as requested)
let tileMapping = {
    0: { col: 1, row: 1, width: 32, height: 32 }, // Floor tile
    1: { col: 1, row: 2, width: 32, height: 32 }, // Wall tile
    2: { col: 7, row: 3, width: 16, height: 16 }, // Door tile
    health: { col: 8, row: 9, width: 16, height: 16 }, // Health item
    potion: { col: 7, row: 8, width: 16, height: 16 },
    key: { col: 9, row: 9, width: 16, height: 16 }, // Key
    // decor: { col: 1, row: 9, width: 16, height: 16 } // Decorative item
    decor1: { col: 0, row: 9, width: 16, height: 16 }, // Decorative item 1
    decor2: { col: 7, row: 7, width: 16, height: 16 }, // Decorative item 2
    decor3: { col: 9, row: 5, width: 16, height: 16 }  // Decorative item 3

};

// Game State Variables
let player = {
    x: tileSize,
    y: tileSize,
    size: tileSize,
    speed: 4
};

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let xhttp; // For AJAX

let health = 3;
let healthItem = {
    x: 0,
    y: 0,
    collected: false
};

let previousHealth = health; // Initialize with the starting health

let potion = {
    x: 0,
    y: 0,
    collected: false
}

let decorativeItems = [];

let level = 1; // This is used as the score now
let gameTime = 0;

let camera = {
    x: 0,
    y: 0,
    zoom: 1.2
};

let maze = [];
let gridRows;
let gridCols;

let keys = [];
let keysCollected = 0;
let maxKeys = 3; // Total number of keys

let door = {
    x: 0,
    y: 0,
    width: tileSize,
    height: tileSize,
    unlocked: false
};

let enemies = [];

let initCalled = false;

// Admin mode flag (assuming this is a global flag)
let isAdmin = window.isAdmin; // Use the value passed from the template

// User identifier for saving scores (assuming this is set elsewhere, e.g., from a template)
let user = ""; // Initialize to an empty string

// References to HTML elements (assuming these exist)
let backgroundMusic; // Will be assigned getElementById
let startGameButton; // Will be assigned getElementById
let outcomeElement; // Will be assigned querySelector("#outcome")

// Load images (using let as requested)
let playerImg = new Image();
playerImg.src = 'static/images/player.png';

let wallTexture = new Image();
// wallTexture.src = 'static/images/wall.png'; // This line is commented out in your original
let tileSprite = new Image();
// tileSprite.src = 'static/images/tiles.png'; // This line is commented out in your original

let tileset = new Image();
tileset.src = 'static/images/Dungeon_Tileset.png';

// Image loading trigger (assuming wallTexture and playerImg are the main ones before init)
wallTexture.onload = playerImg.onload = function () {
    init();
};

function init() {
    if (initCalled) return;
    initCalled = true;

    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    outcomeElement = document.querySelector("#outcome"); // Get the outcome element
    backgroundMusic = document.getElementById('background-music'); // Get music element
    startGameButton = document.getElementById('startGameButton'); // Get start button

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    generateMaze();
    generateEnemies();

    camera.zoom = 1.5;
    updateCamera();

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);

    // You might want to add an event listener to startGameButton here
    // if that's how the game is triggered to start and play music.
    // startGameButton.addEventListener('click', startMusicAndGame); // Example

    // If the game starts immediately without a button click, call startGame() directly
    // startGame(); // Example if no start button

    // Assuming startGame() is called elsewhere after user interaction for music autoplay policies
    // For now, just call gameLoop to start rendering if no explicit start button is used for music.
    // If you use startMusicAndGame, the gameLoop should be called from there via startGame().
    request_id = requestAnimationFrame(gameLoop); // Starts the game loop
}


function generateMaze() {
    gridRows = Math.floor(canvas.height / tileSize);
    gridCols = Math.floor(canvas.width / tileSize);

    gridRows = Math.max(3, gridRows);
    gridCols = Math.max(3, gridCols);

    maze = Array(gridRows).fill(null).map(() => Array(gridCols).fill(1));

    let startX = 1;
    let startY = 1;

    maze[startY][startX] = 0;

    let frontier = [];

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

    maze[1][1] = 0;

    let doorPlaced = false;
    for (let row = gridRows - 2; row >= 0 && !doorPlaced; row--) {
        for (let col = gridCols - 2; col >= 0 && !doorPlaced; col--) {
            if (maze[row][col] === 0) {
                door.x = col * tileSize;
                door.y = row * tileSize;
                door.unlocked = false;
                doorPlaced = true;
            }
        }
    }

    placeHealthItem();
    placePotion(); // Place the potion
    placeKeys();
    placeDecorativeItems(5); // Place 10 decorative items

}

function addFrontier(x, y, frontier) {
    if (x + 2 < gridCols - 1 && maze[y][x + 2] === 1) frontier.push([x + 2, y, x + 1, y]);
    if (x - 2 > 0 && maze[y][x - 2] === 1) frontier.push([x - 2, y, x - 1, y]);
    if (y + 2 < gridRows - 1 && maze[y + 2][x] === 1) frontier.push([x, y + 2, x, y + 1]);
    if (y - 2 > 0 && maze[y - 2][x] === 1) frontier.push([x, y - 2, x, y - 1]);
}

function updateCamera() {
    let targetX = player.x - (canvas.width / (2 * camera.zoom));
    let targetY = player.y - (canvas.height / (2 * camera.zoom));

    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    let maxX = (gridCols * tileSize) - (canvas.width / camera.zoom);
    let maxY = (gridRows * tileSize) - (canvas.height / camera.zoom);

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}

function drawMaze() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    let startCol = Math.floor(camera.x / tileSize);
    let endCol = Math.ceil((camera.x + canvas.width / camera.zoom) / tileSize);
    let startRow = Math.floor(camera.y / tileSize);
    let endRow = Math.ceil((camera.y + canvas.height / camera.zoom) / tileSize);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
                let tileValue = maze[row][col];
                let tile = tileMapping[tileValue];

                if (tile) {
                    let sx = tile.col * tileSize;
                    let sy = tile.row * tileSize;

                    context.drawImage(
                        tileset,
                        sx, sy, tileSize, tileSize,
                        col * tileSize, row * tileSize, tileSize, tileSize
                    );
                }
            }
        }
    }

    context.restore();
}

function placeDecorativeItems(count) {
    decorativeItems = []; // Clear any existing decorative items

    for (let i = 0; i < count; i++) {
        let validPosition = false;
        let item = { x: 0, y: 0, type: "" }; // Default decorative item

        while (!validPosition) {
            let col = Math.floor(Math.random() * gridCols);
            let row = Math.floor(Math.random() * gridRows);

            if (maze[row][col] === 0) { // Ensure the position is valid (not a wall)
                item.x = col * tileSize;
                item.y = row * tileSize;

                // Randomly select one of the three decorative items
                let decorTypes = ["decor1", "decor2", "decor3"];
                item.type = decorTypes[Math.floor(Math.random() * decorTypes.length)];

                validPosition = true;
            }
        }

        decorativeItems.push(item);
    }
}

function drawDecorativeItems() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    decorativeItems.forEach(item => {
        let decorTile = tileMapping[item.type]; // Use the type to get the correct tile mapping
        let sx = decorTile.col * decorTile.width;
        let sy = decorTile.row * decorTile.height;

        context.drawImage(
            tileset,
            sx, sy, decorTile.width, decorTile.height,
            item.x, item.y, tileSize, tileSize
        );
    });

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

    let hudHeight = 60;
    let padding = 20;

    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, canvas.height - hudHeight, canvas.width, hudHeight);

    context.font = 'bold 20px Arial';

    context.fillStyle = '#ff4444';
    context.fillText(`❤️ ${health}`, padding, canvas.height - hudHeight / 2 + 8);

    context.fillStyle = '#ffff44';
    context.fillText(`Level ${level}`, canvas.width / 3, canvas.height - hudHeight / 2 + 8); // Level is the score

    context.fillStyle = '#ffff44';
    context.fillText(`Keys ${keysCollected}`, canvas.width / 6, canvas.height - hudHeight / 2 + 8);

    context.fillStyle = '#ffffff';
    let minutes = Math.floor(gameTime / 60000);
    let seconds = Math.floor((gameTime % 60000) / 1000);
    context.fillText(`⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`,
        2 * canvas.width / 3, canvas.height - hudHeight / 2 + 8);

    if (isAdmin) {
        context.fillStyle = '#00ff00';
        context.fillText(`Admin Mode`, canvas.width - 150, canvas.height - hudHeight / 2 + 8);
    }
}
if (isAdmin) {
    console.log("Admin Mode Enabled");
    // Admin-specific logic here
} else {
    console.log("Admin Mode Disabled");
}

function updatePlayer() {
    let newX = player.x;
    let newY = player.y;

    if (moveLeft) newX -= player.speed;
    if (moveRight) newX += player.speed;
    if (moveUp) newY -= player.speed;
    if (moveDown) newY += player.speed;

    if (isValidMove(newX, player.y, true)) player.x = newX;
    if (isValidMove(player.x, newY, true)) player.y = newY;

    let canMoveX = true;
    let canMoveY = true;

    let colX = Math.floor(newX / tileSize);
    let rowX = Math.floor(player.y / tileSize);
    let colRightX = Math.floor((newX + player.size - 1) / tileSize);
    let rowBottomX = Math.floor((player.y + player.size - 1) / tileSize);

    if (colX < 0 || colX >= gridCols || rowX < 0 || rowX >= gridRows ||
        colRightX < 0 || colRightX >= gridCols || rowBottomX < 0 || rowBottomX >= gridRows ||
        maze[rowX][colX] === 1 || maze[rowBottomX][colRightX] === 1) {
        canMoveX = false;
    }

    let colY = Math.floor(player.x / tileSize);
    let rowY = Math.floor(newY / tileSize);
    let colRightY = Math.floor((player.x + player.size - 1) / tileSize);
    let rowBottomY = Math.floor((newY + player.size - 1) / tileSize);

     if (colY < 0 || colY >= gridCols || rowY < 0 || rowY >= gridRows ||
        colRightY < 0 || colRightY >= gridCols || rowBottomY < 0 || rowBottomY >= gridRows ||
         maze[rowY][colY] === 1 || maze[rowBottomY][colRightY] === 1) {
        canMoveY = false;
    }


    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;

    if (!healthItem.collected &&
        health < 3 &&
        player.x < healthItem.x + tileSize &&
        player.x + player.size > healthItem.x &&
        player.y < healthItem.y + tileSize &&
        player.y + player.size > healthItem.y) {
        health++;
        healthItem.collected = true;
    }
}

function gameLoop() {
    console.log("Game loop running..."); // Debugging log

    request_id = requestAnimationFrame(gameLoop);

    now = Date.now();
    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        gameTime += elapsed;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        updateCamera();
        drawMaze();
        drawHealthItem();
        drawPotion(); // Draw the potion
        drawKeys();
        drawDoor();
        updatePlayer();
        updateEnemies();
        drawPlayer();
        drawEnemies();
        drawDecorativeItems(); // Draw decorative items
        checkGameEnd();

        checkKeyCollection();
        checkPotionCollection(); // Check if the player collects the potion
        checkDoorInteraction();

        drawHUD();
    }
}

function generateEnemies() {
    enemies = [];
    let minDistance = 5 * tileSize;
    let enemyCount = 2 + Math.floor(level / 2);

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
            speed: 2 + (level * 0.2),
            direction: Math.floor(Math.random() * 4),
            pause: false, // Add pause state
            pauseTimer: 0 // Add timer for pausing
        };
        enemies.push(enemy);
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        let canSeePlayer = false;
        let distance = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));

        // Check if the enemy can see the player
        if (distance < 300) {
            if (hasLineOfSight(
                enemy.x + enemy.size / 2,
                enemy.y + enemy.size / 2,
                player.x + player.size / 2,
                player.y + player.size / 2
            )) {
                canSeePlayer = true;
            }
        }

        if (canSeePlayer) {
            // Move toward the player
            let newX = enemy.x;
            let newY = enemy.y;

            if (player.x > enemy.x && isValidMove(enemy.x + enemy.speed, enemy.y)) {
                newX += enemy.speed;
            } else if (player.x < enemy.x && isValidMove(enemy.x - enemy.speed, enemy.y)) {
                newX -= enemy.speed;
            }

            if (player.y > enemy.y && isValidMove(enemy.x, enemy.y + enemy.speed)) {
                newY += enemy.speed;
            } else if (player.y < enemy.y && isValidMove(enemy.x, enemy.y - enemy.speed)) {
                newY -= enemy.speed;
            }

            // Only update position if the move is valid
            if (isValidMove(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                console.warn(`Enemy at (${enemy.x}, ${enemy.y}) stuck trying to move to (${newX}, ${newY})`);
            }
        } else {
            // Random movement when not chasing the player
            let newX = enemy.x;
            let newY = enemy.y;

            switch (enemy.direction) {
                case 0: newY -= enemy.speed; break; // Up
                case 1: newX += enemy.speed; break; // Right
                case 2: newY += enemy.speed; break; // Down
                case 3: newX -= enemy.speed; break; // Left
            }

            if (isValidMove(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                // Change direction if the move is invalid
                enemy.direction = Math.floor(Math.random() * 4);
            }

            // Occasionally change direction randomly
            if (Math.random() < 0.01) {
                enemy.direction = Math.floor(Math.random() * 4);
            }
        }

        // Enemy collision with player
        if (!isAdmin &&
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y) {
            health--;
            console.log("Player hit by enemy! Health:", health);
            player.x = tileSize;
            player.y = tileSize;
        }
        if (health < previousHealth) {
            console.log("Health decreased! Respawning enemies...");
            generateEnemies(); // Respawn enemies
        }

    // Update previous health
    previousHealth = health;

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

function isValidMove(x, y, isPlayer = false) {
    if (isPlayer && isAdmin) {
        return true;
    }

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

        if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
            if (maze[row][col] === 1) {
                return false;
            }
        }
    }
    return true;
}

function placeKeys() {
    keys = [];
    keysCollected = 0;

    for (let i = 0; i < maxKeys; i++) {
        let validPosition = false;

        while (!validPosition) {
            let col = Math.floor(Math.random() * gridCols);
            let row = Math.floor(Math.random() * gridRows);

            if (maze[row][col] === 0) {
                keys.push({ x: col * tileSize, y: row * tileSize, collected: false });
                validPosition = true;
            }
        }
    }
}

function drawKeys() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    keys.forEach(key => {
        if (!key.collected) {
            let keyTile = tileMapping.key;
            let sx = keyTile.col * keyTile.width;
            let sy = keyTile.row * keyTile.height;

            context.drawImage(
                tileset,
                sx, sy, keyTile.width, keyTile.height,
                key.x, key.y, tileSize, tileSize
            );
        }
    });

    context.restore();
}

function checkKeyCollection() {
    if (isAdmin) {
        keysCollected = maxKeys;
        return;
    }

    keys.forEach(key => {
        if (
            !key.collected &&
            player.x < key.x + tileSize &&
            player.x + player.size > key.x &&
            player.y < key.y + tileSize &&
            player.y + player.size > key.y
        ) {
            key.collected = true;
            keysCollected++;
        }
    });
}

function checkDoorInteraction() {
    if (
        keysCollected === maxKeys &&
        !door.unlocked
    ) {
        door.unlocked = true;
        console.log("Door unlocked!");
    }

    if (
        door.unlocked &&
        player.x < door.x + door.width &&
        player.x + player.size > door.x &&
        player.y < door.y + door.height &&
        player.y + player.size > door.y
    ) {
        level++;
        generateMaze();
        generateEnemies();
        player.x = tileSize;
        player.y = tileSize;
    }
}

function drawDoor() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    let doorTile = tileMapping[2];
    let sx = doorTile.col * doorTile.width;
    let sy = doorTile.row * doorTile.height;

    context.drawImage(
        tileset,
        sx, sy, doorTile.width, doorTile.height,
        door.x, door.y, tileSize, tileSize
    );

    context.restore();
}

function placeHealthItem() {
    let validPosition = false;

    while (!validPosition) {
        let col = Math.floor(Math.random() * gridCols);
        let row = Math.floor(Math.random() * gridRows);

        if (maze[row][col] === 0) {
            healthItem.x = col * tileSize;
            healthItem.y = row * tileSize;
            validPosition = true;
        }
    }

    healthItem.collected = false;
}

function drawHealthItem() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    if (!healthItem.collected) {
        let healthTile = tileMapping.health;
        let sx = healthTile.col * healthTile.width;
        let sy = healthTile.row * healthTile.height;

        context.drawImage(
            tileset,
            sx, sy, healthTile.width, healthTile.height,
            healthItem.x, healthItem.y, tileSize, tileSize
        );
    }

    context.restore();
}

function placePotion() {
    let validPosition = false;

    while (!validPosition) {
        let col = Math.floor(Math.random() * gridCols);
        let row = Math.floor(Math.random() * gridRows);

        if (maze[row][col] === 0) { // Ensure the position is valid (not a wall)
            potion.x = col * tileSize;
            potion.y = row * tileSize;
            validPosition = true;
        }
    }

    potion.collected = false;
}

function drawPotion() {
    context.save();
    context.scale(camera.zoom, camera.zoom);
    context.translate(-camera.x, -camera.y);

    if (!potion.collected) {
        let potionTile = tileMapping.potion; // Use the potion tile mapping
        let sx = potionTile.col * potionTile.width;
        let sy = potionTile.row * potionTile.height;

        context.drawImage(
            tileset,
            sx, sy, potionTile.width, potionTile.height,
            potion.x, potion.y, tileSize, tileSize
        );
    }

    context.restore();
}

function checkPotionCollection() {
    if (
        !potion.collected &&
        player.x < potion.x + tileSize &&
        player.x + player.size > potion.x &&
        player.y < potion.y + tileSize &&
        player.y + player.size > potion.y
    ) {
        potion.collected = true;
        teleportPlayer(); // Teleport the player to a random valid position
    }
}

function teleportPlayer() {
    let validPosition = false;

    while (!validPosition) {
        let col = Math.floor(Math.random() * gridCols);
        let row = Math.floor(Math.random() * gridRows);

        if (maze[row][col] === 0) { // Ensure the position is valid (not a wall)
            player.x = col * tileSize;
            player.y = row * tileSize;
            validPosition = true;
        }
    }

    console.log("Player teleported to:", player.x, player.y); // Debugging log
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

function checkGameEnd() {
    console.log("Checking game end conditions..."); // Debugging log

    if (health < 0) {
        console.log("Game over! Health is below 0."); // Debugging log
        stop("Game Over!");
    } else if (player.reachedGoal) {
        console.log("Player reached the goal!"); // Debugging log
        stop("You Win!");
    }
}

function stop(outcome_txt) {
    console.log("Stopping the game with outcome:", outcome_txt); // Debugging log

    // Remove event listeners
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);

    // Cancel the game loop
    cancelAnimationFrame(request_id);

    // Display the outcome
    if (outcomeElement) {
        outcomeElement.innerHTML = outcome_txt + " Final Level: " + level;
    } else {
        console.error("Outcome element not found!");
    }

    // Send the level to the server
    let data = new FormData();
    data.append("level", level);

    xhttp = new XMLHttpRequest();
    xhttp.addEventListener("readystatechange", function () {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {
                console.log("Level saved successfully.");
                window.location.href = `/game_over?level=${level}&user=${user}`;
            } else {
                console.error("Failed to save level. Redirecting anyway.");
                window.location.href = `/game_over?level=${level}&user=${user}`;
            }
        }
    });

    xhttp.open("POST", "/store_score", true);
    xhttp.send(data);

    // Stop the background music
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

function startGame() {
    init();
}

document.addEventListener('DOMContentLoaded', function () {
    let menuMusic = document.getElementById('menu-music');

    if (menuMusic) {
        menuMusic.volume = 0.2; // Set volume to 20%
        menuMusic.loop = true;

        if (menuMusic.paused) {
            const playPromise = menuMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Game music started.");
                }).catch(error => {
                    console.warn("Game music autoplay prevented:", error);
                });
            }
        }
    } else {
        console.error("Menu music element not found in the game!");
    }
});
