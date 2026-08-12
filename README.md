# Aplicativo de Previsão do Tempo

Aplicação web simples que exibe a previsão do tempo em tempo real a partir das APIs Open‑Meteo (Geocoding e Weather).  
Construída com HTML, CSS e JavaScript puro, oferece uma interface amigável, responsiva e dinâmica, que alterna automaticamente entre modo diurno e noturno com base nos dados retornados pela API.

## Objetivo

Fornecer um exemplo prático de integração com uma API de clima, utilizando apenas tecnologias web básicas (HTML, CSS e JavaScript puro), com foco em código limpo, testes automatizados com Jest e uma interface simples e intuitiva para consulta de cidades.

## Funcionalidades

- Busca de cidade por nome.
- Consulta à API Open-Meteo para obter o clima atual.
- Exibição de:
  - Nome da cidade
  - Temperatura atual (°C)
  - Velocidade e direção do vento
  - Código de condição de tempo (weathercode)
  - Indicação de **Dia / Noite**
  - Data/hora da medição
- Ícones meteorológicos em SVG (Weather Icons) variando conforme:
  - Condição do tempo (sol, nuvens, chuva, neve, neblina, tempestade etc.)
  - Período (dia ou noite).
- Testes automatizados com **Jest** para as funções principais de integração com a API.

## Tecnologias utilizadas

- **HTML5** para a estrutura da página.
- **CSS3** para layout e estilo responsivo.
- **JavaScript (ES6+)** para lógica de negócio e integração com a API.
- **Jest** para testes unitários.
- **Open-Meteo** (API de clima e geocodificação).
- **Weather Icons (SVG)** para ícones visuais de clima.

## Estrutura do projeto

```text
previsao_do_tempo/
  index.html
  assets/
    css/
      style.css
    js/
      api.js
    weather-icons/
      svg/
        wi-*.svg
  testes/
    api.test.js
  package.json
  README.md
```

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/JoelRamalhoF/previsao_do_tempo.git
   cd previsao_do_tempo
   ```

2. Instale as dependências de desenvolvimento (Jest):

   ```bash
   npm install
   ```

> A aplicação em si não depende de build ou bundler: basta abrir o `index.html` no navegador.

## Como usar

1. Abra o arquivo `index.html` no navegador (duplo clique ou via servidor local).
2. Digite o nome de uma cidade (ex.: São Paulo, Lisboa, Tóquio).
3. Clique em **Buscar**.
4. Veja:
   - A temperatura atual
   - O ícone de clima correspondente (dia/noite)
   - Detalhes de vento, código de tempo e data/hora.

## Testes

O projeto utiliza **Jest** para testar as funções principais do arquivo `api.js`.

### Executar testes

Na raiz do projeto:

```bash
npm test
```

Os testes cobrem cenários como:

- Cidade válida retornando dados meteorológicos.
- Cidade inexistente com erro tratado.
- Falha da API de geocodificação.
- Falha da API de previsão do tempo.
- Limite de requisições excedido (HTTP 429).
- Erros de rede (conexão instável).
- Mudanças inesperadas no formato da resposta JSON.
- Mapeamento de `weathercode` para ícones dia/noite.

## Boas práticas e revisão de código

Durante a etapa de revisão, foram aplicadas as seguintes melhorias:

- Documentação das funções com **JSDoc**, descrevendo parâmetros, retorno e comportamento.
- Tratamento consistente de erros com `try/catch` e logs em `console.error`.
- Separação clara entre:
  - Funções puras de dado (chamadas à API, mapeamento de códigos).
  - Funções de interface (manipulação do DOM).
- Export das funções principais para permitir testes unitários em ambiente Node.

## Licença

Este projeto é de uso educacional. Ajuste a licença conforme a necessidade do seu repositório (por exemplo, MIT, Apache 2.0 etc.).