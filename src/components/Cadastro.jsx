import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // Importa o useNavigate
import "../styles/Cadastro.css";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const navigate = useNavigate(); // Hook de navegação

  const validarCampos = () => {
    const novosErros = {};

    if (!formData.nome.trim()) novosErros.nome = "Nome é obrigatório.";
    if (!formData.email.trim()) novosErros.email = "E-mail é obrigatório.";
    if (!formData.cpf.trim()) novosErros.cpf = "CPF é obrigatório.";

    if (!formData.senha) {
      novosErros.senha = "Senha é obrigatória.";
    } else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.senha)) {
      novosErros.senha = "Mínimo 8 caracteres, 1 maiúscula e 1 número.";
    }

    if (formData.senha !== formData.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErros({ ...erros, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    const usuario = {
      id: 0,
      nome: formData.nome,
      email: formData.email,
      cpf: formData.cpf,
      senha: formData.senha,
    };

    try {
      const response = await fetch("https://localhost:7239/api/v1/usuarios/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (response.ok) {
        setMensagemTipo("sucesso");
        setMensagem("Cadastro realizado com sucesso!");

        setTimeout(() => {
          navigate("/login"); // Redireciona após 2 segundos
        }, 2000);

        setFormData({
          nome: "",
          email: "",
          cpf: "",
          senha: "",
          confirmarSenha: "",
        });
        setErros({});
      } else {
        const erro = await response.text();
        setMensagemTipo("erro");
        setMensagem("Erro ao cadastrar: " + erro);
      }
    } catch (error) {
      setMensagemTipo("erro");
      setMensagem("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="cadastros-container">
      <div className="overlay"></div>
      <div className="form-wrapper">
        <div className="cadastro-form-card">
          <h2>Cadastro</h2>

          {mensagem && (
            <div className={`cadastro-mensagem ${mensagemTipo === "sucesso" ? "mensagem-sucesso" : "mensagem-erro"}`}>
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>
              Nome completo<span className="asterisco">*</span>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
            />
            {erros.nome && <span className="erro">{erros.nome}</span>}

            <label>
              E-mail<span className="asterisco">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
            />
            {erros.email && <span className="erro">{erros.email}</span>}

            <label>
              CPF<span className="asterisco">*</span>
            </label>
            <input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
            />
            {erros.cpf && <span className="erro">{erros.cpf}</span>}

            <label>
              Senha<span className="asterisco">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
              />
              <button type="button" className="olho" onClick={() => setMostrarSenha(!mostrarSenha)}>
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.senha && <span className="erro">{erros.senha}</span>}

            <label>
              Confirmar senha<span className="asterisco">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                name="confirmarSenha"
                placeholder="Confirmar senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
              />
              <button type="button" className="olho" onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
                {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.confirmarSenha && <span className="erro">{erros.confirmarSenha}</span>}

            <button type="submit">Cadastrar</button>
          </form>

          <p className="login-link">
            Já possuo cadastro? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
