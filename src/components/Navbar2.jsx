import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import '../styles/Navbar2.css';

const Navbar2 = () => {
  return (
    <nav className="navbar2">
      <div className="navbar2-menu">
        <ul>
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/novos">NOVOS</Link></li>
          <li><Link to="/seminovos">SEMI-NOVOS</Link></li>
 
        </ul>
      </div>
      
   
    </nav>
  );
};

export default Navbar2;