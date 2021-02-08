# FIIGuru

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Kalish1/FIIGuru/blob/main/LICENSE)

Disponível em [https://fiiguru.netlify.app/](https://fiiguru.netlify.app/) e [https://kalish1.github.io/FIIGuru/](https://kalish1.github.io/FIIGuru/)

Um ranqueador de Fundos de Investimento Imobiliário que atribui uma nota para quatro diferentes parâmetros dos FIIs:
- **P/VP** 
- **DY Médio** 
- **Liquidez** 
- **Volatilidade**

Após atribuição das notas, faz uma média ponderada totalizando uma **Nota Geral**, da qual serve para atribuir ao FII uma posição no ranking.

---

###### Nota Geral

É o resultado da média ponderada das notas de cada parâmetro, tendo como peso o valor estipulado nos *inputs* do tipo *range*.

###### Nota P/VP

Nota do Preço / Valor Patrimonial é a razão da soma do preço de todas as cotas sendo negociadas no mercado pelo valor do patrimônio do fundo.

###### Nota DY Médio
Nota atribuída a média do [Dividend Yield](https://pt.wikipedia.org/wiki/Dividend_yield) distribuído pelo fundo nos últimos 10 meses.

###### Nota Liquidez
Calculada pela relação entre o número de cotas do fundo e o número de cotistas.

###### Nota Volatilidade
Nota atribuída pelo cálculo da [volatilidade](https://pt.wikipedia.org/wiki/Volatilidade_(finan%C3%A7as)) do preço da cota do fundo nos últimos 12 meses.
