import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import "../styles/Aluguel.css";

const AluguelSeminovosPage = () => {
  const [alugueis, setAlugueis] = useState([]);
  const [carrosDisponiveis, setCarrosDisponiveis] = useState([]);
  const [loading, setLoading] = useState({
    page: true,
    form: false
  });
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [erro, setErro] = useState(null);

  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    valorTotal: '',
    cor: 'Prata',
    carroId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alugueisRes, carrosRes] = await Promise.all([
          axios.get('https://localhost:7239/api/Alugueis'),
          axios.get('https://localhost:7239/api/v1/usados/listar/disponiveis')
        ]);
        
        setAlugueis(alugueisRes.data);
        setCarrosDisponiveis(carrosRes.data);
      } catch (err) {
        setErro('Erro ao carregar dados. Tente recarregar a página.');
        console.error('Erro na requisição:', err);
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCarroChange = (e) => {
    const carroId = e.target.value;
    const carroSelecionado = carrosDisponiveis.find(c => c.id.toString() === carroId);
    
    setFormData(prev => ({
      ...prev,
      carroId,
      valorTotal: carroSelecionado ? carroSelecionado.valorDiaria * 7 : '' // Valor padrão para 1 semana
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));
    setErro(null);
    
    try {
      const usuarioId = 1; // Em uma aplicação real, isso viria do contexto de autenticação
      const payload = {
        ...formData,
        valorTotal: parseFloat(formData.valorTotal),
        carroId: parseInt(formData.carroId),
        usuarioId,
        status: 'Pendente'
      };

      const response = await axios.post('https://localhost:7239/api/Alugueis', payload);
      
      setAlugueis([response.data, ...alugueis]);
      setFormData({
        dataInicio: '',
        dataFim: '',
        valorTotal: '',
        cor: 'Prata',
        carroId: ''
      });
      setShowForm(false);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar aluguel. Verifique os dados e tente novamente.');
      console.error('Erro no cadastro:', err);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const formatarData = (dateStr) => {
    return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const calcularDias = (inicio, fim) => {
    const diff = new Date(fim) - new Date(inicio);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const alugueisFiltrados = filtro === 'todos' 
    ? alugueis 
    : alugueis.filter(a => a.status === filtro);

  return (
    <div className="aluguel-container">
      <header className="aluguel-header">
        <h1>Aluguel de Veículos Seminovos</h1>
        <p>Escolha entre nossos veículos seminovos disponíveis para aluguel</p>
      </header>

      <section className="veiculos-disponiveis">
        <h2>Carros Disponíveis para Aluguel</h2>
        
        {loading.page ? (
          <div className="loading-spinner"></div>
        ) : erro ? (
          <div className="error-message">{erro}</div>
        ) : carrosDisponiveis.length === 0 ? (
          <p className="no-results">Nenhum veículo disponível no momento.</p>
        ) : (
          <div className="carros-grid">
            {carrosDisponiveis.map(carro => (
              <div key={carro.id} className="carro-card">
                <div className="carro-imagem">
                  <img src={carro.imagemUrl || 'https://via.placeholder.com/300x200?text=Veículo'} alt={`${carro.marca} ${carro.modelo}`} />
                </div>
                <div className="carro-info">
                  <h3>{carro.marca} {carro.modelo}</h3>
                  <p>Ano: {carro.ano}</p>
                  <p>KM: {carro.quilometragem.toLocaleString('pt-BR')}</p>
                  <p>Diária: <strong>R$ {carro.valorDiaria?.toFixed(2)}</strong></p>
                  <button 
                    onClick={() => {
                      setShowForm(true);
                      setFormData(prev => ({
                        ...prev,
                        carroId: carro.id.toString(),
                        valorTotal: carro.valorDiaria * 7
                      }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="alugar-btn"
                  >
                    Alugar este veículo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="form-overlay">
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>Solicitar Aluguel</h2>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowForm(false)}
                disabled={loading.form}
              >
                &times;
              </button>
            </div>
            
            {erro && <div className="form-error">{erro}</div>}
            
            <div className="form-group">
              <label>Veículo Selecionado</label>
              <select 
                name="carroId" 
                value={formData.carroId} 
                onChange={handleCarroChange} 
                required
                disabled={loading.form}
              >
                <option value="">Selecione um veículo</option>
                {carrosDisponiveis.map(carro => (
                  <option key={carro.id} value={carro.id}>
                    {carro.marca} {carro.modelo} ({carro.ano}) - R$ {carro.valorDiaria?.toFixed(2)}/dia
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data de Início</label>
                <input 
                  type="datetime-local" 
                  name="dataInicio" 
                  value={formData.dataInicio} 
                  onChange={handleChange} 
                  required
                  disabled={loading.form}
                />
              </div>
              
              <div className="form-group">
                <label>Data de Término</label>
                <input 
                  type="datetime-local" 
                  name="dataFim" 
                  value={formData.dataFim} 
                  onChange={handleChange} 
                  required
                  disabled={loading.form}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valor Total</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="valorTotal" 
                  placeholder="Valor Total" 
                  value={formData.valorTotal} 
                  onChange={handleChange} 
                  required
                  disabled={loading.form}
                />
              </div>
              
              <div className="form-group">
                <label>Cor do Veículo</label>
                <select 
                  name="cor" 
                  value={formData.cor} 
                  onChange={handleChange} 
                  required
                  disabled={loading.form}
                >
                  <option value="Prata">Prata</option>
                  <option value="Preto">Preto</option>
                  <option value="Branco">Branco</option>
                  <option value="Vermelho">Vermelho</option>
                  <option value="Azul">Azul</option>
                  <option value="Cinza">Cinza</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading.form}
            >
              {loading.form ? (
                <>
                  <span className="spinner"></span>
                  Processando...
                </>
              ) : 'Confirmar Aluguel'}
            </button>
          </form>
        </div>
      )}

      <section className="historico-alugueis">
        <div className="section-header">
          <h2>Histórico de Aluguéis</h2>
          <div className="filtros">
            <button 
              className={filtro === 'todos' ? 'active' : ''}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button 
              className={filtro === 'Pendente' ? 'active' : ''}
              onClick={() => setFiltro('Pendente')}
            >
              Pendentes
            </button>
            <button 
              className={filtro === 'Confirmado' ? 'active' : ''}
              onClick={() => setFiltro('Confirmado')}
            >
              Confirmados
            </button>
            <button 
              className={filtro === 'Cancelado' ? 'active' : ''}
              onClick={() => setFiltro('Cancelado')}
            >
              Cancelados
            </button>
          </div>
        </div>
        
        {loading.page ? (
          <div className="loading-spinner"></div>
        ) : alugueisFiltrados.length === 0 ? (
          <p className="no-results">Nenhum aluguel encontrado.</p>
        ) : (
          <div className="alugueis-table-container">
            <table className="alugueis-table">
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Período</th>
                  <th>Duração</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alugueisFiltrados.map(aluguel => {
                  const carro = carrosDisponiveis.find(c => c.id === aluguel.carroId) || {};
                  return (
                    <tr key={aluguel.id} className={`status-${aluguel.status.toLowerCase()}`}>
                      <td>
                        <div className="veiculo-info">
                          <strong>{carro.marca} {carro.modelo}</strong>
                          <span>{carro.ano} • {aluguel.cor}</span>
                        </div>
                      </td>
                      <td>
                        {formatarData(aluguel.dataInicio)} <br />
                        até <br />
                        {formatarData(aluguel.dataFim)}
                      </td>
                      <td>{calcularDias(aluguel.dataInicio, aluguel.dataFim)} dias</td>
                      <td>R$ {aluguel.valorTotal.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${aluguel.status.toLowerCase()}`}>
                          {aluguel.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AluguelSeminovosPage;