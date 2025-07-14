import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/SemiNovos.css";

const CarrosNovos = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7239/api/v1/usados/listar"
      );
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError("Erro ao carregar os veículos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateUniqueKey = (carro) => {
    // Gera uma chave única baseada nos dados disponíveis
    const baseKey = `${carro.id || ''}-${carro.marca || 'marca'}-${carro.modelo || 'modelo'}-${carro.ano || 'ano'}`;
    
    // Se a baseKey for muito genérica (muitos undefined), adiciona um hash único
    if (baseKey.split('-').filter(part => part === 'marca' || part === 'modelo' || part === 'ano').length >= 2) {
      return `${baseKey}-${Math.random().toString(36).substr(2, 5)}`;
    }
    return baseKey;
  };

  const carrosFiltrados = data.filter((carro) => {
    const nomeCompleto = `${carro.marca ?? ""} ${carro.modelo ?? ""}`.toLowerCase();
    const busca = search.toLowerCase();
    const nomeMatch = nomeCompleto.includes(busca);

    const precoNumerico = parseFloat(carro.preco ?? 0);
    const precoMatch = filtroPreco === "" || precoNumerico <= parseInt(filtroPreco);

    return nomeMatch && precoMatch;
  });

  if (loading) {
    return <div className="seminos-loading">Carregando...</div>;
  }

  if (error) {
    return <div className="seminos-error">{error}</div>;
  }

  return (
    <div className="seminos-container">
      <h2 className="seminos-titulo">Carros Semi-Novos Disponíveis</h2>

      <div className="seminos-filtros">
        <div className="filtro-wrapper">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="seminos-pesquisa-input"
          />
        </div>

        <div className="filtro-wrapper">
          <select
            value={filtroPreco}
            onChange={(e) => setFiltroPreco(e.target.value)}
            className="seminos-preco-select"
          >
            <option value="">Todos os preços</option>
            <option value="50000">Até R$50.000</option>
            <option value="100000">Até R$100.000</option>
            <option value="150000">Até R$150.000</option>
            <option value="200000">Até R$200.000</option>
          </select>
        </div>
      </div>

      <div className="seminos-grid">
        {carrosFiltrados.length > 0 ? (
          carrosFiltrados.map((carro) => {
            const imagemValida = carro.Imagem && carro.Imagem.trim() !== "" ? carro.Imagem : null;

            return (
              <div className="seminos-card" key={generateUniqueKey(carro)}>
                {imagemValida ? (
                  <img
                    src={imagemValida}
                    alt={`${carro.marca ?? ""} ${carro.modelo ?? ""}`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="sem-imagem">Imagem não disponível</div>
                )}

                <h3>
                  {carro.Marca ?? "Marca não informada"} {carro.Modelo ?? "Modelo não informado"}
                </h3>
                <p>Ano: {carro.Ano ?? "N/A"}</p>
                <p>Cor: {carro.Cor ?? "N/A"}</p>
                <p>Km: {carro.Quilometragem ? `${carro.Quilometragem.toLocaleString()} km` : "N/A"} </p>
                <p className="preco">
                  {carro.Preco != null ? `R$ ${carro.Preco.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "Preço não informado"}
                </p>

                <div className="seminos-botoes">
                  <button className="seminos-comprar-btn">Comprar</button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="seminos-sem-resultados">Nenhum carro encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
};

export default CarrosNovos;