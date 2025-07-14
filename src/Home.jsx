import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Carousel from './components/Carousel';
import './styles/Home.css';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mensagem = location.state?.mensagem;

  const carros0KM = [
    { id: 1, nome: "Grand Siena", img: "src/assets/images/GrandSienaT.png" },
    { id: 2, nome: "Fiat Argo Tributo 125", img: "src/assets/images/FiatArgoTributo125T.png" },
    { id: 3, nome: "Renault Stepway", img: "src/assets/images/RenaultStepwayT.png" },
    { id: 4, nome: "Fiat Argo", img: "src/assets/images/FiatArgoT.png" },
    { id: 5, nome: "Renault Kwid", img: "src/assets/images/RenaultKwidT.png" }
  ];

  const handleCarroClick = (id) => {
    navigate(`/carros/${id}`);
  };

  const handleMarcaClick = (marca) => {
    navigate(`/novos?marca=${encodeURIComponent(marca)}`);
  };

  return (
    <div className="home-container">
      {mensagem && (
        <div className="home-mensagem mensagem-sucesso">
          {mensagem}
        </div>
      )}

      <Carousel />

      <div className="section">
        <h2>Carros 0KM</h2>
        <div className="car-row">
          {carros0KM.map((carro) => (
            <img
              key={carro.id}
              src={carro.img}
              alt={carro.nome}
              onClick={() => handleCarroClick(carro.id)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Escolha uma marca</h2>
        <div className="brand-row">
          <img
            src="src/assets/images/fiat.png"
            alt="Fiat"
            onClick={() => handleMarcaClick("Fiat")}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="src/assets/images/renault.png"
            alt="Renault"
            onClick={() => handleMarcaClick("Renault")}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="src/assets/images/Honda.png"
            alt="Honda"
            onClick={() => handleMarcaClick("Honda")}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="src/assets/images/chevro.png"
            alt="Chevrolet"
            onClick={() => handleMarcaClick("Chevrolet")}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="src/assets/images/Volkswagen.png"
            alt="Volkswagen"
            onClick={() => handleMarcaClick("Volkswagen")}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className="section dealership-info">
        <img
          src="src/assets/images/descricao.png"
          alt="Nossa Concessionária"
          className="dealership-image"
        />
        <p className="dealership-description">
          Bem-vindo à nossa concessionária! Com anos de tradição e excelência no mercado automotivo,
          oferecemos as melhores opções de carros novos e seminovos com qualidade garantida, atendimento diferenciado
          e condições imperdíveis. Venha nos visitar e encontrar o carro dos seus sonhos!
        </p>
      </div>
    </div>
  );
};

export default Home;
