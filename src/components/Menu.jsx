import React, { useState } from 'react';
import '../styles/Menu.css';

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    {
      title: 'Carros',
      subItems: [
        { title: 'Novos', link: '/carros-novos' },
        { title: 'Seminovos', link: '/seminovos' },
        { title: 'Comparar', link: '/comparar' }
      ]
    },
    {
      title: 'Financiamento',
      subItems: [
        { title: 'Simular Financiamento', link: '/simular' },
        { title: 'Condições Especiais', link: '/condicoes' },
        { title: 'Financiamento Aprovado', link: '/aprovados' }
      ]
    },
    {
      title: 'Serviços',
      subItems: [
        { title: 'Agendar Revisão', link: '/revisao' },
        { title: 'Consultar Garantia', link: '/garantia' },
        { title: 'Peças e Acessórios', link: '/pecas' }
      ]
    }
  ];

  return (
    <div className="menu-container">
      {menuItems.map((item, index) => (
        <div 
          key={index}
          className="menu-item"
          onMouseEnter={() => setActiveMenu(index)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <span className="menu-title">{item.title}</span>
          
          {activeMenu === index && (
            <div className="dropdown-menu">
              {item.subItems.map((subItem, subIndex) => (
                <a 
                  key={subIndex} 
                  href={subItem.link}
                  className="dropdown-item"
                >
                  {subItem.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Menu;