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

        this.attackInterval = null; // 자동 공격 타이머
    }

    updatePosition() {
        this.x += this.speed.x; // X축 이동
        this.y += this.speed.y; // Y축 이동
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
            this.stopAutoAttack(); // 생명이 다하면 자동 공격 중지
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
                    clearInterval(id); // 쿨다운 완료 후 타이머 종료
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0; // 쿨다운이 끝났는지 확인
    }

    startAutoAttack(interval = 1000) { // 자동 공격 시작
        if (this.attackInterval) return; // 이미 타이머가 있으면 무시
        this.attackInterval = setInterval(() => {
            if (!this.dead) {
                this.fire();
            }
        }, interval);
    }

    stopAutoAttack() { // 자동 공격 중지
        if (this.attackInterval) {
            clearInterval(this.attackInterval);
            this.attackInterval = null;
        }
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
    constructor(x, y, isBoss = false) { // isBoss 파라미터 추가
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = isBoss ? "BossLaser" : "Laser"; // 타입 설정
        this.img = isBoss ? blaserImg : laserImg; // 보스 레이저는 bimg, 일반 레이저는 img
        this.speed = { x: 0, y: -15 }; // 기본 속도 설정 (히어로 레이저)

        // 레이저 이동
        let id = setInterval(() => {
            this.x += this.speed.x;
            this.y += this.speed.y;
            if (this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                this.dead = true; // 화면 밖으로 나가면 제거
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
        this.speed = { x: 0, y: enemySpeedIncrease }; // 이동 속도 반영

        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += this.speed.y; // 이동 속도 반영
            } else {
                this.dead = true; // 바닥에 도달하면 제거
                clearInterval(id); // 타이머 중지
            }
        }, 100); // 이동 간격
    }
}
class Boss extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 200;
        this.height = 100;
        this.type = "Boss";
        this.img = bossImg;
        this.health = 500; // 충분한 체력을 설정
        this.maxHealth = this.health; // 최대 체력
        this.speed = 5;
        this.dead = false; // 생성 시 보스가 죽은 상태로 설정되지 않도록 확인
        this.cooldown = 0;

        // 보스 움직임 패턴
        this.movementInterval = setInterval(() => {
            this.x += this.speed;
            if (Math.random() < 0.1) {
                this.y += 10;
            }
            if (this.x + this.width >= canvas.width || this.x <= 0) {
                this.speed = -this.speed;
            }
        }, 100);

        // 원형 레이저 발사
        this.fireInterval = setInterval(() => {
            if (!this.dead) {
                this.fireCircular();
            }
        }, 5000);

        // 플레이어를 조준해서 직선 발사
        this.targetedFireInterval = setInterval(() => {
            if (!this.dead) {
                this.fireStraightAtPlayer();
            }
        }, 500); // 0.5초마다 플레이어 조준 공격
    }

    fireAtPlayer() {
        if (this.cooldown === 0 && !this.dead) {
            const dx = hero.x + hero.width / 2 - (this.x + this.width / 2);
            const dy = hero.y + hero.height / 2 - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            const laser = new Laser(this.x + this.width / 2 - 5, this.y + this.height);
            laser.speed = { x: normalizedDx * 10, y: normalizedDy * 10 };
            laser.type = "BossLaser";
            gameObjects.push(laser);

            this.cooldown = 2000;
            let cooldownInterval = setInterval(() => {
                this.cooldown -= 100;
                if (this.cooldown <= 0) {
                    clearInterval(cooldownInterval);
                    this.cooldown = 0;
                }
            }, 100);
        }
    }

    fireCircular() {
        const NUM_LASERS = 12; // 발사할 총알 개수
        for (let i = 0; i < NUM_LASERS; i++) {
            const angle = (i * 2 * Math.PI) / NUM_LASERS;
            const dx = Math.cos(angle) * 10; // X 방향 속도
            const dy = Math.sin(angle) * 5; // Y 방향 속도

            const laser = new Laser(this.x + this.width / 2, this.y + this.height / 2, true);
            laser.speed = { x: dx, y: dy };
            laser.type = "BossLaser";
            gameObjects.push(laser);
        }
    }

    fireStraightAtPlayer() {
        // 플레이어와 보스 사이의 방향 계산
        const dx = hero.x + hero.width / 2 - (this.x + this.width / 2);
        const dy = hero.y + hero.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / distance; // 방향 벡터 정규화
        const normalizedDy = dy / distance;

        // 보스 레이저 생성 (isBoss=true)
        const laser = new Laser(this.x + this.width / 2 - 5, this.y + this.height, true);
        laser.speed = { x: normalizedDx * 8, y: normalizedDy * 8 }; // 속도 설정
        gameObjects.push(laser);
    }

    clearBossTimers() {
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
        if (this.fireInterval) {
            clearInterval(this.fireInterval);
            this.fireInterval = null;
        }
        if (this.targetedFireInterval) {
            clearInterval(this.targetedFireInterval);
            this.targetedFireInterval = null;
        }
    }
    

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.dead = true;
            this.clearBossTimers();
        }
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

function drawBossHealth(boss) {
    if (!boss || boss.dead) return;

    const barWidth = canvas.width * 0.6; // 체력 바 너비
    const barHeight = 20; // 체력 바 높이
    const x = (canvas.width - barWidth) / 2; // 중앙 정렬
    const y = 20; // 캔버스 상단에서 20px 내려옴

    // 체력 바 배경
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, barWidth, barHeight);

    // 체력 바 현재 상태
    const healthPercentage = boss.health / boss.maxHealth;
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);

    // 체력 텍스트
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Boss Health: ${boss.health}/${boss.maxHealth}`, x + barWidth / 2, y + barHeight - 4);
}

// Hero와 보조 우주선을 생성하고, 초기 위치와 이미지를 설정하며 게임 객체 리스트에 추가함
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
// 적 객체를 생성하여 지정된 좌표에 배치하고, 게임 객체 리스트에 추가함
function createEnemiesWave() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;

    function spawnEnemies() {
        if (currentStage !== 1 || !stageRunning) return; // 스테이지가 1이 아니거나 스테이지가 종료되면 생성 중단
        console.log("Spawning enemies...");
        for (let x = START_X; x < START_X + MONSTER_TOTAL * 98; x += 98) {
            const enemy = new Enemy(x, 0);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }

    // 적을 5초마다 생성
    const waveInterval = setInterval(() => {
        if (stageRunning && currentStage === 1) {
            spawnEnemies();
        } else {
            clearInterval(waveInterval); // 조건이 맞지 않으면 생성 중단
            console.log("Stopping enemy wave...");
        }
    }, 3000);

    // 처음 한 번 적 생성
    spawnEnemies();
}

function createEnemies2() {
    const MAX_ROWS = 5;
    for (let row = 0; row < MAX_ROWS; row++) {
        const numEnemies = MAX_ROWS - row;
        const START_X = (canvas.width - numEnemies * enemyImg.width) / 2;
        const y = row * enemyImg.height;
        for (let i = 0; i < numEnemies; i++) {
            const x = START_X + i * enemyImg.width;
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy); // gameObjects에 추가
        }
    }
}
function clearGameObjects() {
    // 보스 타이머 정리
    gameObjects.forEach((obj) => {
        if (obj instanceof Boss) {
            obj.clearBossTimers();
        }
    });

    // 히어로와 보조 우주선을 제외하고 객체 삭제
    gameObjects = gameObjects.filter(go => go.type === "Hero" || go.type === "SideHero");
}
//보스 객체 생성
function createBoss() {
    // 기존 보스 객체가 있다면 타이머를 정리
    gameObjects.forEach((obj) => {
        if (obj.type === "Boss") {
            obj.clearBossTimers();
        }
    });

    // 새 보스 생성
    const boss = new Boss(canvas.width / 2 - 100, 50);
    gameObjects.push(boss);
}
// 이미지 파일을 로드하여 Promise를 반환하는 함수
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}
// 게임 초기화: 게임 객체 생성, 이벤트 리스너 설정, 자동 공격 시작
function initGame() {
    gameObjects = [];
    currentStage = 1; // 첫 번째 스테이지로 초기화
    stageRunning = true;
    stageReady = false;
    startStage(currentStage); // 첫 번째 스테이지 시작
    createHero();
    // 자동 공격 시작
    hero.startAutoAttack(300); // 0.5초 간격으로 공격
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

            // 적 처치 카운트 증가
            enemyKillCount++;
            if (enemyKillCount % 10 === 0) { // 10기 처치마다 속도 증가
                // 이동 속도 증가 (상한선 적용)
                enemySpeedIncrease = Math.min(MAX_SPEED, enemySpeedIncrease + 3);

                // 생성 간격 감소 (하한선 적용)
                spawnInterval = Math.max(MIN_SPAWN_INTERVAL, spawnInterval - 500);

                console.log(
                    `Enemy Speed: ${enemySpeedIncrease}, Spawn Interval: ${spawnInterval}ms`
                );
            }

            if (isEnemiesDead()) {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        }
    });

    eventEmitter.on(Messages.COLLISION_HERO_LASER, (_, { first, second }) => {
        if (second.type === "BossLaser") {
            console.log("Hero Hit by BossLaser!"); // 디버깅 로그
            if (!hero.dead) {
                first.dead = true; // 레이저 제거
                hero.decrementLife(); // 생명 감소
                console.log(`Hero Life Remaining: ${hero.life}`); // 생명 로그 출력
                if (isHeroDead()) {
                    eventEmitter.emit(Messages.GAME_END_LOSS);
                }
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
        console.log(`Stage Cleared! Current Stage: ${currentStage}, Points: ${hero.points}`);
    
        if (currentStage === 1 && hero.points >= 10000) {
            console.log("Transitioning to Boss Stage!");
            currentStage = maxStage; // 보스 스테이지로 이동
            startStage(currentStage);
        } else if (currentStage === 1) {
            console.log("Remaining in Stage 1. Keep playing!");
            stageReady = true; // 스테이지 1에서 적 생성 지속
        } else if (currentStage === maxStage) {
            console.log("Game Completed! You Win!");
            endGame(true); // 게임 종료
        } else {
            console.error("Unexpected Stage Value! CurrentStage:", currentStage);
        }
    });
    
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });

}
// 현재 게임 객체 리스트의 모든 객체를 화면에 그림
function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}
// 게임 객체의 상태를 업데이트하고 충돌을 감지하며 죽은 객체를 필터링함
function updateGameObjects() {   
    // 1. 키 입력에 따른 이동 처리
    updateHeroAndSideHeroes();

    // 2. 게임 객체 상태 업데이트
    updateObjectPositions();

    // 3. 충돌 처리
    handleCollisions();

    // 4. 죽은 객체 제거
    gameObjects = gameObjects.filter((go) => !(go.dead && !go.destroyed));

    // 5. 스테이지 진행 확인
    checkStageProgress();
}
function updateHeroAndSideHeroes() {
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
}
function updateObjectPositions() {
    gameObjects.forEach((obj) => {
        if (obj instanceof Laser || obj instanceof Enemy || obj instanceof Boss) {
            obj.updatePosition?.(); // 객체의 업데이트 메서드가 있으면 호출
        }
    });
}
function handleCollisions() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const bosses = gameObjects.filter((go) => go.type === "Boss");
    const lasers = gameObjects.filter((go) => go.type === "Laser");
    const bossLasers = gameObjects.filter((go) => go.type === "BossLaser");

    // BossLaser와 Hero의 충돌 감지
    bossLasers.forEach((laser) => {
        if (intersectRect(laser.rectFromGameObject(), hero.rectFromGameObject())) {
            console.log("BossLaser Hit Detected!"); // 디버깅 로그
            eventEmitter.emit(Messages.COLLISION_HERO_LASER, {
                first: laser,
                second: laser,
            });
        }
    });

    // 레이저와 적 충돌
    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (!enemy.dead && !enemy.destroyed && intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: laser,
                    second: enemy,
                });
            }
        });

        // 레이저와 보스 충돌 처리
        bosses.forEach((boss) => {
            if (!boss.dead && intersectRect(laser.rectFromGameObject(), boss.rectFromGameObject())) {
                console.log("Boss Hit!"); // 디버깅 로그
                boss.takeDamage(10); // 레이저 데미지 확인
                laser.dead = true; // 레이저 제거
            }
        });
    });

    // 히어로와 적 충돌
    enemies.forEach((enemy) => {
        if (!enemy.dead && intersectRect(hero.rectFromGameObject(), enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });
}
function checkStageProgress() {
    if (!stageRunning || !stageReady) return;

    console.log(
        `Current Stage: ${currentStage}, Hero Points: ${hero.points}`
    );

    // 점수가 10,000점 이상이면 보스 스테이지로 이동
    if (hero.points >= 10000 && currentStage !== 3) {
        console.log("Transitioning to Boss Stage!");
        stageRunning = false; // 현재 스테이지 중단
        currentStage = 3; // 보스 스테이지로 설정
        startStage(currentStage); // 보스 스테이지 시작
    } else if (currentStage === 3) {
        // 보스 스테이지가 완료되었는지 확인
        const remainingBosses = gameObjects.filter(
            (go) => go.type === "Boss" && !go.dead
        );
        if (remainingBosses.length === 0) {
            console.log("All stages cleared!");
            stageRunning = false;
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    }
}
function nextStage() {
    if (currentStage === 1 && hero.points >= 10000) {
        console.log("Proceeding to Boss Stage!");
        currentStage = 3;
        startStage(currentStage);
    } else {
        console.log("Not enough points to proceed to Boss Stage.");
        stageReady = true;
    }
}
function startStage(stage) {
    clearGameObjects(); // 이전 스테이지의 객체 제거
    console.log(`Starting Stage ${stage}`);
    stageRunning = true; // 스테이지 진행 중 설정
    stageReady = false; // 스테이지 준비 상태 초기화

    // 스테이지 시작 메시지 표시
    displayMessage(`Stage ${stage}`, "yellow");
    setTimeout(() => {
        if (stage === 1) {
            createEnemiesWave(); // 스테이지 1: 적 무한 생성
        } else if (stage === 3) {
            createBoss(); // 보스 생성
        } else {
            console.error("Invalid stage:", stage);
        }
        stageReady = true; // 스테이지 준비 완료
    }, 3000); // 1초 대기 후 스테이지 시작
}
// 두 사각형이 겹치는지 확인하여 true/false를 반환
function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right || // r2가 r1의 오른쪽에 있음
        r2.right < r1.left || // r2가 r1의 왼쪽에 있음
        r2.top > r1.bottom || // r2가 r1의 아래에 있음
        r2.bottom < r1.top // r2가 r1의 위에 있음
    );
}
// 대상 객체의 이미지를 파괴된 상태로 변경한 뒤 일정 시간 후에 제거
function showDestroyedImage(target, destroyedImage, duration = 500) {
    target.img = destroyedImage; 
    target.destroyed = true;     
    setTimeout(() => {
        target.dead = true;      
        target.destroyed = false; // destroyed 상태를 false로 되돌림
    }, duration);
}
// 보조 우주선들이 일정 간격으로 자동 공격하도록 타이머를 설정
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
// Hero의 생명(목숨)을 화면 우측 하단에 표시
function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
    lifeImg,
    START_POS + (45 * (i+1) ),
    canvas.height - 37);
    }
}
// Hero의 점수를 화면 좌측 하단에 표시
function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}
// 주어진 텍스트를 지정된 좌표에 표시
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}
// Hero가 죽었는지 확인하여 true/false를 반환
function isHeroDead() {
    return hero.life <= 0;
}
// 모든 적이 죽었는지 확인하여 true/false를 반환
function isEnemiesDead() {
    const enemies = gameObjects.filter(
        (go) => (go.type === "Enemy" || go.type === "Boss") && !go.dead
  );
    console.log(`Remaining enemies: ${enemies.length}`); // 디버깅용 로그
    return enemies.length === 0; // 적이나 보스가 모두 죽었으면 true 반환
}
// 화면 중앙에 메시지를 표시
function displayMessage(message, color = "red") {
    ctx.save(); // 현재 캔버스 상태 저장
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore(); // 캔버스 상태 복원
}
// 보조 우주선의 자동 공격 타이머를 모두 해제
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
// 게임 종료 시 처리: 타이머 정지, 배경 초기화, 결과 메시지 표시
function endGame(win) {
    // 1. 게임 루프 및 타이머 정리
    clearInterval(gameLoopId);
    clearAutoAttackTimers();

    // 2. 상태 변수 초기화
    stageRunning = false;
    stageReady = false;
    currentStage = 1; // 스테이지를 초기화하거나 유지

    setTimeout(() => {
        // 3. 화면 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (backImg) {
            const bgPattern = ctx.createPattern(backImg, 'repeat');
            ctx.fillStyle = bgPattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 4. 메시지 표시
        displayMessage(
            win
                ? "Victory!!! Press [Enter] to start a new game"
                : "You died!!! Press [Enter] to restart the game",
            win ? "green" : "red"
        );

        // 5. 게임 재시작 대기
        window.addEventListener("keydown", handleRestart);
    }, 200);
}
function handleRestart(event) {
    if (event.key === "Enter") {
        window.removeEventListener("keydown", handleRestart); // 리스너 제거
        resetGame(); // 게임 리셋
    }
}
// 게임 리셋: 게임 루프 중지, 객체 초기화, 새 게임 루프 시작
function resetGame() {
    // 초기값 상수 정의
    const INITIAL_SPEED = 5; // 적 초기 이동 속도
    const INITIAL_SPAWN_INTERVAL = 5000; // 적 초기 생성 간격 (5초)

    // 적 속도 및 생성 간격 초기화
    enemySpeedIncrease = INITIAL_SPEED; 
    spawnInterval = INITIAL_SPAWN_INTERVAL; 
    enemyKillCount = 0; 

    if (gameLoopId) {
        clearInterval(gameLoopId);
        clearAutoAttackTimers(); // 보조 우주선 타이머 정리
        eventEmitter.clear();    // 이벤트 리스너 정리
    }

    // 모든 보스 및 적 타이머 정리
    gameObjects.forEach((obj) => {
        if (obj.type === "Boss") {
            obj.clearBossTimers(); // 보스 타이머 정리
        }
    });

    // 게임 객체 및 상태 초기화
    clearGameObjects();
    currentStage = 1;
    stageRunning = false;
    stageReady = false;

    // 게임 재시작
    initGame();

    // 게임 루프 재시작
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bgPattern = ctx.createPattern(backImg, 'repeat');
        ctx.fillStyle = bgPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawPoints();
        drawLife();

        // 보스 체력 표시 (보스가 있을 때만)
        const boss = gameObjects.find(go => go.type === "Boss");
        drawBossHealth(boss)

        updateGameObjects();
        drawGameObjects(ctx);
    }, 100);
}
function nextStage() {
    if (currentStage === 1 && hero.points >= 10000) {
        console.log("Proceeding to Boss Stage!");
        currentStage = 3;
        startStage(currentStage);
    } else {
        console.log("Not enough points to proceed to Boss Stage.");
        stageReady = true;
    }
}
// `startStage` 함수에서 `createEnemiesWave` 호출로 변경
function startStage(stage) {
    clearGameObjects(); // 이전 스테이지 객체 초기화
    stageRunning = true;
    stageReady = false;

    console.log(`Starting Stage ${stage}`);
    setTimeout(() => {
        if (stage === 1) {
            createEnemiesWave(); // 무한 적 생성
        } else if (stage === 3) {
            createBoss(); // 보스 생성
        } else {
            console.error("Invalid stage:", stage);
        }
        stageReady = true; // 스테이지 준비 완료
    }, 1000);
}
function clearGameObjects() {
    // 보스 타이머 정리
    gameObjects.forEach((go) => {
        if (go.type === "Boss") {
            go.clearBossTimers(); // 보스 타이머 정리
        }
    });

    // 히어로와 보조 우주선을 제외하고 객체 제거
    gameObjects = gameObjects.filter(
        (go) => go.type === "Hero" || go.type === "SideHero"
    );
}

const MAX_SPEED = 20; // 적 이동 속도의 상한선
const MIN_SPAWN_INTERVAL = 1000; // 적 생성 간격의 하한선

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
    bossImg,
    gameLoopId,
    currentStage,
    maxStage = 3,
    blaserImg,
    enemyKillCount = 0,// 처치된 적 수
    enemySpeedIncrease = 5, // 초기 이동 속도 증가 값
    spawnInterval = 5000, // 적 생성 간격 (ms)
    stageRunning, // 스테이지 진행 여부
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
    blaserImg = await loadTexture("assets/laserGreen.png");
    lifeImg = await loadTexture("assets/life.png");
    bossImg = await loadTexture("assets/enemyUFO.png");
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

        // 보스 체력 표시 (보스가 있을 때만)
        const boss = gameObjects.find(go => go.type === "Boss");
        drawBossHealth(boss);

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
        }
    }); 
    
    
};