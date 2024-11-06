document.querySelectorAll('.plant').forEach(plant => {
    plant.setAttribute('draggable', 'true'); // 드래그 가능 설정

    plant.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id); // 드래그할 데이터 설정
        e.dataTransfer.effectAllowed = 'move';
        
        // 드래그 시작 시 z-index 조정
        e.target.style.zIndex = 3;
    });

    plant.addEventListener('dragend', (e) => {
        e.target.style.zIndex = ''; // z-index 초기화
    });

    plant.addEventListener('dblclick', (e) => {
        // 모든 요소의 z-index를 2로 초기화
        document.querySelectorAll('.plant').forEach(el => {
            el.style.zIndex = 2;
        });

        // 더블 클릭된 요소의 z-index를 3으로 설정
        e.target.style.zIndex = 3;
    });
});

// 드롭 가능한 영역 설정
const dropZone = document.getElementById('terrarium');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // 드롭 가능하게 설정
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const plantId = e.dataTransfer.getData('text'); // 드래그한 요소의 ID 가져오기
    const plantElement = document.getElementById(plantId);

    // 드롭된 위치로 요소 이동
    const offsetX = e.clientX;
    const offsetY = e.clientY;

    // 드롭된 요소를 드롭존에 추가하고 위치 조정
    dropZone.appendChild(plantElement); // 드롭 영역 안으로 요소를 이동시킴
    plantElement.style.position = 'absolute';
    plantElement.style.left = `${offsetX - plantElement.offsetWidth / 2}px`;
    plantElement.style.top = `${offsetY - plantElement.offsetHeight / 2}px`;

    // 드롭 후 z-index 조정
    plantElement.style.zIndex = 2;
});