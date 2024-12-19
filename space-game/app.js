//클래스

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
        this.points += 200;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 35, this.y - 20)); // 레이저 발사
            this.cooldown = 200; // 쿨다운 200ms
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
        (this.width = 49), (this.height = 37);
        this.type = "SideHero";
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 10 , this.y - 25)); // 레이저 발사
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
        this.width = 27;
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
        this.health = 50; // 적의 체력을 200으로 설정 (여러 번 맞을 수 있도록)
        this.maxHealth = this.health; // 최대 체력 설정

        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += this.speed.y; // 이동 속도 반영
            } else {
                this.dead = true; // 바닥에 도달하면 제거
                clearInterval(id); // 타이머 중지
            }
        }, 100); // 이동 간격
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.dead = true; // 체력이 0 이하일 경우 적이 죽음
            hero.incrementPoints(); // 점수 증가
        }
    }
}
class Boss extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 273*0.7;
        this.height = 273*0.7;
        this.type = "Boss";
        this.img = bossImg;
        this.health = 800; // 충분한 체력을 설정
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
                this.fireSemiCircular();
            }
        }, 8000);

        // 플레이어를 조준해서 직선 발사
        this.fireAtPlayer();
        this.targetedFireInterval = setInterval(() => {
            if (!this.dead) {
                this.fireAtPlayer();
            }
        }, 4000); // 4초마다 플레이어 조준 공격
    }

    fireAtPlayer() {
        if (this.cooldown === 0 && !this.dead) {
            const dx = hero.x + hero.width / 2 - (this.x + this.width / 2);
            const dy = hero.y + hero.height / 2 - (this.y + this.height / 2);


            // 발사 각도 조정: 3발을 발사하는데 중심을 기준으로 좌우로 조금씩 발사
            const angleOffset = 0.2; // 각도를 좌우로 조정할 값 (3발이 퍼져서 발사됨)
            
            for (let i = -1; i <= 1; i++) { // -1, 0, 1 로 3발
                const angle = Math.atan2(dy, dx) + i * angleOffset; // 각도를 조금씩 조정
                
                const laser = new Laser(this.x + this.width / 2 - 5, this.y + this.height, true);
                laser.speed = { 
                    x: Math.cos(angle) * 10, // 방향에 맞게 속도 계산
                    y: Math.sin(angle) * 10 
                };
                laser.type = "BossLaser";
                gameObjects.push(laser);
            }
    
        }
    }
    

    fireSemiCircular() {
        const NUM_LASERS = 12; // 발사할 총알 개수
        const radius = 40; // 반원의 반지름
        for (let i = 0; i < NUM_LASERS; i++) {
            const angle = (i * Math.PI) / (NUM_LASERS - 1); // 0에서 Math.PI까지 분배
            const dx = Math.cos(angle) * (radius/4); // X 방향 속도
            const dy = Math.sin(angle) * (radius/4); // Y 방향 속도
    
            const laser = new Laser(this.x + this.width / 2, this.y + this.height / 2, true);
            laser.speed = { x: dx, y: dy };
            laser.type = "BossLaser";
            gameObjects.push(laser);
        }
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

//함수
//게임 진행 관련 함수

// 1. 게임 초기화: 게임 객체 생성, 이벤트 리스너 설정, 자동 공격 시작
function initGame() {
    gameObjects = [];
    currentStage = 1; // 첫 번째 스테이지로 초기화
    stageRunning = true;
    stageReady = false;
    startStage(currentStage); // 첫 번째 스테이지 시작
    createHero();
    // 자동 공격 시작
    hero.startAutoAttack(300); // 0.3초 간격으로 공격
    // 보조 우주선 자동 공격 시작
    const sideHeroes = [sideHero1, sideHero2];
    startAutoAttack(sideHeroes, 500); // 0.5초 간격으로 자동 공격

    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        if (second.type === "Enemy" && !second.dead && !second.destroyed) {
    
            // 체력이 0 이하가 되면 적이 죽은 상태로 처리
            if (second.dead) {
                showDestroyedImage(second, destroyedEnemie, 500); // 이펙트 표시 및 500ms 후 제거
                
    
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
    
            // 레이저 제거
            first.dead = true;
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
// 2. 특정 스테이지를 시작하고 적 또는 보스를 생성.
function startStage(stage) {
    clearGameObjects(); // 이전 스테이지의 객체 제거
    stageRunning = true; // 스테이지 진행 중 설정
    stageReady = false; // 스테이지 준비 상태 초기화

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
// 3. 조건 충족 시 다음 스테이지로 진행.
function nextStage() {
    if (currentStage === 1 && hero.points >= 10000) {
        currentStage = 3;
        startStage(currentStage);
    } else {
        stageReady = true;
    }
}
// 4. 스테이지 진행 상황을 확인하고 보스 스테이지로 전환.
function checkStageProgress() {
    if (!stageRunning || !stageReady) return;

    // 점수가 10,000점 이상이면 보스 스테이지로 이동
    if (hero.points >= 10000 && currentStage !== 3) {
        stageRunning = false; // 현재 스테이지 중단
        currentStage = 3; // 보스 스테이지로 설정
        startStage(currentStage); // 보스 스테이지 시작
    } else if (currentStage === 3) {
        // 보스 스테이지가 완료되었는지 확인
        const remainingBosses = gameObjects.filter(
            (go) => go.type === "Boss" && !go.dead
        );
        if (remainingBosses.length === 0) {
            stageRunning = false;
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    }
}
// 5. 게임 종료 시 처리: 타이머 정지, 배경 초기화, 결과 메시지 표시
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
                ? "이겼다!!! [Enter]를 누르면 게임을 다시 할수있어요!"
                : "죽었다!!! [Enter]를 누르면 게임을 다시 할수있어요 ㅠㅠ",
            win ? "#8b00ff" : "#ff00ff"
        );

        // 5. 게임 재시작 대기
        window.addEventListener("keydown", handleRestart);
    }, 200);
}
// 6. 게임 리셋: 게임 루프 중지, 객체 초기화, 새 게임 루프 시작
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
//
function handleRestart(event) {
    if (event.key === "Enter") {
        window.removeEventListener("keydown", handleRestart); // 리스너 제거
        resetGame(); // 게임 리셋
    }
}


//객체 생성 및 초기화 함수
//7. Hero와 보조 우주선을 생성하고, 초기 위치와 이미지를 설정하며 게임 객체 리스트에 추가함
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
        canvas.width / 2 + 60,
        canvas.height - canvas.height / 5
    );

    hero.img = heroImg;
    sideHero1.img = sideImg;
    sideHero2.img = sideImg;

    gameObjects.push(hero);
    gameObjects.push(sideHero1);
    gameObjects.push(sideHero2);
}
//8. 적 객체를 생성하여 지정된 좌표에 배치하고, 게임 객체 리스트에 추가함
function createEnemiesWave() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;

    function spawnEnemies() {
        if (currentStage !== 1 || !stageRunning) return; // 스테이지가 1이 아니거나 스테이지가 종료되면 생성 중단
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
        }
    }, 3000);

    // 처음 한 번 적 생성
    spawnEnemies();
}
//9. 보스 객체 생성
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
//10. 보스 타이머 정리 및 필요 없는 객체 제거.
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


//그리기 및 화면 표시
//11. 현재 게임 객체 리스트의 모든 객체를 화면에 그림
function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}
//12. 보스 체력 바를 화면에 표시.
function drawBossHealth(boss) {
    if (!boss || boss.dead) return;

    const barWidth = canvas.width * 0.6; // 체력 바 너비
    const barHeight = 20; // 체력 바 높이
    const x = (canvas.width - barWidth) / 2; // 중앙 정렬
    const y = 20; // 캔버스 상단에서 20px 내려옴

    // 체력 바 배경
    ctx.fillStyle = "#808080";
    ctx.fillRect(x, y, barWidth, barHeight);

    // 체력 바 현재 상태
    const healthPercentage = boss.health / boss.maxHealth;
    ctx.fillStyle = "#8b00ff";
    ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);


}
// 적 체력 바를 화면에 표시
function drawEnemyHealth(enemy) {
    if (!enemy || enemy.dead) return; // 적이 없거나 죽은 경우엔 그리지 않음

    const barWidth = enemy.width; // 체력 바의 너비는 적의 너비와 동일
    const barHeight = 5; // 체력 바의 높이
    const x = enemy.x; // 체력 바의 X 좌표 (적의 X 좌표)
    const y = enemy.y - 10; // 체력 바의 Y 좌표 (적의 Y 좌표 위쪽에 표시)

    // 체력 바 배경 (체력의 전체 크기)
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, barWidth, barHeight);

    // 체력 바 현재 상태 (체력 비율에 맞게 표시)
    const healthPercentage = enemy.health / enemy.maxHealth;
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);

}

//13. Hero의 생명(목숨)을 화면 우측 하단에 표시
function drawLife() {
    const START_POS = canvas.width - 180;
    const LIFE_WIDTH = 69.3;  // 원하는 너비로 설정
    const LIFE_HEIGHT = 52.5; // 원하는 높이로 설정
    
    for(let i = 0; i < hero.life; i++) {
        ctx.drawImage(
            lifeImg,
            START_POS + (50 * i),
            canvas.height - 60,
            LIFE_WIDTH,  // 이미지의 너비
            LIFE_HEIGHT  // 이미지의 높이
        );
    }
}
//14. Hero의 점수를 화면 좌측 하단에 표시
function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "#8b00ff";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}
//15. 주어진 텍스트를 지정된 좌표에 표시
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}
//16. 화면 중앙에 메시지를 표시
function displayMessage(message, color = "red") {
    ctx.save(); // 현재 캔버스 상태 저장
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore(); // 캔버스 상태 복원
}


//객체 충돌 및 업데이트
//17. 게임 객체의 상태를 업데이트하고 충돌을 감지하며 죽은 객체를 필터링함
function updateGameObjects() {   
    // 1. 키 입력에 따른 이동 처리
    updateHeroAndSideHeroes();

    // 2. 게임 객체 상태 업데이트
    updateObjectPositions();

    // 3. 충돌 처리
    handleCollisions();

    // 4. 죽은 객체 제거
    gameObjects = gameObjects.filter((go) => !(go.dead && !go.destroyed));

    // 5. 각 적에 대해 체력 표시
    /*
    gameObjects.forEach((go) => {
    if (go.type === "Enemy") { // 적일 때만 체력 표시
        drawEnemyHealth(go); // 각 적의 체력을 화면에 표시
    }
    });
    */

    // 5. 스테이지 진행 확인
    checkStageProgress();
}
//18. 키 입력에 따라 히어로와 보조 우주선 이동.
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
//19. 모든 게임 객체의 위치 업데이트.
function updateObjectPositions() {
    gameObjects.forEach((obj) => {
        if (obj instanceof Laser || obj instanceof Enemy || obj instanceof Boss) {
            obj.updatePosition?.(); // 객체의 업데이트 메서드가 있으면 호출
        }
    });
}
//20. Hero가 죽었는지 확인하여 true/false를 반환
function isHeroDead() {
    return hero.life <= 0;
}
//21. 모든 적이 죽었는지 확인하여 true/false를 반환
function isEnemiesDead() {
    const enemies = gameObjects.filter(
        (go) => (go.type === "Enemy" || go.type === "Boss") && !go.dead
  );
    return enemies.length === 0; // 적이나 보스가 모두 죽었으면 true 반환
}
//게임 내 모든 객체 간 충돌 여부를 확인하고 충돌 이벤트를 발생시켜 적절한 처리를 수행함
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
                // 레이저와 적이 충돌했을 때
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: laser,
                    second: enemy,
                });
                enemy.takeDamage(10); // 적에게 데미지 주기
                laser.dead = true; // 레이저 제거
            }
        });

        // 레이저와 보스 충돌 처리
        bosses.forEach((boss) => {
            if (!boss.dead && intersectRect(laser.rectFromGameObject(), boss.rectFromGameObject())) {
                console.log("Boss Hit!"); // 디버깅 로그
                boss.takeDamage(10); // 보스에게 데미지 주기
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


//공격 및 타이머
//22. 보조 우주선들이 일정 간격으로 자동 공격하도록 타이머를 설정
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
//23. 보조 우주선의 자동 공격 타이머를 모두 해제
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
//24. 대상 객체의 이미지를 파괴된 상태로 변경한 뒤 일정 시간 후에 제거
function showDestroyedImage(target, destroyedImage, duration = 500) {
    target.img = destroyedImage; 
    target.destroyed = true;     
    setTimeout(() => {
        target.dead = true;      
        target.destroyed = false; // destroyed 상태를 false로 되돌림
    }, duration);
}


//유틸리티
//26. 콜라이더 두 사각형이 겹치는지 확인하여 true/false를 반환
function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right || // r2가 r1의 오른쪽에 있음
        r2.right < r1.left || // r2가 r1의 왼쪽에 있음
        r2.top > r1.bottom || // r2가 r1의 아래에 있음
        r2.bottom < r1.top // r2가 r1의 위에 있음
    );
}
//27. 이미지 파일을 로드하여 Promise를 반환하는 함수
function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}


//상수 및 변수
const MAX_SPEED = 20; // 적 이동 속도의 상한선
const MIN_SPAWN_INTERVAL = 200; // 적 생성 간격의 하한선

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
    
    backImg = await loadTexture('myassets/bg.png');
    destroyedEnemie = await loadTexture('myassets/die.png');
    console.log("Destroyed Enemy Image Loaded:", destroyedEnemie);
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("myassets/player.png");
    sideImg = await loadTexture("myassets/side.png")
    enemyImg = await loadTexture("myassets/enemy.png");
    laserImg = await loadTexture("myassets/attackPlayer.png");
    blaserImg = await loadTexture("myassets/AttackEnemy.png");
    lifeImg = await loadTexture("myassets/player.png");
    bossImg = await loadTexture("myassets/bassFish.png");
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
        //case 32: // 스페이스바
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