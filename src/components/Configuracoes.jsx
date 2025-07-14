import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- Importa o hook de navegação
import { ConfigContext } from './ConfigContext';
import '../styles/Configuracoes.css';

const Configuracoes = () => {
  const { config, saveConfig } = useContext(ConfigContext);
  const [tempConfig, setTempConfig] = useState(config);
  const navigate = useNavigate();  // <-- Hook para navegação

  // Mantém tempConfig sincronizado com config atual
  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleSave = () => {
    saveConfig(tempConfig);
    alert('Configurações salvas com sucesso!');
    navigate('/'); // <-- Redireciona para /login após salvar
  };

  return (
    <div className="configuracoes-container">
      <h1>Configurações</h1>

      <div className="config-section">
        <h2>Aparência</h2>
        <label>
          Tema:
          <select
            value={tempConfig.tema}
            onChange={(e) => setTempConfig({ ...tempConfig, tema: e.target.value })}
          >
            <option value="claro">Claro</option>
            <option value="escuro">Escuro</option>
          </select>
        </label>

        <label>
          Tamanho da Fonte:
          <select
            value={tempConfig.tamanhoFonte}
            onChange={(e) => setTempConfig({ ...tempConfig, tamanhoFonte: e.target.value })}
          >
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </label>
      </div>

      <div className="config-section">
        <h2>Acessibilidade</h2>
        <label>
          <input
            type="checkbox"
            checked={tempConfig.acessibilidade}
            onChange={(e) => setTempConfig({ ...tempConfig, acessibilidade: e.target.checked })}
          />
          Ativar modo de acessibilidade (alto contraste e texto destacado)
        </label>
      </div>

      <button className="salvar-btn" onClick={handleSave}>
        Salvar Alterações
      </button>
    </div>
  );
};

export default Configuracoes;
