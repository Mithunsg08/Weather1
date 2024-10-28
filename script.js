// Replace with your OpenWeatherMap API key
const weatherApiKey = 'dd740e37a94937f0bcfb43f3f82f4d17';

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
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === 200) {
            displayCurrentWeather(weatherData);
            displayForecast(forecastData);
            displayHourlyForecast(forecastData);
        } else {
            alert("City not found!");
        }
    } catch (error) {
        alert("Failed to fetch weather data");
        console.error(error);
    }
}

// Function to get weather by user's current location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;

            try {
                const [weatherResponse, forecastResponse] = await Promise.all([
                    fetch(weatherUrl),
                    fetch(forecastUrl)
                ]);
                const weatherData = await weatherResponse.json();
                const forecastData = await forecastResponse.json();

                if (weatherData.cod === 200) {
                    displayCurrentWeather(weatherData);
                    displayForecast(forecastData);
                    displayHourlyForecast(forecastData);
                } else {
                    alert("Location-based weather not found!");
                }
            } catch (error) {
                alert("Failed to fetch weather data by location");
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

function displayCurrentWeather(data) {
    const { name } = data;
    const { temp, humidity } = data.main;
    const { main, description } = data.weather[0];
    const { speed } = data.wind;

    document.getElementById("currentWeather").innerHTML = `
        <h2>${name}</h2>
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Condition:</strong> ${main} - ${description}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${speed} m/s</p>
    `;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = '';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        forecastContainer.innerHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <p>${day.main.temp}°C</p>
                <p>${day.weather[0].main}</p>
            </div>
        `;
    });
}

function displayHourlyForecast(data) {
    const hours = data.list.slice(0, 8);
    const labels = hours.map(hour => new Date(hour.dt * 1000).getHours() + ':00');
    const temps = hours.map(hour => hour.main.temp);

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: '#ff6347',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
