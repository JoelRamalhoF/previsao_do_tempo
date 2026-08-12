/**
 * Testes para as funções do arquivo assets/js/api.js
 * Jest roda em Node, então precisamos ajustar caminhos e mocks.
 */

const path = require('path');

// Importa funções do api.js
const {
    getCityCoordinates,
    getWeatherData,
    getWeatherByCity,
    getIconByWeatherCode
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

    test('Nome de cidade inexistente retorna null', async () => {
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

    test('Retorna dados meteorológicos para latitude/longitude válidos', async () => {
        const fakeWeather = {
            latitude: -23.55,
            longitude: -46.63,
            current_weather: {
                temperature: 25,
                windspeed: 10,
                winddirection: 180,
                weathercode: 1,
                is_day: 1,
                time: '2026-08-12T13:00'
            },
            timezone: 'America/Sao_Paulo'
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fakeWeather
        });

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('current_weather');
        expect(result.current_weather).toHaveProperty('temperature');
    });

    test('Falha na API de tempo retorna null', async () => {
        fetch.mockResolvedValueOnce({ ok: false });

        const result = await getWeatherData(-23.55, -46.63, 'America/Sao_Paulo');
        expect(result).toBeNull();
    });
});

describe('Função getWeatherByCity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Cidade válida retorna objeto com dados consolidados', async () => {
        const fakeGeo = {
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo'
        };

        const fakeWeather = {
            latitude: -23.55,
            longitude: -46.63,
            current_weather: {
                temperature: 25,
                windspeed: 10,
                winddirection: 180,
                weathercode: 1,
                is_day: 1,
                time: '2026-08-12T13:00'
            },
            timezone: 'America/Sao_Paulo'
        };

        // 1ª chamada: geocoding, 2ª chamada: previsão
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
            city: 'São Paulo',
            temperature: 25,
            windSpeed: 10,
            windDirection: 180,
            weatherCode: 1,
            isDay: true
        });
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

        // current_weather ausente
        const malformedWeather = {
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo'
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

describe('Função getIconByWeatherCode', () => {
    test('Retorna ícone de dia para céu limpo (código 0, isDay=true)', () => {
        const icon = getIconByWeatherCode(0, true);
        expect(icon).toBe('wi-day-sunny.svg');
    });

    test('Retorna ícone de noite para céu limpo (código 0, isDay=false)', () => {
        const icon = getIconByWeatherCode(0, false);
        expect(icon).toBe('wi-night-clear.svg');
    });

    test('Retorna ícone genérico quando código é desconhecido', () => {
        const icon = getIconByWeatherCode(999, true);
        expect(icon).toBe('wi-na.svg');
    });
});