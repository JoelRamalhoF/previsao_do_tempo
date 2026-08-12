async function getCityCoordinates(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    return data.results[0];
}

async function getWeatherData(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    const response = await fetch(url);
    if (!response.ok) return null;

    return await response.json();
}

function updateUI(data) {
    const weatherResult = document.getElementById('weather-result');
    const errorMessage = document.getElementById('error-message');

    if (data.error) {
        weatherResult.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        return;
    }

    document.getElementById('city-name').textContent = data.city;
    document.getElementById('temp-value').textContent = data.temperature;
    document.getElementById('wind-speed').textContent = data.windSpeed;
    document.getElementById('wind-direction').textContent = data.windDirection;
    document.getElementById('weather-code').textContent = data.weatherCode;
    document.getElementById('weather-time').textContent = data.time;

    weatherResult.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

async function getWeatherByCity(cityName) {
    const city = await getCityCoordinates(cityName);

    if (!city) {
        return { error: true };
    }

    const weather = await getWeatherData(city.latitude, city.longitude);

    if (!weather || !weather.current_weather) {
        return { error: true };
    }

    return {
        city: city.name,
        temperature: weather.current_weather.temperature,
        windSpeed: weather.current_weather.windspeed,
        windDirection: weather.current_weather.winddirection,
        weatherCode: weather.current_weather.weathercode,
        time: weather.current_weather.time
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weather-form');
    const cityInput = document.getElementById('city-input');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const cityName = cityInput.value.trim();

        if (!cityName) return;

        const data = await getWeatherByCity(cityName);
        updateUI(data);
    });
});