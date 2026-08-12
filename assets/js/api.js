/**
 * @fileoverview Lógica principal do aplicativo de previsão do tempo.
 * - Geocodificação de cidades (Open-Meteo Geocoding API)
 * - Clima atual e previsão diária (Open-Meteo Forecast API)
 * - Mapeamento de códigos de tempo para ícones e descrições
 * - Atualização dinâmica da interface, cores e mensagens
 * - Comparação de até 3 cidades
 * - Suporte a múltiplos idiomas (i18n) + balão de boas-vindas
 */

const FORECAST_DAYS = 7;

/**
 * Dicionário de traduções por idioma.
 * (Completo para pt-BR, en, es, it. Os demais ainda usam texto base.)
 * @type {Object<string, Object<string, string>>}
 */
const TRANSLATIONS = {
    'pt-BR': {
        'app.title': 'Previsão do Tempo',
        'app.subtitle': 'Clima atual e previsão para os próximos 7 dias',
        'search.placeholder': 'Digite o nome da cidade (ex.: São Paulo, Lisboa, Tóquio)',
        'search.button': 'Buscar previsão',
        'error.cityNotFound': 'Cidade não encontrado. Tente novamente.',
        'current.updatedAt': 'Atualizado em',
        'details.humidity': 'Umidade',
        'details.humidity.short': 'Umidade',
        'details.wind': 'Vento',
        'details.wind.short': 'Vento',
        'details.precipitation': 'Precipitação',
        'details.precipitation.short': 'Precipitação',
        'advice.title': 'Recomendações para hoje',
        'forecast.title': 'Próximos 7 dias',
        'forecast.subtitle': 'Clique em um dia para ver mais detalhes',
        'selectedDay.badge.temperature': 'Temperatura',
        'selectedDay.max': 'Máx',
        'selectedDay.min': 'Mín',
        'selectedDay.badge.details': 'Detalhes',
        'selectedDay.condition': 'Condição',
        'compare.title': 'Compare até 3 cidades',
        'compare.subtitle': 'Adicione cidades e veja o clima atual de cada uma lado a lado',
        'compare.placeholder': 'Digite o nome de uma cidade para comparar',
        'compare.add': 'Adicionar',
        'compare.compare': 'Comparar Climas',
        'compare.clear': 'Limpar tudo',
        'compare.table.city': 'Cidade',
        'compare.table.weather': 'Clima',
        'compare.table.temp': 'Temp',
        'footer.data': 'Dados meteorológicos fornecidos por',
        'footer.madeBy': 'Feito por',
        'footer.github': 'Github',
        'footer.portfolio': 'Portfólio',
        // Condições de clima
        'weather.clear': 'Céu limpo',
        'weather.partlyCloudy': 'Parcialmente nublado',
        'weather.cloudy': 'Nublado',
        'weather.fog': 'Nevoeiro',
        'weather.rain': 'Chuva',
        'weather.snow': 'Neve',
        'weather.storm': 'Tempestade',
        'weather.unknown': 'Condição desconhecida',
        // Advice
        'advice.rain': 'Chuva prevista para hoje. Leve um guarda-chuva e proteja-se em locais cobertos.',
        'advice.storm': 'Tempestade prevista. Procure um local seguro, evite áreas abertas e regiões com muitas árvores.',
        'advice.wind': 'Ventos fortes na região. Evite ficar próximo a árvores ou estruturas instáveis.',
        'advice.hot': 'Tempo muito quente e/ou UV elevado. Use protetor solar, óculos escuros e mantenha-se hidratado.',
        'advice.cold': 'Temperaturas baixas. Vista roupas adequadas e proteja-se do frio.',
        'advice.stable': 'Condições relativamente estáveis para hoje. Ainda assim, acompanhe a previsão ao longo do dia.',
        // Boas-vindas
        'welcome.title': 'Bem-vindo!',
        'welcome.message':
            'Obrigado por visitar este projeto de previsão do tempo. Explore a previsão, compare cidades e, se quiser me conhecer melhor, acesse meu portfólio para ver outros projetos.',
        'welcome.cta': 'Conheça meu portfólio', 

        // Rodapé (Privacidade e Licença)
        'footer.privacy': 'Esta aplicação não coleta, armazena ou compartilha dados pessoais. As buscas são processadas em tempo real e não são registradas.',
        'footer.license': 'sob licença'
    },
    
    'en': {
        'app.title': 'Weather Forecast',
        'app.subtitle': 'Current weather and 7-day forecast',
        'search.placeholder': 'Enter a city name (e.g. São Paulo, Lisbon, Tokyo)',
        'search.button': 'Get forecast',
        'error.cityNotFound': 'City not found. Please try again.',
        'current.updatedAt': 'Updated at',
        'details.humidity': 'Humidity',
        'details.humidity.short': 'Humidity',
        'details.wind': 'Wind',
        'details.wind.short': 'Wind',
        'details.precipitation': 'Precipitation',
        'details.precipitation.short': 'Precipitation',
        'advice.title': 'Recommendations for today',
        'forecast.title': 'Next 7 days',
        'forecast.subtitle': 'Click a day to see more details',
        'selectedDay.badge.temperature': 'Temperature',
        'selectedDay.max': 'Max',
        'selectedDay.min': 'Min',
        'selectedDay.badge.details': 'Details',
        'selectedDay.condition': 'Condition',
        'compare.title': 'Compare up to 3 cities',
        'compare.subtitle': 'Add cities and see current weather side by side',
        'compare.placeholder': 'Enter a city name to compare',
        'compare.add': 'Add',
        'compare.compare': 'Compare weather',
        'compare.clear': 'Clear all',
        'compare.table.city': 'City',
        'compare.table.weather': 'Weather',
        'compare.table.temp': 'Temp',
        'footer.data': 'Weather data provided by',
        'footer.madeBy': 'Made by',
        'footer.github': 'Github',
        'footer.portfolio': 'Portfolio',
        'weather.clear': 'Clear sky',
        'weather.partlyCloudy': 'Partly cloudy',
        'weather.cloudy': 'Cloudy',
        'weather.fog': 'Fog',
        'weather.rain': 'Rain',
        'weather.snow': 'Snow',
        'weather.storm': 'Thunderstorm',
        'weather.unknown': 'Unknown condition',
        'advice.rain': 'Rain expected today. Bring an umbrella and stay in covered areas.',
        'advice.storm': 'Storm expected. Seek shelter, avoid open areas and places with many trees.',
        'advice.wind': 'Strong winds in the area. Avoid staying near trees or unstable structures.',
        'advice.hot': 'Very hot weather and/or high UV. Use sunscreen, sunglasses and stay hydrated.',
        'advice.cold': 'Low temperatures. Wear appropriate clothing and protect yourself from the cold.',
        'advice.stable': 'Relatively stable conditions today. Still, keep an eye on the forecast throughout the day.',
        'welcome.title': 'Welcome!',
        'welcome.message':
            'Thanks for visiting this weather forecast project. Explore the forecast, compare cities, and if you want to know more about me, visit my portfolio to see other projects.',
        'welcome.cta': 'Visit my portfolio', 
        'footer.privacy': 'This application does not collect, store, or share personal data. Searches are processed in real-time and are not logged.',
        'footer.license': 'under license'
    },
    'es': {
        'app.title': 'Previsión del Tiempo',
        'app.subtitle': 'Clima actual y previsión para los próximos 7 días',
        'search.placeholder': 'Escribe el nombre de una ciudad (ej. São Paulo, Lisboa, Tokio)',
        'search.button': 'Buscar previsión',
        'error.cityNotFound': 'Ciudad no encontrada. Inténtalo de nuevo.',
        'current.updatedAt': 'Actualizado en',
        'details.humidity': 'Humedad',
        'details.humidity.short': 'Humedad',
        'details.wind': 'Viento',
        'details.wind.short': 'Viento',
        'details.precipitation': 'Precipitación',
        'details.precipitation.short': 'Precipitación',
        'advice.title': 'Recomendaciones para hoy',
        'forecast.title': 'Próximos 7 días',
        'forecast.subtitle': 'Haz clic en un día para ver más detalles',
        'selectedDay.badge.temperature': 'Temperatura',
        'selectedDay.max': 'Máx',
        'selectedDay.min': 'Mín',
        'selectedDay.badge.details': 'Detalles',
        'selectedDay.condition': 'Condición',
        'compare.title': 'Compara hasta 3 ciudades',
        'compare.subtitle': 'Añade ciudades y ve el clima actual de cada una lado a lado',
        'compare.placeholder': 'Escribe el nombre de una ciudad para comparar',
        'compare.add': 'Añadir',
        'compare.compare': 'Comparar climas',
        'compare.clear': 'Limpiar todo',
        'compare.table.city': 'Ciudad',
        'compare.table.weather': 'Clima',
        'compare.table.temp': 'Temp',
        'footer.data': 'Datos meteorológicos proporcionados por',
        'footer.madeBy': 'Hecho por',
        'footer.github': 'Github',
        'footer.portfolio': 'Portafolio',
        'weather.clear': 'Cielo despejado',
        'weather.partlyCloudy': 'Parcialmente nublado',
        'weather.cloudy': 'Nublado',
        'weather.fog': 'Niebla',
        'weather.rain': 'Lluvia',
        'weather.snow': 'Nieve',
        'weather.storm': 'Tormenta',
        'weather.unknown': 'Condición desconocida',
        'advice.rain': 'Lluvia prevista para hoy. Lleva un paraguas y protégete en lugares cubiertos.',
        'advice.storm': 'Tormenta prevista. Busca un lugar seguro, evita zonas abiertas y áreas con muchos árboles.',
        'advice.wind': 'Vientos fuertes en la zona. Evita estar cerca de árboles o estructuras inestables.',
        'advice.hot': 'Tiempo muy caluroso y/o UV alto. Usa protector solar, gafas de sol y mantente hidratado.',
        'advice.cold': 'Temperaturas bajas. Viste ropa adecuada y protégete del frío.',
        'advice.stable': 'Condiciones relativamente estables hoy. Aun así, sigue la previsión durante el día.',
        'welcome.title': '¡Bienvenido!',
        'welcome.message':
            'Gracias por visitar este proyecto de previsión del tiempo. Explora la previsión, compara ciudades y, si quieres conocerme mejor, visita mi portafolio para ver otros proyectos.',
        'welcome.cta': 'Ver mi portafolio', 
        'footer.privacy': 'Esta aplicación no recopila, almacena ni comparte datos personales. Las búsquedas se procesan en tiempo real y no se registran.',
        'footer.license': 'bajo licencia'
    },
    'it': {
        'app.title': 'Previsioni Meteo',
        'app.subtitle': 'Meteo attuale e previsioni per i prossimi 7 giorni',
        'search.placeholder': 'Inserisci il nome di una città (es. São Paulo, Lisbona, Tokyo)',
        'search.button': 'Cerca previsioni',
        'error.cityNotFound': 'Città non trovata. Riprova.',
        'current.updatedAt': 'Aggiornato alle',
        'details.humidity': 'Umidità',
        'details.humidity.short': 'Umidità',
        'details.wind': 'Vento',
        'details.wind.short': 'Vento',
        'details.precipitation': 'Precipitazioni',
        'details.precipitation.short': 'Precipitazioni',
        'advice.title': 'Consigli per oggi',
        'forecast.title': 'Prossimi 7 giorni',
        'forecast.subtitle': 'Clicca su un giorno per vedere più dettagli',
        'selectedDay.badge.temperature': 'Temperatura',
        'selectedDay.max': 'Max',
        'selectedDay.min': 'Min',
        'selectedDay.badge.details': 'Dettagli',
        'selectedDay.condition': 'Condizione',
        'compare.title': 'Confronta fino a 3 città',
        'compare.subtitle': 'Aggiungi città e vedi il meteo attuale di ciascuna fianco a fianco',
        'compare.placeholder': 'Inserisci il nome di una città da confrontare',
        'compare.add': 'Aggiungi',
        'compare.compare': 'Confronta meteo',
        'compare.clear': 'Pulisci tutto',
        'compare.table.city': 'Città',
        'compare.table.weather': 'Meteo',
        'compare.table.temp': 'Temp',
        'footer.data': 'Dati meteorologici forniti da',
        'footer.madeBy': 'Realizzato da',
        'footer.github': 'Github',
        'footer.portfolio': 'Portfolio',
        'weather.clear': 'Cielo sereno',
        'weather.partlyCloudy': 'Parzialmente nuvoloso',
        'weather.cloudy': 'Nuvoloso',
        'weather.fog': 'Nebbia',
        'weather.rain': 'Pioggia',
        'weather.snow': 'Neve',
        'weather.storm': 'Temporale',
        'weather.unknown': 'Condizione sconosciuta',
        'advice.rain': 'Pioggia prevista oggi. Porta un ombrello e riparati in luoghi coperti.',
        'advice.storm': 'Temporale previsto. Cerca un luogo sicuro, evita aree aperte e zone con molti alberi.',
        'advice.wind': 'Venti forti nella zona. Evita di stare vicino ad alberi o strutture instabili.',
        'advice.hot': 'Molto caldo e/o UV elevato. Usa protezione solare, occhiali da sole e rimani idratato.',
        'advice.cold': 'Temperature basse. Indossa abiti adeguati e proteggiti dal freddo.',
        'advice.stable': 'Condizioni relativamente stabili oggi. Tieni comunque d\'occhio le previsioni.',
        'welcome.title': 'Benvenuto!',
        'welcome.message':
            'Grazie per aver visitato questo progetto di previsioni meteo. Esplora le previsioni, confronta città e, se vuoi conoscermi meglio, visita il mio portfolio per vedere altri progetti.',
        'welcome.cta': 'Visita il mio portfolio', 
        'footer.privacy': 'Questa applicazione non raccoglie, memorizza o condivide dati personali. Le ricerche sono elaborate in tempo reale e non vengono registrate.',
        'footer.license': 'sotto licenza'
    }
    // fr, de, ru, ja, ko, zh podem seguir mesma lógica depois, se você quiser completar.
};

/**
 * Idioma atual.
 * @type {string}
 */
let currentLang = 'pt-BR';

/**
 * Aplica traduções na interface com base no idioma selecionado.
 * @param {string} lang
 */
function applyTranslations(lang) {
    if (typeof document === 'undefined') return;

    // Se a linguagem não existir no dicionário, volta para o pt-BR para evitar misturar textos
    if (!TRANSLATIONS[lang]) {
        lang = 'pt-BR';
    }

    const t = TRANSLATIONS[lang];
    currentLang = lang;

    // Textos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.setAttribute('placeholder', t[key]);
        }
    });

    localStorage.setItem('clima_lang', lang);
}

/**
 * Traduz o label de condição de clima de acordo com o idioma.
 * @param {'clear'|'cloudy'|'rain'|'snow'|'storm'|'fog'} category
 * @returns {string}
 */
function translateWeatherLabel(category) {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['pt-BR'];
    switch (category) {
        case 'clear':
            return t['weather.clear'];
        case 'rain':
            return t['weather.rain'];
        case 'snow':
            return t['weather.snow'];
        case 'storm':
            return t['weather.storm'];
        case 'fog':
            return t['weather.fog'];
        case 'cloudy':
            return t['weather.cloudy'];
        default:
            return t['weather.unknown'];
    }
}

/**
 * Converte um código weathercode em categoria base.
 * A tradução do texto é feita em translateWeatherLabel.
 * @param {number} code
 * @returns {{category: 'clear'|'cloudy'|'rain'|'snow'|'storm'|'fog'}}
 */
function mapWeatherCode(code) {
    const c = Number(code);

    if (c === 0) return { category: 'clear' };
    if (c === 1 || c === 2) return { category: 'clear' };
    if (c === 3) return { category: 'cloudy' };
    if (c === 45 || c === 48) return { category: 'fog' };

    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) {
        return { category: 'rain' };
    }

    if ([71, 73, 75, 77, 85, 86].includes(c)) {
        return { category: 'snow' };
    }

    if ([95, 96, 99].includes(c)) {
        return { category: 'storm' };
    }

    return { category: 'cloudy' };
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

    body.classList.remove(
        'theme-default',
        'theme-sunny',
        'theme-cloudy',
        'theme-rainy',
        'theme-storm',
        'theme-night'
    );

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
    // Pega apenas as duas primeiras letras do idioma atual (ex: 'pt' de 'pt-BR', 'en' de 'en-US')
    const langCode = currentLang.split('-')[0];
    
    // Atualiza a URL para usar a variável langCode no lugar do 'en' fixo
    const geocodingUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=${langCode}&format=json`;

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

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['pt-BR'];

    if (category === 'rain' || precipToday > 0 || precipProbToday >= 40) {
        items.push({
            icon: '☔',
            text: t['advice.rain']
        });
    }

    if (category === 'storm') {
        items.push({
            icon: '⛈️',
            text: t['advice.storm']
        });
    }

    if (maxWindToday >= 40) {
        items.push({
            icon: '💨',
            text: t['advice.wind']
        });
    }

    if (temp >= 30 || uvToday >= 6) {
        items.push({
            icon: '🌞',
            text: t['advice.hot']
        });
    }

    if (temp <= 10) {
        items.push({
            icon: '🧣',
            text: t['advice.cold']
        });
    }

    if (items.length === 0) {
        items.push({
            icon: '✅',
            text: t['advice.stable']
        });
    }

    return items;
}

/**
 * Formata nome do dia da semana no idioma atual.
 */
function formatWeekday(date) {
    const fmt = new Intl.DateTimeFormat(currentLang, { weekday: 'long' });
    const text = fmt.format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formata data curta (dia + mês) no idioma atual.
 */
function formatDayMonth(date) {
    const fmt = new Intl.DateTimeFormat(currentLang, { day: '2-digit', month: 'short' });
    return fmt.format(date);
}

/**
 * Formata data longa para o card do dia selecionado.
 */
function formatFullDate(date) {
    const fmt = new Intl.DateTimeFormat(currentLang, {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
    });
    return fmt.format(date);
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
    const descEl = document.getElementById('weather-description');
    const periodEl = document.getElementById('day-period');
    const timeEl = document.getElementById('weather-time');
    const humidityEl = document.getElementById('humidity-value');
    const precipEl = document.getElementById('precipitation-value');

    if (cityEl) cityEl.textContent = city;
    if (tzEl) tzEl.textContent = timezone || '';
    if (tempEl) tempEl.textContent = current.temperature.toFixed(1);

    const windInfo = `${current.windSpeed.toFixed(1)} km/h • ${current.windDirection.toFixed(0)}°`;
    if (windInfoEl) windInfoEl.textContent = windInfo;

    const { category } = mapWeatherCode(current.weatherCode);
    if (descEl) descEl.textContent = translateWeatherLabel(category);

    const periodTranslations = {
        'pt-BR': { day: 'Dia', night: 'Noite' },
        'en': { day: 'Day', night: 'Night' },
        'es': { day: 'Día', night: 'Noche' },
        'it': { day: 'Giorno', night: 'Notte' }
    };
    const pTrans = periodTranslations[currentLang] || periodTranslations['pt-BR'];
    const periodText = current.isDay ? pTrans.day : pTrans.night;
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
            li.innerHTML =
                `<span class="advice-icon">${item.icon}</span><span class="advice-text">${item.text}</span>`;
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
        const weekday = formatWeekday(dateObj);
        const dayLabel = formatDayMonth(dateObj);

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'forecast-day';
        item.dataset.index = String(i);

        const { category } = mapWeatherCode(wCode);
        const label = translateWeatherLabel(category);
        const dayIconFile = getIconByWeatherCode(wCode, true); // usa versão diurna como ícone padrão

        item.innerHTML = `
    <div class="forecast-date">
        <div class="forecast-date-main">
            <img class="forecast-icon" src="assets/weather-icons/svg/${dayIconFile}" alt="${label}">
            <div class="forecast-date-text">
                <span class="forecast-weekday">${weekday}</span>
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
    labelEl.textContent = formatFullDate(dateObj);

    const max = daily.temperature_2m_max?.[index];
    const min = daily.temperature_2m_min?.[index];
    const wCode = daily.weathercode?.[index];
    const precip = daily.precipitation_sum?.[index] ?? 0;
    const wind = daily.windspeed_10m_max?.[index] ?? 0;
    const humidity = daily.relative_humidity_2m_max?.[index] ?? null;

    maxEl.textContent = max != null ? max.toFixed(1) : '‑';
    minEl.textContent = min != null ? min.toFixed(1) : '‑';

    const { category } = mapWeatherCode(wCode);
    descEl.textContent = translateWeatherLabel(category);

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
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS['pt-BR'];
        weatherResult.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorText.textContent = t['error.cityNotFound'];
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
        alert(
            currentLang === 'en'
                ? 'You can only compare up to 3 cities.'
                : currentLang === 'es'
                    ? 'Solo puedes comparar hasta 3 ciudades.'
                    : 'Você só pode comparar até 3 cidades.'
        );
        return;
    }

    const normalized = cityName.trim();
    if (!normalized) return;

    // Evita duplicatas exatas
    if (comparisonCities.some(c => c.toLowerCase() === normalized.toLowerCase())) {
        alert(
            currentLang === 'en'
                ? 'This city is already in the comparison list.'
                : currentLang === 'es'
                    ? 'Esta ciudad ya está en la lista de comparación.'
                    : 'Essa cidade já está na lista de comparação.'
        );
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
        const t = TRANSLATIONS[currentLang] || TRANSLATIONS['pt-BR'];
        addBtn.disabled = comparisonCities.length >= 3;
        addBtn.style.opacity = comparisonCities.length >= 3 ? '0.6' : '1';
        addBtn.style.cursor = comparisonCities.length >= 3 ? 'not-allowed' : 'pointer';
        addBtn.textContent = t['compare.add'];
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
        alert(
            currentLang === 'en'
                ? 'Add at least one city to compare.'
                : currentLang === 'es'
                    ? 'Añade al menos una ciudad para comparar.'
                    : 'Adicione pelo menos uma cidade para comparar.'
        );
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
            const errorText =
                currentLang === 'en'
                    ? `Error getting data: ${data.error}`
                    : currentLang === 'es'
                        ? `Error al obtener datos: ${data.error}`
                        : `Erro ao obter dados: ${data.error}`;

            row.innerHTML = `
                <td>${comparisonCities[index]}</td>
                <td colspan="4" style="color: var(--danger);">${errorText}</td>
            `;
        } else {
            const { city, current } = data;
            const { category } = mapWeatherCode(current.weatherCode);
            const label = translateWeatherLabel(category);
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

/**
 * Mostra o balão de boas-vindas (apenas 1x por dispositivo).
 */
function maybeShowWelcome() {
    const overlay = document.getElementById('welcome-overlay');
    const closeBtn = document.getElementById('welcome-close');

    if (!overlay || !closeBtn) return;

    const closeWelcome = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        overlay.classList.add('hidden');
        localStorage.setItem('clima_welcome_seen', '1');
    };

    const alreadySeen =
        localStorage.getItem('clima_welcome_seen') === '1';

    if (!alreadySeen) {
        overlay.classList.remove('hidden');
    }

    closeBtn.addEventListener('click', closeWelcome);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeWelcome(event);
        }
    });
}
// ---------- Inicialização / Formulário ----------

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const savedLang = localStorage.getItem('clima_lang') || 'pt-BR';
        applyTranslations(savedLang);

        // Balão de boas-vindas depois de aplicar idioma
        maybeShowWelcome();

        // --- FORMULÁRIO 1: BUSCA PRINCIPAL ---
        const form = document.getElementById('weather-form');
        const cityInput = document.getElementById('city-input');
        const optionsList = document.getElementById('city-options-list');

        if (form && cityInput && optionsList) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                event.stopPropagation();

                const cityName = cityInput.value.trim();
                if (!cityName) return;

                // 1. Busca até 5 opções de cidades na API usando o idioma atual
                const langCode = currentLang.split('-')[0];
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=${langCode}&format=json`;
                
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    
                    if (!data.results || data.results.length === 0) {
                        updateUI({ error: 'Cidade não encontrada' });
                        return;
                    }

                    // 2. Limpa a lista e mostra na tela
                    optionsList.innerHTML = '';
                    optionsList.classList.remove('hidden');

                    // 3. Preenche a lista com as opções para o usuário clicar
                    data.results.forEach(cityObj => {
                        const li = document.createElement('li');
                        li.style.cssText = "padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(148, 163, 184, 0.1); color: var(--text-primary); font-size: 14px; transition: background 0.2s;";
                        li.onmouseover = () => li.style.background = "var(--accent-soft)";
                        li.onmouseout = () => li.style.background = "transparent";
                        
                        // Formata o nome (ex: Tóquio, Tokyo, Japão)
                        const region = cityObj.admin1 ? cityObj.admin1 + ', ' : '';
                        const country = cityObj.country || '';
                        li.textContent = `${cityObj.name} (${region}${country})`;
                        
                        // 4. Quando clicar na opção certa, busca o clima dela
                        li.addEventListener('click', async () => {
                            optionsList.classList.add('hidden'); // esconde a lista
                            cityInput.value = cityObj.name; // atualiza o input
                            
                            // Puxa os dados exatos da coordenada escolhida
                            const weatherData = await getWeatherData(cityObj.latitude, cityObj.longitude, cityObj.timezone);
                            
                            if (!weatherData) {
                                updateUI({ error: 'Erro ao obter dados do tempo' });
                                return;
                            }

                            // Atualiza a tela
                            updateUI({
                                city: `${cityObj.name}, ${country}`,
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
                            });
                        });
                        
                        optionsList.appendChild(li);
                    });

                } catch (e) {
                    updateUI({ error: 'Erro de conexão' });
                }
            });

            // Esconde a lista suspensa se o usuário clicar fora dela
            document.addEventListener('click', (e) => {
                if (!form.contains(e.target)) {
                    optionsList.classList.add('hidden');
                }
            });
        }

        // --- SELETOR DE IDIOMAS ---
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang) {
                    applyTranslations(lang);
                    // Força a recarga da pesquisa atual para traduzir os dias da semana no HTML
                    const currentCityInput = document.getElementById('city-input');
                    if (currentCityInput && currentCityInput.value.trim() !== '') {
                        document.querySelector('#weather-form button[type="submit"]').click();
                    }
                }
            });
        });

        // --- FORMULÁRIO 2: COMPARAÇÃO DE CIDADES ---
        const compareForm = document.getElementById('compare-form');
        const compareCityInput = document.getElementById('compare-city-input');
        const compareBtn = document.getElementById('compare-btn');
        const clearCompareBtn = document.getElementById('clear-compare-btn');

        if (compareForm && compareCityInput) {
            compareForm.addEventListener('submit', (event) => {
                event.preventDefault();
                event.stopPropagation(); // Impede que ative a busca de cima

                const cityName = compareCityInput.value.trim();
                if (!cityName) {
                    alert(
                        currentLang === 'en'
                            ? 'Please enter a city name to compare'
                            : currentLang === 'es'
                                ? 'Por favor, escribe una ciudad para comparar'
                                : 'Por favor, digite uma cidade para comparar'
                    );
                    return;
                }

                addCityToComparison(cityName);
                compareCityInput.value = '';
            });
        }

        if (compareBtn) {
            compareBtn.addEventListener('click', (event) => {
                event.preventDefault();
                compareCities();
            });
        }

        if (clearCompareBtn) {
            clearCompareBtn.addEventListener('click', (event) => {
                event.preventDefault();
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