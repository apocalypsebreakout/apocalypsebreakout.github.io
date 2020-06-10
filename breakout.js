"use strict";

let playGameReq;
let startGamereq;
let prophecyBox;
let restartButton;
let scoreBox;
let bestBox;
let gameOverBox;

let score = 0;
let best = 0;

// CONSTANTS
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const PADDLE_ACC = 1.5;
const PADDLE_MAX_VEL = 9;
const PADDLE_Y = 370;

const BALL_WIDTH = 7;
const BALL_ACC = 2;

const BORDERWIDTH = 44;
const GATEWIDTH = 200;


const CANVASWIDTH = 858;
const CANVASHEIGHT = 658;

const BRICKROWCOUNT = 10;
const BRICKCOLUMNCOUNT = 8;
const BRICKWIDTH = 50;
const BRICKHEIGHT = 20;
const BRICKOFFSETX = (CANVASWIDTH - (BRICKCOLUMNCOUNT * BRICKWIDTH)) / 2;
const BRICKOFFSETY = 80;

const BOOKXPOS = (CANVASWIDTH - 128) / 2;
const BOOKYPOS = 12;
const BOOK_WIDTH = 128;
const BOOK_HEIGHT = 62;

const PROPHECYWIDTH = 15;
const PROPHECYHEIGHT = 15;

const brickWallImage = new Image();

const worlds = ['placeholder.jpg'];
brickWallImage.src = 'sprites/world.png';


const ballImage = new Image();
ballImage.src = 'sprites/eye.png'

const paddleImage = new Image();
paddleImage.src = 'sprites/paddle.png'

const frameImage = new Image();
frameImage.src = 'sprites/frame.png'

const gateImage = new Image();
gateImage.src = 'sprites/gate.png'

const bookImage = new Image();
bookImage.src = 'sprites/book.png'

const prophecyImage = new Image();
prophecyImage.src = 'sprites/prophecy.png'



frameImage.onload = function() {
    startGame();
}

function startGame() {

    let startBox = document.getElementById('start_game');
    startBox.style.display = 'block'

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    document.addEventListener('keypress', exitMenu);

    function exitMenu(e) {
        document.removeEventListener('keypress', exitMenu);
        console.log('uuuh');
        startBox.style.display = 'none';
        playGame();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(50, 50, 45, .9)';
    ctx.fillRect(20, 20, 818, 618);
    ctx.drawImage(frameImage, 0, 0, CANVASWIDTH, CANVASHEIGHT, 0, 0, CANVASWIDTH, CANVASHEIGHT);

}


function playGame() {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    restartButton = document.getElementById('restart_button');
    scoreBox = document.getElementById('score_box');
    bestBox = document.getElementById('best_box');
    // SCORE

    scoreBox.style.display = 'block';
    bestBox.style.display = 'block';

    function updateScore() {
        score += 100;
        scoreBox.innerHTML = 'score: ' + score;
    }


    // BORDERS
    const borders = {
        draw() {
            // ctx.strokeStyle = 'white';
            // ctx.strokeRect(BORDERWIDTH, BORDERWIDTH, canvas.width - BORDERWIDTH * 2, canvas.height - BORDERWIDTH * 2);
            ctx.drawImage(frameImage, 0, 0, CANVASWIDTH, CANVASHEIGHT, 0, 0, CANVASWIDTH, CANVASHEIGHT);
        }
    }

    // THE GATE

    const gate = {

        //four states: opening, open, closing, closed
        x: (CANVASWIDTH - GATEWIDTH) / 2,
        w: GATEWIDTH,

        status: 'closed',
        color: 256,

        f: 0,
        spitWait: 0,
        ballToSpit: 0,

        i: 0,

        update() {
            if (this.status == 'opening') {
                this.f += 1;
            } else if (this.status == 'closing') {
                this.f -= 1;
                this.i += 1;
            } else if (this.status == 'open') {
                this.spitWait += 1;
                this.i += 1;
            }

            if (this.f == 100) {
                this.status = 'open'
            }

            if (this.f == 0 && this.status == 'closing') {
                this.status = 'closed';
                this.i = 0;
            }

            if (this.spitWait == 200) {
                balls.push(new Ball(((canvas.width - BALL_WIDTH) / 2) + Math.floor(Math.random() - 0.5) * 40, canvas.height));
                this.spitWait = 0;
                this.ballToSpit -= 1;
                if (this.ballToSpit == 0) {
                    this.status = 'closing';
                }
            }
        },


        spitBall() {
            this.ballToSpit += 1;
            if (this.status == 'closed' || this.status == 'closing') {

                this.status = 'opening';
            }
        },

        draw() {
            // if (this.status == 'closed') {
            //     ctx.fillStyle = '#111111';
            // } else if (this.status == 'opening') {
            //     ctx.fillStyle = '#777777';
            // } else if (this.status == 'open') {
            //     ctx.fillStyle = '#FFFFFF';
            // } else if (this.status == 'closing') {
            //     ctx.fillStyle = '#FF0000';
            // }
            // ctx.fillRect(this.x, canvas.height - BORDERWIDTH, this.w, BORDERWIDTH);
            if (this.status == 'open' || this.status == 'closing') {
                if (this.i % 50 < 25) {
                    ctx.drawImage(gateImage, 0, 0, 250, 150, this.x - 25, CANVASHEIGHT - 150, 250, 150)
                } else {
                    ctx.drawImage(gateImage, 250, 0, 250, 150, this.x - 25, CANVASHEIGHT - 150, 250, 150)
                }
            }
        }

    }


    // PADDLE & CONTROLS

    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener("keydown", keyDownHandlerGame, false);
    document.addEventListener("keyup", keyUpHandlerGame, false);

    function keyDownHandlerGame(e) {
        if (e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = true;
        } else if (e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = true;
        }
    }

    function keyUpHandlerGame(e) {
        if (e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = false;
        } else if (e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = false;
        }
    }

    //PADDLE

    const paddle = {
        h: PADDLE_HEIGHT,
        w: PADDLE_WIDTH,
        x: (canvas.width - PADDLE_WIDTH) / 2,
        y: PADDLE_Y,
        dx: 0,
        maxd: PADDLE_MAX_VEL,
        isPaddle: true,

        update() {
            if (rightPressed && this.dx < PADDLE_MAX_VEL) {
                this.dx += PADDLE_ACC;
            } else if (leftPressed && this.dx > -PADDLE_MAX_VEL) {
                this.dx += -PADDLE_ACC;
            } else if (this.dx > 0) {
                this.dx -= 1;
            } else if (this.dx < 0) {
                this.dx += 1;
            } else {
                this.dx = 0;
            }

            this.x = valBetweenAltMin(this.x + this.dx, BORDERWIDTH, canvas.width - this.w - BORDERWIDTH);
        },

        draw() {
            ctx.drawImage(paddleImage, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h)
            // ctx.beginPath();
            // ctx.rect(this.x, this.y, this.w, this.h);
            // ctx.fillStyle = "red";
            // ctx.fill();
            // ctx.closePath();

        }
    }


    //BALLS

    let balls = [];

    class Ball {
        constructor(x, y) {
            this.x = x;
            this.y = y;

            this.w = BALL_WIDTH;

            this.dx = BALL_ACC * (Math.random() < 0.5 ? -1 : 1) + (Math.random() - 0.5) * 0.5;
            this.dy = -BALL_ACC + (Math.random() - 0.5) * 0.5;

            this.isColliding = false;
        }

        update() {

            this.x += this.dx;
            this.y += this.dy;

        }

        draw() {
            // ctx.fillStyle = 'green';
            // ctx.fillRect(this.x, this.y, this.w, this.w);
            if (this.dx > 0) {
                if (this.dy > 0) {
                    ctx.drawImage(ballImage, (ballImage.width / 2) * 0, (ballImage.height / 2) * 0, ballImage.width / 2, ballImage.height / 2, this.x - 4, this.y - 4, ballImage.width / 2, ballImage.width / 2)
                } else {
                    ctx.drawImage(ballImage, (ballImage.width / 2) * 1, (ballImage.height / 2) * 0, ballImage.width / 2, ballImage.height / 2, this.x - 4, this.y - 4, ballImage.width / 2, ballImage.width / 2)
                }
            } else {
                if (this.dy > 0) {
                    ctx.drawImage(ballImage, (ballImage.width / 2) * 0, (ballImage.height / 2) * 1, ballImage.width / 2, ballImage.height / 2, this.x - 4, this.y - 4, ballImage.width / 2, ballImage.width / 2)
                } else {
                    ctx.drawImage(ballImage, (ballImage.width / 2) * 1, (ballImage.height / 2) * 1, ballImage.width / 2, ballImage.height / 2, this.x - 4, this.y - 4, ballImage.width / 2, ballImage.width / 2)
                }
            }
        }
    }


    //// BRICKSSSSSSSSS

    class Brick {
        constructor(c, r, img) {
            this.c = c;
            this.r = r;
            this.img = img;

            this.status = "active";

            this.isBrick = true;

            this.sx = (img.width / BRICKCOLUMNCOUNT) * this.c;
            this.sy = (img.height / BRICKROWCOUNT) * this.r;
            this.sWidth = img.width / BRICKCOLUMNCOUNT
            this.sHeight = img.height / BRICKROWCOUNT;

            this.w = BRICKWIDTH;
            this.h = BRICKHEIGHT;
            this.x = c * BRICKWIDTH + BRICKOFFSETX;
            this.y = r * BRICKHEIGHT + BRICKOFFSETY;
        }

        update() {
            if (this.status == "falling") {
                this.y += 4;
                if (this.y > canvas.height) {
                    this.status = false
                }
            }
        }

        draw() {
            ctx.drawImage(this.img, this.sx, this.sy, this.sWidth, this.sHeight, this.x, this.y, this.w, this.h);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        }
    }

    function updateBricks() {
        for (let i = brickWall.length - 1; i >= 0; i--) {
            let brick = brickWall[i];
            if (brick.status == false) {
                brickWall.splice(i, 1);
            }
        }
    }

    function drawBricks() {
        for (let i = 0; i < brickWall.length; i++) {
            brickWall[i].draw();
        }
    }

    ///// init brick wall
    let brickWall = [];

    buildWall(brickWallImage);

    function buildWall(img) {
        for (let c = 0; c < BRICKCOLUMNCOUNT; c++) {
            for (let r = 0; r < BRICKROWCOUNT; r++) { ///riscrivi senza doppio loop: brickWall.push(new Brick(c, r, img))
                brickWall.push(new Brick(c, r, img))
            }
        }
    }


    //// THE BOOK OF PROPHECIES 

    const book = {
        img: '',
        x: BOOKXPOS,
        y: BOOKYPOS,
        w: BOOK_WIDTH,
        h: BOOK_HEIGHT,

        prophecies: [],
        amountOfPropheciesRead: 0,

        spitProphecy() {
            let random = Math.random() * 1000; // improve randomness
            if (random > 990) {
                let dx = Math.random() * 6 - 3;
                let dy = -(Math.random() * 4);
                this.prophecies.push(new Prophecy(dx, dy))
            }
        },

        update() {
            if (!gameOver.status) {
                this.spitProphecy(); // add animation, etc.
            }
        },

        draw() {
            // ctx.beginPath();
            // ctx.rect(this.x, this.y, this.w, this.h);
            // ctx.fillStyle = "blue";
            // ctx.fill();
            // ctx.closePath();
            ctx.drawImage(bookImage, 0, 0, 128, 62, this.x, this.y, this.w, this.h)
        }

    }

    // FLYING PROPHECIES

    class Prophecy {
        constructor(dx, dy) {

            this.dx = dx;
            this.dy = dy;

            this.x = book.x + book.w / 2;
            this.y = book.y + book.h / 2;

            this.gravity = 0.1

            this.w = PROPHECYWIDTH;
            this.h = PROPHECYHEIGHT;


        }

        update() {
            this.x += this.dx;
            this.dy += this.gravity;
            this.y += this.dy;
        }

        draw() {
            // ctx.beginPath();
            // ctx.rect(this.x, this.y, this.w, this.h);
            // ctx.fillStyle = "yellow";
            // ctx.fill();
            // ctx.closePath();
            if (this.dx < 0) {
                ctx.drawImage(prophecyImage, 0, 0, 17, 19, this.x - 1, this.y - 2, 17, 19)
            } else {
                ctx.drawImage(prophecyImage, 17, 0, 17, 19, this.x - 1, this.y - 2, 17, 19)
            }
        }
    }


    function prophecyCollision() {
        for (let i = book.prophecies.length - 1; i >= 0; i--) {

            let prophecy = book.prophecies[i];
            prophecy.update();
            if (prophecy.x < paddle.x + paddle.w && prophecy.x + prophecy.w > paddle.x && prophecy.y < paddle.y + paddle.h && prophecy.y + prophecy.h > paddle.y) {
                prophecyOnScreen.displayProphecy();
                //if (book.amountOfPropheciesRead == 0) {
                gate.spitBall();
                //
                updateScore();
                book.amountOfPropheciesRead += 1;
                book.prophecies.splice(i, 1);

                continue;
            }
            if (prophecy.y > canvas.height + 5) {
                book.prophecies.splice(i, 1);
            }


        }
    }


    function drawProphecies() {
        for (let i = 0; i < book.prophecies.length; i++) {
            let p = book.prophecies[i];
            p.draw();
        }
    }


    // ANNOYING PRINTED PROPHECY IN THE MIDDLE OF THE SCREEN

    prophecyBox = document.getElementById('prophecy_box');
    let when_span = document.getElementById('when');
    let who_span = document.getElementById('who');
    let what_span = document.getElementById('what');

    let all_the_prophecies = the_ends_of_the_world


    const prophecyOnScreen = {
        status: false,
        f: 0,

        update() {
            if (this.status == true) {
                this.f += 1;
                if (this.f > 700) {
                    this.f = 0;
                    this.status = false;
                    prophecyBox.style.display = 'none'
                }
            }
        },

        displayProphecy() {
            if (!this.status) {
                let i = Math.floor(Math.random() * all_the_prophecies.length);
                let endOfTheWorld = all_the_prophecies[i];


                when_span.innerHTML = endOfTheWorld[0];
                who_span.innerHTML = endOfTheWorld[1];
                what_span.innerHTML = endOfTheWorld[2];

                prophecyBox.style.display = 'block';

                this.status = true;
                this.f = 0;

                all_the_prophecies.splice(i, 1);

                if (all_the_prophecies.length == 0) {

                    console.log('you won everything')
                }
            }
        }
    }

    //// COLLISION FUNCTIONS

    function ballRectCollision(ball, rect) {
        if (ball.x < rect.x + rect.w && ball.x + ball.w > rect.x && ball.y < rect.y + rect.h && ball.y + ball.w > rect.y) {

            let ballCenter = [ball.x + ball.w / 2, ball.y + ball.w / 2];

            if (ballCenter[0] - ball.dx > rect.x && ballCenter[0] - ball.dx < rect.x + rect.w) {
                ball.dy = -ball.dy
            } else if (ballCenter[1] - ball.dy > rect.y && ballCenter[1] - ball.dy < rect.y + rect.h) {
                ball.dx = -ball.dx
            } else {
                ball.dx = -ball.dx;
                ball.dy = -ball.dy
            }


            //for paddle
            if (rect.isPaddle) {
                ball.dx = valBetweenAltMin(ball.dx + paddle.dx, -PADDLE_MAX_VEL * 0.7, PADDLE_MAX_VEL * 0.7);
                if (ball.dx == 0) {
                    ball.dx = 0.1;
                }
            } else {
                if (Math.abs(ball.dx) > Math.abs(BALL_ACC)) {
                    ball.dx *= 0.9;
                    ball.dy *= 0.9;
                    if (Math.abs(ball.dx) < BALL_ACC) {
                        ball.dx = Math.sign(ball.dx) * BALL_ACC
                    }
                    if (Math.abs(ball.dy) < BALL_ACC) {
                        ball.dy = Math.sign(ball.dy) * BALL_ACC
                    }
                }
            }



            //collision position resolution
            if (rect.isPaddle) {
                let projX = ball.x + ball.dx;
                let projY = ball.y + ball.dy;
                let correctX = 0;
                let correctY = 0;

                while (projX < rect.x + rect.w && projX + ball.w > rect.x && projY < rect.y + rect.h && projY + ball.w > rect.y) {
                    if (Math.abs(ball.dx) < Math.abs(ball.dy)) {
                        projX += Math.sign(ball.dx);
                        projY += ball.dy / Math.abs(ball.dx)
                    } else if (Math.abs(ball.dx) > Math.abs(ball.dy)) {
                        projY += Math.sign(ball.dy);
                        projX += ball.dx / Math.abs(ball.dy)
                    } else {
                        projX += Math.sign(ball.dx);
                        projY += Math.sign(ball.dy);
                    }

                }
                correctX = projX - ball.dx - ball.x;
                correctY = projY - ball.dy - ball.y;

                if (correctX != 0 || correctY != 0) {
                    ball.x += correctX;
                    ball.y += correctY;
                }
            }
            //for bricks
            if (rect.isBrick) {
                rect.status = false;
            }
        }
    }


    function borderCollision(ball) {
        let collision = false;

        //left and right
        if (ball.x > canvas.width - ball.w - BORDERWIDTH || ball.x < BORDERWIDTH) {
            ball.dx = -ball.dx
            if (Math.abs(ball.dx) > Math.abs(BALL_ACC)) {
                ball.dx *= 0.9;
                if (Math.abs(ball.dx) < BALL_ACC) {
                    ball.dx = Math.sign(ball.dx) * BALL_ACC
                }

            }
            collision = true;
            ball.dx += (Math.random() - 0.5);
            ball.dy += (Math.random() - 0.5);
        }

        //top
        if (ball.y < BORDERWIDTH) {
            ball.dy = -ball.dy;
            collision = true;
            ball.dx += (Math.random() - 0.5);
            ball.dy += (Math.random() - 0.5);
        }

        //bottom
        if (gate.status == 'open' || gate.status == 'closing') {
            if (ball.y > canvas.height - ball.w - BORDERWIDTH && (ball.x < gate.x + ball.w || ball.x > gate.x + gate.w)) {
                ball.dy = -ball.dy;
                collision = true;
                ball.dx += (Math.random() - 0.5);
                ball.dy += (Math.random() - 0.5);
            }
        } else {
            if (ball.y > canvas.height - ball.w - BORDERWIDTH) {
                ball.dy = -ball.dy;
                collision = true;
                ball.dx += (Math.random() - 0.5);
                ball.dy += (Math.random() - 0.5);
            }
        }




        //position resolution
        if (collision) {
            if (ball.x + ball.dx > canvas.width - ball.w - BORDERWIDTH || ball.x + ball.dx < BORDERWIDTH) {
                ball.x = valBetweenAltMin(ball.x, BORDERWIDTH + 1, canvas.width - ball.w - 1 - BORDERWIDTH)

            }

            if (ball.y + ball.dy > canvas.height - ball.w - BORDERWIDTH || ball.y + ball.dy < BORDERWIDTH) {
                ball.y = valBetweenAltMin(ball.y, BORDERWIDTH + 1, canvas.height - ball.w - 1 - BORDERWIDTH)
            }
        }


    }


    //big function
    function checkCollision(ball) {
        //check brick
        for (let i = 0; i < brickWall.length; i++) {
            let brick = brickWall[i];
            ballRectCollision(ball, brick)
        }

        // check area paddle
        ballRectCollision(ball, paddle);

        // check borders
        borderCollision(ball);

    }


    ///GAME OVER 

    gameOverBox = document.getElementById('gameOver_box')
    const gameOver = {
        status: false,

        endGame() {
            if (this.status == false) {
                this.status = true;
                gate.status = 'closed';
                book.prophecies = [];
                gameOverBox.style.display = 'block'
                restartButton.style.display = 'block';
                document.addEventListener('keypress', enterRestart);
            }
        },
    }

    let frames = 0;
    let frame = new Image();
    frame.src = 'frame.png'

    function drawGame() {
        frames += 1;

        if (brickWall.length == 0) {
            gameOver.endGame();
        }


        gate.update();
        book.update();

        paddle.update();

        updateBricks();
        prophecyOnScreen.update();


        for (let i = balls.length - 1; i >= 0; i--) {
            let b = balls[i];
            b.update();
            checkCollision(b);

            if ((b.y > canvas.height + 10 && b.dy > 0) || (b.y - 5 > canvas.height - BORDERWIDTH && ((gate.status != 'open') && (gate.status != 'closing')) && (b.x > gate.x && b.x + b.w < gate.x + gate.w))) {
                balls.splice(i, 1);
            }
        }

        prophecyCollision();


        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(50, 50, 45, .9)';
        ctx.fillRect(20, 20, 818, 618);
        borders.draw();
        gate.draw();
        book.draw();
        drawBricks();
        drawProphecies();

        for (let i = 0; i < balls.length; i++) {
            let b = balls[i];
            b.draw();
        }

        paddle.draw();

        playGameReq = window.requestAnimationFrame(drawGame);
    }

    playGameReq = window.requestAnimationFrame(drawGame);
}


function enterRestart(e) {
    if (e.key == 'Enter') {
        restart();
    }
}


function restart() {
    document.removeEventListener('keypress', enterRestart);
    best = Math.max(score, best);
    score = 0;
    restartButton.style.display = 'none';
    prophecyBox.style.display = 'none';
    gameOverBox.style.display = 'none'
    scoreBox.innerHTML = 'score: ' + score;
    bestBox.innerHTML = 'best: ' + best;
    window.cancelAnimationFrame(playGameReq);
    playGame();
}





// misc utilities

function valBetweenAltMin(val, min, max) {
    return (val > min) ? ((val < max) ? val : max) : min;
}
