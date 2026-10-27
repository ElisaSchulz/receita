// Pasta onde ficam os arquivos JSON das receitas.
// Para adicionar uma receita: crie receitas/<nome>.json e acrescente
// o <nome> na lista de receitas/index.json.
const PASTA = "receitas/";

async function carregarJSON(caminho) {
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error("Não foi possível carregar " + caminho);
  return resposta.json();
}

// Cria um elemento com classe e texto (o texto nunca é tratado como HTML).
function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto) el.textContent = texto;
  return el;
}

async function montarLista() {
  const lista = document.getElementById("lista-receitas");
  try {
    const nomes = await carregarJSON(PASTA + "index.json");
    const receitas = await Promise.all(
      nomes.map(nome => carregarJSON(PASTA + nome + ".json").then(r => ({ nome, ...r })))
    );

    lista.innerHTML = "";
    receitas.forEach(r => {
      const item = criar("li");
      const link = criar("a", "cartao-receita");
      link.href = "receita.html?r=" + encodeURIComponent(r.nome);

      const foto = criar("img");
      foto.src = r.foto;
      foto.alt = r.fotoAlt || r.titulo;
      foto.loading = "lazy";

      const texto = criar("div", "cartao-texto");
      if (r.categoria) texto.append(criar("span", "etiqueta", r.categoria));
      texto.append(
        criar("h2", null, r.titulo),
        criar("p", "cartao-info", r.tempoTotal + " · " + r.rendimento)
      );

      link.append(foto, texto);
      item.append(link);
      lista.append(item);
    });
  } catch (erro) {
    lista.innerHTML = "";
    lista.append(criar("li", "aviso", "Não foi possível carregar as receitas."));
    console.error(erro);
  }
}

async function montarReceita() {
  const area = document.getElementById("receita");
  const nome = new URLSearchParams(location.search).get("r");

  // Aceita só nomes simples (letras, números e hífen) para evitar caminhos estranhos.
  if (!nome || !/^[a-z0-9-]+$/.test(nome)) {
    area.innerHTML = "";
    area.append(criar("p", "aviso", "Receita não encontrada."));
    return;
  }

  try {
    const r = await carregarJSON(PASTA + nome + ".json");
    document.title = r.titulo + " | Receitas";
    area.innerHTML = "";

    const foto = criar("img", "receita-foto");
    foto.src = r.foto;
    foto.alt = r.fotoAlt || r.titulo;
    area.append(foto);

    if (r.categoria) area.append(criar("span", "etiqueta", r.categoria));
    area.append(criar("h1", "receita-titulo", r.titulo));
    if (r.descricao) area.append(criar("p", "receita-descricao", r.descricao));

    const tempos = criar("dl", "tempos");
    [
      ["Preparo", r.preparo],
      ["Forno", r.forno],
      ["Tempo total", r.tempoTotal],
      ["Rende", r.rendimento]
    ].forEach(([rotulo, valor]) => {
      if (!valor) return;
      const bloco = criar("div", "tempo");
      bloco.append(criar("dt", null, rotulo), criar("dd", null, valor));
      tempos.append(bloco);
    });
    area.append(tempos);

    const secaoIngredientes = criar("section", "secao");
    secaoIngredientes.append(criar("h2", null, "Ingredientes"));
    const ingredientes = criar("ul", "ingredientes");
    r.ingredientes.forEach(ing => {
      const li = criar("li", null, ing.item);
      if (ing.nota) li.append(criar("em", "nota", "Nota: " + ing.nota));
      ingredientes.append(li);
    });
    secaoIngredientes.append(ingredientes);
    area.append(secaoIngredientes);

    const secaoPreparo = criar("section", "secao");
    secaoPreparo.append(criar("h2", null, "Modo de preparo"));
    const passos = criar("ol", "passos");
    r.modoDePreparo.forEach(passo => passos.append(criar("li", null, passo)));
    secaoPreparo.append(passos);
    area.append(secaoPreparo);

    if (r.dicas && r.dicas.length) {
      const secaoDicas = criar("section", "secao dicas");
      secaoDicas.append(criar("h2", null, r.dicasTitulo || "Dicas"));
      r.dicas.forEach(dica => secaoDicas.append(criar("p", null, dica)));
      area.append(secaoDicas);
    }

    if (r.credito) {
      const credito = criar("p", "credito", "Receita original: ");
      const link = criar("a", null, r.credito.nome);
      link.href = r.credito.url;
      link.target = "_blank";
      link.rel = "noopener";
      credito.append(link);
      if (r.credito.observacao) credito.append(". " + r.credito.observacao);
      area.append(credito);
    }
  } catch (erro) {
    area.innerHTML = "";
    area.append(criar("p", "aviso", "Não foi possível carregar esta receita."));
    console.error(erro);
  }
}
