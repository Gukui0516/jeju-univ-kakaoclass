const quotes = [
    '<인생> 잠깐 밖으로 벗어나도 </인생> 큰 문제는 아니였던거 같아요.',
    '땀이 필요한 순간은 운동할때만이 아니다;',
    '너는 사소했지 나는 전부였어 <개발자님 1px만 옮겨주세요>',
    '버그의 꽃말은 그거 기능이에요',
    '잘 모르겠다고? 뒤져볼래? <라이브러리>',
    '듀얼 모니터, 스탠딩 책상, 허먼밀러 의자를 가지고 있는 나는 오늘도 카페를 간다.',
    '요즘 실력좋은 개발자들은 NULL리고 NULL렸다 <by 네카라쿠배당토>',
    '<버그> 태초에 원인이 있었다 나만 모를 뿐',
    '<ChatGPT> 개발에 관해 문학적인 짧은 글귀 만들어줘',
    '<boolean life = true || false;> 세상을 옳고 그름으로 나누게 되면1 Byte로 설명 가능한 삶이 된다.',
    '누가 변수명을 이렇게 지은 나',
];

// 초기값 세팅
let words = []; // 현재 선택된 인용문을 단어 단위로 분할하여 배열로 저장
let wordIndex = 0; // 현재 타이핑해야 할 단어의 인덱스를 추적
let startTime = Date.now(); // 타이핑 시작 시간을 기록하여 총 소요 시간을 계산

// DOM 요소 가져오기
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const typedValueElement = document.getElementById('typed-value');
const modal = document.getElementById('result-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalMessage = document.getElementById('modal-message');
const scoreList = document.getElementById('score-list'); // 오른쪽 스코어 리스트 요소
const closeModalButton = document.getElementById('close-modal');
const startButton = document.getElementById('start');

// HTML 특수 문자를 엔티티로 변환하는 함수
function escapeHtml(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// TOP 3 타임 가져오기
function getTop3Scores() {
    let scores = JSON.parse(localStorage.getItem('scores')) || []; // localStorage에서 점수 배열을 가져옴
    scores.sort((a, b) => a - b); // 점수를 오름차순으로 정렬
    return scores.slice(0, 3); // 상위 3개 점수 반환
}

// 점수를 저장하는 함수
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || []; // 기존 점수 배열을 가져옴
    scores.push(score); // 새로운 점수를 배열에 추가
    localStorage.setItem('scores', JSON.stringify(scores)); // 점수 배열을 JSON 형식으로 localStorage에 저장
}

// TOP 3 타임을 HTML 형식으로 반환
function getTop3Html() {
    const top3Scores = getTop3Scores(); // 상위 3개 점수를 가져옴
    if (top3Scores.length === 0) return "<p>No scores available yet.</p>"; // 저장된 점수가 없을 때 메시지

    const medals = ['🥇', '🥈', '🥉']; // 각 순위에 대한 메달 아이콘
    return top3Scores
        .map((score, index) => `<p>${medals[index]} ${score} 초</p>`)
        .join(''); // 상위 3개 점수를 HTML 형식으로 변환하여 반환
}

// start 버튼 클릭 이벤트
startButton.addEventListener('click', () => {
    // 시작버튼 안보이게, 입력창 보이게
    startButton.style.display = 'none';
    typedValueElement.style.display = 'block';
    typedValueElement.disabled = false;
    typedValueElement.value = '';
    typedValueElement.focus();

    // 무작위로 인용문 선택 및 설정
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    words = quote.split(' ');
    wordIndex = 0;

    // 인용문을 span 태그로 감싸서 표시
    const spanWords = words.map(word => `<span>${escapeHtml(word)} </span>`);
    quoteElement.innerHTML = spanWords.join('');
    quoteElement.childNodes[0].className = 'highlight';
    messageElement.innerText = '';
    startTime = new Date().getTime();

    // 상위 3개 점수를 초기화하여 표시
    scoreList.innerHTML = getTop3Html();
});

// input 입력 필드 이벤트
typedValueElement.addEventListener('input', () => {
    const currentWord = words[wordIndex]; // 현재 타이핑할 단어 저장
    const typedValue = typedValueElement.value; // 입력된 값 저장

    if (typedValue === currentWord && wordIndex === words.length - 1) { // 마지막 단어까지 정확히 입력했는지 확인
        const elapsedTime = new Date().getTime() - startTime; // 소요 시간 계산
        const score = (elapsedTime / 1000).toFixed(2);
        saveScore(score); // 점수 저장

        // 현재 점수와 상위 3개 점수를 업데이트하여 오른쪽에 표시
        modalMessage.innerText = `완벽한 타이핑 입니다!! ${score} 초`;
        scoreList.innerHTML = getTop3Html();

        // 모달창 표시
        showModal();

        // 입력 필드 비활성화
        typedValueElement.disabled = true;
        typedValueElement.style.display = 'none';
    } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) { // 공백으로 끝나고 단어가 일치하는지 확인
        typedValueElement.value = ''; // 입력 필드 초기화
        wordIndex++; // 다음 단어로 이동
        for (const wordElement of quoteElement.childNodes) { // 모든 강조 표시 제거
            wordElement.className = ''; // 클래스 제거
        }
        quoteElement.childNodes[wordIndex].className = 'highlight'; // 다음 단어 강조
    } else if (currentWord.startsWith(typedValue)) { // 현재 단어의 일부가 맞게 입력되었는지 확인
        typedValueElement.className = ''; // 올바르면 클래스 제거
    } else {
        typedValueElement.className = 'error'; // 틀리면 error 클래스 추가
    }
});

// 모달창 표시 함수
function showModal() {
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    startButton.style.display = 'none'; // 시작 버튼 숨기기
}

// 모달 닫기 이벤트 리스너
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    startButton.style.display = 'block'; // 시작 버튼 다시 보이기
});