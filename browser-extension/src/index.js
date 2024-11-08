import axios from 'axios';

const form = document.querySelector('.form-data');
const regionInputs = document.querySelectorAll('.region-name');
const apiKey = document.querySelector('.api-key');
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const clearBtn = document.querySelector('.clear-btn');

const displayCarbonUsage = async (apiKey, regions) => {
    try {
        // 모든 지역 정보 가져오기
        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            const response = await axios.get('https://api.co2signal.com/v1/latest', {
                params: { countryCode: region.value },
                headers: { 'auth-token': apiKey },
            });

            const CO2 = Math.floor(response.data.data.carbonIntensity);
            calculateColor(CO2);

            // 각 결과 항목에 텍스트 설정
            document.querySelector(`.my-region${i + 1}`).textContent = region.value;
            document.querySelector(`.carbon-usage${i + 1}`).textContent =
                `${CO2} grams (grams C02 emitted per kilowatt hour)`;
            document.querySelector(`.fossil-fuel${i + 1}`).textContent =
                `${response.data.data.fossilFuelPercentage.toFixed(2)}% (percentage of fossil fuels used to generate electricity)`;

            loading.style.display = 'none';
            form.style.display = 'none';
            results.style.display = 'block'; // 결과 표시
        }
    } catch (error) {
        console.log(error);
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'Sorry, we have no data for the region(s) you have requested.';
    }
};

const calculateColor = (value) => {
    const co2Scale = [0, 150, 600, 750, 800];
    const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];

    const closestNum = co2Scale.sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
    const scaleIndex = co2Scale.findIndex((element) => element > closestNum);
    const closestColor = colors[scaleIndex];

    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

function setUpUser(apiKey, regionInputs) {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regions', JSON.stringify(Array.from(regionInputs).map((input) => input.value)));
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';
    displayCarbonUsage(apiKey, regionInputs);
}

function handleSubmit(e) {
    e.preventDefault();
    setUpUser(apiKey.value, regionInputs);
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegions = JSON.parse(localStorage.getItem('regions')) || [];

    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: 'green' } });

    if (!storedApiKey || storedRegions.length === 0) {
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else {
        regionInputs.forEach((input, i) => {
            if (storedRegions[i]) input.value = storedRegions[i];
        });
        displayCarbonUsage(storedApiKey, regionInputs);
        results.style.display = 'none';
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }
}

function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regions');
    init();
}

form.addEventListener('submit', handleSubmit);
clearBtn.addEventListener('click', reset);
init();