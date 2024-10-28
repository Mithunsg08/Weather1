// Mapbox and OpenWeatherMap API keys
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
const weatherApiKey = 'YOUR_OPENWEATHERMAP_API_KEY';

let map;

function initializeMap(lat, lon) {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lon, lat],
        zoom: 8
    });

    map.addControl(new mapboxgl.NavigationControl());
    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);

    addWeatherLayer(lat, lon);
}

function addWeatherLayer(lat, lon) {
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
            paint: { 'raster-opacity': 0.7 }
        });
    });
}

async function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function getWeather() {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    const data = await response.json();
    
    if (data.cod === 200) {
        const { lat, lon } = data.coord;
        await fetchWeatherData(lat, lon);
    } else {
        alert("City not found!");
    }
}

async function fetchWeatherData(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${weatherApiKey}&units=metric`);
    const weatherData = await response.json();

    displayCurrentWeather(weatherData.current);
    displayDailyForecast(weatherData.daily);
    displayHourlyForecast(weatherData.hourly);

    initializeMap(lat, lon);
}

function displayCurrentWeather(data) {
    const { temp, humidity, wind_speed, weather } = data;
    const description = weather[0].description;
    const emoji = getWeatherEmoji(description);

    document.getElementById("currentWeather").innerHTML = `
        <h2>Current Weather ${emoji}</h2>
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Condition:</strong> ${description}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind_speed} m/s</p>
    `;
}

function displayDailyForecast(daily) {
    const dailyForecastEl = document.getElementById("dailyForecast");
    dailyForecastEl.innerHTML = daily.slice(0, 10).map(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();
        const temp = day.temp.day;
        const description = day.weather[0].description;
        const emoji = getWeatherEmoji(description);
        
        return `
            <div class="forecast-day">
                <p><strong>${date}</strong></p>
                <p>${emoji} ${temp}°C, ${description}</p>
            </div>
        `;
    }).join('');
}

function displayHourlyForecast(hourly) {
    const hourlyForecastEl = document.getElementById("hourlyForecast");
    hourlyForecastEl.innerHTML = hourly.slice(0, 24).map(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = hour.temp;
        const description = hour.weather[0].description;
        const emoji = getWeatherEmoji(description);

        return `
            <div class="forecast-hour">
                <p><strong>${time}</strong></p>
                <p>${emoji} ${temp}°C, ${description}</p>
            </div>
        `;
    }).join('');
}

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
