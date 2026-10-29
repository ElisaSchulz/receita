// Pasta onde ficam os arquivos JSON das receitas.
// Para adicionar uma receita: crie receitas/<nome>.json e acrescente
// o <nome> na lista de receitas/index.json.
const PASTA = "receitas/";

// Textos fixos da página em cada idioma. A receita escolhe o idioma
// pelo campo "idioma" ("pt" é o padrão, "en" para inglês).
const TEXTOS = {
  pt: {
    lang: "pt-BR",
    preparo: "Preparo",
    forno: "Forno",
    tempoTotal: "Tempo total",
    rende: "Rende",
    ingredientes: "Ingredientes",
    modoDePreparo: "Modo de preparo",
    dicas: "Dicas",
    nota: "Nota: ",
    original: "Receita original: ",
    outroIdioma: "Read in English",
    fotoEmBreve: "Foto em breve",
    voltar: "← Voltar para todas as receitas",
    erro: "Não foi possível carregar esta receita."
  },
  en: {
    lang: "en",
    preparo: "Prep",
    forno: "Bake",
    tempoTotal: "Total time",
    rende: "Serves",
    ingredientes: "Ingredients",
    modoDePreparo: "Instructions",
    dicas: "Tips",
    nota: "Note: ",
    original: "Original recipe: ",
    outroIdioma: "Ver em português",
    fotoEmBreve: "Photo coming soon",
    voltar: "← Back to all recipes",
    erro: "This recipe could not be loaded."
  }
};

function textos(r) {
  return TEXTOS[r.idioma] || TEXTOS.pt;
}

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

      const t = textos(r);
      let foto;
      if (r.foto) {
        foto = criar("img");
        foto.src = r.foto;
        foto.alt = r.fotoAlt || r.titulo;
        foto.loading = "lazy";
      } else {
        foto = criar("div", "foto-vazia", t.fotoEmBreve);
      }

      const texto = criar("div", "cartao-texto");
      if (r.idioma && r.idioma !== "pt") link.lang = t.lang;
      if (r.categoria) texto.append(criar("span", "etiqueta", r.categoria));
      if (r.idioma === "en") texto.append(criar("span", "etiqueta idioma", "English"));
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
    const t = textos(r);
    document.documentElement.lang = t.lang;
    document.title = r.titulo + " | Receitas";
    const voltar = document.querySelector(".rodape a");
    if (voltar) voltar.textContent = t.voltar;
    area.innerHTML = "";

    if (r.foto) {
      const foto = criar("img", "receita-foto");
      foto.src = r.foto;
      foto.alt = r.fotoAlt || r.titulo;
      area.append(foto);
    }

    if (r.categoria) area.append(criar("span", "etiqueta", r.categoria));
    area.append(criar("h1", "receita-titulo", r.titulo));
    if (r.outroIdioma) {
      const troca = criar("a", "outro-idioma", t.outroIdioma);
      troca.href = "receita.html?r=" + encodeURIComponent(r.outroIdioma);
      troca.hreflang = r.idioma === "en" ? "pt-BR" : "en";
      area.append(troca);
    }
    if (r.descricao) area.append(criar("p", "receita-descricao", r.descricao));

    const tempos = criar("dl", "tempos");
    [
      [t.preparo, r.preparo],
      [t.forno, r.forno],
      [t.tempoTotal, r.tempoTotal],
      [t.rende, r.rendimento]
    ].forEach(([rotulo, valor]) => {
      if (!valor) return;
      const bloco = criar("div", "tempo");
      bloco.append(criar("dt", null, rotulo), criar("dd", null, valor));
      tempos.append(bloco);
    });
    area.append(tempos);

    // Ingredientes e passos podem ser divididos em partes (por exemplo,
    // massa e cobertura) com um item { "grupo": "Nome da parte" }.
    const secaoIngredientes = criar("section", "secao");
    secaoIngredientes.append(criar("h2", null, t.ingredientes));
    let ingredientes = null;
    r.ingredientes.forEach(ing => {
      if (ing.grupo) {
        secaoIngredientes.append(criar("h3", "grupo", ing.grupo));
        ingredientes = null;
        return;
      }
      if (!ingredientes) {
        ingredientes = criar("ul", "ingredientes");
        secaoIngredientes.append(ingredientes);
      }
      const li = criar("li", null, ing.item);
      if (ing.nota) li.append(criar("em", "nota", t.nota + ing.nota));
      ingredientes.append(li);
    });
    area.append(secaoIngredientes);

    const secaoPreparo = criar("section", "secao");
    secaoPreparo.append(criar("h2", null, t.modoDePreparo));
    let passos = null;
    r.modoDePreparo.forEach(passo => {
      if (passo.grupo) {
        secaoPreparo.append(criar("h3", "grupo", passo.grupo));
        passos = null;
        return;
      }
      if (!passos) {
        passos = criar("ol", "passos");
        secaoPreparo.append(passos);
      }
      passos.append(criar("li", null, passo));
    });
    area.append(secaoPreparo);

    if (r.dicas && r.dicas.length) {
      const secaoDicas = criar("section", "secao dicas");
      secaoDicas.append(criar("h2", null, r.dicasTitulo || t.dicas));
      r.dicas.forEach(dica => secaoDicas.append(criar("p", null, dica)));
      area.append(secaoDicas);
    }

    if (r.credito) {
      const credito = criar("p", "credito", t.original);
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
    area.append(criar("p", "aviso", TEXTOS.pt.erro));
    console.error(erro);
  }
}
