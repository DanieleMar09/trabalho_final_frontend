import React, { useState } from 'react';
import '../styles/Contato.css';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Envia via EmailJS (sem back-end)
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      email: email,
      message: message
    }, 'YOUR_USER_ID')
    .then(() => {
      setIsSent(true);
      setMessage('');
      setEmail('');
    })
    .catch((err) => console.error("Erro:", err));
  };

  return (
    <div className="contact-container">
      <h2>Fale Conosco</h2>
      {!isSent ? (
        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        <div className="success-message">
          <p>✅ Mensagem enviada! Responderemos em breve.</p>
        </div>
      )}
    </div>
  );
};

export default Contact;