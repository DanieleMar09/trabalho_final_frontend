import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '../styles/Agendamentos.css';

// Serviço de imagens - fallback para diferentes categorias de veículos
const getVehicleImage = (modelo, categoria) => {
  // Primeiro tenta determinar pela categoria
  if (categoria) {
    categoria = categoria.toLowerCase();
    if (categoria.includes('hatch')) return 'https://storage.googleapis.com/car-placeholder-images/hatchback.png';
    if (categoria.includes('sedan')) return 'https://storage.googleapis.com/car-placeholder-images/sedan.png';
    if (categoria.includes('suv')) return 'https://storage.googleapis.com/car-placeholder-images/suv.png';
    if (categoria.includes('pickup') || categoria.includes('picape')) 
      return 'https://storage.googleapis.com/car-placeholder-images/pickup.png';
    if (categoria.includes('esportivo')) return 'https://storage.googleapis.com/car-placeholder-images/sports.png';
  }
  
  // Se não tiver categoria, tenta pelo modelo
  if (modelo) {
    modelo = modelo.toLowerCase();
    if (modelo.includes('hatch')) return 'https://storage.googleapis.com/car-placeholder-images/hatchback.png';
    if (modelo.includes('sedan')) return 'https://storage.googleapis.com/car-placeholder-images/sedan.png';
    if (modelo.includes('suv')) return 'https://storage.googleapis.com/car-placeholder-images/suv.png';
    if (modelo.includes('toro') || modelo.includes('hilux') || modelo.includes('ranger') || modelo.includes('s10')) 
      return 'https://storage.googleapis.com/car-placeholder-images/pickup.png';
    if (modelo.includes('bmw') || modelo.includes('mercedes') || modelo.includes('porsche')) 
      return 'https://storage.googleapis.com/car-placeholder-images/sports.png';
  }
  
  // Fallback genérico
  return 'https://storage.googleapis.com/car-placeholder-images/generic-car.png';
};

const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('idUsuario');

        if (!token || !userId) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        // 1. Buscar agendamentos
        const agendamentosResponse = await axios.get(
          `https://localhost:7239/api/v1/Aluguel/buscar/${userId}`,
          config
        );

        console.log("Resposta de agendamentos:", agendamentosResponse.data);

        // Tratamento flexível da resposta
        let agendamentosData = agendamentosResponse.data?.data || agendamentosResponse.data;
        
        // Normalizar para array
        if (!agendamentosData) agendamentosData = [];
        if (!Array.isArray(agendamentosData)) {
          agendamentosData = [agendamentosData];
        }

        // 2. Buscar todos os carros
        let carrosData = [];
        try {
          const carrosResponse = await axios.get(
            'https://localhost:7239/api/v1/usados/listar',
            config
          );
          
          carrosData = carrosResponse.data?.data || carrosResponse.data || [];
          
          // Normalizar para array
          if (!Array.isArray(carrosData)) {
            carrosData = [carrosData];
          }
        } catch (carrosError) {
          console.error('Erro ao buscar carros, usando fallback:', carrosError);
        }

        // Criar mapa de carros
        const carrosMap = {};
        carrosData.forEach(carro => {
          const id = carro.id || carro.Id;
          if (id) carrosMap[id] = carro;
        });

        // 3. Processar agendamentos com imagens
        const agendamentosCompletos = agendamentosData.map(aluguel => {
          const carroId = aluguel.CarroId;
          const carro = carroId ? carrosMap[carroId] : null;
          
          // Função para formatar datas
          const formatarData = (dateString) => {
            if (!dateString) return 'Data não informada';
            try {
              const dateObj = new Date(dateString);
              return isNaN(dateObj) ? dateString : format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
            } catch {
              return dateString;
            }
          };

          // Determinar dados do veículo
          const modelo = carro?.modelo || carro?.Modelo || 'Veículo não especificado';
          const marca = carro?.marca || carro?.Marca || '';
          const categoria = carro?.categoria || carro?.Categoria || '';
          
          // URL da imagem com prioridades
          let imagemUrl = '';
          if (carro) {
            // 1. URL direta da API
            if (carro.imagemUrl) imagemUrl = carro.imagemUrl;
            else if (carro.ImagemUrl) imagemUrl = carro.ImagemUrl;
            
            // 2. URL construída com base no ID
            if (!imagemUrl && carro.id) {
              imagemUrl = `https://localhost:7239/api/v1/usados/imagem/${carro.id}`;
            }
          }
          
          // 3. Imagem genérica baseada no modelo/categoria
          if (!imagemUrl) {
            imagemUrl = getVehicleImage(modelo, categoria);
          }

          return {
            id: aluguel.Id || aluguel.id || Math.random().toString(),
            modelo,
            marca,
            cor: aluguel.Cor || carro?.cor || carro?.Cor || 'Cor não informada',
            dataInicio: formatarData(aluguel.DataInicio),
            dataFim: formatarData(aluguel.DataFim),
            imagem: imagemUrl,
            status: aluguel.Status || 'Indefinido',
            valorTotal: aluguel.ValorTotal ? `R$ ${aluguel.ValorTotal.toFixed(2)}` : 'Valor não informado',
            carroId
          };
        });

        setAgendamentos(agendamentosCompletos);
      } catch (err) {
        setError('Erro ao carregar agendamentos: ' + (err.message || 'Erro desconhecido'));
        console.error('Erro principal na requisição:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manipulador de erro de imagem
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="agendamentos-container">
        <h2 className="titulo">Meus Agendamentos</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agendamentos-container">
        <h2 className="titulo">Meus Agendamentos</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="agendamentos-container">
      <h2 className="titulo">Meus Agendamentos</h2>

      {agendamentos.length === 0 ? (
        <p className="nenhum">Nenhum agendamento encontrado.</p>
      ) : (
        <div className="lista-agendamentos">
          {agendamentos.map((ag) => {
            // Determinar a imagem final a ser exibida
            let imagemFinal = ag.imagem;
            
            // Se houve erro ao carregar, usar fallback
            if (imageErrors[ag.id]) {
              imagemFinal = getVehicleImage(ag.modelo, '');
            }
            
            return (
              <div
                key={ag.id}
                className={`card-agendamento status-${(ag.status || 'Indefinido').toLowerCase()}`}
              >
                <div className="imagem-container">
                  <img
                    src={imagemFinal}
                    alt={`${ag.marca} ${ag.modelo}`}
                    className="imagem-veiculo"
                    onError={() => handleImageError(ag.id)}
                  />
                  {imageErrors[ag.id] && (
                    <div className="imagem-error-overlay">
                      <span>Imagem não disponível</span>
                    </div>
                  )}
                </div>
                
                <div className="detalhes">
                  <h3>{ag.marca} {ag.modelo}</h3>
                  <p><strong>Cor:</strong> {ag.cor}</p>
                  <p><strong>Início:</strong> {ag.dataInicio}</p>
                  <p><strong>Fim:</strong> {ag.dataFim}</p>
                  <p><strong>Valor:</strong> {ag.valorTotal}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${(ag.status || 'Indefinido').toLowerCase()}`}>
                      {ag.status || 'Indefinido'}
                    </span>
                  </p>
                  
                  {ag.carroId && (
                    <a 
                      href={`/seminovos/${ag.carroId}`} 
                      className="link-veiculo"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver detalhes completos
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Agendamentos;