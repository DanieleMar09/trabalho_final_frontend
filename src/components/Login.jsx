import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/Login.css';

export default function Entrar() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.senha
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      if (data.nome) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.email && data.nome) {
        localStorage.setItem('email', data.email);
        localStorage.setItem('nome', data.nome);
        localStorage.setItem('idUsuario', data.id);
      }

      setMensagemTipo("sucesso");
      setMensagem(data.message || "Login realizado com sucesso!");

      navigate("/perfil");

    } catch (error) {
      setMensagemTipo("erro");
      setMensagem(error.message || "Erro desconhecido ao conectar com o servidor");
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2>Entrar</h2>

        {mensagem && (
          <div className={`mensagem ${mensagemTipo}`}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                className="senha-input"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="toggle-password"
                disabled={loading}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="link-esqueci-senha">
              <Link to="/recuperar-senha">Esqueci minha senha</Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>

        <p className="link-cadastro">
          Não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
