import React, { useContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigContext } from './components/ConfigContext';

import Home from './Home';
import Novos from './Novos';
import SemiNovos from './SemiNovos';
import Cadastro from './components/Cadastro';
import Login from './components/Login';
import Detalhes from './components/Detalhes';
import RedefinirSenha from './components/RedefinirSenha';
import UserProfile from './components/UserProfile';
import Aluguel from './components/Aluguel';
import Carrinho from './components/Carrinho';
import Configuracoes from './components/Configuracoes';

import Navbar1 from './components/Navbar1';
import Navbar2 from './components/Navbar2';
import Menu from './components/Menu';
import Footer from './components/Footer';
import FinalizarCompra from './components/FinalizarCompra';
import ScrollToTop from './components/ScrollToTop';
import Contato from './components/Contato';
import Admin from './components/Admin';
import Agendamentos from './components/Agendamentos';



import { FaWhatsapp } from 'react-icons/fa';
import './styles/Configuracoes.css';
import './styles/Wpp.css';

const App = () => {
  const { config } = useContext(ConfigContext);

  useEffect(() => {
    const body = document.body;

    body.className = '';
    body.classList.add(config.tema); // claro ou escuro
    body.classList.add(`fonte-${config.tamanhoFonte}`); // fonte-pequeno, fonte-medio, fonte-grande
    if (config.acessibilidade) {
      body.classList.add('acessibilidade');
    }
  }, [config]);

  return (
    <>
      <Navbar1 />
      <Menu />
      <Navbar2 />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/novos" element={<Novos />} />
        <Route path="/seminovos" element={<SemiNovos />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carros/:id" element={<Detalhes />} />
        <Route path="/recuperar-senha" element={<RedefinirSenha />} />
        <Route path="/perfil" element={<UserProfile />} />
        <Route path="/aluguel" element={<Aluguel />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
         <Route path="/finalizar" element={<FinalizarCompra />} />
               <Route path="/contatos" element={<Contato />} />
               <Route path="/admin" element={<Admin />} />
                <Route path="/agendamentos" element={<Agendamentos />} />
      </Routes>

      <Footer />

      <a href="https://wa.me/5531987340716" target="_blank" rel="noopener noreferrer" className="whatsapp-icon">
        <FaWhatsapp size={40} color="#ffffff" />
      </a>
    </>
  );
};

export default App;
