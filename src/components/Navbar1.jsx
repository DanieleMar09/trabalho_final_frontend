// Navbar1.js

import React, { useState, useEffect } from 'react';
import '../styles/Navbar1.css';
import logo from '../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';

const Navbar1 = () => {
  const [location, setLocation] = useState('São Paulo, SP');
  const [showModal, setShowModal] = useState(false);
  const [inputLocation, setInputLocation] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [isRequestingGeo, setIsRequestingGeo] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: '' });
  const [cartCount, setCartCount] = useState(0);

  // This function fetches the cart count from the backend
  const fetchCartCount = async () => {
    const usuarioId = localStorage.getItem('userId') || 1; // Assuming a default user ID for now
    if (usuarioId) {
      try {
        const res = await axios.get(`https://localhost:7239/api/Carrinho/usuario/${usuarioId}`);
        if (res.data && res.data.Itens) {
          const total = res.data.Itens.reduce((acc, item) => acc + item.Quantidade, 0);
          localStorage.setItem('cartCount', total.toString());
          setCartCount(total);
        } else {
          localStorage.setItem('cartCount', '0');
          setCartCount(0);
        }
      } catch (err) {
        console.error("Erro ao buscar contagem do carrinho:", err);
        localStorage.setItem('cartCount', '0');
        setCartCount(0);
      }
    } else {
      localStorage.setItem('cartCount', '0');
      setCartCount(0);
    }
  };

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
        fetchCartCount();
      } else {
        setUserInfo({ name: '', email: '', role: '' });
        setCartCount(0);
      }
    };

    const syncCartCount = () => {
      const count = parseInt(localStorage.getItem('cartCount')) || 0;
      setCartCount(count);
    };

    const handleLoginChanged = () => {
      checkAuth();
    };

    // New event handler for when cart is updated
    const handleCartUpdated = () => {
      fetchCartCount();
    };

    checkAuth();
    syncCartCount();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('loginChanged', handleLoginChanged);
    window.addEventListener('cartUpdated', handleCartUpdated); // Listen for the new event

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('loginChanged', handleLoginChanged);
      window.removeEventListener('cartUpdated', handleCartUpdated); // Clean up the listener
    };
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair da sua conta?');
    if (confirmLogout) {
      localStorage.removeItem('email');
      localStorage.removeItem('nome');
      localStorage.removeItem('role');
      localStorage.removeItem('idUsuario');
      localStorage.removeItem('authToken');
      // Also clear cart-related data on logout
      localStorage.removeItem('cartCount');
      window.location.href = '/';
    }
  };

  return (
    <div className="navbar1">
      <div className="navbar-content">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
        </div>

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

        <div className="right-section">
          {isLoggedIn && (
            <div className="navbar2-cart">
              <Link to="/carrinho" className="cart-icon">
                <FaShoppingCart size={20} color="red" />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          )}

          {isLoggedIn ? (
            <div
              className="profile-container"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div className="profile-info">
                <Link to="/" className="profile-icon">
                  <i className="fas fa-user-circle"></i>
                </Link>
              </div>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-email">{userInfo.email}</div>
                    <div className="user-status">
                      <i className="fas fa-circle status-online"></i> Online
                    </div>
                  </div>

                  <div className="dropdown-section">
                    <div className="section-title">CONTATOS</div>
                    <Link to="/contatos" className="dropdown-item">
                      <i className="fas fa-address-book"></i> Contatos
                    </Link>
                  </div>

                  <div className="dropdown-section">
                    <div className="section-title">CONTA</div>
                    <Link to="/configuracoes" className="dropdown-item">
                      <i className="fas fa-cog"></i> Configurações
                    </Link>
                  </div>

                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Entre</Link>
              <span className="auth-separator">|</span>
              <Link to="/cadastro" className="auth-link">Cadastre-se</Link>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="location-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3>Informe sua localização</h3>

            <div className="search-container">
              <input
                type="text"
                className="unified-search"
                placeholder="Digite CEP, cidade ou endereço"
                value={inputLocation}
                onChange={e => setInputLocation(e.target.value)}
              />
              <button className="search-btn" onClick={() => {/* sua busca aqui */}}>Buscar</button>
              <button
                className="location-btn"
                disabled={isRequestingGeo}
                onClick={() => {
                  setIsRequestingGeo(true);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      position => {
                        setIsRequestingGeo(false);
                        const { latitude, longitude } = position.coords;
                        setLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
                        setShowModal(false);
                      },
                      error => {
                        setIsRequestingGeo(false);
                        alert('Erro ao obter localização');
                      }
                    );
                  } else {
                    alert('Geolocalização não suportada');
                    setIsRequestingGeo(false);
                  }
                }}
              >
                Usar localização atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar1;