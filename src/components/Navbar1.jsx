import React, { useState, useEffect } from 'react';
import '../styles/Navbar1.css';
import logo from '../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar1 = () => {
  const [location, setLocation] = useState('São Paulo, SP');
  const [showModal, setShowModal] = useState(false);
  const [inputLocation, setInputLocation] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [isRequestingGeo, setIsRequestingGeo] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('nome');
      const role = localStorage.getItem('role') || 'Cliente';
      setIsLoggedIn(!!email);

      if (email) {
        setUserInfo({
          name: name || 'Usuário',
          email: email,
          role: role
        });
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair da sua conta?');
    if (confirmLogout) {
      localStorage.removeItem('email');
      localStorage.removeItem('nome');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
  };

  const handleSearch = async () => {
    const cep = inputLocation.replace(/\D/g, '');

    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          const cityState = `${data.localidade}, ${data.uf}`;
          setTempLocation(`${cityState}, Brasil`);
        } else {
          alert('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP');
      }
    } else {
      setTempLocation(`${inputLocation}, Brasil`);
    }
  };

  const requestGeolocation = () => {
    setIsRequestingGeo(true);
    const confirmation = window.confirm(
      'Para usar a localização automática, precisamos da sua permissão. Deseja permitir o acesso à sua localização?'
    );

    if (confirmation) {
      handleGetLocation();
    } else {
      setIsRequestingGeo(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            if (data.address) {
              const city = data.address.city || data.address.town || data.address.village;
              const state = data.address.state;
              if (city && state) {
                setTempLocation(`${city}, ${state}, Brasil`);
              }
            }
          } catch (err) {
            console.error('Erro ao buscar localização:', err);
            setTempLocation('São Paulo, SP, Brasil');
          } finally {
            setIsRequestingGeo(false);
          }
        },
        (err) => {
          console.error('Erro de geolocalização:', err);
          setIsRequestingGeo(false);
          alert('Não foi possível obter a localização. Por favor, insira manualmente.');
        },
        { timeout: 10000 }
      );
    } else {
      alert('Geolocalização não suportada pelo seu navegador');
      setIsRequestingGeo(false);
    }
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      setLocation(tempLocation.split(',').slice(0, 2).join(','));
    } else if (inputLocation) {
      setLocation(inputLocation);
    }
    setShowModal(false);
  };

  return (
    <div className="navbar1">
      <div className="navbar-content">
        {/* ---------- LOGO ---------- */}
        <div className="logo-container">
          <a href="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </a>
        </div>

        {/* ---------- LOCALIZAÇÃO ---------- */}
        <span
          className="location-text"
          onClick={() => setShowModal(true)}
          style={{ cursor: 'pointer' }}
        >
          Estou em: <span className="location-city">{location.split(',')[0]}</span>
          {location.includes(',') && (
            <span className="location-state">, {location.split(',')[1]}</span>
          )}
        </span>

        {/* ---------- SEÇÃO DIREITA ---------- */}
        <div className="right-section">
          {/* Carrinho (NÃO aciona dropdown) */}
          <div className="navbar2-cart">
            <Link to="/carrinho" className="cart-icon">
              <FaShoppingCart size={20} color="red" />
            </Link>
          </div>

          {/* Perfil (SOMENTE ele controla o dropdown) */}
          {isLoggedIn ? (
            <div
              className="profile-container"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div className="profile-info">
                <a href="/perfil" className="profile-icon">
                  <i className="fas fa-user-circle"></i>
                </a>
              </div>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-email">{userInfo.email}</div>
                    <div className="user-status">
                      <i className="fas fa-circle status-online"></i> Online
                    </div>
                  </div>

                  <a href="/perfil" className="dropdown-item">
                    <i className="fas fa-user"></i> Meu Perfil
                  </a>

                  <div className="dropdown-section">
                    <div className="section-title">CONTATOS</div>
                    <a href="/contatos" className="dropdown-item">
                      <i className="fas fa-address-book"></i> Contatos
                    </a>
                    <a href="https://wa.me/5531987340716" className="dropdown-item">
                      <i className="fas fa-headset"></i> Suporte
                    </a>
                  </div>

                  <div className="dropdown-section">
                    <div className="section-title">SERVIÇOS</div>
                    <a href="/agendamentos" className="dropdown-item">
                      <i className="fas fa-calendar-check"></i> Agendamentos
                    </a>
                    
                  </div>

                  <div className="dropdown-section">
                    <div className="section-title">CONTA</div>
                    <a href="/configuracoes" className="dropdown-item">
                      <i className="fas fa-cog"></i> Configurações
                    </a>
                  </div>

                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <a href="/login" className="auth-link">Entre</a>
              <span className="auth-separator">|</span>
              <a href="/cadastro" className="auth-link">Cadastre-se</a>
            </div>
          )}
        </div>
      </div>

      {/* ---------- MODAL DE LOCALIZAÇÃO ---------- */}
      {showModal && (
        <div className="location-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3>Informe sua localização</h3>

            <div className="search-container">
              <input
                type="text"
                className="unified-search"
                placeholder="Digite CEP, cidade ou endereço"
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
              />
              <button className="search-button" onClick={handleSearch}>
                Buscar
              </button>
            </div>

            {tempLocation && <div className="suggested-location">{tempLocation}</div>}

            <button
              className="auto-location-btn"
              onClick={requestGeolocation}
              disabled={isRequestingGeo}
            >
              {isRequestingGeo ? 'Solicitando permissão...' : 'UTILIZAR LOCALIZAÇÃO AUTOMÁTICA'}
            </button>

            <button className="confirm-btn" onClick={handleConfirmLocation}>
              Confirmar
            </button>

            <div className="location-disclaimer">
              Importante: Os dados de sua localização são utilizados instantaneamente para que possamos
              indicar os preços de acordo com a sua região e as concessionárias mais próximas de você.
              Não guardamos estes dados. Caso opte por não confirmar sua geolocalização, você verá as
              ofertas válidas para preços do DF.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar1;
