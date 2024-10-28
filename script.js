// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoibWl0aHVuc2cwOCIsImEiOiJjbTJzbGF1MWcxanFyMmxzM2U0MHE5OG5yIn0.VNR_-X-4BxkLhEyX1F06sQ';

// OpenWeatherMap API Key
const weatherApiKey = 'dd740e37a94937f0bcfb43f3f82f4d17';

// Create Mapbox map instance
let map;

function initializeMap(lat, lon) {
    // Initialize the map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lon, lat],
        zoom: 8
    });

    // Add navigation controls (zoom in/out)
    map.addControl(new mapboxgl.NavigationControl());

    // Add a marker for the user's location
    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);

    // Add weather overlay
    addWeatherLayer(lat, lon);
}

function addWeatherLayer(lat, lon) {
    // OpenWeatherMap Tile Layer for clouds (or other weather types)
    map.on('load', () => {
        map.addSource('clouds', {
            type: 'raster',
            tiles: [
                `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${weatherApiKey}`
            ],
            tileSize: 256
        });

        map.addLayer({
            id: 'clouds-layer',
            type: 'raster',
            source: 'clouds',
            paint: {
                'raster-opacity': 0.7
            }
        });
    });
}

// Automatically get weather by user's location on page load
window.onload = function() {
    getWeatherByLocation();
};

// Function to get weather by city name
async function getWeather() {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;

    try {
        const response = await fetch(weatherUrl);
        const weatherData = await response.json();

        if (weatherData.cod === 200) {
            displayCurrentWeather(weatherData);
            initializeMap(weatherData.coord.lat, weatherData.coord.lon);
        } else {
            alert("City not found!");
        }
    } catch (error) {
        alert("Failed to fetch weather data");
        console.error(error);
    }
}

// Fetch weather and initialize map based on user's location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;

            try {
                const response = await fetch(weatherUrl);
                const weatherData = await response.json();

                if (weatherData.cod === 200) {
                    displayCurrentWeather(weatherData);
                    initializeMap(latitude, longitude);
                } else {
                    alert("Weather data not found!");
                }
            } catch (error) {
                alert("Failed to fetch weather data");
                console.error(error);
            }
        }, error => {
            alert("Unable to retrieve location. Please enter a city name.");
            console.error(error);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to map weather conditions to emojis
function getWeatherEmoji(description) {
    const desc = description.toLowerCase();
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("clouds")) return "☁️";
    if (desc.includes("rain")) return "🌧️";
    if (desc.includes("drizzle")) return "🌦️";
    if (desc.includes("thunderstorm")) return "⛈️";
    if (desc.includes("snow")) return "❄️";
    if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
    return "🌡️";
}

function displayCurrentWeather(data) {
    const { name } = data;
    const { temp, humidity } = data.main;
    const { main, description } = data.weather[0];
    const { speed } = data.wind;

    const emoji = getWeatherEmoji(description);

    document.getElementById("currentWeather").innerHTML = `
        <h2>${name} ${emoji}</h2>
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Condition:</strong> ${main} - ${description}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${speed} m/s</p>
    `;
}
