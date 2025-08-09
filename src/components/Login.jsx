import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/Login.css';

export default function Entrar() {
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");
    setMensagemTipo("");

    try {
      const response = await fetch("https://localhost:7239/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, senha: formData.senha }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        // Mensagem genérica para erros 401 e 404
        let mensagemErro = "Email ou senha incorretos";

        if (response.status >= 500) {
          mensagemErro = data.message || "Erro no servidor. Tente novamente mais tarde.";
        }

        setMensagemTipo("erro");
        setMensagem(mensagemErro);
        setLoading(false);
        return;
      }

      // Salvar dados no localStorage após login bem sucedido
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.email && data.nome) {
        localStorage.setItem('email', data.email);
        localStorage.setItem('nome', data.nome);
        localStorage.setItem('idUsuario', data.id);

        // Dispara evento para atualizar Navbar
        window.dispatchEvent(new Event('loginChanged'));
      }

      setMensagemTipo("sucesso");
      setMensagem(data.message || "Login realizado com sucesso!");

      // Redirecionar para home ("/")
      navigate("/");

    } catch (error) {
      setMensagemTipo("erro");
      setMensagem(error.message || "Erro desconhecido ao conectar com o servidor");
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <aside className="image-side">
        <div className="overlay-gradient" />
        <div className="text-content">
          <h1>Bem-vindo de volta!</h1>
          <p>Entre para acessar suas funcionalidades exclusivas e aproveitar o melhor do nosso sistema.</p>
        </div>
      </aside>

      <main className="form-side" aria-label="Formulário de login">

        {mensagem && (
          <div className={`mensagem ${mensagemTipo}`} role="alert" aria-live="assertive">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" className="visually-hidden">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
            autoComplete="username"
          />

          <label htmlFor="senha" className="visually-hidden">Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="toggle-password-btn"
              disabled={loading}
            >
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="forgot-password-link">
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>

        <p className="signup-link">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </main>
    </div>
  );
}
