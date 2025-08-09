import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/Cadastro.css';

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para verificar email já cadastrado
  async function verificarEmailExistente(email) {
    try {
      const response = await fetch(`https://localhost:7239/api/v1/usuarios/verificar-email?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Erro ao verificar email");
      }
      const data = await response.json();
      return data.exists; // true se email existe, false se não
    } catch {
      return false; // Em caso de erro, permite continuar (opcional: você pode tratar diferente)
    }
  }

  // Função para verificar CPF já cadastrado
  async function verificarCpfExistente(cpf) {
    try {
      const response = await fetch(`https://localhost:7239/api/v1/usuarios/verificar-cpf?cpf=${encodeURIComponent(cpf)}`);
      if (!response.ok) {
        throw new Error("Erro ao verificar CPF");
      }
      const data = await response.json();
      return data.exists; // true se cpf existe, false se não
    } catch {
      return false;
    }
  }

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nome.trim()) novosErros.nome = "O nome é obrigatório.";
    if (!formData.email.trim()) novosErros.email = "O e-mail é obrigatório.";
    if (!formData.cpf.trim()) novosErros.cpf = "O CPF é obrigatório.";
    if (!formData.senha) novosErros.senha = "A senha é obrigatória.";
    if (formData.senha !== formData.confirmarSenha)
      novosErros.confirmarSenha = "As senhas não coincidem.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setMensagemTipo("");
    setErros({});

    if (!validarFormulario()) {
      setMensagem("Preencha todos os campos obrigatórios corretamente.");
      setMensagemTipo("erro");
      return;
    }

    setLoading(true);

    // Verificações assíncronas se email e cpf já existem
    const [emailExiste, cpfExiste] = await Promise.all([
      verificarEmailExistente(formData.email),
      verificarCpfExistente(formData.cpf),
    ]);

    const novosErros = {};
    if (emailExiste) novosErros.email = "Este e-mail já está cadastrado.";
    if (cpfExiste) novosErros.cpf = "Este CPF já está cadastrado.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setMensagem("Corrija os erros antes de enviar.");
      setMensagemTipo("erro");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://localhost:7239/api/v1/usuarios/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar");
      }

      setMensagem("Cadastro realizado com sucesso!");
      setMensagemTipo("sucesso");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMensagem(error.message || "Erro inesperado ao cadastrar.");
      setMensagemTipo("erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <aside className="image-side">
        <div className="overlay-gradient" />
        <div className="text-content">
          <h1>Crie sua conta</h1>
          <p>Cadastre-se para acessar todas as funcionalidades exclusivas da plataforma.</p>
        </div>
      </aside>

      <main className="form-side" aria-label="Formulário de cadastro">
      
        {mensagem && (
          <div className={`mensagem ${mensagemTipo}`} role="alert" aria-live="assertive">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="nome" className="visually-hidden">Nome completo</label>
          <input
            type="text"
            id="nome"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {erros.nome && <span className="erro">{erros.nome}</span>}

          <label htmlFor="email" className="visually-hidden">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {erros.email && <span className="erro">{erros.email}</span>}

          <label htmlFor="cpf" className="visually-hidden">CPF</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {erros.cpf && <span className="erro">{erros.cpf}</span>}

          <label htmlFor="senha" className="visually-hidden">Senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
              disabled={loading}
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
          {erros.senha && <span className="erro">{erros.senha}</span>}

          <label htmlFor="confirmarSenha" className="visually-hidden">Confirmar senha</label>
          <div className="password-wrapper">
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              id="confirmarSenha"
              name="confirmarSenha"
              placeholder="Confirmar senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="toggle-password-btn"
              disabled={loading}
            >
              {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {erros.confirmarSenha && <span className="erro">{erros.confirmarSenha}</span>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Carregando..." : "Cadastrar"}
          </button>
        </form>

        <p className="signup-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </main>
    </div>
  );
}
