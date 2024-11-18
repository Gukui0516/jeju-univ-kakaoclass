function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    })
}

window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const heroImg = await loadTexture('assets/player.png');
    const enemyImg = await loadTexture('assets/enemyShip.png');
    const backImg = await loadTexture('assets/starBackground.png');

    // 배경색 설정
    const bgPattern = ctx.createPattern(backImg, 'repeat');
    ctx.fillStyle = bgPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 플레이어 우주선 크기 설정
    const heroWidth = 100; // 플레이어 우주선 너비
    const heroHeight = 100; // 플레이어 우주선 높이

    // 플레이어 우주선의 위치
    const heroX = canvas.width / 2 - heroWidth / 2;
    const heroY = canvas.height - (canvas.height / 4);
    ctx.drawImage(heroImg, heroX, heroY, heroWidth, heroHeight);
    
    // 보조 우주선 크기 설정
    const sideOffset = heroWidth + 20; // 보조 우주선 간격
    const supportWidth = 30; // 보조 우주선 너비
    const supportHeight = 30; // 보조 우주선 높이

    // 보조 우주선 배치 (왼쪽과 오른쪽)
    ctx.drawImage(heroImg, heroX - sideOffset + 55, heroY, supportWidth, supportHeight); // 왼쪽 보조 우주선
    ctx.drawImage(heroImg, heroX + sideOffset, heroY, supportWidth, supportHeight); // 오른쪽 보조 우주선

    // 적 우주선 배치
    createEnemies2(ctx, canvas, enemyImg);
};

function createEnemies(ctx, canvas, enemyImg) {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += enemyImg.width) {
        for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);
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