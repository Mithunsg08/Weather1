$w.onReady(function () {
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeather, handleError);
    } else {
        $w("#location").text = "Geolocation is not supported by this browser.";
    }
});

function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = "dd740e37a94937f0bcfb43f3f82f4d17";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => updateWeatherUI(data))
        .catch(error => console.error("Error fetching weather data:", error));
}

function updateWeatherUI(data) {
    const weatherDescription = data.weather[0].description;
    const weatherEmoji = getWeatherEmoji(weatherDescription);

    $w("#location").text = `${data.name}, ${data.sys.country}`;
    $w("#temperature").text = `${Math.round(data.main.temp)} °F`;
    $w("#description").text = `${weatherEmoji} ${weatherDescription}`;
    $w("#feels-like").text = `${Math.round(data.main.feels_like)} °F`;
    $w("#humidity").text = `${data.main.humidity}%`;
    $w("#wind").text = `${Math.round(data.wind.speed)} mph`;
}

function handleError(error) {
    console.error("Geolocation error:", error);
    $w("#location").text = "Unable to retrieve your location for weather updates.";
}

// Function to get an emoji based on the weather description
function getWeatherEmoji(description) {
    description = description.toLowerCase();

    if (description.includes("clear")) {
        const hours = new Date().getHours();
        return (hours > 6 && hours < 18) ? "☀️" : "🌙"; // Sun for day, moon for night
    } else if (description.includes("clouds")) {
        return "☁️"; // Cloud
    } else if (description.includes("rain")) {
        return "🌧️"; // Rain
    } else if (description.includes("thunderstorm")) {
        return "⛈️"; // Thunderstorm
    } else if (description.includes("snow")) {
        return "❄️"; // Snow
    } else if (description.includes("mist") || description.includes("fog")) {
        return "🌫️"; // Fog or mist
    } else if (description.includes("drizzle")) {
        return "🌦️"; // Drizzle
    } else {
        return "🌡️"; // Default thermometer icon for unknown weather
    }
}
