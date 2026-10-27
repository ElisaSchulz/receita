# Receitas

Site de receitas em português, feito com HTML, CSS e JavaScript simples (sem framework) e hospedado no GitHub Pages.

## Estrutura

```
index.html          página inicial com a lista de receitas
receita.html        página de uma receita (receita.html?r=<nome>)
css/estilo.css      visual do site (pensado primeiro para celular)
js/receitas.js      lê os arquivos JSON e monta as páginas
receitas/index.json lista com o nome de cada receita, na ordem em que aparecem
receitas/<nome>.json uma receita por arquivo
imagens/            fotos das receitas
```

## Como adicionar uma receita

1. Coloque a foto em `imagens/`, por exemplo `imagens/bolo-de-cenoura.jpg`.
2. Copie `receitas/torta-cafe-da-manha-frango-hash-brown.json` para `receitas/bolo-de-cenoura.json` e troque o conteúdo. O nome do arquivo deve usar só letras minúsculas sem acento, números e hífens.
3. Acrescente `"bolo-de-cenoura"` na lista de `receitas/index.json`.

Campos de cada receita:

| Campo | O que é |
| --- | --- |
| `titulo` | Nome da receita |
| `categoria` | Etiqueta opcional, por exemplo "Café da manhã" |
| `descricao` | Texto curto de apresentação |
| `foto`, `fotoAlt` | Caminho da foto e descrição dela para leitores de tela |
| `preparo`, `forno`, `tempoTotal`, `rendimento` | Tempos e rendimento |
| `ingredientes` | Lista de `{ "item": "...", "nota": "..." }`. A `nota` é opcional e aparece em itálico |
| `modoDePreparo` | Lista de passos, numerados automaticamente |
| `dicasTitulo`, `dicas` | Título opcional da seção e lista de parágrafos de dicas |
| `credito` | `{ "nome", "url", "observacao" }` da receita original |

## Ver no computador

O navegador não deixa a página ler os arquivos JSON se você abrir o `index.html` direto. Rode um servidor simples na pasta do projeto:

```
python3 -m http.server 8000
```

e abra http://localhost:8000.
