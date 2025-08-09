import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import "../styles/Carrinho.css";

const Carrinho = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const usuarioId = localStorage.getItem('userId') || 1; // Get user ID from localStorage
  const navigate = useNavigate();

  const atualizarContadorCarrinho = (itens) => {
    const total = itens.reduce((acc, item) => acc + item.Quantidade, 0);
    localStorage.setItem("cartCount", total.toString());
    window.dispatchEvent(new Event("storage"));
  };

  const fetchCarrinho = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `https://localhost:7239/api/Carrinho/usuario/${usuarioId}`
      );

      if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].Itens) {
        setCartItems(res.data[0].Itens);
        atualizarContadorCarrinho(res.data[0].Itens);
      } else if (res.data && res.data.Itens) {
        setCartItems(res.data.Itens);
        atualizarContadorCarrinho(res.data.Itens);
      } else {
        setCartItems([]);
        atualizarContadorCarrinho([]);
      }
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
      alert("Erro ao carregar carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrinho();
  }, [usuarioId]);

  const atualizarQuantidade = async (itemId, novaQuantidade) => {
    if (novaQuantidade < 1) return;

    setIsUpdating(true);
    try {
      await axios.put(`https://localhost:7239/api/Carrinho/AtualizarQuantidade/${itemId}`, {
        quantidade: novaQuantidade,
      });

      const atualizados = cartItems.map((item) =>
        item.Id === itemId ? { ...item, Quantidade: novaQuantidade } : item
      );

      setCartItems(atualizados);
      atualizarContadorCarrinho(atualizados);
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      alert("Erro ao atualizar quantidade");
    } finally {
      setIsUpdating(false);
    }
  };

  const removerItem = async (itemId) => {
    if (!window.confirm("Tem certeza que deseja remover este item do carrinho?")) return;

    setIsUpdating(true);
    try {
      await axios.delete(`https://localhost:7239/api/Carrinho/RemoverItem/${itemId}`);
      const atualizados = cartItems.filter((item) => item.Id !== itemId);
      setCartItems(atualizados);
      atualizarContadorCarrinho(atualizados);
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("Erro ao remover item do carrinho");
    } finally {
      setIsUpdating(false);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.PrecoUnitario * item.Quantidade,
    0
  );

  const handleFinalizarCompra = () => {
    if (cartItems.length === 0) return;

    const dadosCompra = {
      carrinhosId: cartItems[0]?.carrinhoId || 1,
      carrosId: cartItems[0]?.carroId || 1,
      usuariosId: usuarioId,
      precoFinal: total,
      Itens: cartItems,
    };

    navigate("/finalizar", { state: dadosCompra });
  };

  if (isLoading) {
    return (
      <div className="carrinho-loading">
        <div className="spinner"></div>
        <p>Carregando seu carrinho...</p>
      </div>
    );
  }

  return (
    <div className="carrinho-container">
      <h1 className="carrinho-title">Meu Carrinho</h1>

      {cartItems.length === 0 ? (
        <div className="carrinho-empty">
          <FaShoppingCart size={50} className="empty-cart-icon" />
          <p>Seu carrinho está vazio.</p>
          <Link to="/novos" className="btn-continue">
            Continuar comprando
          </Link>
        </div>
      ) : (
        <>
          <div className="carrinho-items">
            {cartItems.map((item) => (
              <div key={item.Id} className="carrinho-item">
                <div className="item-image-container">
                  {item.ImagemUrl ? (
                    <img
                      src={item.ImagemUrl}
                      alt={item.NomeProduto}
                      className="item-image"
                    />
                  ) : (
                    <div className="no-image">Sem imagem</div>
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.NomeProduto}</h3>

                  <p className="item-cor">
                    <strong>Cor:</strong> {item.Cor}
                  </p>

                  <p className="item-price">
                    R$ {item.PrecoUnitario.toFixed(2).replace(".", ",")}
                  </p>

                  <div className="quantidade-controle">
                    <button
                      onClick={() => atualizarQuantidade(item.Id, item.Quantidade - 1)}
                      disabled={isUpdating || item.Quantidade <= 1}
                      aria-label={`Diminuir quantidade de ${item.NomeProduto}`}
                    >
                      <FaMinus />
                    </button>

                    <span>{item.Quantidade}</span>

                    <button
                      onClick={() => atualizarQuantidade(item.Id, item.Quantidade + 1)}
                      disabled={isUpdating}
                      aria-label={`Aumentar quantidade de ${item.NomeProduto}`}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removerItem(item.Id)}
                  disabled={isUpdating}
                  aria-label={`Remover ${item.NomeProduto} do carrinho`}
                  className="btn-remover"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="carrinho-total">
            <h3>Total: R$ {total.toFixed(2).replace(".", ",")}</h3>
            <button
              disabled={cartItems.length === 0}
              className="btn-finalizar"
              onClick={handleFinalizarCompra}
            >
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrinho;