import React from 'react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h3>Dani&Thur Veículos</h3>
          <p>Seu próximo carro está aqui. Qualidade e confiança desde 1990.</p>
        </div>

        <div className="footer-section">
          <h4>Contato</h4>
          <p><FaMapMarkerAlt /> Treze de Maio - Sabará, MG</p>
          <p><FaPhoneAlt /> (31) 9 8734-0716</p>
          <p><FaEnvelope /> contato@Dani&Thurveiculos.com.br</p>
        </div>

        <div className="footer-section">
          <h4>Siga-nos</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Dani&Thur Veículos - Todos os direitos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;
