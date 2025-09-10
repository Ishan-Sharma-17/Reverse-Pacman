//map
let map;
const rowsCount = 21;
const columnsCount = 19;
const tileLength = 32
const charLength = 32
const mapWidth = columnsCount * tileLength
const mapHeight = rowsCount * tileLength
let context;

//X = wall, O = skip, R = reverse pac man, ' ' = food, 'P' = Power food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "XP       X       PX",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     R     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "XP               PX",
    "XXXXXXXXXXXXXXXXXXX" 
];
const fps = 20;
let start = Date.now(), end = Date.now();

let walls = [];
let foods = [];
let powerUps = [];
let ghosts = [];
let reversePacman;

//Game Data
let score = 0;
let lives = 3;
let gameOver = false;

//images
let redGhostImage;
let blueGhostImage;
let pinkGhostImage;
let orangeGhostImage;
let angryGhostImage;

let rpUpImage;
let rpDownImage;
let rpLeftImage;
let rpRightImage;

let wallImage;
let powerUpImage;

//Initialize the game

window.onload = function() {
    map = document.getElementById("map");
    map.height = mapHeight;
    map.width = mapWidth;
    context = map.getContext("2d"); //Used for drawing on the board

    loadImages();
    loadMap();
    
    update();
    
    document.addEventListener("keyup", changeDirectionRP);
}

//Set-up functions
function loadImages() {
    wallImage = new Image();
    wallImage.src = "../resources/wall.png";

    powerUpImage = new Image();
    powerUpImage.src = "../resources/power up.png";

    redGhostImage = new Image();
    redGhostImage.src = "../resources/red ghost.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "../resources/blue ghost.png";

    pinkGhostImage = new Image();
    pinkGhostImage.src = "../resources/pink ghost.png";

    orangeGhostImage = new Image();
    orangeGhostImage.src = "../resources/orange ghost.png";

    angryGhostImage = new Image();
    angryGhostImage.src = "../resources/angry ghost.png";

    rpUpImage = new Image();
    rpUpImage.src = "../resources/reverse pacman up.png";

    rpDownImage = new Image();
    rpDownImage.src = "../resources/reverse pacman down.png";

    rpLeftImage = new Image();
    rpLeftImage.src = "../resources/reverse pacman left.png";

    rpRightImage = new Image();
    rpRightImage.src = "../resources/reverse pacman right.png";
}

function loadMap() {
    //Used to reset the game
    walls = [];
    foods = [];
    ghosts = [];
    powerUps = [];
    
    for (let row = 0; row < rowsCount; row++) {
        for (let column = 0; column < columnsCount; column++) {
            let tileChar = tileMap[row][column];
            let x = column * tileLength;
            let y = row * tileLength;

            if (tileChar == 'X') {
                let wall = new Block(wallImage, "W", x, y, tileLength, tileLength);
                walls.push(wall);
            }

            else if (tileChar == ' ') {
                let food = new Block(null, "F", x + 14, y + 14, 4, 4);
                foods.push(food);
            }
            else if (tileChar == 'P') {
                let powerUp = new Block(powerUpImage, "P", x + 8, y + 8, 16, 16);
                powerUps.push(powerUp);
            }

            else if (tileChar == 'R') {
                reversePacman = new Block(rpRightImage, "R", x, y, charLength, charLength);
            }

            else if (tileChar == 'r') {
                let redGhost = new Block(redGhostImage, "G", x, y, charLength, charLength);
                ghosts.push(redGhost);
            }
            else if (tileChar == 'b') {
                let blueGhost = new Block(blueGhostImage, "G", x, y, charLength, charLength);
                ghosts.push(blueGhost);
            }
            else if (tileChar == 'p') {
                let pinkGhost = new Block(pinkGhostImage, "G", x, y, charLength, charLength);
                ghosts.push(pinkGhost);
            }
            else if (tileChar == 'o') {
                let orangeGhost = new Block(orangeGhostImage, "G", x, y, charLength, charLength);
                ghosts.push(orangeGhost);
            }
        }
    }
    score = foods.length * 10
    lives = 3;
}

//Main function
function update() {
    if (reversePacman.pendingDirection) {
        reversePacman.updateDirection(reversePacman.pendingDirection);
    }
    move(reversePacman);
    for (let ghost of ghosts) {
        move(ghost);
    }
    if (end - start > 100){
        for (let ghost of ghosts) {
            changeDirectionGhosts(ghost);
        }
        start = end;
    }
    end = Date.now();
    
    updateUI();
    
    if (gameOver){
        return;
    }
    setTimeout(update, 1000/fps); //We use timeout instead of setInterval to ensure that the next update only happens after the current one is done
}

//Function that draws everything on the board
function updateUI() {
    context.clearRect(0, 0, mapWidth, mapHeight); //Clear the board
    context.drawImage(reversePacman.image, reversePacman.x, reversePacman.y, reversePacman.width, reversePacman.height);
    for (let ghost of ghosts) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    for (let wall of walls) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    for (let food of foods) {
        context.fillStyle = "white";
        context.fillRect(food.x, food.y, food.width, food.height);
    }
    for (let powerUp of powerUps) {
        context.drawImage(powerUp.image, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    context.fillStyle = "white";
    context.font = "14px sans-serif";
    context.fillText("Score: " + score, 10, mapHeight - 10);
    context.fillText("Lives: " + lives, mapWidth - 60, mapHeight - 10);
}

//Functions used by reverse pacman
function changeDirectionRP(e) {
    if (gameOver) {
        gameOver = false;
        loadMap();
        update();
        return;
    }
    if (e.code == "ArrowUp" || e.code == "KeyW") {
        reversePacman.pendingDirection = "U";
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        reversePacman.pendingDirection = "D";
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        reversePacman.pendingDirection = "L";
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        reversePacman.pendingDirection = "R";
    }
}

function changeDirectionGhosts(ghost){
    if (ghost.x < (columnsCount - 1) * tileLength && ghost.x > 0) {
        let directions = [];
        let count = 3;
        for (let i = 0; i < count; i++){
            directions.push("U");
            directions.push("L");
            directions.push("D");
            directions.push("R");
        }
        for (let i = 0; i < count - 1; i++){
            directions.splice(directions.indexOf(ghost.direction) + 2 + 3 * i, 1); //Remove opposite direction to avoid going back
        }
        let randomDirection = directions[Math.floor(Math.random() * directions.length)];
        ghost.updateDirection(randomDirection);
    }
}

//Functions used by all blocks
function willCollide(block1, block2){
    return block1.x + block1.velocityX < block2.x + block2.width && block1.x + block1.width + block1.velocityX > block2.x && block1.y + block1.velocityY < block2.y + block2.height && block1.y + block1.height  + block1.velocityY > block2.y;
}

function move(entity) {
    for (let wall of walls){
        if (willCollide(entity, wall)){
            entity.velocityX = 0;
            entity.velocityY = 0;
            break;
        }
    }

    if (entity.type == "G"){
        for (let food of foods){
            if (willCollide(entity, food)){
                foods.splice(foods.indexOf(food), 1);
                score -= 10;
                if (foods.length == 0){
                    gameOver = true;
                    return;
                }
                break;
            }
        }

        if (willCollide(entity, reversePacman)){
            if (entity.image != angryGhostImage){
                ghosts.splice(ghosts.indexOf(entity), 1);
                if (ghosts.length == 0){
                    gameOver = true;
                    return;
                }
            }
            else {
                lives -= 1;
                resetEntities();
                if (lives == 0){
                    console.log("Game over");
                    gameOver = true;
                    return;
                }
            }
        }
        for (let powerUp of powerUps){
            if (willCollide(entity, powerUp)){
                powerUps.splice(powerUps.indexOf(powerUp), 1);
                entity.image = angryGhostImage;
                entity.ghostStartTime = Date.now();
                entity.ghostEndTime = Date.now();
            }
        }

        if (entity.image == angryGhostImage){
            entity.ghostEndTime = Date.now();
            if (entity.ghostEndTime - entity.ghostStartTime > 10000){
                entity.image = entity.startImage;
            }
        }
    }
    
    entity.x += entity.velocityX;
    entity.y += entity.velocityY;

    if (entity.x == columnsCount * tileLength) {
        entity.x = 0;
    }
    else if (entity.x + entity.width == 0) {
        entity.x = columnsCount * tileLength - entity.width;
    }
}

function resetEntities(){
    reversePacman.x = reversePacman.startX;
    reversePacman.y = reversePacman.startY;
    reversePacman.direction = "R";
    reversePacman.velocityX = 0;
    reversePacman.velocityY = 0;
    reversePacman.pendingDirection = null;

    for (let ghost of ghosts){
        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        ghost.image = ghost.startImage;
    }
}

//Classes
class Block {
    constructor(image, type, x, y, width, height) {
        this.image = image;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        //Used to reset position of pacman and ghosts
        this.startX = x;
        this.startY = y;
        this.startImage = image;

        //Only for ghosts when powered up
        this.ghostStartTime = 0;
        this.ghostEndTime = 0;

        this.direction = "R"; //Default initial direction
        this.pendingDirection = null; //Used for buffered direction change
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(newDirection) {
        let oldVelocityX = this.velocityX;
        let oldVelocityY = this.velocityY;
        let oldDirection = this.direction;

        this.direction = newDirection;
        
        if (this.direction == "U") {
            this.velocityX = 0;
            this.velocityY = -tileLength/fps*5;
            if (this.image != rpUpImage && this == reversePacman){
                this.image = rpUpImage;
            }
        }
        else if (this.direction == "D") {
            this.velocityX = 0;
            this.velocityY = tileLength/fps*5;
            if (this.image != rpDownImage && this == reversePacman){
                this.image = rpDownImage;
            }
        }
        else if (this.direction == "L") {
            this.velocityX = -tileLength/fps*5;
            this.velocityY = 0;
            if (this.image != rpLeftImage && this == reversePacman){
                this.image = rpLeftImage;
            }
        }
        else if (this.direction == "R") {
            this.velocityX = tileLength/fps*5;
            this.velocityY = 0;
            if (this.image != rpRightImage && this == reversePacman){
                this.image = rpRightImage;
            }
            
        }
 
        for (let wall of walls){
            if (willCollide(this, wall)){
                this.velocityX = oldVelocityX;
                this.velocityY = oldVelocityY;
                this.direction = oldDirection;

                if (this.direction == "U" && this == reversePacman) {
                    this.image = rpUpImage;
                }
                else if (this.direction == "D" && this == reversePacman) {
                    this.image = rpDownImage;
                }
                else if (this.direction == "L" && this == reversePacman) {
                    this.image = rpLeftImage;
                }
                else if (this.direction == "R" && this == reversePacman) {
                    this.image = rpRightImage;
                }
                return;
            }
        }
        this.pendingDirection = null;
    }
}