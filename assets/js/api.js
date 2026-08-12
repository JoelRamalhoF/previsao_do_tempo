/**
 * @fileoverview Lógica principal do aplicativo de previsão do tempo.
 * - Geocodificação de cidades (Open-Meteo Geocoding API)
 * - Clima atual e previsão diária (Open-Meteo Forecast API)
 * - Mapeamento de códigos de tempo para ícones e descrições
 * - Atualização dinâmica da interface, cores e mensagens
 * - Comparação de até 3 cidades
 */

const FORECAST_DAYS = 7;

/**
 * Converte um código weathercode da Open-Meteo em um rótulo e categoria.
 * @param {number} code
 * @returns {{label: string, category: 'clear'|'cloudy'|'rain'|'snow'|'storm'|'fog'}}
 */
function mapWeatherCode(code) {
    const c = Number(code);

    if (c === 0) return { label: 'Céu limpo', category: 'clear' };
    if (c === 1 || c === 2) return { label: 'Parcialmente nublado', category: 'clear' };
    if (c === 3) return { label: 'Nublado', category: 'cloudy' };
    if (c === 45 || c === 48) return { label: 'Nevoeiro', category: 'fog' };

    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) {
        return { label: 'Chuva', category: 'rain' };
    }

    if ([71, 73, 75, 77, 85, 86].includes(c)) {
        return { label: 'Neve', category: 'snow' };
    }

    if ([95, 96, 99].includes(c)) {
        return { label: 'Tempestade', category: 'storm' };
    }

    return { label: 'Condição desconhecida', category: 'cloudy' };
}

/**
 * Define a classe de tema no <body> de acordo com o código de tempo e dia/noite.
 * @param {number} weatherCode
 * @param {boolean} isDay
 */
function applyTheme(weatherCode, isDay) {
    if (typeof document === 'undefined') return;

    const { category } = mapWeatherCode(weatherCode);
    const body = document.body;

    body.classList.remove('theme-default', 'theme-sunny', 'theme-cloudy', 'theme-rainy', 'theme-storm', 'theme-night');

    if (!isDay) {
        body.classList.add('theme-night');
        return;
    }

    switch (category) {
        case 'clear':
            body.classList.add('theme-sunny');
            break;
        case 'rain':
            body.classList.add('theme-rainy');
            break;
        case 'storm':
            body.classList.add('theme-storm');
            break;
        case 'fog':
        case 'cloudy':
        default:
            body.classList.add('theme-cloudy');
            break;
    }
}

/**
 * Busca coordenadas (latitude, longitude, timezone) de uma cidade.
 * @param {string} cityName
 * @returns {Promise<Object|null>}
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
 * Obtém clima atual e previsão diária.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} timezone
 * @returns {Promise<Object|null>}
 */
async function getWeatherData(latitude, longitude, timezone) {
    const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current_weather=true` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max,relative_humidity_2m_max` +
        `&timezone=${encodeURIComponent(timezone || 'auto')}`;

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
 * Retorna o ícone SVG apropriado para o clima atual.
 * @param {number} weatherCode
 * @param {boolean} isDay
 * @returns {string}
 */
function getIconByWeatherCode(weatherCode, isDay) {
    const code = Number(weatherCode);
    const { category } = mapWeatherCode(code);

    if (category === 'clear') {
        return isDay ? 'wi-day-sunny.svg' : 'wi-night-clear.svg';
    }

    if (category === 'cloudy') {
        return isDay ? 'wi-day-cloudy.svg' : 'wi-night-cloudy.svg';
    }

    if (category === 'fog') {
        return isDay ? 'wi-day-fog.svg' : 'wi-night-fog.svg';
    }

    if (category === 'rain') {
        return isDay ? 'wi-day-rain.svg' : 'wi-night-rain.svg';
    }

    if (category === 'snow') {
        return isDay ? 'wi-day-snow.svg' : 'wi-night-snow.svg';
    }

    if (category === 'storm') {
        return isDay ? 'wi-day-thunderstorm.svg' : 'wi-night-thunderstorm.svg';
    }

    return 'wi-na.svg';
}

/**
 * Atualiza o <img> do ícone de clima.
 * @param {string} iconFileName
 */
function setWeatherIcon(iconFileName) {
    if (typeof document === 'undefined') return;

    const iconElement = document.getElementById('weather-icon');
    if (!iconElement) return;

    iconElement.src = `assets/weather-icons/svg/${iconFileName}`;
    iconElement.alt = iconFileName.replace('.svg', '');
}

/**
 * Função de alto nível que integra geocodificação e previsão.
 * @param {string} cityName
 * @returns {Promise<Object>}
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

    if (!weatherData || !weatherData.current_weather || !weatherData.daily) {
        return { error: 'Erro ao obter dados do tempo' };
    }

    return {
        city: `${coordinates.name}${coordinates.country ? ', ' + coordinates.country : ''}`,
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        timezone: weatherData.timezone,
        current: {
            temperature: weatherData.current_weather.temperature,
            windSpeed: weatherData.current_weather.windspeed,
            windDirection: weatherData.current_weather.winddirection,
            weatherCode: weatherData.current_weather.weathercode,
            isDay: weatherData.current_weather.is_day === 1,
            time: weatherData.current_weather.time,
            humidity: weatherData.daily.relative_humidity_2m_max?.[0] ?? null,
            precipitation: weatherData.daily.precipitation_sum?.[0] ?? 0
        },
        daily: weatherData.daily
    };
}

/**
 * Gera recomendações com base nos dados retornados.
 * @param {Object} weather
 * @returns {Array<{icon: string, text: string}>}
 */
function buildAdvice(weather) {
    const items = [];
    if (!weather || !weather.current) return items;

    const { current, daily } = weather;
    const { category } = mapWeatherCode(current.weatherCode);
    const todayIndex = 0;

    const temp = current.temperature;
    const precipToday = daily.precipitation_sum?.[todayIndex] ?? 0;
    const precipProbToday = daily.precipitation_probability_max?.[todayIndex] ?? 0;
    const maxWindToday = daily.windspeed_10m_max?.[todayIndex] ?? current.windSpeed;
    const uvToday = daily.uv_index_max?.[todayIndex] ?? 0;

    if (category === 'rain' || precipToday > 0 || precipProbToday >= 40) {
        items.push({
            icon: '☔',
            text: 'Chuva prevista para hoje. Leve um guarda-chuva e proteja-se em locais cobertos.'
        });
    }

    if (category === 'storm') {
        items.push({
            icon: '⛈️',
            text: 'Tempestade prevista. Procure um local seguro, evite áreas abertas e regiões com muitas árvores.'
        });
    }

    if (maxWindToday >= 40) {
        items.push({
            icon: '💨',
            text: 'Ventos fortes na região. Evite ficar próximo a árvores ou estruturas instáveis.'
        });
    }

    if (temp >= 30 || uvToday >= 6) {
        items.push({
            icon: '🌞',
            text: 'Tempo muito quente e/ou UV elevado. Use protetor solar, óculos escuros e mantenha-se hidratado.'
        });
    }

    if (temp <= 10) {
        items.push({
            icon: '🧣',
            text: 'Temperaturas baixas. Vista roupas adequadas e proteja-se do frio.'
        });
    }

    if (items.length === 0) {
        items.push({
            icon: '✅',
            text: 'Condições relativamente estáveis para hoje. Ainda assim, acompanhe a previsão ao longo do dia.'
        });
    }

    return items;
}

/**
 * Preenche o card de clima atual.
 * @param {Object} weather
 */
function renderCurrentWeather(weather) {
    if (typeof document === 'undefined') return;
    const { city, timezone, current } = weather;

    const cityEl = document.getElementById('city-name');
    const tzEl = document.getElementById('timezone-label');
    const tempEl = document.getElementById('temp-value');
    const windInfoEl = document.getElementById('wind-info');
    const windSpeedEl = document.getElementById('wind-speed');
    const windDirEl = document.getElementById('wind-direction');
    const descEl = document.getElementById('weather-description');
    const codeEl = document.getElementById('weather-code');
    const periodEl = document.getElementById('day-period');
    const timeEl = document.getElementById('weather-time');
    const humidityEl = document.getElementById('humidity-value');
    const precipEl = document.getElementById('precipitation-value');

    if (cityEl) cityEl.textContent = city;
    if (tzEl) tzEl.textContent = timezone || '';
    if (tempEl) tempEl.textContent = current.temperature.toFixed(1);

    const windInfo = `${current.windSpeed.toFixed(1)} km/h • ${current.windDirection.toFixed(0)}°`;
    if (windInfoEl) windInfoEl.textContent = windInfo;
    if (windSpeedEl) windSpeedEl.textContent = current.windSpeed.toFixed(1);
    if (windDirEl) windDirEl.textContent = current.windDirection.toFixed(0);

    const { label } = mapWeatherCode(current.weatherCode);
    if (descEl) descEl.textContent = label;
    if (codeEl) codeEl.textContent = String(current.weatherCode);

    const periodText = current.isDay ? 'Dia' : 'Noite';
    if (periodEl) periodEl.textContent = periodText;
    if (timeEl) timeEl.textContent = current.time;

    if (humidityEl) {
        if (current.humidity != null) {
            humidityEl.textContent = `${current.humidity.toFixed(0)}%`;
        } else {
            humidityEl.textContent = '‑';
        }
    }

    if (precipEl) {
        precipEl.textContent = `${current.precipitation.toFixed(1)} mm`;
    }

    const iconFile = getIconByWeatherCode(current.weatherCode, current.isDay);
    setWeatherIcon(iconFile);

    applyTheme(current.weatherCode, current.isDay);

    const adviceList = document.getElementById('advice-list');
    if (adviceList) {
        adviceList.innerHTML = '';
        const adviceItems = buildAdvice(weather);
        adviceItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'advice-item';
            li.innerHTML = `<span class="advice-icon">${item.icon}</span><span class="advice-text">${item.text}</span>`;
            adviceList.appendChild(li);
        });
    }
}

/**
 * Monta a lista de previsão (até FORECAST_DAYS).
 * @param {Object} daily
 */
function renderForecast(daily) {
    if (typeof document === 'undefined') return;

    const listEl = document.getElementById('forecast-list');
    const selectedSection = document.getElementById('selected-day');

    if (!listEl || !selectedSection) return;

    listEl.innerHTML = '';
    selectedSection.classList.add('hidden');

    const days = daily.time || [];
    const total = Math.min(days.length, FORECAST_DAYS);

    for (let i = 0; i < total; i++) {
        const dateStr = daily.time[i];
        const max = daily.temperature_2m_max?.[i];
        const min = daily.temperature_2m_min?.[i];
        const wCode = daily.weathercode?.[i];
        const precip = daily.precipitation_sum?.[i] ?? 0;
        const wind = daily.windspeed_10m_max?.[i] ?? 0;

        const dateObj = new Date(dateStr + 'T00:00:00');
        const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
        const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
        const weekday = weekdayFormatter.format(dateObj);
        const dayLabel = dayFormatter.format(dateObj);

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'forecast-day';
        item.dataset.index = String(i);

        const { label, category } = mapWeatherCode(wCode);
        const dayIconFile = getIconByWeatherCode(wCode, true); // usa versão diurna como ícone padrão

        item.innerHTML = `
    <div class="forecast-date">
        <div class="forecast-date-main">
            <img class="forecast-icon" src="assets/weather-icons/svg/${dayIconFile}" alt="${label}">
            <div class="forecast-date-text">
                <span class="forecast-weekday">${weekday.charAt(0).toUpperCase() + weekday.slice(1)}</span>
                <span class="forecast-desc">${dayLabel}</span>
            </div>
        </div>
    </div>
    <div class="forecast-temps">
        <span class="max">${max != null ? max.toFixed(0) : '‑'}°</span>
        <span class="min">${min != null ? min.toFixed(0) : '‑'}°</span>
    </div>
    <div class="forecast-precip">
        💧 ${precip.toFixed(1)} mm
    </div>
    <div class="forecast-wind">
        💨 ${wind.toFixed(1)} km/h
    </div>
`;

        item.addEventListener('click', () => {
            document.querySelectorAll('.forecast-day').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            renderSelectedDay(i, daily);
        });

        listEl.appendChild(item);
    }

    if (days.length < FORECAST_DAYS) {
        console.info(`A API retornou apenas ${days.length} dias de previsão.`);
    }
}

/**
 * Mostra o detalhe do dia selecionado.
 * @param {number} index
 * @param {Object} daily
 */
function renderSelectedDay(index, daily) {
    if (typeof document === 'undefined') return;

    const labelEl = document.getElementById('selected-day-label');
    const maxEl = document.getElementById('selected-max-temp');
    const minEl = document.getElementById('selected-min-temp');
    const descEl = document.getElementById('selected-description');
    const humEl = document.getElementById('selected-humidity');
    const windEl = document.getElementById('selected-wind');
    const precEl = document.getElementById('selected-precipitation');
    const section = document.getElementById('selected-day');

    if (!labelEl || !maxEl || !minEl || !descEl || !humEl || !windEl || !precEl || !section) return;

    const dateStr = daily.time[index];
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    labelEl.textContent = formatter.format(dateObj);

    const max = daily.temperature_2m_max?.[index];
    const min = daily.temperature_2m_min?.[index];
    const wCode = daily.weathercode?.[index];
    const precip = daily.precipitation_sum?.[index] ?? 0;
    const wind = daily.windspeed_10m_max?.[index] ?? 0;
    const humidity = daily.relative_humidity_2m_max?.[index] ?? null;

    maxEl.textContent = max != null ? max.toFixed(1) : '‑';
    minEl.textContent = min != null ? min.toFixed(1) : '‑';

    const { label } = mapWeatherCode(wCode);
    descEl.textContent = label;

    humEl.textContent = humidity != null ? `${humidity.toFixed(0)}%` : '‑';
    windEl.textContent = `${wind.toFixed(1)} km/h`;
    precEl.textContent = `${precip.toFixed(1)} mm`;

    section.classList.remove('hidden');
}

/**
 * Atualiza toda a interface com o objeto retornado por getWeatherByCity.
 * @param {Object} data
 */
function updateUI(data) {
    if (typeof document === 'undefined') return;

    const weatherResult = document.getElementById('weather-result');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (!weatherResult || !errorMessage || !errorText) return;

    if (data.error) {
        weatherResult.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorText.textContent = data.error;
        applyTheme(3, true); // tema neutro nublado
        return;
    }

    errorMessage.classList.add('hidden');
    renderCurrentWeather(data);
    renderForecast(data.daily);

    weatherResult.classList.remove('hidden');
}

// ========== Comparação de cidades ==========

/**
 * Array de cidades para comparação.
 * @type {string[]}
 */
let comparisonCities = [];

/**
 * Adiciona uma cidade à lista de comparação.
 * @param {string} cityName
 */
function addCityToComparison(cityName) {
    if (comparisonCities.length >= 3) {
        alert('Você só pode comparar até 3 cidades.');
        return;
    }

    const normalized = cityName.trim();
    if (!normalized) return;

    // Evita duplicatas exatas
    if (comparisonCities.some(c => c.toLowerCase() === normalized.toLowerCase())) {
        alert('Essa cidade já está na lista de comparação.');
        return;
    }

    comparisonCities.push(normalized);
    renderComparisonList();
}

/**
 * Remove uma cidade da lista de comparação.
 * @param {number} index
 */
function removeCityFromComparison(index) {
    if (index < 0 || index >= comparisonCities.length) return;
    comparisonCities.splice(index, 1);
    renderComparisonList();
}

/**
 * Renderiza a lista de cidades adicionadas para comparação.
 */
function renderComparisonList() {
    if (typeof document === 'undefined') return;

    const listEl = document.getElementById('compare-list');
    const addBtn = document.getElementById('add-city-btn');

    if (!listEl) return;

    listEl.innerHTML = '';

    comparisonCities.forEach((city, index) => {
        const item = document.createElement('div');
        item.className = 'compare-city-item';
        item.innerHTML = `
            <span>${city}</span>
            <button class="remove-city-btn" type="button" aria-label="Remover ${city}" title="Remover">
                ✕
            </button>
        `;

        const removeBtn = item.querySelector('.remove-city-btn');
        removeBtn.addEventListener('click', () => {
            removeCityFromComparison(index);
        });

        listEl.appendChild(item);
    });

    if (addBtn) {
        addBtn.disabled = comparisonCities.length >= 3;
        addBtn.style.opacity = comparisonCities.length >= 3 ? '0.6' : '1';
        addBtn.style.cursor = comparisonCities.length >= 3 ? 'not-allowed' : 'pointer';
    }
}

/**
 * Compara as cidades atualmente na lista.
 */
async function compareCities() {
    if (typeof document === 'undefined') return;

    const resultSection = document.getElementById('compare-result');
    const tableBody = document.getElementById('compare-table-body');

    if (!resultSection || !tableBody) return;

    if (comparisonCities.length === 0) {
        alert('Adicione pelo menos uma cidade para comparar.');
        return;
    }

    resultSection.classList.add('hidden');
    tableBody.innerHTML = '';

    // Busca clima de cada cidade
    const promises = comparisonCities.map(city => getWeatherByCity(city));
    const results = await Promise.all(promises);

    // Renderiza tabela
    results.forEach((data, index) => {
        const row = document.createElement('tr');

        if (data.error) {
            row.innerHTML = `
                <td>${comparisonCities[index]}</td>
                <td colspan="4" style="color: var(--danger);">Erro ao obter dados: ${data.error}</td>
            `;
        } else {
            const { city, current } = data;
            const { label } = mapWeatherCode(current.weatherCode);
            const iconFile = getIconByWeatherCode(current.weatherCode, current.isDay);

            row.innerHTML = `
                <td>${city}</td>
                <td class="weather-cell">
                    <img class="weather-icon" src="assets/weather-icons/svg/${iconFile}" alt="${label}">
                    <span>${label}</span>
                </td>
                <td>${current.temperature.toFixed(1)}°C</td>
                <td>${current.humidity != null ? current.humidity.toFixed(0) + '%' : '‑'}</td>
                <td>${current.windSpeed.toFixed(1)} km/h</td>
            `;
        }

        tableBody.appendChild(row);
    });

    resultSection.classList.remove('hidden');
}

/**
 * Limpa toda a lista de comparação.
 */
function clearComparison() {
    comparisonCities = [];
    renderComparisonList();

    const resultSection = document.getElementById('compare-result');
    if (resultSection) {
        resultSection.classList.add('hidden');
    }
}

// ---------- Inicialização / Formulário ----------

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

        // Seletor de idiomas – por enquanto só registra o idioma escolhido em localStorage
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang) {
                    localStorage.setItem('clima_lang', lang);
                    console.info(`Idioma selecionado: ${lang} (tradução ainda não implementada)`);
                    // Aqui no futuro você pode chamar uma função applyTranslations(lang)
                }
            });
        });

        // Carrega idioma salvo (para uso futuro)
        const savedLang = localStorage.getItem('clima_lang');
        if (savedLang) {
            console.info(`Idioma carregado: ${savedLang}`);
        }

        // ---------- Comparação de cidades ----------

        const compareForm = document.getElementById('compare-form');
        const compareCityInput = document.getElementById('compare-city-input');
        const compareBtn = document.getElementById('compare-btn');
        const clearCompareBtn = document.getElementById('clear-compare-btn');

        if (compareForm && compareCityInput) {
            compareForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const cityName = compareCityInput.value.trim();
                if (!cityName) {
                    alert('Por favor, digite o nome de uma cidade');
                    return;
                }

                addCityToComparison(cityName);
                compareCityInput.value = '';
            });
        }

        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                compareCities();
            });
        }

        if (clearCompareBtn) {
            clearCompareBtn.addEventListener('click', () => {
                clearComparison();
            });
        }
    });
}

// ---------- Exports para Jest ----------

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCityCoordinates,
        getWeatherData,
        getWeatherByCity,
        getIconByWeatherCode,
        mapWeatherCode,
        buildAdvice
    };
}