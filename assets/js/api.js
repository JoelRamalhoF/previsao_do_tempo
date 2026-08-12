/**
 * @fileoverview Funções principais do aplicativo de previsão do tempo.
 * Responsável por:
 * - Buscar coordenadas de cidades na API de geocodificação Open-Meteo
 * - Obter dados meteorológicos atuais pela API de previsão Open-Meteo
 * - Mapear códigos de tempo (weathercode) para ícones SVG
 * - Integrar os dados com a interface HTML do projeto
 */

/**
 * Busca coordenadas (latitude, longitude, timezone) de uma cidade
 * utilizando a API de geocodificação da Open-Meteo.
 *
 * @async
 * @param {string} cityName - Nome da cidade a ser pesquisada (em qualquer idioma).
 * @returns {Promise<Object|null>} Objeto com dados da cidade (name, latitude, longitude, timezone),
 *          ou null caso não encontre resultados ou ocorra erro na requisição.
 * @throws {Error} Pode lançar erro interno se o response.ok for falso, tratado internamente no catch.
 *
 * @example
 * const saoPaulo = await getCityCoordinates('São Paulo');
 * // saoPaulo.latitude -> -23.55
 */
async function getCityCoordinates(cityName) {
    const geocodingUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`;

    try {
        const response = await fetch(geocodingUrl);
        if (!response.ok) throw new Error('Erro na geocodificação');

        const data = await response.json();
        if (!data.results || data.results.length === 0) return null;

        return data.results[0];
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error);
        return null;
    }
}

/**
 * Obtém dados meteorológicos atuais para uma latitude/longitude específica,
 * utilizando a API de previsão da Open-Meteo.
 *
 * @async
 * @param {number} latitude - Latitude da localização.
 * @param {number} longitude - Longitude da localização.
 * @param {string} [timezone='auto'] - Timezone IANA (ex.: "America/Sao_Paulo").
 * @returns {Promise<Object|null>} Objeto JSON retornado pela API da Open-Meteo,
 *          ou null em caso de falha na requisição ou exceção de rede.
 * @throws {Error} Pode lançar erro interno se o response.ok for falso, tratado internamente no catch.
 *
 * @example
 * const weather = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
 * // weather.current_weather.temperature -> 25.0
 */
async function getWeatherData(latitude, longitude, timezone) {
    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${encodeURIComponent(timezone || 'auto')}`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error('Erro na requisição de dados meteorológicos');

        return await response.json();
    } catch (error) {
        console.error('Erro ao obter dados do tempo:', error);
        return null;
    }
}

/**
 * Retorna o nome do arquivo SVG do ícone apropriado com base no código de tempo
 * (weathercode) da Open-Meteo e se é dia ou noite na localização.
 *
 * @param {number} weatherCode - Código de tempo retornado pela API (padrão WMO).
 * @param {boolean} isDay - Indica se é dia (true) ou noite (false) na localização.
 * @returns {string} Nome do arquivo SVG correspondente dentro de assets/weather-icons/svg.
 *
 * @example
 * const iconFile = getIconByWeatherCode(0, true);
 * // iconFile -> "wi-day-sunny.svg"
 */
function getIconByWeatherCode(weatherCode, isDay) {
    const code = Number(weatherCode);

    if (code === 0) return isDay ? 'wi-day-sunny.svg' : 'wi-night-clear.svg';
    if (code === 1 || code === 2) return isDay ? 'wi-day-sunny-overcast.svg' : 'wi-night-partly-cloudy.svg';
    if (code === 3) return isDay ? 'wi-day-cloudy.svg' : 'wi-night-cloudy.svg';
    if (code === 45 || code === 48) return isDay ? 'wi-day-fog.svg' : 'wi-night-fog.svg';
    if (code === 51 || code === 53 || code === 55) return isDay ? 'wi-day-sprinkle.svg' : 'wi-night-sprinkle.svg';
    if (code === 56 || code === 57) return isDay ? 'wi-day-sleet.svg' : 'wi-night-sleet.svg';
    if (code === 61 || code === 63 || code === 65) return isDay ? 'wi-day-rain.svg' : 'wi-night-rain.svg';
    if (code === 66 || code === 67) return isDay ? 'wi-day-rain-mix.svg' : 'wi-night-rain-mix.svg';
    if (code === 71 || code === 73 || code === 75) return isDay ? 'wi-day-snow.svg' : 'wi-night-snow.svg';
    if (code === 77) return 'wi-snowflake-cold.svg';
    if (code === 80 || code === 81 || code === 82) return isDay ? 'wi-day-showers.svg' : 'wi-night-showers.svg';
    if (code === 85 || code === 86) return isDay ? 'wi-day-snow-wind.svg' : 'wi-night-snow-wind.svg';
    if (code === 95) return isDay ? 'wi-day-thunderstorm.svg' : 'wi-night-thunderstorm.svg';
    if (code === 96 || code === 99) return isDay ? 'wi-day-sleet-storm.svg' : 'wi-night-sleet-storm.svg';

    return 'wi-na.svg';
}

/**
 * Atualiza o elemento de imagem do ícone de clima na interface,
 * alterando o atributo src para o arquivo SVG informado.
 *
 * @param {string} iconFileName - Nome do arquivo SVG (ex.: "wi-day-sunny.svg").
 * @returns {void}
 *
 * @example
 * setWeatherIcon('wi-night-clear.svg');
 */
function setWeatherIcon(iconFileName) {
    if (typeof document === 'undefined') return; // segurança para Jest / Node

    const iconElement = document.getElementById('weather-icon');
    if (!iconElement) return;

    iconElement.src = `assets/weather-icons/svg/${iconFileName}`;
    iconElement.alt = iconFileName.replace('.svg', '');
}

/**
 * Função de alto nível que integra geocodificação e previsão:
 * - Busca coordenadas da cidade
 * - Busca dados de clima para essas coordenadas
 * - Retorna um objeto consolidado para uso no front-end
 *
 * @async
 * @param {string} cityName - Nome da cidade digitado pelo usuário.
 * @returns {Promise<Object>} Objeto com dados consolidados ou um objeto { error: string }
 *          em caso de erro ou cidade não encontrada.
 *
 * @example
 * const result = await getWeatherByCity('Lisboa');
 * if (!result.error) {
 *   console.log(result.temperature);
 * }
 */
async function getWeatherByCity(cityName) {
    const coordinates = await getCityCoordinates(cityName);

    if (!coordinates) {
        return { error: 'Cidade não encontrada' };
    }

    const weatherData = await getWeatherData(
        coordinates.latitude,
        coordinates.longitude,
        coordinates.timezone
    );

    if (!weatherData || !weatherData.current_weather) {
        return { error: 'Erro ao obter dados do tempo' };
    }

    return {
        city: coordinates.name,
        temperature: weatherData.current_weather.temperature,
        windSpeed: weatherData.current_weather.windspeed,
        windDirection: weatherData.current_weather.winddirection,
        weatherCode: weatherData.current_weather.weathercode,
        time: weatherData.current_weather.time,
        timezone: weatherData.timezone,
        isDay: weatherData.current_weather.is_day === 1
    };
}

/**
 * Atualiza a interface HTML com os dados retornados por getWeatherByCity.
 * Esconde/mostra mensagens de erro e altera o ícone de clima.
 *
 * @param {Object} data - Objeto retornado por getWeatherByCity.
 * @param {string} [data.error] - Mensagem de erro, quando presente.
 * @returns {void}
 */
function updateUI(data) {
    if (typeof document === 'undefined') return; // segurança para Jest

    const weatherResult = document.getElementById('weather-result');
    const errorMessage = document.getElementById('error-message');

    if (data.error) {
        if (weatherResult) weatherResult.classList.add('hidden');
        if (errorMessage) errorMessage.classList.remove('hidden');
        setWeatherIcon('wi-na.svg');
        return;
    }

    document.getElementById('city-name').textContent = data.city;
    document.getElementById('temp-value').textContent = data.temperature;
    document.getElementById('wind-speed').textContent = data.windSpeed;
    document.getElementById('wind-direction').textContent = data.windDirection;
    document.getElementById('weather-code').textContent = data.weatherCode;
    document.getElementById('weather-time').textContent = data.time;

    const period = data.isDay ? 'Dia' : 'Noite';
    const dayPeriodSpan = document.getElementById('day-period');
    if (dayPeriodSpan) dayPeriodSpan.textContent = period;

    const iconFile = getIconByWeatherCode(data.weatherCode, data.isDay);
    setWeatherIcon(iconFile);

    if (weatherResult) weatherResult.classList.remove('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
}

// Listener do formulário – apenas no navegador
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('weather-form');
        const cityInput = document.getElementById('city-input');

        if (!form || !cityInput) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const cityName = cityInput.value.trim();
            if (!cityName) {
                alert('Por favor, digite o nome de uma cidade');
                return;
            }

            const weatherData = await getWeatherByCity(cityName);
            updateUI(weatherData);
        });
    });
}

// Exporta funções para testes com Jest (não afeta uso no navegador)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCityCoordinates,
        getWeatherData,
        getWeatherByCity,
        getIconByWeatherCode
    };
}