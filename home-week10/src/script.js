// script.js
const clientId = 'YOUR_CLIENT_ID'; // Spotify 개발자 페이지에서 발급받은 Client ID로 변경
const clientSecret = 'YOUR_CLIENT_SECRET'; // Spotify 개발자 페이지에서 발급받은 Client Secret으로 변경
const recommendationsContainer = document.getElementById('recommendations');
const recommendButton = document.getElementById('recommendButton');

recommendButton.addEventListener('click', async () => {
    const token = await getAccessToken();
    if (token) {
        fetchRecommendations(token);
    }
});

async function getAccessToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await result.json();
    return data.access_token;
}

async function fetchRecommendations(token) {
    const response = await fetch('https://api.spotify.com/v1/recommendations?limit=5&seed_genres=pop', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    displayRecommendations(data.tracks);
}

function displayRecommendations(tracks) {
    recommendationsContainer.innerHTML = '';
    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.innerHTML = `
            <p><strong>${track.name}</strong> by ${track.artists[0].name}</p>
            <img src="${track.album.images[0].url}" alt="${track.name}" width="200px">
        `;
        recommendationsContainer.appendChild(trackElement);
    });
}
