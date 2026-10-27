import "./ProdutCard.css";
import ShoppingCartIcon from "../ShoppingCartIcon";

export default function ProdutCard({
  produto,
  onComprar,
  quantidadeNoCarrinho = 0,
}) {
  if (!produto) return null;

  const precoFormatado = (produto.price / 100).toFixed(2).replace(".", ",");
  const temPromocao =
    produto.promoPrice !== undefined && produto.promoPrice !== null;
  const esgotado = produto.stock <= 0;
  const limiteAtingido = quantidadeNoCarrinho >= produto.stock;

  const precoPromoFormatado = temPromocao
    ? (produto.promoPrice / 100).toFixed(2).replace(".", ",")
    : null;

  return (
    <article className="card-produto">
      <div className="imagem-container">
        <img
          src={produto.image}
          alt={produto.name}
          className="imagem-produto"
          onError={(e) => {
            e.currentTarget.src =
              "https://picsum.photos/seed/fallback/400/300";
          }}
        />

        {temPromocao && (
          <span className="badge-promo">Promoção</span>
        )}
        {esgotado && (
          <span className="badge-esgotado">Esgotado</span>
        )}
      </div>

      <div className="conteudo">
        <span className="categoria">{produto.category}</span>

        <h2>{produto.name}</h2>

        <p>{produto.description}</p>

        <div className="rodape-card">
          <div className="precos">
            {temPromocao ? (
              <>
                <span className="preco-antigo">
                  R$ {precoFormatado}
                </span>

                <span className="preco promo">
                  R$ {precoPromoFormatado}
                </span>
              </>
            ) : (
              <span className="preco">
                R$ {precoFormatado}
              </span>
            )}
          </div>

          <span className={`estoque ${esgotado ? "esgotado" : ""}`}>
            {esgotado
              ? "Esgotado"
              : `Estoque: ${produto.stock}`}
          </span>

          <button
            className="btn-comprar"
            disabled={esgotado || limiteAtingido}
            onClick={() =>
              onComprar
                ? onComprar(produto)
                : alert(`${produto.name} adicionado ao carrinho!`)
            }
          >
            {esgotado ? (
              "Indisponível"
            ) : limiteAtingido ? (
              "Limite atingido"
            ) : (
              <>
                <ShoppingCartIcon className="icone-comprar" />
                Comprar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}