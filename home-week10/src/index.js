import axios from 'axios';

const uploadContainer = document.getElementById('uploadContainer');
const imageInput = document.getElementById('imageInput');
const fileNameDisplay = document.getElementById('fileName');
const uploadLabel = document.getElementById('uploadLabel');
const formatSelect = document.getElementById('format');
const convertButton = document.getElementById('convertButton');
const apiTokenInput = document.getElementById('apiToken');
const loadingContainer = document.getElementById('loadingContainer');
const loadingMessage = document.getElementById('loadingMessage');
const resultMessage = document.getElementById('resultMessage');
const downloadButton = document.getElementById('downloadButton');
const retryButton = document.getElementById('retryButton');
const title = document.getElementById('title'); // 제목 요소 추가
const mainElements = [
    uploadContainer,
    fileNameDisplay,
    formatSelect,
    convertButton,
    apiTokenInput,
    document.querySelector('.main-image'),
    document.querySelector('.description'),
];

let fileBlob = null; // Blob 데이터를 저장할 변수
let fileName = "converted-file"; // 기본 파일 이름

// --- 페이지 로드 시 저장된 토큰 불러오기 ---
document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('convertApiToken'); // 저장된 토큰 가져오기
    if (savedToken) {
        apiTokenInput.value = savedToken; // 입력 필드에 저장된 토큰 값 설정
        console.log("저장된 토큰이 로드되었습니다:", savedToken);
    }
});

// --- 토큰 값이 변경될 때 저장 ---
apiTokenInput.addEventListener('change', () => {
    const newToken = apiTokenInput.value.trim(); // 입력된 토큰 값
    localStorage.setItem('convertApiToken', newToken); // 토큰 저장
    console.log("새 토큰이 저장되었습니다:", newToken);
});

// 업로드 및 변환 관련 코드
uploadContainer.addEventListener('click', () => {
    imageInput.click();
});

uploadContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadContainer.classList.add('dragover');
    uploadLabel.textContent = "이미지를 여기에 놓으세요";
});

uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.classList.remove('dragover');
    uploadLabel.innerHTML = `여기로 이미지를 드래그하거나 <span>파일을 업로드하세요</span>`;
});

uploadContainer.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadContainer.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        imageInput.files = files;
        displayFileName(files[0].name);
    }
});

imageInput.addEventListener('change', () => {
    if (imageInput.files.length > 0) {
        displayFileName(imageInput.files[0].name);
    }
});

function displayFileName(name) {
    fileNameDisplay.textContent = `선택된 파일: ${name}`;
}

// 변환 버튼 클릭 이벤트
convertButton.addEventListener('click', async () => {
    const imageFile = imageInput.files[0];
    const format = formatSelect.value; // 대상 형식
    const apiToken = apiTokenInput.value;

    if (!apiToken) {
        alert("API 토큰을 입력해주세요.");
        return;
    }

    if (!imageFile) {
        alert("이미지를 업로드해주세요.");
        return;
    }

    // 제목 숨기기 추가
    title.classList.add('hidden');

    mainElements.forEach((element) => element.classList.add('hidden'));
    loadingContainer.classList.remove('hidden');
    downloadButton.classList.add('hidden');
    retryButton.classList.add('hidden');
    loadingMessage.classList.remove('hidden');
    resultMessage.classList.add('hidden');

    try {
        await uploadAndConvertFile(imageFile, format, apiToken);
    } catch (error) {
        console.error("변환 오류:", error);
        showErrorState();
    }
});

// ConvertAPI 파일 업로드 및 변환 함수
async function uploadAndConvertFile(file, targetFormat, apiToken) {
    const formData = new FormData();
    formData.append("File", file); // ConvertAPI에서 요구하는 키 "File"

    const sourceFormat = file.type.split('/')[1]; // 파일 확장자 추출 (예: png, jpg)
    const url = `https://v2.convertapi.com/convert/${sourceFormat}/to/${targetFormat}?Token=${apiToken}`;

    try {
        const response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log(
            "API 응답 데이터 (전체):",
            JSON.stringify(response.data, null, 2)
        );

        if (
            !response.data ||
            !response.data.Files ||
            response.data.Files.length === 0 ||
            !response.data.Files[0].FileData
        ) {
            throw new Error("유효한 응답 데이터가 없습니다.");
        }

        const base64Data = response.data.Files[0].FileData;
        fileName = response.data.Files[0].FileName || "converted-file";

        const binaryData = atob(base64Data);
        const byteNumbers = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            byteNumbers[i] = binaryData.charCodeAt(i);
        }
        fileBlob = new Blob([byteNumbers]);

        showSuccessState();
    } catch (error) {
        console.error("파일 업로드 및 변환 중 오류:", error);
        throw error;
    }
}

// 성공 상태 처리
function showSuccessState() {
    loadingMessage.textContent = "변환 성공! 다운로드 버튼을 클릭하세요.";
    downloadButton.classList.remove('hidden');

    // 제목 다시 표시하려면 필요 시 아래 코드 추가
    // title.classList.remove('hidden');
}

// 실패 상태 처리
function showErrorState() {
    loadingMessage.textContent = "변환 실패! 다시 시도해주세요.";
    retryButton.classList.remove('hidden');
}

// 다운로드 버튼 클릭 이벤트
downloadButton.addEventListener('click', () => {
    if (!fileBlob) {
        alert("파일이 준비되지 않았습니다. 다시 시도해주세요.");
        return;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(fileBlob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// 다시 시도 버튼 클릭 이벤트
retryButton.addEventListener('click', () => {
    location.reload();
});