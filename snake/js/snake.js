let foods = 0;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let rows = 30;
let cols = 30;
let snake = [{
    x: 9,
    y: 3
}];
let food;

let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;
let direction ='LEFT';
let foodCollected = false;

let playButton = document.getElementById('play_btn');
let playerNameInput = document.getElementById('player_name');
let isGameStarted = false;

let userRow = document.getElementById('user_row').innerHTML;
let userRowTemplate = _.template(userRow);

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.volume=0.5;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}
var punktSound=new sound("cartoon_bite_sound_effect.mp3");
var entsound=new sound("2020-08-20-00-38-28.mp3");

let schwierigkeiten = {
    easy: {
        speed: 2000,
        push: 1000
    },
    normal: {
        speed: 1000,
        push: 500
    },
    hard: {
        speed: 250,
        push: 125
    }
};

let settings = schwierigkeiten.normal;

let speedfactor = settings.speed;
let pushfator = settings.push;
let playfator = settings.speed;

let startTime = 0;
let gameTimer = null;

let highscores = JSON.parse( window.localStorage.getItem('highscores') );
if (_.isArray(highscores) === false) {
    highscores = [];
}

function renderHighscores() {
    $('tbody').html(''); // liste leeren

    highscores =_.sortBy(highscores, 'score').reverse(); // nach punkten sortieren

    _.each(highscores, function(row, i) { // platz vergeben (index + 1)
        highscores[i].pos = (i + 1);
    });

    let written = 0;
    _.each(highscores, function(row) { // eintrag in tabelle anfügen
        if (written < 5) {
            $('tbody').append( userRowTemplate(row) );
        }
        written = written + 1;
    });
}


/*
    let row_data = {
        pos: 1,
        name: "test1",
        score: 10,
        time: 0
    };
    highscores.push(row_data);
    row_data = {
        pos: 2,
        name: "tes2",
        score: 5,
        time: 0
    };
    highscores.push(row_data);
     row_data = {
        pos: 3,
        name: "winner",
        score: 11,
        time: 0
    };
    highscores.push(row_data);

 */


function start_game () {
    if (playerNameInput.value.length === 0) {
        alert('Bitte gib deinen Namen ein!');
        playerNameInput.focus();
    } else {

       // if (isGameStarted === false) {

            if (gameTimer) {
               clearTimeout(gameTimer);
            }

            settings = schwierigkeiten[ document.getElementById('schwierigkeit').value ];
            speedfactor = settings.speed;
            pushfator = settings.push;
            playfator = settings.speed;


            console.log('game started! ' + playerNameInput.value + ' is playing');
            isGameStarted = true;

            startTime = _.now(); // startzeit merken
            foods = 0; // score reset

            placeFood(); // essen hinlegen

            snake = [{
                x: 9,
                y: 3
            }];
            direction ='LEFT';

            play();
//        }

    }
}


function play () {
    if (isGameStarted) {
        gameTimer = setTimeout(gameLoop, playfator / (foods || 1) );
    }
}

function gameLoop() {
    testGameOver();

    if (foodCollected){
        snake = [{
            x: snake[0].x,
            y: snake[0].y
        }, ...snake];

        foodCollected = false;
    }

    shiftSnake();

    if (direction == 'LEFT') {
        snake[0].x--;
    }
    if (direction == 'RIGHT') {
        snake[0].x++;
    }
    if (direction == 'UP') {
        snake[0].y--;
    }
    if (direction == 'DOWN') {
        snake[0].y++;
    }
    if (snake[0].x == food.x &&
        snake[0].y == food.y){
        foodCollected =true;

        foods++;
        console.log(playerNameInput.value + ' hat jetzt ' + foods + ' punkte');
        punktSound.play()



        placeFood();
    }

    play();
} // end game loop

function testGameOver(){

    let firstPart = snake[0];
    let otherParts = snake.slice(1);
    let duplicatePart = otherParts.find(part => part.x == firstPart.x && part.y == firstPart.y);

    //Schlage geht in die Wand
    if (snake[0].x < 0 ||
        snake[0].x > cols - 1 ||
        snake[0].y < 0 ||
        snake[0].y > rows - 1 ||
        duplicatePart
    ){
        // STOP LOOP
        // ------------------------------------------------
        isGameStarted = false;
        entsound.play()

        // GAMEOVER
        // ------------------------------------------------
        let playerName = playerNameInput.value;
        let scoredPoints = foods;
        let timePlayed = (_.now() - startTime) / 1000;
        console.log(playerName, 'timePlayed:', timePlayed + 's', scoredPoints, 'points' );

        // ADD SCORE TO TABLE
        // ------------------------------------------------
        let row_data = {
            pos: 1,
            name: playerName,
            score: scoredPoints,
            time: timePlayed
        };
        highscores.push(row_data);

        window.localStorage.setItem('highscores', JSON.stringify(highscores));

        renderHighscores();

    }

}


function placeFood() {
    let randomX = Math.floor( Math.random() * cols);
    let randomY = Math.floor( Math.random() * rows);

    food ={
        x:randomX,
        y:randomY
    }
}

function add(x, y)
{
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight -1);
}


function shiftSnake(){
    for (let i = snake.length - 1; i > 0; i--) {
        const part = snake[i];
        const lastPart = snake[i - 1];
        part.x = lastPart.x;
        part.y = lastPart.y;

    }
}

function draw(){
    let firstPart = snake[0];

    // spielfläche
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // score
    ctx.fillStyle = 'yellow';
    ctx.fillText('Score: ' + foods, 10, 20);

    // schlange-teile
    snake.forEach(function(part, i){
        if (i === 0) {
            ctx.fillStyle = 'cyan';
        } else {
            ctx.fillStyle ='blue';
        }
        add(part.x, part.y);
    });

    // essen
    ctx.fillStyle = 'green';
    add(food.x, food.y); //food

    requestAnimationFrame(draw);
}

function keyUp(e) {
    playfator = speedfactor;
}
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);


function keyDown(e) {
    playfator = pushfator;

    if (e.keyCode === 37) {
        direction = 'LEFT';
    }
    if (e.keyCode === 38) {
        direction = 'UP';
    }
    if (e.keyCode === 39) {
        direction = 'RIGHT';
    }
    if (e.keyCode === 40) {
        direction = 'DOWN';
    }
    if (e.keyCode === 65) {
        direction = 'LEFT';
    }
    if (e.keyCode === 87) {
        direction = 'UP';
    }
    if (e.keyCode === 68) {
        direction = 'RIGHT';
    }
    if (e.keyCode === 83) {
        direction = 'DOWN';
    }
}
let clear =document.getElementById("clear")
clear.addEventListener('click',function (){
    console.log('cöick?')
    window.localStorage.clear();
    highscores=[]
    renderHighscores();
});
// EVENTS
// -------------------------------------------------------
document.addEventListener('keydown', keyDown )
document.addEventListener('keyup', keyUp )
playButton.addEventListener('click', start_game)
document.addEventListener('keydown', keyDown )

// INIT
// -------------------------------------------------------
renderHighscores();
placeFood();
draw();