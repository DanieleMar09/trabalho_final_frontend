import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/SemiNovos.css";
import { format, differenceInDays } from 'date-fns';

const CarrosSeminovos = () => {
  const API_BASE_URL = "https://localhost:7239/api/v1";
  
  const [carros, setCarros] = useState([]);
  const [search, setSearch] = useState("");
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

      const carrosNormalizados = response.data.map((carro, index) => ({
        id: carro.id || carro.Id || `temp-id-${index}`,
        marca: carro.marca || carro.Marca,
        modelo: carro.modelo || carro.Modelo,
        ano: carro.ano || carro.Ano,
        quilometragem: carro.quilometragem || carro.Quilometragem,
        cor: carro.cor || carro.Cor,
        imagemUrl: carro.imagemUrl || carro.Imagem,
        valorDiaria: carro.valorDiaria || carro.ValorDiaria || (carro.preco || carro.Preco) * 0.005
      }));

      setCarros(carrosNormalizados);
    } catch (error) {
      console.error("Erro ao buscar carros:", error);
      setError("Erro ao carregar veículos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const carrosFiltrados = carros.filter(carro => {
    const busca = search.toLowerCase();
    return `${carro.marca} ${carro.modelo}`.toLowerCase().includes(busca);
  });

  const abrirModalAluguel = (carro) => {
    setCarroSelecionado(carro);
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 3);
    
    setFormData({
      dataInicio: format(dataInicio, "yyyy-MM-dd'T'HH:mm"),
      dataFim: format(dataFim, "yyyy-MM-dd'T'HH:mm"),
      valorTotal: (carro.valorDiaria * 3).toFixed(2),
      observacoes: ''
    });
    setShowAluguelModal(true);
    setAluguelSucesso(false);
    setError(null);
  };

  const calcularValorAluguel = () => {
    if (!formData.dataInicio || !formData.dataFim || !carroSelecionado) return;
    
    try {
      const inicio = new Date(formData.dataInicio);
      const fim = new Date(formData.dataFim);
      
      if (fim <= inicio) {
        return { dias: 0, total: 0 };
      }
      
      const dias = differenceInDays(fim, inicio) || 1;
      const total = dias * carroSelecionado.valorDiaria;
      
      return { dias, total };
    } catch (error) {
      console.error("Erro no cálculo:", error);
      return { dias: 0, total: 0 };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if ((name === 'dataInicio' || name === 'dataFim') && carroSelecionado) {
      const calculo = calcularValorAluguel();
      if (calculo) {
        setFormData(prev => ({
          ...prev,
          valorTotal: calculo.total.toFixed(2)
        }));
      }
    }
  };

  const handleSubmitAluguel = async (e) => {
    e.preventDefault();
    setLoadingAluguel(true);
    setError(null);

    const calculo = calcularValorAluguel();
    if (!calculo || calculo.dias < 1) {
      setError("Período de aluguel inválido. A data de término deve ser posterior à data de início.");
      setLoadingAluguel(false);
      return;
    }

    try {
      // Formatar datas para ISO 8601 (formato esperado pela API)
      const formatarDataParaISO = (dataString) => {
        const data = new Date(dataString);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        return `${ano}-${mes}-${dia}T${horas}:${minutos}:00`;
      };

      const payload = {
        carroId: carroSelecionado.id,
        cor: carroSelecionado.cor || "Indefinida",
        dataInicio: formatarDataParaISO(formData.dataInicio),
        dataFim: formatarDataParaISO(formData.dataFim),
        valorTotal: parseFloat(formData.valorTotal),
        observacoes: formData.observacoes,
        status: "Pendente",
        usuarioId: 1
      };

      console.log("Enviando payload para aluguel:", payload);
      console.log("Endpoint: ", `${API_BASE_URL}/Aluguel/cadastrar`);

      const response = await axios.post(
        `${API_BASE_URL}/Aluguel/cadastrar`, // URL corrigida
        payload,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 10000
        }
      );

      console.log("Aluguel cadastrado com sucesso:", response.data);
      
      if (response.status === 200 || response.status === 201) {
        setAluguelSucesso(true);
        setTimeout(() => {
          setShowAluguelModal(false);
        }, 2000);
      } else {
        throw new Error(`Resposta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar aluguel:", error);
      
      let errorMessage = "Erro ao registrar aluguel";
      if (error.response) {
        console.error("Detalhes do erro:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
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
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão de internet.";
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

  const { dias = 0 } = calcularValorAluguel() || {};

  return (
    <div className="seminos-container">
      <h2 className="seminos-titulo">Carros Disponíveis para Aluguel</h2>

      <div className="seminos-filtros">
        <input
          type="text"
          placeholder="Pesquisar veículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="seminos-pesquisa-input"
        />
      </div>

      <div className="seminos-grid">
        {carrosFiltrados.length > 0 ? (
          carrosFiltrados.map((carro) => (
            <div className="seminos-card" key={carro.id}>
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
                <p className="valor-diaria">
                  <strong>Diária:</strong> R$ {carro.valorDiaria.toFixed(2)}
                </p>
                <p className="info-aluguel">Alugue por 3 dias: R$ {(carro.valorDiaria * 3).toFixed(2)}</p>
              </div>
              <button 
                className="seminos-comprar-btn"
                onClick={() => abrirModalAluguel(carro)}
              >
                Alugar Agora
              </button>
            </div>
          ))
        ) : (
          <p className="seminos-sem-resultados">Nenhum carro encontrado</p>
        )}
      </div>

      {showAluguelModal && carroSelecionado && (
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
                <div className="seminos-sucesso-icon">✓</div>
                <h3>Aluguel Confirmado!</h3>
                <p>Seu aluguel para {carroSelecionado.marca} {carroSelecionado.modelo} foi registrado com sucesso.</p>
              </div>
            ) : (
              <>
                <h3>Alugar {carroSelecionado.marca} {carroSelecionado.modelo}</h3>
                {error && <div className="seminos-modal-error">{error}</div>}
                
                <div className="detalhes-aluguel">
                  <p><strong>Valor da diária:</strong> R$ {carroSelecionado.valorDiaria.toFixed(2)}</p>
                </div>
                
                <form onSubmit={handleSubmitAluguel}>
                  <div className="seminos-form-group">
                    <label>Data de Início</label>
                    <input
                      type="datetime-local"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      required
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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
                  
                  <div className="resumo-aluguel">
                    <div className="resumo-item">
                      <span>Dias de aluguel:</span>
                      <span className="destaque-valor">{dias} {dias === 1 ? 'dia' : 'dias'}</span>
                    </div>
                    <div className="resumo-item">
                      <span>Valor total:</span>
                      <span className="destaque-valor">R$ {formData.valorTotal}</span>
                    </div>
                  </div>
                  
                  <div className="seminos-form-group">
                    <label>Observações</label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      placeholder="Informações adicionais sobre o aluguel"
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
                      {loadingAluguel ? (
                        <>
                          <span className="spinner"></span> Processando...
                        </>
                      ) : 'Confirmar Aluguel'}
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