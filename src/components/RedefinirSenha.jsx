import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/RedefinirSenha.css';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function safeFetch(url, options) {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async function solicitarReset(e) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    if (!email || !validarEmail(email)) {
      setTipoMensagem("erro");
      setMensagem("Por favor, insira um email válido.");
      setCarregando(false);
      return;
    }

    try {
      const data = await safeFetch("https://localhost:7239/api/v1/usuarios/solicitar-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "include"
      });

      setTipoMensagem("sucesso");
      setMensagem(data.message || "Código enviado para seu email.");
      setEtapa(2);
    } catch (error) {
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao solicitar código. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function verificarCodigo(e) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    if (!codigo || codigo.length !== 6) {
      setTipoMensagem("erro");
      setMensagem("Por favor, insira o código de 6 dígitos.");
      setCarregando(false);
      return;
    }

    try {
      const data = await safeFetch("https://localhost:7239/api/v1/usuarios/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), codigo: codigo.trim() }),
        credentials: "include"
      });

      setTipoMensagem("sucesso");
      setMensagem(data.message || "Código verificado com sucesso!");
      setEtapa(3);
    } catch (error) {
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao verificar código. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function resetarSenha(e) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    if (!novaSenha || novaSenha.length < 6) {
      setTipoMensagem("erro");
      setMensagem("A senha deve ter pelo menos 6 caracteres.");
      setCarregando(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setTipoMensagem("erro");
      setMensagem("As senhas não coincidem.");
      setCarregando(false);
      return;
    }

    try {
      const data = await safeFetch("https://localhost:7239/api/v1/usuarios/resetar-senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, novaSenha }),
        credentials: "include"
      });

      setTipoMensagem("sucesso");
      setMensagem(data.message || "Senha redefinida com sucesso! Redirecionando...");
      
      setTimeout(() => navigate('/login', { 
        state: { email, mensagem: "Sua senha foi redefinida com sucesso!" }
      }), 2000);
    } catch (error) {
      setTipoMensagem("erro");
      setMensagem(error.message || "Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="redefinir-container">
      <div className="redefinir-card">
        <h2 className="titulo-redefinir">redefinir senha</h2>
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          &larr; Voltar
        </button>
        
        {mensagem && <div className={`mensagem ${tipoMensagem}`}>{mensagem}</div>}

        {etapa === 1 && (
          <form onSubmit={solicitarReset}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Digite seu Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primario" disabled={carregando}>
              {carregando ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={verificarCodigo}>
            <div className="form-group">
              <input type="email" value={email} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="codigo">Código de Verificação</label>
              <input
                type="text"
                id="codigo"
                placeholder="123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
              <small>Verifique sua caixa de entrada e spam</small>
            </div>
            <button type="submit" className="btn-primario" disabled={carregando}>
              {carregando ? 'Verificando...' : 'Verificar Código'}
            </button>
            <button type="button" className="btn-link" onClick={() => setEtapa(1)}>
              Voltar
            </button>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={resetarSenha}>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova Senha</label>
              <input
                type="password"
                id="novaSenha"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                placeholder="Digite novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn-primario" disabled={carregando}>
              {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
            <button type="button" className="btn-link" onClick={() => setEtapa(2)}>
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}