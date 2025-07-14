import React, { useEffect, useState } from "react";

function EditUser() {
  const userId = localStorage.getItem("userId"); // pega o id do usuário logado
  const [user, setUser] = useState({
    nome: "",
    email: "",
    acessoExpiracao: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("Usuário não logado");
      setLoading(false);
      return;
    }
    fetch(`https://localhost:7239/api/v1/usuarios/buscar/${userId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.msg || "Erro ao buscar usuário");
        }
        return res.json();
      })
      .then((data) => {
        setUser({
          nome: data.nome || "",
          email: data.email || "",
          acessoExpiracao: data.acessoExpiracao
            ? data.acessoExpiracao.substring(0, 16)
            : "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const payload = {
      nome: user.nome,
      email: user.email,
      acessoExpiracao: user.acessoExpiracao,
    };

    fetch(`https://localhost:7239/api/v1/usuarios/atualizar/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.msg || "Erro ao atualizar usuário");
        }
        return res.json();
      })
      .then(() => {
        setSuccessMsg("Usuário editado com sucesso!");
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  if (loading) return <p>Carregando dados do usuário...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Perfil</h2>

      <label>
        Nome: <br />
        <input
          type="text"
          name="nome"
          value={user.nome}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Email: <br />
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <label>
        Acesso Expiração: <br />
        <input
          type="datetime-local"
          name="acessoExpiracao"
          value={user.acessoExpiracao}
          onChange={handleChange}
          required
        />
      </label>
      <br />

      <button type="submit">Editar Perfil</button>

      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
    </form>
  );
}

export default EditUser;
