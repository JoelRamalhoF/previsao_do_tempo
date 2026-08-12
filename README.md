# 🌦️ Aplicativo de Previsão do Tempo

Uma aplicação web completa e interativa que exibe a previsão do tempo em tempo real utilizando a API **Open‑Meteo**. Construída com HTML, CSS e JavaScript puro (Vanilla JS), a interface é totalmente responsiva, dinâmica e internacionalizada, oferecendo dados meteorológicos detalhados com uma experiência de usuário polida e à prova de falhas.

---

## 🎯 Objetivo

Fornecer uma aplicação prática, leve e rápida de consulta climática, utilizando tecnologias web fundamentais (HTML, CSS e JavaScript), com foco absoluto em:
* Código limpo e separação de responsabilidades (Lógica vs. DOM).
* Resiliência a erros e tratamento de exceções.
* Testes automatizados robustos utilizando **Jest**.
* Excelente Experiência do Usuário (UX), com interfaces dinâmicas, validação de ações e adaptação de temas.

---

## ✨ Funcionalidades

* 🔎 **Busca Inteligente com Autocompletar:** Consulta de cidades com lista suspensa para desambiguação de localidades (ex: escolher entre o Tóquio no Japão ou uma localidade homônima no Brasil).
* 🌍 **Internacionalização (i18n):** Suporte nativo para Português, Inglês, Espanhol e Italiano, atualizando textos e datas instantaneamente com base na preferência do usuário.
* 📅 **Previsão Detalhada:**
  * Clima atual (Temperatura, Vento, Umidade, Precipitação).
  * Previsão para os próximos 7 dias.
* ⚖️ **Comparação de Cidades:** Adicione até 3 cidades simultaneamente e compare o clima atual lado a lado.
* 💡 **Recomendações Inteligentes:** Dicas baseadas no clima do dia (ex: alertas para levar guarda-chuva, usar protetor solar devido ao índice UV ou se agasalhar).
* 🎨 **Temas Visuais Dinâmicos:** O layout (cores de fundo e ícones SVG) se adapta automaticamente à condição climática (Ensolarado, Nublado, Chuvoso, Tempestade) e ao período (Dia/Noite).
* 👋 **Onboarding do Usuário:** Modal de boas-vindas com persistência local (`localStorage`), exibido de forma inteligente apenas na primeira visita.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estruturação semântica da aplicação.
* **CSS3:** Estilização, variáveis de tema (Custom Properties) e design responsivo (Mobile-first).
* **JavaScript (ES6+):** Lógica de negócios, consumo de APIs via `fetch`, manipulação do DOM e `localStorage`.
* **Jest:** Framework de testes unitários para a camada de dados.
* **Open‑Meteo API:** Fornecimento gratuito e sem chaves (API Keys) de dados climáticos e geocodificação.
* **Weather Icons:** Conjunto de ícones vetoriais (SVG) para representação meteorológica.

---

## 📁 Estrutura do Projeto

```text
previsao_do_tempo/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── api.js
│   └── weather-icons/
│       └── svg/
│           └── wi-*.svg
├── testes/
│   └── api.test.js
├── package.json
└── README.md
```

---

## 🚀 Instalação

Como a aplicação é construída com tecnologias web nativas, ela não necessita de processos de build complexos (como Webpack ou Vite) para rodar o cliente.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/JoelRamalhoF/previsao_do_tempo.git](https://github.com/JoelRamalhoF/previsao_do_tempo.git)
   cd previsao_do_tempo
   ```

2. **Instale as dependências (para rodar os testes):**
   ```bash
   npm install
   ```

3. **Execute a aplicação:**
   Basta abrir o arquivo `index.html` diretamente no seu navegador, ou utilizar uma extensão como o *Live Server* no VS Code para uma melhor experiência de desenvolvimento.

---

## 💻 Como Usar (Exemplos)

1. **Consultar o Tempo:**
   * Selecione o seu idioma preferido no topo da tela.
   * Digite o nome de uma cidade na barra de busca (ex: "São Paulo").
   * Clique na cidade correta na lista suspensa que aparecerá abaixo do campo de busca.
   * Visualize os detalhes atuais, recomendações e clique nos dias da semana para ver a previsão dos próximos 7 dias.

2. **Comparar Cidades:**
   * Role a página até a seção "Compare até 3 cidades".
   * Digite o nome das cidades desejadas e clique em "Adicionar".
   * Clique em "Comparar Climas" para gerar a tabela lado a lado.

---

## 🧪 Testes Automatizados

O projeto utiliza o **Jest** para garantir que a lógica de negócio (`api.js`) funcione corretamente de forma isolada da interface.

**Para executar os testes:**  
Na raiz do projeto, rode o comando:
```bash
npm test
```

**Os testes cobrem cenários críticos como:**
* ✅ **Sucesso:** Retorno correto de coordenadas e formatação do JSON meteorológico.
* 🚫 **Erros de Usuário:** Comportamento ao buscar cidades inexistentes.
* ⚠️ **Falhas de API:** Limite de requisições (HTTP 429) e quedas de rede tratadas de forma graciosa retornando `null` ou mensagens amigáveis.
* 🎯 **Precisão de Lógica:** Mapeamento assertivo de `weathercodes` para ícones de Dia/Noite e geração correta de alertas de recomendação.

---

## 🧹 Boas Práticas e Arquitetura

* **Documentação com JSDoc:** Funções devidamente documentadas descrevendo parâmetros e tipos de retorno.
* **Isolamento de Eventos (Event Bubbling):** Prevenção de conflitos de formulários usando `event.stopPropagation()`.
* **Tratamento de Exceções:** Uso de `try/catch` para garantir que falhas de conexão não quebrem a aplicação web.
* **Ambientes Isolados:** Exportação condicional via `module.exports` para permitir a testabilidade no ambiente Node (Jest) sem gerar erros no navegador.

---

## 📄 Licença e Autoria

Feito por **Joel Ramalho Filho** - 2026.

Portfólio: [joelramalhof.github.io/portfolio/](https://joelramalhof.github.io/portfolio/)

Este projeto é de uso educacional. Consulte o arquivo de licença do repositório para mais detalhes.