import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import '../styles/Contato.css'; // Usaremos o CSS similar ao do login

export default function Contact() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    emailjs.send(
      'service_a1xu5lf',    
      'template_pqjthkj',   
      { email, message },   
      'l-N-gkQ74oxlf-fwb'     
    )
    .then(() => {
      setIsSent(true);
      setMessage('');
      setEmail('');
    })
    .catch((err) => {
      setErrorMsg('Erro ao enviar a mensagem. Tente novamente.');
      console.error('Erro:', err);
    })
    .finally(() => setLoading(false));
  };

  return (
    <div className="login-container">
      <aside className="image-side">
        <div className="overlay-gradient" />
        <div className="text-content">
          <h1>Fale Conosco</h1>
          <p>Envie sua mensagem, dúvidas ou sugestões. Estamos aqui para ajudar!</p>
        </div>
      </aside>

      <main className="form-side" aria-label="Formulário de contato">
        {!isSent ? (
          <>
            {errorMsg && (
              <div className="mensagem erro" role="alert" aria-live="assertive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className="visually-hidden">Seu e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />

              <label htmlFor="message" className="visually-hidden">Mensagem</label>
              <textarea
                id="message"
                name="message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
                rows={6}
              />

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </form>
          </>
        ) : (
          <div className="mensagem sucesso" role="alert" aria-live="polite">
            ✅ Mensagem enviada! Responderemos em breve.
          </div>
        )}
      </main>
    </div>
  );
}
