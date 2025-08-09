import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css'; // Seu CSS geral

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
    <div className="login-container">
      {/* Lado esquerdo com imagem */}
      <aside className="image-side">
        <div className="overlay-gradient" />
        <div className="text-content">
          <h1>Redefina sua senha</h1>
          <p>Recupere o acesso à sua conta em poucos passos simples</p>
        </div>
      </aside>

      {/* Lado direito com formulário */}
      <main className="form-side" aria-label="Formulário de redefinição de senha">
        {/* BOTÃO VOLTAR */}
        <button 
          className="btn-voltar" 
          onClick={() => navigate(-1)}
          aria-label="Voltar para página anterior"
        >
          &larr; Voltar
        </button>

        <h2 className="titulo-redefinir">REDEFINIR senha</h2>

        {mensagem && (
          <div 
            className={`mensagem ${tipoMensagem}`} 
            role="alert"
            aria-live="assertive"
          >
            {mensagem}
          </div>
        )}

        {etapa === 1 && (
          <form onSubmit={solicitarReset} className="form-redefinir">
            <div className="form-group">
              <label htmlFor="email" className="visually-hidden">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="Digite seu Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
                autoComplete="email"
              />
            </div>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={carregando}
              aria-busy={carregando}
            >
              {carregando ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={verificarCodigo} className="form-redefinir">
            <div className="form-group">
              <label htmlFor="email-disabled" className="visually-hidden">E-mail</label>
              <input 
                type="email" 
                id="email-disabled" 
                value={email} 
                disabled 
                aria-readonly="true"
              />
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
                disabled={carregando}
                aria-describedby="codigo-help"
              />
              <small id="codigo-help">Verifique sua caixa de entrada e spam</small>
            </div>
            <div className="botoes-duplos">
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={carregando}
                aria-busy={carregando}
              >
                {carregando ? 'Verificando...' : 'Verificar Código'}
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={() => setEtapa(1)}
                disabled={carregando}
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={resetarSenha} className="form-redefinir">
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
                disabled={carregando}
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
                disabled={carregando}
                aria-describedby="senha-help"
              />
              <small id="senha-help">As senhas devem coincidir</small>
            </div>
            <div className="botoes-duplos">
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={carregando}
                aria-busy={carregando}
              >
                {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
              <button 
                type="button" 
                className="btn-link" 
                onClick={() => setEtapa(2)}
                disabled={carregando}
              >
                Voltar
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
