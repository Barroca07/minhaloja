import "./estilos.css";
import ShoppingCartIcon from "../ShoppingCartIcon";

export default function MenuNavegacao({
  quantidadeCarrinho = 0,
  telaAtiva = "loja",
  onNavegar,
}) {
  return (
    <header className="menu">
      <div className="logo">
        Minha<span>Loja</span>
      </div>

      <nav className="menu-links">
        <button
          type="button"
          className={telaAtiva === "loja" ? "ativo" : ""}
          aria-current={telaAtiva === "loja" ? "page" : undefined}
          onClick={() => onNavegar("loja")}
        >
          Loja
        </button>
        <button
          type="button"
          className={telaAtiva === "painel" ? "ativo" : ""}
          aria-current={telaAtiva === "painel" ? "page" : undefined}
          onClick={() => onNavegar("painel")}
        >
          Painel
        </button>
      </nav>

      <button
        type="button"
        className={`carrinho ${telaAtiva === "carrinho" ? "ativo" : ""}`}
        aria-label={`Abrir carrinho com ${quantidadeCarrinho} itens`}
        aria-current={telaAtiva === "carrinho" ? "page" : undefined}
        onClick={() => onNavegar("carrinho")}
      >
        <ShoppingCartIcon className="icone-carrinho" />
        <span className="contador" aria-live="polite">
          {quantidadeCarrinho}
        </span>
      </button>
    </header>
  );
}