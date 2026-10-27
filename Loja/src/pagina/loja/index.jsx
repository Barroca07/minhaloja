import { useEffect, useState } from "react";
import ProdutCard from "../../components/ProdutCard";
import MenuNavegacao from "../../components/MenuNavegacao";
import { NUMERO_WHATSAPP_LOJA } from "../../config";
import mockData from "../../../db.json";
import "./estilo.css";

const formatarPreco = (centavos) => {
  const valorAbsoluto = Math.abs(centavos);
  const reais = Math.floor(valorAbsoluto / 100);
  const centavosRestantes = valorAbsoluto % 100;
  const reaisFormatados = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(reais);

  return `${centavos < 0 ? "-" : ""}${reaisFormatados},${String(
    centavosRestantes,
  ).padStart(2, "0")}`;
};

const obterPreco = (produto) => produto.promoPrice ?? produto.price;
const obterSubtotal = ({ produto, quantidade }) =>
  obterPreco(produto) * quantidade;

export default function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [telaAtiva, setTelaAtiva] = useState("loja");
  const [carrinho, setCarrinho] = useState([]);
  const [aviso, setAviso] = useState("");

  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  function adicionarAoCarrinho(produto) {
    if (produto.stock <= 0) {
      setAviso(`${produto.name} está esgotado e não pode ser adicionado.`);
      return;
    }

    const itemAtual = carrinho.find((item) => item.produto.id === produto.id);
    if (itemAtual?.quantidade >= produto.stock) {
      setAviso(`Estoque máximo de ${produto.name} atingido.`);
      return;
    }

    setCarrinho((itens) => {
      const itemExistente = itens.find(
        (item) => item.produto.id === produto.id,
      );

      if (itemExistente) {
        if (itemExistente.quantidade >= produto.stock) {
          return itens;
        }

        return itens.map((item) =>
          item.produto.id === produto.id
            ? {
                ...item,
                quantidade: Math.min(item.quantidade + 1, produto.stock),
              }
            : item,
        );
      }

      if (produto.stock <= 0) {
        return itens;
      }

      return [...itens, { produto, quantidade: 1 }];
    });
    setAviso(`${produto.name} adicionado ao carrinho.`);
  }

  function alterarQuantidade(produtoId, variacao) {
    setCarrinho((itens) =>
      itens
        .map((item) =>
          item.produto.id === produtoId
            ? {
                ...item,
                quantidade: Math.max(
                  1,
                  Math.min(item.produto.stock, item.quantidade + variacao),
                ),
              }
            : item,
        ),
    );
  }

  function removerDoCarrinho(produtoId) {
    setCarrinho((itens) =>
      itens.filter((item) => item.produto.id !== produtoId),
    );
  }

  function finalizarPeloWhatsApp() {
    const numero = NUMERO_WHATSAPP_LOJA.replace(/\D/g, "");
    if (numero.length < 8 || numero.length > 15) {
      setAviso(
        "Configure um número válido do WhatsApp do lojista em src/config.js.",
      );
      return;
    }

    const linhasItens = carrinho.map(
      ({ produto, quantidade }) =>
        `- ${produto.name} — ${quantidade} un. — Subtotal: R$ ${formatarPreco(
          obterSubtotal({ produto, quantidade }),
        )}`,
    );
    const mensagem = [
      "Olá! Gostaria de finalizar este pedido:",
      "",
      ...linhasItens,
      "",
      `Total de itens: ${quantidadeCarrinho}`,
      `Total: R$ ${formatarPreco(totalCarrinho)}`,
    ].join("\n");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    let montado = true;

    async function carregarProdutos() {
      try {
        const resposta = await fetch("http://localhost:3000/products");

        if (!resposta.ok) {
          throw new Error("Erro ao carregar os produtos.");
        }

        const dados = await resposta.json();
        if (montado) {
          setProdutos(dados);
        }
      } catch (error) {
        if (montado) {
          if (mockData && Array.isArray(mockData.products)) {
            setProdutos(mockData.products);
          } else {
            setErro(error.message);
          }
        }
      } finally {
        if (montado) {
          setCarregando(false);
        }
      }
    }

    carregarProdutos();

    return () => {
      montado = false;
    };
  }, []);

  const totalCarrinho = carrinho.reduce(
    (total, item) => total + obterSubtotal(item),
    0,
  );
  const quantidadeEmEstoque = produtos.reduce(
    (total, produto) => total + produto.stock,
    0,
  );
  const produtosEsgotados = produtos.filter(
    (produto) => produto.stock === 0,
  ).length;
  const produtosEmPromocao = produtos.filter(
    (produto) => produto.promoPrice !== undefined && produto.promoPrice !== null,
  ).length;

  return (
    <>
      <MenuNavegacao
        quantidadeCarrinho={quantidadeCarrinho}
        telaAtiva={telaAtiva}
        onNavegar={(tela) => {
          setTelaAtiva(tela);
          setAviso("");
        }}
      />

      {carregando ? (
        <h2 className="mensagem">Carregando produtos...</h2>
      ) : erro ? (
        <h2 className="mensagem erro">{erro}</h2>
      ) : (
        <main className="loja">
          {telaAtiva === "loja" && (
            <>
              <h1 className="titulo">Nossa Loja</h1>
              {aviso && <p className="aviso-carrinho" role="status">{aviso}</p>}
              <section className="grade-produtos">
                {produtos.map((produto) => (
                  <ProdutCard
                    key={produto.id}
                    produto={produto}
                    onComprar={adicionarAoCarrinho}
                    quantidadeNoCarrinho={
                      carrinho.find((item) => item.produto.id === produto.id)
                        ?.quantidade ?? 0
                    }
                  />
                ))}
              </section>
            </>
          )}

          {telaAtiva === "painel" && (
            <section className="painel">
              <h1 className="titulo">Painel da loja</h1>
              <div className="resumo-painel">
                <article className="card-resumo">
                  <span>Produtos cadastrados</span>
                  <strong>{produtos.length}</strong>
                </article>
                <article className="card-resumo">
                  <span>Unidades em estoque</span>
                  <strong>{quantidadeEmEstoque}</strong>
                </article>
                <article className="card-resumo">
                  <span>Produtos esgotados</span>
                  <strong>{produtosEsgotados}</strong>
                </article>
                <article className="card-resumo">
                  <span>Produtos em promoção</span>
                  <strong>{produtosEmPromocao}</strong>
                </article>
              </div>
            </section>
          )}

          {telaAtiva === "carrinho" && (
            <section className="pagina-carrinho">
              <h1 className="titulo">Carrinho de compras</h1>
              {aviso && <p className="aviso-carrinho" role="status">{aviso}</p>}
              {carrinho.length === 0 ? (
                <div className="carrinho-vazio">
                  <p>Seu carrinho está vazio.</p>
                  <button
                    className="btn-acao"
                    type="button"
                    onClick={() => setTelaAtiva("loja")}
                  >
                    Voltar à loja
                  </button>
                </div>
              ) : (
                <>
                  <div className="lista-carrinho">
                    {carrinho.map(({ produto, quantidade }) => (
                      <article className="item-carrinho" key={produto.id}>
                        <img src={produto.image} alt="" />
                        <div className="detalhes-carrinho">
                          <h2>{produto.name}</h2>
                          <span>
                            R$ {formatarPreco(obterPreco(produto))} cada
                          </span>
                        </div>
                        <div
                          className="controle-quantidade"
                          aria-label={`Quantidade de ${produto.name}`}
                        >
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${produto.name}`}
                            disabled={quantidade <= 1}
                            onClick={() => alterarQuantidade(produto.id, -1)}
                          >
                            −
                          </button>
                          <span>{quantidade}</span>
                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${produto.name}`}
                            disabled={quantidade >= produto.stock}
                            onClick={() => alterarQuantidade(produto.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <strong className="subtotal-carrinho">
                          Subtotal: R${" "}
                          {formatarPreco(obterSubtotal({ produto, quantidade }))}
                        </strong>
                        <button
                          type="button"
                          className="remover-carrinho"
                          onClick={() => removerDoCarrinho(produto.id)}
                        >
                          Remover
                        </button>
                      </article>
                    ))}
                  </div>
                  <div className="total-carrinho">
                    <span>
                      Total de itens: <strong>{quantidadeCarrinho}</strong>
                    </span>
                    <span className="valor-total-carrinho">
                      Total: <strong>R$ {formatarPreco(totalCarrinho)}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-acao checkout-whatsapp"
                    onClick={finalizarPeloWhatsApp}
                  >
                    Finalizar pelo WhatsApp
                  </button>
                </>
              )}
            </section>
          )}
        </main>
      )}
    </>
  );
}