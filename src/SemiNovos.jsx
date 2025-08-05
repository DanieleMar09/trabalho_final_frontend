import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/SemiNovos.css";
import { format } from 'date-fns';

const CarrosSeminovos = () => {
  // Configuração da API
  const API_BASE_URL = "https://localhost:7239/api/v1";
  
  // Estados da aplicação
  const [carros, setCarros] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAluguelModal, setShowAluguelModal] = useState(false);
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    valorTotal: '',
    observacoes: ''
  });
  const [loadingAluguel, setLoadingAluguel] = useState(false);
  const [aluguelSucesso, setAluguelSucesso] = useState(false);

  // Buscar carros seminovos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/usados/listar`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Normalizar dados da API, garantindo id único (fallback com index)
      const carrosNormalizados = response.data.map((carro, index) => ({
        id: carro.id || carro.Id || `temp-id-${index}`,
        marca: carro.marca || carro.Marca,
        modelo: carro.modelo || carro.Modelo,
        ano: carro.ano || carro.Ano,
        preco: carro.preco || carro.Preco,
        quilometragem: carro.quilometragem || carro.Quilometragem,
        cor: carro.cor || carro.Cor,
        imagemUrl: carro.imagemUrl || carro.Imagem,
        valorDiaria: carro.valorDiaria || carro.ValorDiaria || (carro.preco || carro.Preco) * 0.005
      }));

      setCarros(carrosNormalizados);
    } catch (error) {
      console.error("Erro ao buscar carros:", {
        url: `${API_BASE_URL}/usados/listar`,
        error: error.response?.data || error.message
      });
      setError("Erro ao carregar veículos. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar carros
  const carrosFiltrados = carros.filter(carro => {
    const busca = search.toLowerCase();
    return (
      `${carro.marca} ${carro.modelo}`.toLowerCase().includes(busca) &&
      (filtroPreco === "" || carro.preco <= parseInt(filtroPreco))
    );
  });

  // Abrir modal de aluguel
  const abrirModalAluguel = (carro) => {
    setCarroSelecionado(carro);
    setFormData({
      dataInicio: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      dataFim: '',
      valorTotal: carro.valorDiaria.toFixed(2),
      observacoes: ''
    });
    setShowAluguelModal(true);
    setAluguelSucesso(false);
    setError(null);
  };

  // Manipular mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calcular valor total automaticamente quando datas são alteradas
    if ((name === 'dataInicio' || name === 'dataFim')) {
      if (formData.dataInicio && (name === 'dataFim' ? value : formData.dataFim)) {
        const dataInicio = name === 'dataInicio' ? value : formData.dataInicio;
        const dataFim = name === 'dataFim' ? value : formData.dataFim;
        const diffMs = new Date(dataFim) - new Date(dataInicio);
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const valorTotal = dias > 0
          ? (carroSelecionado.valorDiaria * dias).toFixed(2)
          : carroSelecionado.valorDiaria.toFixed(2);
        setFormData(prev => ({ ...prev, valorTotal }));
      }
    }
  };

  // Submeter formulário de aluguel
  const handleSubmitAluguel = async (e) => {
    e.preventDefault();
    setLoadingAluguel(true);
    setError(null);

    try {
      // Preparar payload
      const payload = {
        carroId: carroSelecionado.id,
        cor: carroSelecionado.cor || "Indefinida"  ,// <-- aqui
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: new Date(formData.dataFim).toISOString(),
        valorTotal: parseFloat(formData.valorTotal),
        observacoes: formData.observacoes,
        status: "Pendente",
        usuarioId: 1 // Substituir pelo ID do usuário logado
        
      };

      console.log("Enviando aluguel:", payload); // Log para depuração

      // Enviar para a API
      const response = await axios.post(
        `${API_BASE_URL}/Aluguel/cadastrar`,
        payload,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 5000
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Aluguel cadastrado com sucesso:", response.data);
        setAluguelSucesso(true);
        setTimeout(() => {
          setShowAluguelModal(false);
          fetchData(); // Atualizar lista
        }, 2000);
      } else {
        throw new Error(`Resposta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar aluguel:", {
        error: error.response?.data || error.message,
        config: error.config
      });

      let errorMessage = "Erro ao registrar aluguel";
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.errors) {
            errorMessage = Object.values(error.response.data.errors)
              .flat()
              .join(', ');
          }
        }
        errorMessage += ` (Status: ${error.response.status})`;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoadingAluguel(false);
    }
  };

  if (loading) return (
    <div className="seminos-loading">
      <div className="loading-spinner"></div>
      <p>Carregando veículos...</p>
    </div>
  );

  if (error && !showAluguelModal) return (
    <div className="seminos-error">
      <h3>Ocorreu um erro</h3>
      <p>{error}</p>
      <button onClick={fetchData} className="retry-button">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="seminos-container">
      <h2 className="seminos-titulo">Carros Semi-Novos Disponíveis</h2>

      {/* Filtros */}
      <div className="seminos-filtros">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="seminos-pesquisa-input"
        />
        <select
          value={filtroPreco}
          onChange={(e) => setFiltroPreco(e.target.value)}
          className="seminos-preco-select"
        >
          <option value="">Todos os preços</option>
          <option value="10000">Até R$10.000</option>
          <option value="100000">Até R$100.000</option>
          <option value="150000">Até R$150.000</option>
        </select>
      </div>

      {/* Lista de carros */}
      <div className="seminos-grid">
        {carrosFiltrados.length > 0 ? (
          carrosFiltrados.map((carro, index) => (
            <div className="seminos-card" key={carro.id || `carro-${index}`}>
              <div className="seminos-card-imagem">
                {carro.imagemUrl ? (
                  <img src={carro.imagemUrl} alt={`${carro.marca} ${carro.modelo}`} />
                ) : (
                  <div className="seminos-imagem-placeholder">
                    <span>Imagem não disponível</span>
                  </div>
                )}
              </div>
              <div className="seminos-card-info">
                <h3>{carro.marca} {carro.modelo}</h3>
                <p><strong>Ano:</strong> {carro.ano}</p>
                <p><strong>Preço:</strong> R$ {carro.preco.toLocaleString('pt-BR')}</p>
                <p><strong>Diária:</strong> R$ {carro.valorDiaria.toFixed(2)}</p>
              </div>
              <button 
                className="seminos-comprar-btn"
                onClick={() => abrirModalAluguel(carro)}
              >
                Alugar
              </button>
            </div>
          ))
        ) : (
          <p className="seminos-sem-resultados">Nenhum carro encontrado</p>
        )}
      </div>

      {/* Modal de aluguel */}
      {showAluguelModal && (
        <div className="seminos-modal-overlay">
          <div className="seminos-modal">
            <button 
              className="seminos-modal-close"
              onClick={() => setShowAluguelModal(false)}
            >
              &times;
            </button>

            {aluguelSucesso ? (
              <div className="seminos-aluguel-sucesso">
                <h3>Sucesso!</h3>
                <p>Aluguel registrado com sucesso.</p>
              </div>
            ) : (
              <>
                <h3>Alugar {carroSelecionado?.marca} {carroSelecionado?.modelo}</h3>
                {error && <div className="seminos-modal-error">{error}</div>}
                
                <form onSubmit={handleSubmitAluguel}>
                  <div className="seminos-form-group">
                    <label>Data de Início</label>
                    <input
                      type="datetime-local"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="seminos-form-group">
                    <label>Data de Término</label>
                    <input
                      type="datetime-local"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      min={formData.dataInicio}
                      required
                    />
                  </div>
                  
                  <div className="seminos-form-group">
                    <label>Valor Total</label>
                    <input
                      type="text"
                      value={`R$ ${formData.valorTotal}`}
                      readOnly
                    />
                  </div>
                  
                  <div className="seminos-form-group">
                    <label>Observações</label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="seminos-modal-botoes">
                    <button
                      type="button"
                      className="seminos-modal-cancelar"
                      onClick={() => setShowAluguelModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="seminos-modal-confirmar"
                      disabled={loadingAluguel}
                    >
                      {loadingAluguel ? 'Processando...' : 'Confirmar'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarrosSeminovos;
