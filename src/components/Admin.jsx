// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

const AdminPanel = () => {
  // Estados para controle das abas e dados
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [newCar, setNewCar] = useState({
    marca: '',
    modelo: '',
    ano: '',
    preco: '',
    tipo: 'usado',
    placa: '',
    disponivel: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Busca usuários da API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7239/api/v1/usuarios/listar');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Cadastra novo carro
  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://localhost:7239/api/v1/usados/cadastrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCar),
      });

      if (!response.ok) throw new Error('Erro no cadastro');
      
      alert('Carro cadastrado com sucesso!');
      setNewCar({
        marca: '',
        modelo: '',
        ano: '',
        preco: '',
        tipo: 'usado',
        placa: '',
        disponivel: true
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza campos do formulário de carros
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCar({
      ...newCar,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Carrega usuários ao abrir a aba
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  return (
    <div className="admin-panel">
      <h1>Área Administrativa</h1>
      
      <div className="tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Usuários Cadastrados
        </button>
        <button 
          className={activeTab === 'cars' ? 'active' : ''}
          onClick={() => setActiveTab('cars')}
        >
          Cadastrar Carros
        </button>
      </div>

      {loading && <div className="loader">Carregando...</div>}
      {error && <div className="error">{error}</div>}

      <div className="tab-content">
        {activeTab === 'users' && (
          <div className="user-list">
            <h2>Lista de Usuários</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.tipoUsuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'cars' && (
          <div className="car-form">
            <h2>Cadastrar Novo Veículo</h2>
            <form onSubmit={handleCarSubmit}>
              <div className="form-group">
                <label>Marca:</label>
                <input
                  type="text"
                  name="marca"
                  value={newCar.marca}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Modelo:</label>
                <input
                  type="text"
                  name="modelo"
                  value={newCar.modelo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Ano:</label>
                <input
                  type="number"
                  name="ano"
                  value={newCar.ano}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Preço (R$):</label>
                <input
                  type="number"
                  name="preco"
                  value={newCar.preco}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Placa:</label>
                <input
                  type="text"
                  name="placa"
                  value={newCar.placa}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  name="tipo"
                  value={newCar.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="usado">Usado</option>
                  <option value="novo">Novo</option>
                  <option value="aluguel">Para Aluguel</option>
                </select>
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="disponivel"
                    checked={newCar.disponivel}
                    onChange={handleInputChange}
                  />
                  Disponível
                </label>
              </div>
              
              <button type="submit" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;