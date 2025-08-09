// DetalhesCarro.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Detalhes.css";

// === Imagens GRAND SIENA ===
import grandPreto from "../assets/images/GrandSiena/GRANDPRETO.png";
import grandPrata from "../assets/images/GrandSiena/GRANDPRATA.png";
import grandAzul from "../assets/images/GrandSiena/GRANDAZUL.png";
import grandVerde from "../assets/images/GrandSiena/GRANDVERDE.png";
import grandVermelho from "../assets/images/GrandSiena/GRANDVERMELHO.png";
import grandAmarelo from "../assets/images/GrandSiena/GRANDAMARELO.png";
import grandBranco from "../assets/images/GrandSiena/GRANDBRANCO.png";

// === Imagens ARGO TRIBUTO ===
import argoTributoPreto from "../assets/images/ArgoTributo/ARGOPRETO.png";
import argoTributoPrata from "../assets/images/ArgoTributo/ARGOPRATA.png";
import argoTributoAzul from "../assets/images/ArgoTributo/ARGOAZUL.png";
import argoTributoVerde from "../assets/images/ArgoTributo/ARGOVERDE.png";
import argoTributoVermelho from "../assets/images/ArgoTributo/ARGOVERMELHO.png";
import argoTributoAmarelo from "../assets/images/ArgoTributo/ARGOAMARELO.png";
import argoTributoBranco from "../assets/images/ArgoTributo/ARGOBRANCO.png";

// === Imagens ARGO ===
import argoPreto from "../assets/images/Argo/argo-preto.png";
import argoPrata from "../assets/images/Argo/argo-prata.png";
import argoAzul from "../assets/images/Argo/argo-azul.png";
import argoVerde from "../assets/images/Argo/argo-verde.png";
import argoVermelho from "../assets/images/Argo/argo-vermelho.png";
import argoAmarelo from "../assets/images/Argo/argo-amarelo.png";
import argoBranco from "../assets/images/Argo/argo-branco.png";

// === Imagens STEPWAY ===
import stepwayPreto from "../assets/images/Stepway/STEPWAYPRETO.png";
import stepwayPrata from "../assets/images/Stepway/STEPWAYPRATA.png";
import stepwayAzul from "../assets/images/Stepway/STEPWAYAZUL.png";
import stepwayVerde from "../assets/images/Stepway/STEPWAYVERDE.png";
import stepwayVermelho from "../assets/images/Stepway/STEPWAYVERMELHO.png";
import stepwayAmarelo from "../assets/images/Stepway/STEPWAYAMARELO.png";
import stepwayBranco from "../assets/images/Stepway/STEPWAYBRANCO.png";

// === Imagens GOL LAST ===
import golPreto from "../assets/images/GolLast/GolLastPreto.png";
import golPrata from "../assets/images/GolLast/GolLastPrata.png";
import golAzul from "../assets/images/GolLast/GolLastAzul.png";
import golVerde from "../assets/images/GolLast/GolLastVerde.png";
import golVermelho from "../assets/images/GolLast/GolLastVermelho.png";
import golAmarelo from "../assets/images/GolLast/GolLastAmarelo.png";
import golBranco from "../assets/images/GolLast/GolLastBranco.png";

// === Imagens CITROËN ===
import citreonPreto from "../assets/images/Citroen/citroen-preto.png";
import citreonPrata from "../assets/images/Citroen/citroen-prata.png";
import citreonAzul from "../assets/images/Citroen/citroen-azul.png";
import citreonVerde from "../assets/images/Citroen/citroen-verde.png";
import citreonVermelho from "../assets/images/Citroen/citroen-vermelho.png";
import citreonAmarelo from "../assets/images/Citroen/citroen-amarelo.png";
import citreonBranco from "../assets/images/Citroen/citroen-branco.png";

// === Imagens KWID ===
import kwidPreto from "../assets/images/KWID/kwid-preto.png";
import kwidPrata from "../assets/images/KWID/kwid-prata.png";
import kwidAzul from "../assets/images/KWID/kwid-azul.png";
import kwidVerde from "../assets/images/KWID/kwid-verde.png";
import kwidVermelho from "../assets/images/KWID/kwid-vermelho.png";
import kwidAmarelo from "../assets/images/KWID/kwid-amarelo.png";
import kwidBranco from "../assets/images/KWID/kwid-branco.png";

// === Imagens MOBI ===
import mobiPreto from "../assets/images/Mobi/preto.png";
import mobiPrata from "../assets/images/Mobi/prata.png";
import mobiAzul from "../assets/images/Mobi/azul.png";
import mobiVerde from "../assets/images/Mobi/verde.png";
import mobiVermelho from "../assets/images/Mobi/vermelho.png";
import mobiAmarelo from "../assets/images/Mobi/amarelo.png";
import mobiBranco from "../assets/images/Mobi/branco.png";

const DetalhesCarro = () => {
  const { id } = useParams();
  const [carro, setCarro] = useState(null);
  const [corSelecionada, setCorSelecionada] = useState("");
  const [coresComImagens, setCoresComImagens] = useState([]);

  const coresHex = {
    preto: "#1A1A1A",
    prata: "#C4C4C4",
    azul: "#1976D2",
    verde: "#388E3C",
    vermelho: "#D32F2F",
    amarelo: "#FBC02D",
    branco: "#FFFFFF",
  };

  const getCoresPorId = (carroId) => {
    switch (carroId) {
      case 1:
        return [
          { cor: "Preto", imagem: grandPreto },
          { cor: "Prata", imagem: grandPrata },
          { cor: "Azul", imagem: grandAzul },
          { cor: "Verde", imagem: grandVerde },
          { cor: "Vermelho", imagem: grandVermelho },
          { cor: "Amarelo", imagem: grandAmarelo },
          { cor: "Branco", imagem: grandBranco },
        ];
      case 2:
        return [
          { cor: "Preto", imagem: argoTributoPreto },
          { cor: "Prata", imagem: argoTributoPrata },
          { cor: "Azul", imagem: argoTributoAzul },
          { cor: "Verde", imagem: argoTributoVerde },
          { cor: "Vermelho", imagem: argoTributoVermelho },
          { cor: "Amarelo", imagem: argoTributoAmarelo },
          { cor: "Branco", imagem: argoTributoBranco },
        ];
      case 3:
        return [
          { cor: "Preto", imagem: stepwayPreto },
          { cor: "Prata", imagem: stepwayPrata },
          { cor: "Azul", imagem: stepwayAzul },
          { cor: "Verde", imagem: stepwayVerde },
          { cor: "Vermelho", imagem: stepwayVermelho },
          { cor: "Amarelo", imagem: stepwayAmarelo },
          { cor: "Branco", imagem: stepwayBranco },
        ];
      case 4:
        return [
          { cor: "Preto", imagem: argoPreto },
          { cor: "Prata", imagem: argoPrata },
          { cor: "Azul", imagem: argoAzul },
          { cor: "Verde", imagem: argoVerde },
          { cor: "Vermelho", imagem: argoVermelho },
          { cor: "Amarelo", imagem: argoAmarelo },
          { cor: "Branco", imagem: argoBranco },
        ];
      case 5:
        return [
          { cor: "Preto", imagem: citreonPreto },
          { cor: "Prata", imagem: citreonPrata },
          { cor: "Azul", imagem: citreonAzul },
          { cor: "Verde", imagem: citreonVerde },
          { cor: "Vermelho", imagem: citreonVermelho },
          { cor: "Amarelo", imagem: citreonAmarelo },
          { cor: "Branco", imagem: citreonBranco },
        ];
      case 6:
        return [
          { cor: "Preto", imagem: kwidPreto },
          { cor: "Prata", imagem: kwidPrata },
          { cor: "Azul", imagem: kwidAzul },
          { cor: "Verde", imagem: kwidVerde },
          { cor: "Vermelho", imagem: kwidVermelho },
          { cor: "Amarelo", imagem: kwidAmarelo },
          { cor: "Branco", imagem: kwidBranco },
        ];
      case 7:
        return [
          { cor: "Preto", imagem: mobiPreto },
          { cor: "Prata", imagem: mobiPrata },
          { cor: "Azul", imagem: mobiAzul },
          { cor: "Verde", imagem: mobiVerde },
          { cor: "Vermelho", imagem: mobiVermelho },
          { cor: "Amarelo", imagem: mobiAmarelo },
          { cor: "Branco", imagem: mobiBranco },
        ];
      case 8:
        return [
          { cor: "Preto", imagem: golPreto },
          { cor: "Prata", imagem: golPrata },
          { cor: "Azul", imagem: golAzul },
          { cor: "Verde", imagem: golVerde },
          { cor: "Vermelho", imagem: golVermelho },
          { cor: "Amarelo", imagem: golAmarelo },
          { cor: "Branco", imagem: golBranco },
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchCarro = async () => {
      try {
        const { data } = await axios.get(
          `https://localhost:7239/api/v1/carros-novos/${id}`
        );
        setCarro(data);

        const cores = getCoresPorId(Number(id));
        setCoresComImagens(cores);

        if (cores.length > 0) setCorSelecionada(cores[0].cor);
      } catch (err) {
        console.error("Erro ao buscar detalhes do carro:", err);
      }
    };

    fetchCarro();
  }, [id]);

  if (!carro) return <p>Carregando...</p>;

  const imagemAtual = coresComImagens.find(
    (c) => c.cor === corSelecionada
  )?.imagem;

  const adicionarAoCarrinho = async () => {
    try {
      const itemDto = {
        usuarioId: 1, // Ajuste conforme usuário logado
        produtoId: carro.Id,
        nomeProduto: carro.Modelo,
        precoUnitario: carro.Preco,
        quantidade: 1,
        cor: corSelecionada,
        imagemUrl: imagemAtual,
      };

      console.log(itemDto)

      await axios.post(
        "https://localhost:7239/api/Carrinho/AdicionarItem",
        itemDto
      );

      alert(`✅ ${carro.Modelo} (${corSelecionada}) adicionado ao carrinho!`);
      // Trigger the event to update the cart count in Navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho", error);
      alert("❌ Erro ao adicionar ao carrinho");
    }
  };

  return (
    <div className="detalhes-container">
      <div className="detalhes-texto">
        <h1>
          {carro.marca} {carro.modelo}
        </h1>
        <p>{carro.descricao}</p>
        <p>
          <strong>Ano:</strong> {carro.ano}
        </p>
        <p>
          <strong>Motor:</strong> {carro.motor}
        </p>
        <p className="preco">
          Preço: R$ {carro.Preco.toFixed(2).replace(".", ",")}
        </p>

        <div className="selecao-cor">
          <h3>Escolha a cor:</h3>
          <div className="color-options">
            {coresComImagens.map(({ cor }) => (
              <button
                key={cor}
                className={`botao-cor ${
                  corSelecionada === cor ? "ativo" : ""
                }`}
                style={{
                  backgroundColor: coresHex[cor.toLowerCase()] || "#fff",
                  border:
                    corSelecionada === cor ? "2px solid #000" : "1px solid gray",
                }}
                onClick={() => setCorSelecionada(cor)}
                aria-label={`Selecionar cor ${cor}`}
              />
            ))}
          </div>
        </div>

        <button className="btn-carrinho" onClick={adicionarAoCarrinho}>
          Adicionar ao Carrinho 🛒
        </button>
      </div>

      <div className="imagem-carro">
        {imagemAtual ? (
          <img
            src={imagemAtual}
            alt={`${carro.marca} ${carro.modelo} na cor ${corSelecionada}`}
          />
        ) : (
          <p>Imagem não disponível para esta cor.</p>
        )}
      </div>
    </div>
  );
};

export default DetalhesCarro;