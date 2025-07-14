import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import "./styles/Novos.css";

const CarrosNovos = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const marcaQuery = searchParams.get("marca");

  useEffect(() => {
    const fetchCarros = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://localhost:7239/api/v1/carros-novos/listar");
        
        const carrosFormatados = response.data.map((carro, index) => {
          const marca = carro.Marca || "Marca não informada";
          const modelo = carro.Modelo || "Modelo não informado";
          const ano = carro.Ano || "Ano não informado";

          return {
            id:
              carro.Id ||
              `${marca}-${modelo}-${ano}-${index}`
                .replace(/\s+/g, "-")
                .toLowerCase(),
            marca,
            modelo,
            ano,
            motor: carro.Motor || "Motor não informado",
            cor: carro.Cor || "Cor não informada",
            preco: carro.Preco || 0,
            imagem: carro.Imagem || null,
          };
        });
        
        setCarros(carrosFormatados);

        if (marcaQuery) {
          setFiltroMarca(marcaQuery);
        }
      } catch (err) {
        console.error("Erro ao buscar carros:", err);
        setError("Erro ao carregar carros. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarros();
  }, [marcaQuery]);

  const carrosFiltrados = carros.filter((carro) => {
    const nome = `${carro.marca} ${carro.modelo}`.toLowerCase();
    const busca = search.toLowerCase();
    const preco = Number(carro.preco);
    const marca = carro.marca.toLowerCase();

    return (
      nome.includes(busca) &&
      (filtroPreco === "" || preco <= Number(filtroPreco)) &&
      (filtroMarca === "" || marca === filtroMarca.toLowerCase())
    );
  });

  const limparFiltros = () => {
    setSearch("");
    setFiltroPreco("");
    setFiltroMarca("");
    navigate("/novos");
  };

  const marcasUnicas = Array.from(
    new Set(carros.map((carro) => carro.marca || "Marca não informada"))
  );

  if (loading) {
    return <div className="loading">Carregando carros...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="novos-container">
      <h2 className="novos-titulo">Carros 0KM Disponíveis</h2>

      <div className="novos-filtros">
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="novo-pesquisa-input"
        />

        <select
          value={filtroPreco}
          onChange={(e) => setFiltroPreco(e.target.value)}
          className="novos-preco-select"
        >
          <option value="">Todos os preços</option>
          <option value="50000">Até R$50.000</option>
          <option value="100000">Até R$100.000</option>
          <option value="150000">Até R$150.000</option>
          <option value="200000">Até R$200.000</option>
        </select>

        <select
          value={filtroMarca}
          onChange={(e) => {
            setFiltroMarca(e.target.value);
            navigate(`/novos?marca=${e.target.value}`);
          }}
          className="novos-marca-select"
        >
          <option value="">Todas as marcas</option>
          {marcasUnicas.map((marca) => (
            <option key={marca} value={marca}>
              {marca}
            </option>
          ))}
        </select>

        {(filtroPreco || filtroMarca || search) && (
          <button onClick={limparFiltros} className="limpar-filtros-btn">
            Limpar Filtros
          </button>
        )}
      </div>

      {filtroMarca && (
        <div className="filtro-ativo">
          Mostrando carros da marca: <strong>{filtroMarca}</strong>
        </div>
      )}

      <div className="carros-grid">
        {carrosFiltrados.length > 0 ? (
          carrosFiltrados.map((carro) => (
            <div className="carro-card" key={carro.id}>
              {carro.imagem ? (
                <img
                  src={carro.imagem}
                  alt={`${carro.marca} ${carro.modelo}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML =
                      '<div class="sem-imagem">Imagem não disponível</div>';
                  }}
                />
              ) : (
                <div className="sem-imagem">Imagem não disponível</div>
              )}

              <h3>
                {carro.marca} {carro.modelo}
              </h3>
              <p>Ano: {carro.ano}</p>
              <p>Motor: {carro.motor}</p>
              <p>Cor: {carro.cor}</p>
              <p className="preco">
                R$ {Number(carro.preco).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <div className="botoes">
                <button
                  className="comprar-btn"
                  onClick={() => navigate(`/carros/${carro.id}`)}
                >
                  <FaShoppingCart /> Comprar 
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="sem-resultados">
            Nenhum carro encontrado com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}; 

export default CarrosNovos;
