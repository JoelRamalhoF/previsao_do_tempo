/**
 * Testes para as funções do arquivo assets/js/api.js
 * Jest roda em Node, então usamos mocks de fetch.
 */

const {
    getCityCoordinates,
    getWeatherData,
    getWeatherByCity,
    getIconByWeatherCode,
    mapWeatherCode,
    buildAdvice
} = require('../assets/js/api.js');

// Mock global fetch
global.fetch = jest.fn();

describe('Função getCityCoordinates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Nome de cidade válido retorna objeto com coordenadas', async () => {
        const fakeResponse = {
            results: [
                {
                    name: 'São Paulo',
                    country: 'Brasil',
                    latitude: -23.55,
                    longitude: -46.63,
                    timezone: 'America/Sao_Paulo'
                }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fakeResponse
        });

        const result = await getCityCoordinates('São Paulo');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();
        expect(result).toMatchObject({
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63
        });
    });

    test('Nome de cidade inexistente retorna null (exceção tratada)', async () => {
        const fakeResponse = { results: [] };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fakeResponse
        });

        const result = await getCityCoordinates('CidadeQueNaoExiste123');
        expect(result).toBeNull();
    });

    test('Falha na API de geocodificação retorna null', async () => {
        fetch.mockResolvedValueOnce({
            ok: false
        });

        const result = await getCityCoordinates('São Paulo');
        expect(result).toBeNull();
    });
});

describe('Função getWeatherData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Retorna dados meteorológicos com current_weather e daily', async () => {
        const fakeWeather = {
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
            current_weather: {
                temperature: 25,
                windspeed: 10,
                winddirection: 180,
                weathercode: 1,
                is_day: 1,
                time: '2026-08-12T13:00'
            },
            daily: {
                time: ['2026-08-12'],
                temperature_2m_max: [28],
                temperature_2m_min: [19],
                weathercode: [1],
                precipitation_sum: [0],
                precipitation_probability_max: [10],
                windspeed_10m_max: [15],
                uv_index_max: [6],
                relative_humidity_2m_max: [70]
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fakeWeather
        });

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('current_weather');
        expect(result).toHaveProperty('daily');
    });

    test('Falha na API de tempo retorna null', async () => {
        fetch.mockResolvedValueOnce({ ok: false });

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(result).toBeNull();
    });

    test('Limite de requisições excedido (HTTP 429) retorna null', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests'
        });

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(result).toBeNull();
    });

    test('Conexão de rede instável (fetch rejeita) retorna null', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(result).toBeNull();
    });
});

describe('Função getWeatherByCity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Cidade válida retorna objeto consolidado com current e daily', async () => {
        const fakeGeo = {
            name: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo'
        };

        const fakeWeather = {
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
            current_weather: {
                temperature: 25,
                windspeed: 10,
                winddirection: 180,
                weathercode: 1,
                is_day: 1,
                time: '2026-08-12T13:00'
            },
            daily: {
                time: ['2026-08-12'],
                temperature_2m_max: [28],
                temperature_2m_min: [19],
                weathercode: [1],
                precipitation_sum: [0],
                precipitation_probability_max: [10],
                windspeed_10m_max: [15],
                uv_index_max: [6],
                relative_humidity_2m_max: [70]
            }
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [fakeGeo] })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => fakeWeather
            });

        const result = await getWeatherByCity('São Paulo');

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(result.error).toBeUndefined();
        expect(result).toMatchObject({
            city: 'São Paulo, Brasil',
            timezone: 'America/Sao_Paulo'
        });
        expect(result.current).toBeDefined();
        expect(result.daily).toBeDefined();
    });

    test('Cidade inexistente retorna objeto de erro', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [] })
        });

        const result = await getWeatherByCity('CidadeQueNaoExiste123');

        expect(result).toMatchObject({
            error: 'Cidade não encontrada'
        });
    });

    test('Mudança inesperada no formato da resposta JSON é tratada', async () => {
        const fakeGeo = {
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo'
        };

        const malformedWeather = {
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo'
            // sem current_weather ou daily
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [fakeGeo] })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => malformedWeather
            });

        const result = await getWeatherByCity('São Paulo');
        expect(result).toMatchObject({
            error: 'Erro ao obter dados do tempo'
        });
    });
});

describe('Mapeamento de códigos e ícones', () => {
    test('mapWeatherCode retorna categoria correta para céu limpo', () => {
        const mapped = mapWeatherCode(0);
        expect(mapped.category).toBe('clear');
    });

    test('getIconByWeatherCode retorna ícone de dia para céu limpo', () => {
        const icon = getIconByWeatherCode(0, true);
        expect(icon).toBe('wi-day-sunny.svg');
    });

    test('getIconByWeatherCode retorna ícone de noite para céu limpo', () => {
        const icon = getIconByWeatherCode(0, false);
        expect(icon).toBe('wi-night-clear.svg');
    });
});

describe('Função buildAdvice', () => {
    test('Gera recomendação de guarda-chuva quando há chuva prevista', () => {
        const weather = {
            current: {
                temperature: 22,
                windSpeed: 10,
                weatherCode: 61,
                isDay: 1
            },
            daily: {
                precipitation_sum: [5],
                precipitation_probability_max: [80],
                windspeed_10m_max: [10],
                uv_index_max: [4],
                relative_humidity_2m_max: [80]
            }
        };

        const advice = buildAdvice(weather);
        const hasUmbrellaAdvice = advice.some(a => a.text.toLowerCase().includes('guarda-chuva'));
        expect(hasUmbrellaAdvice).toBe(true);
    });

    test('Gera recomendação de vento forte quando velocidade alta', () => {
        const weather = {
            current: {
                temperature: 20,
                windSpeed: 15,
                weatherCode: 3,
                isDay: 1
            },
            daily: {
                precipitation_sum: [0],
                precipitation_probability_max: [0],
                windspeed_10m_max: [50],
                uv_index_max: [3],
                relative_humidity_2m_max: [60]
            }
        };

        const advice = buildAdvice(weather);
        const hasWindAdvice = advice.some(a => a.text.toLowerCase().includes('ventos fortes'));
        expect(hasWindAdvice).toBe(true);
    });

    test('Gera recomendação de sol/protetor quando UV ou temperatura altos', () => {
        const weather = {
            current: {
                temperature: 32,
                windSpeed: 5,
                weatherCode: 1,
                isDay: 1
            },
            daily: {
                precipitation_sum: [0],
                precipitation_probability_max: [0],
                windspeed_10m_max: [10],
                uv_index_max: [8],
                relative_humidity_2m_max: [40]
            }
        };

        const advice = buildAdvice(weather);
        const hasSunAdvice = advice.some(a => a.text.toLowerCase().includes('protetor solar'));
        expect(hasSunAdvice).toBe(true);
    });
});