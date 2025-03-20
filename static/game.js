let canvas, context;
let page_height = window.innerHeight;
let page_width = window.innerWidth;

let request_id;
const fps = 30;
const fpsInterval = 1000 / fps;
let now, then = Date.now();

const tileSize = 32;

// Player Object
let player = {
    x: tileSize, 
    y: tileSize, 
    size: tileSize, 
    speed: 4
};

// Movement Flags
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let score = 0;
let xhttp;

// Maze (1 = Wall, 0 = Path)
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
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

const rows = maze.length;
const cols = maze[0].length;

// Load images
const playerImg = new Image();
playerImg.src = 'static/images/player.png';

const wallTexture = new Image();
wallTexture.src = 'static/images/wall.jpg';

wallTexture.onload = playerImg.onload = function () {
    init();
};

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);

    request_id = requestAnimationFrame(gameLoop);
}

function drawMaze() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (maze[row][col] === 1) {
                context.drawImage(wallTexture, col * tileSize, row * tileSize, tileSize, tileSize);
            } else {
                context.fillStyle = 'white';
                context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }
    }
}

function drawPlayer() {
    context.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

function updatePlayer() {
    let newX = player.x;
    let newY = player.y;

    if (moveLeft) newX -= player.speed;
    if (moveRight) newX += player.speed;
    if (moveUp) newY -= player.speed;
    if (moveDown) newY += player.speed;

    let col = Math.floor(newX / tileSize);
    let row = Math.floor(newY / tileSize);
    let colRight = Math.floor((newX + player.size - 1) / tileSize);
    let rowBottom = Math.floor((newY + player.size - 1) / tileSize);

    if (maze[row][col] === 0 && maze[rowBottom][colRight] === 0) {
        player.x = newX;
        player.y = newY;
    }
}

function gameLoop() {
    request_id = requestAnimationFrame(gameLoop);

    now = Date.now();
    let elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        context.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze();
        updatePlayer();
        drawPlayer();
    }
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

// Stop game and save score
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
