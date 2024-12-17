class GameObject {
    constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false; // 객체가 파괴되었는지 여부
    this.type = ""; // 객체 타입 (영웅/적)
    this.width = 0; // 객체의 폭
    this.height = 0; // 객체의 높이
    this.img = undefined; // 객체의 이미지
    }

    rectFromGameObject() {
        return {
        top: this.y,
        left: this.x,
        bottom: this.y + this.height,
        right: this.x + this.width,
        };
    }

    draw(ctx) {
        if (this.destroyed) {
            if (this.img) {
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            }
            return; // destroyed 상태에서는 이후 로직 실행 안함
        }
    
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
    
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 99), (this.height = 75);
        this.type = "Hero";
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
    }

    updatePosition() {
        this.x += this.speed.x; // X축 이동
        this.y += this.speed.y; // Y축 이동
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10)); // 레이저 발사
            this.cooldown = 500; // 쿨다운 500ms
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);//쿨다운 완료 후 타이머 종료
                }
            }, 100);
        }
    }
    canFire() {
        return this.cooldown === 0; // 쿨다운이 끝났는지 확인
    }
}

class SideHero extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 40), (this.height = 35);
        this.type = "SideHero";
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 15 , this.y - 10)); // 레이저 발사
            this.cooldown = 1000; // 쿨다운 1000ms
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);//쿨다운 완료 후 타이머 종료
                }
            }, 100);
        }
    }
    canFire() {
        return this.cooldown === 0; // 쿨다운이 끝났는지 확인
    }
}
class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        (this.width = 9), (this.height = 33);
        this.type = 'Laser';
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15; // 레이저가 위로 이동
            } else {
                this.dead = true; // 화면 상단에 도달하면 제거
                clearInterval(id);
            }
        }, 100);
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        // 적 캐릭터의 자동 이동 (Y축 방향)
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5; // 아래로 이동
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id); // 화면 끝에 도달하면 정지
            }
        }, 300);
    }
}

class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
    if (!this.listeners[message]) {
        this.listeners[message] = [];
    }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
    if (this.listeners[message]) {
        this.listeners[message].forEach((l) => l(message, payload));
        }
    }
    clear() {
        this.listeners = {};
    }


}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    sideHero1 = new SideHero(
        canvas.width / 2 - 100,
        canvas.height - canvas.height / 5
    );
    sideHero2 = new SideHero(
        canvas.width / 2 + 70,
        canvas.height - canvas.height / 5
    );

    hero.img = heroImg;
    sideHero1.img = heroImg;
    sideHero2.img = heroImg;

    gameObjects.push(hero);
    gameObjects.push(sideHero1);
    gameObjects.push(sideHero2);
}

function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createEnemies2(ctx, canvas, enemyImg) {
    const MAX_ROWS = 5; // 역 피라미드 최대 줄 수

    for (let row = 0; row < MAX_ROWS; row++) {
        // 각 행의 이미지 개수와 중앙 정렬 시작 위치
        const numEnemies = MAX_ROWS - row;
        const START_X = (canvas.width - numEnemies * enemyImg.width) / 2;
        const y = row * enemyImg.height;

        // 각 행에 이미지 배치
        for (let i = 0; i < numEnemies; i++) {
            const x = START_X + i * enemyImg.width;
            ctx.drawImage(enemyImg, x, y);
        }
    }
}


function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    // 보조 우주선 자동 공격 시작
    const sideHeroes = [sideHero1, sideHero2];
    startAutoAttack(sideHeroes, 500); // 1초 간격으로 자동 공격

        eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -=5,
        sideHero1.y -=5,
        sideHero2.y -=5;
    })
        eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 5
        sideHero1.y += 5
        sideHero2.y += 5;
    });
        eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 5,
        sideHero1.x -= 5,
        sideHero2.x -= 5;
    });
        eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 5
        sideHero1.x += 5
        sideHero2.x += 5;
    });

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }  
    });
 
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        if (second.type === "Enemy" && !second.dead && !second.destroyed) {
            showDestroyedImage(second, destroyedEnemie, 500); // 이펙트 표시 및 500ms 후 제거
            first.dead = true; // 레이저 제거
            second.dead = true; // 적 제거 상태
            hero.incrementPoints(); // 점수 증가
            if (isEnemiesDead()) {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        }
    });
    

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();   
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return; // loss before victory
        }
        if (isEnemiesDead()) {
            eventEmitter.emit(Messages.GAME_END_WIN);
        } 
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });
    
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    }); 

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });

}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

function updateGameObjects() {   
    // 키 입력에 따른 이동 처리
    const speed = 15;
    if (keysPressed["ArrowUp"]) {
        hero.y -= speed;
        sideHero1.y -= speed;
        sideHero2.y -= speed;
    }
    if (keysPressed["ArrowDown"]) {
        hero.y += speed;
        sideHero1.y += speed;
        sideHero2.y += speed;
    }
    if (keysPressed["ArrowLeft"]) {
        hero.x -= speed;
        sideHero1.x -= speed;
        sideHero2.x -= speed;
    }
    if (keysPressed["ArrowRight"]) {
        hero.x += speed;
        sideHero1.x += speed;
        sideHero2.x += speed;
    }

    // 기존 게임 객체 업데이트 로직
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");

    // 레이저와 적 충돌 검사
    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (!m.destroyed && !m.dead && intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });
            }
        });
    });

    // Hero와 적 충돌 검사
    enemies.forEach((enemy) => {
        if (!enemy.dead) { // 이미 처리된 적은 제외
            const heroRect = hero.rectFromGameObject();
            if (intersectRect(heroRect, enemy.rectFromGameObject())) {
                enemy.dead = true; // 충돌한 적 상태를 바로 변경
                eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
            }
        }
    });

    // 죽은 객체 필터링
    gameObjects = gameObjects.filter((go) => !(go.dead && !go.destroyed));

}


function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right || // r2가 r1의 오른쪽에 있음
        r2.right < r1.left || // r2가 r1의 왼쪽에 있음
        r2.top > r1.bottom || // r2가 r1의 아래에 있음
        r2.bottom < r1.top // r2가 r1의 위에 있음
    );
   }

   function showDestroyedImage(target, destroyedImage, duration = 500) {
    target.img = destroyedImage; 
    target.destroyed = true;     
    setTimeout(() => {
        target.dead = true;      
        target.destroyed = false; // destroyed 상태를 false로 되돌림
    }, duration);
}
function startAutoAttack(heroes, interval = 1000) {
    // 보조 우주선 1
    sideHero1Timer = setInterval(() => {
        if (heroes[0].canFire()) {
            heroes[0].fire();
        }
    }, interval);

    // 보조 우주선 2
    sideHero2Timer = setInterval(() => {
        if (heroes[1].canFire()) {
            heroes[1].fire();
        }
    }, interval);
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
    lifeImg,
    START_POS + (45 * (i+1) ),
    canvas.height - 37);
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}
    
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead() {
    return hero.life <= 0;
    }
    function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" &&
    !go.dead);
    return enemies.length === 0;
    }

function displayMessage(message, color = "red") {
    ctx.save(); // 현재 캔버스 상태 저장
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore(); // 캔버스 상태 복원
}

function clearAutoAttackTimers() {
    if (sideHero1Timer) {
        clearInterval(sideHero1Timer);
        sideHero1Timer = null;
    }
    if (sideHero2Timer) {
        clearInterval(sideHero2Timer);
        sideHero2Timer = null;
    }
}

function endGame(win) {
    clearInterval(gameLoopId); // 게임 루프 중지
    clearAutoAttackTimers();

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (backImg) {
            const bgPattern = ctx.createPattern(backImg, 'repeat');
            ctx.fillStyle = bgPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black"; // 배경이 없을 경우 기본 색상 사용
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 메시지 표시
        displayMessage(
            win
                ? "Victory!!! Press [Enter] to start a new game"
                : "You died!!! Press [Enter] to restart the game",
            win ? "green" : "red"
        );
    }, 200);
}


function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); // 게임 루프 중지
        clearAutoAttackTimers(); // 보조 비행기 타이머 정리
        eventEmitter.clear(); // 이벤트 리스너 정리
        initGame(); // 게임 초기화
        gameLoopId = setInterval(() => { // 새 게임 루프 시작
            const bgPattern = ctx.createPattern(backImg, 'repeat');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = bgPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawPoints();
            drawLife();
            updateGameObjects();
            drawGameObjects(ctx);
        }, 100);
    }
}

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    };

let heroImg,
    enemyImg,
    laserImg,
    backImg,
    destroyedEnemie,
    sideHero1Timer, 
    sideHero2Timer,
    canvas, ctx,
    gameObjects = [],
    hero,
    lifeImg,
    gameLoopId,
    keysPressed = {}, // 키 입력 상태를 저장
    eventEmitter = new EventEmitter();


window.onload = async () => {
    // 배경색 설정
    
    backImg = await loadTexture('assets/starBackground.png');
    destroyedEnemie = await loadTexture('assets/laserGreenShot.png');
    console.log("Destroyed Enemy Image Loaded:", destroyedEnemie);
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    lifeImg = await loadTexture("assets/life.png");

    initGame();

    gameLoopId = setInterval(() => {
        const bgPattern = ctx.createPattern(backImg, 'repeat');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
        drawPoints();
        drawLife();
    }, 100);


    let onKeyDown = function (e) {
        console.log(e.keyCode);
        switch (e.keyCode) {
        case 37: // 왼쪽 화살표
        case 39: // 오른쪽 화살표
        case 38: // 위쪽 화살표
        case 40: // 아래쪽 화살표
        case 32: // 스페이스바
            e.preventDefault();
            break;
            default:
            break;
        }
    };
    window.addEventListener('keydown', (evt) => {
        keysPressed[evt.key] = true;
    });
        
    window.addEventListener("keyup", (evt) => {
        keysPressed[evt.key] = false;
        if (evt.key === "ArrowUp") {
            eventEmitter.emit(Messages.KEY_EVENT_UP);
        } else if (evt.key === "ArrowDown") {
            eventEmitter.emit(Messages.KEY_EVENT_DOWN);
        } else if (evt.key === "ArrowLeft") {
            eventEmitter.emit(Messages.KEY_EVENT_LEFT);
        } else if (evt.key === "ArrowRight") {
            eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
        } else if(evt.keyCode === 32) {
            eventEmitter.emit(Messages.KEY_EVENT_SPACE);
        } else if(evt.key === "Enter") {
            eventEmitter.emit(Messages.KEY_EVENT_ENTER);
        }
    }); 
    
    
};