import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Aluguel.css";

const AluguelSeminovosPage = () => {
  const [alugueis, setAlugueis] = useState([]);
  const [seminovos, setSeminovos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    valorTotal: '',
    cor: 'Prata',
    carroId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [alugueisRes, seminovosRes] = await Promise.all([
          axios.get('https://localhost:7239/api/Alugueis').catch(() => ({ data: [] })),
          axios.get('https://localhost:7239/api/v1/usados/listar').catch(() => ({ data: [] }))
        ]);
        setAlugueis(alugueisRes.data);
        setSeminovos(seminovosRes.data);
      } catch (err) {
        alert('Erro ao buscar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const usuarioId = 1;
      const response = await axios.post('https://localhost:7239/api/Alugueis', {
        ...formData,
        valorTotal: parseFloat(formData.valorTotal),
        carroId: parseInt(formData.carroId),
        usuarioId
      });
      setAlugueis([...alugueis, response.data]);
      setFormData({
        dataInicio: '',
        dataFim: '',
        valorTotal: '',
        cor: 'Prata',
        carroId: ''
      });
      setShowForm(false);
      alert('Aluguel cadastrado!');
    } catch (err) {
      alert('Erro ao cadastrar aluguel');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <div className="aluguel-container">
      <h1>Aluguel de Seminovos</h1>

      <button className="toggle-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : 'Novo Aluguel'}
      </button>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Novo Aluguel</h2>

          <select name="carroId" value={formData.carroId} onChange={handleChange} required>
            <option value="">Selecione um seminovo</option>
            {seminovos.map(carro => (
              <option key={carro.id} value={carro.id}>
                {carro.marca} {carro.modelo} ({carro.ano}) - R$ {carro.preco?.toFixed(2)}
              </option>
            ))}
          </select>

          <input type="datetime-local" name="dataInicio" value={formData.dataInicio} onChange={handleChange} required />
          <input type="datetime-local" name="dataFim" value={formData.dataFim} onChange={handleChange} required />
          <input type="number" step="0.01" name="valorTotal" placeholder="Valor Total" value={formData.valorTotal} onChange={handleChange} required />
          <input type="text" name="cor" placeholder="Cor do carro" value={formData.cor} onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>
      )}

      <h2>Aluguéis Realizados</h2>

      {loading && alugueis.length === 0 ? (
        <p>Carregando dados...</p>
      ) : alugueis.length === 0 ? (
        <p>Nenhum aluguel encontrado.</p>
      ) : (
        <table className="aluguel-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Carro</th>
              <th>Período</th>
              <th>Valor</th>
              <th>Cor</th>
            </tr>
          </thead>
          <tbody>
            {alugueis.map(aluguel => {
              const carro = seminovos.find(c => c.id === aluguel.carroId);
              if (!carro) return null;
              return (
                <tr key={aluguel.id}>
                  <td>{aluguel.id}</td>
                  <td>{carro.marca} {carro.modelo} ({carro.ano})</td>
                  <td>{formatDate(aluguel.dataInicio)} - {formatDate(aluguel.dataFim)}</td>
                  <td>R$ {aluguel.valorTotal.toFixed(2)}</td>
                  <td>{aluguel.cor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AluguelSeminovosPage;
