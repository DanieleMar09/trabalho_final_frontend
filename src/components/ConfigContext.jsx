import React, { createContext, useState, useEffect } from 'react';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    tema: 'claro',
    tamanhoFonte: 'medio',
    acessibilidade: false,
  });

  // Carrega as configurações do localStorage ao iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem('config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Salva no localStorage quando o config mudar
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('config', JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ config, saveConfig }}>
      <div
        className={`tema-${config.tema} fonte-${config.tamanhoFonte} ${
          config.acessibilidade ? 'acessibilidade-ativa' : ''
        }`}
      >
        {children}
      </div>
    </ConfigContext.Provider>
  );
};
