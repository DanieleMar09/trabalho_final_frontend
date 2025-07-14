import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/FinalizaCompra.css';

// Componente para mostrar os passos do processo
const ProgressSteps = ({ currentStep }) => {
  const steps = ['Endereço', 'Pagamento', 'Confirmação'];
  
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div key={index} className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}>
          <div className="progress-number">
            {currentStep > index + 1 ? '✓' : currentStep === index + 1 ? index + 1 : index + 1}
          </div>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
};

// Componente para mostrar informações do veículo
const VeiculoInfo = ({ veiculo }) => {
  if (!veiculo) return null;
  
  return (
    <div className="veiculo-info">
      <h3>Veículo Adquirido</h3>
      <div className="detail-row">
        <span>Modelo:</span>
        <span>{veiculo.modelo}</span>
      </div>
      <div className="detail-row">
        <span>Ano:</span>
        <span>{veiculo.ano}</span>
      </div>
      {veiculo.placa && (
        <div className="detail-row">
          <span>Placa:</span>
          <span>{veiculo.placa}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal
const FinalizarCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Dados da concessionária
  const merchantInfo = {
    name: "DANI&THUR AUTOMÓVEIS",
    city: "SABARÁ/MG",
    phone: "(31) 99999-9999",
    email: "vendas@danithur.com.br"
  };

  // Estados do formulário
  const [formData, setFormData] = useState({
    precoTotal: state?.precoFinal || 0,
    metodoPagamento: 'Pix',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: '',
    cartaoNumero: '',
    cartaoValidade: '',
    cartaoCVV: '',
    cartaoNome: '',
    parcelas: 1
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConsultingCep, setIsConsultingCep] = useState(false);
  const [error, setError] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Função para formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Consulta CEP com tratamento de erros
  const consultarCep = useCallback(async (cep) => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) return;

    try {
      setIsConsultingCep(true);
      setError(null);
      const response = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      setFormData(prev => ({
        ...prev,
        endereco: response.data.logradouro || '',
        bairro: response.data.bairro || '',
        cidade: response.data.localidade || '',
        estado: response.data.uf || ''
      }));

    } catch (err) {
      setError('CEP não encontrado. Preencha manualmente.');
    } finally {
      setIsConsultingCep(false);
    }
  }, []);

  // Handlers para os campos do formulário
  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    setFormData(prev => ({ ...prev, cep: value }));

    if (value.replace(/\D/g, '').length === 8) {
      consultarCep(value);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({ ...prev, cartaoNumero: value.slice(0, 19) }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData(prev => ({ ...prev, cartaoValidade: value.slice(0, 5) }));
  };

  const handleCardCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cartaoCVV: value.slice(0, 4) }));
  };

  const handleParcelasChange = (e) => {
    const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), 12);
    setFormData(prev => ({ ...prev, parcelas: value }));
  };

  // Função para tratar mensagens de erro
  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      if (error.includes('System.InvalidOperationException')) {
        return 'Operação inválida: ' + error.split(':')[1]?.trim() || 'Por favor, verifique os dados e tente novamente';
      }
      return error;
    }
    if (error.message) {
      if (error.message.includes('System.')) {
        return error.message.split(' at ')[0];
      }
      return error.message;
    }
    return 'Ocorreu um erro ao processar sua requisição';
  };

  // Função principal para enviar os dados da compra
  const enviarCompraParaBackend = async () => {
    setIsLoading(true);
    try {
      const enderecoCompleto = {
        cep: formData.cep,
        logradouro: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.estado
      };

      const compraData = {
        CarrinhoId: 1,
        CarroId: state?.veiculo?.id || 0,
        UsuarioId: state?.cliente?.id || 1,
        PrecoFinal: formData.precoTotal,
        MetodoPagamento: formData.metodoPagamento,
        Observacoes: formData.observacoes,
        EnderecoEntrega: JSON.stringify(enderecoCompleto)
      };

      const response = await fetch('https://localhost:7239/api/CompraFinalizada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compraData)
      });

      // Verifica se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Erro ao finalizar compra');
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro ao finalizar compra');
      }

      if (formData.metodoPagamento === 'Pix') {
        setPixData({
          qrCodeBase64: responseData.qrCodeBase64,
          payload: responseData.pixCopiacolajson,
          valor: formData.precoTotal,
          transactionId: responseData.numeroNotaFiscal
        });
        setTimeLeft(1800);
      }

      setNumeroPedido(responseData.numeroNotaFiscal);
      return responseData;

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para copiar código PIX
  const copyToClipboard = () => {
    if (!pixData?.payload) return;
    
    navigator.clipboard.writeText(pixData.payload)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        setError('Falha ao copiar código PIX');
        console.error('Erro ao copiar:', err);
      });
  };

  // Efeito para o timer do PIX
  useEffect(() => {
    let timer;
    if (step === 2 && formData.metodoPagamento === 'Pix' && pixData && !paymentConfirmed) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setError('Tempo para pagamento expirado. Por favor, gere um novo QR Code.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, paymentConfirmed, formData.metodoPagamento, pixData]);

  // Manipulador de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await enviarCompraParaBackend();
      setStep(2);
    } catch (err) {
      console.error('Erro no envio:', err);
    }
  };

  // Manipulador de confirmação de pagamento
  const handlePaymentConfirmation = () => {
    setPaymentConfirmed(true);
    setStep(3);
  };

  // Renderização condicional para o passo de pagamento com PIX
  const renderPixPayment = () => (
    <>
      <h2 className="section-title">Pagamento via Pix</h2>
      <p className="payment-instructions">
        Escaneie o QR Code abaixo ou copie o código para pagar via Pix. 
        O código expira em <strong>{formatTime(timeLeft)}</strong>.
      </p>

      <div className="qr-code-container">
        {pixData?.qrCodeBase64 ? (
          <img 
            src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
            alt="QR Code PIX"
            className="qr-code-image"
          />
        ) : (
          <QRCodeSVG
            value={pixData?.payload || ''}
            size={256}
            level="H"
            includeMargin={true}
          />
        )}
      </div>

      <div className="payment-details">
        <div className="detail-row">
          <span>Valor:</span>
          <strong>R$ {formatCurrency(pixData?.valor || 0)}</strong>
        </div>
        <div className="detail-row">
          <span>Beneficiário:</span>
          <strong>{merchantInfo.name}</strong>
        </div>
      </div>

      {pixData?.payload && (
        <div className="pix-code-container">
          <label>Código Pix (copie e cole no seu app):</label>
          <div className="pix-code-wrapper">
            <code className="pix-code">{pixData.payload}</code>
            <button 
              onClick={copyToClipboard}
              className="copy-button"
            >
              {copySuccess ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handlePaymentConfirmation}
        disabled={isLoading}
        className="submit-button"
      >
        {isLoading ? 'CONFIRMANDO...' : 'JÁ PAGUEI'}
      </button>
    </>
  );

  // Renderização condicional para o passo de confirmação
  const renderConfirmation = () => (
    <div className="confirmation-section">
      <div className="confirmation-icon">✓</div>
      <h2 className="confirmation-title">COMPRA CONCLUÍDA!</h2>
      <p className="confirmation-subtitle">Obrigado por comprar na {merchantInfo.name}!</p>
      
      <div className="order-details">
        <h3>Detalhes do Pedido</h3>
        <div className="detail-row">
          <span>Número do Pedido:</span>
          <span>#{numeroPedido}</span>
        </div>
        <div className="detail-row">
          <span>Valor:</span>
          <span>R$ {formatCurrency(formData.precoTotal)}</span>
        </div>
        <div className="detail-row">
          <span>Método:</span>
          <span>{formData.metodoPagamento}</span>
        </div>
        {formData.metodoPagamento === 'Cartão de Crédito' && (
          <div className="detail-row">
            <span>Parcelas:</span>
            <span>{formData.parcelas}x de R$ {formatCurrency(formData.precoTotal / formData.parcelas)}</span>
          </div>
        )}
        <div className="detail-row">
          <span>Endereço:</span>
          <span>
            {formData.endereco}, {formData.numero}
            {formData.complemento && ` - ${formData.complemento}`} - {formData.bairro}, {formData.cidade}/{formData.estado}
          </span>
        </div>
        <div className="detail-row">
          <span>Data:</span>
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <VeiculoInfo veiculo={state?.veiculo} />

      <div className="confirmation-actions">
        <button
          onClick={() => navigate('/')}
          className="submit-button"
        >
          VOLTAR À LOJA
        </button>
        <button
          onClick={() => window.print()}
          className="submit-button secondary"
        >
          IMPRIMIR COMPROVANTE
        </button>
      </div>
    </div>
  );

  return (
    <div className="finalizar-compra-container">
      <div className="compra-box">
        <div className="compra-header">
          <h1 className="compra-title">FINALIZAR COMPRA</h1>
          <ProgressSteps currentStep={step} />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit} className="compra-form">
            <VeiculoInfo veiculo={state?.veiculo} />

            <h2 className="section-title">Endereço de Entrega</h2>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength="9"
                required
              />
              {isConsultingCep && <span className="loading-text">Consultando...</span>}
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  maxLength="2"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="3"
                placeholder="Instruções especiais para entrega"
              />
            </div>

            <div className="form-group">
              <label>Método de Pagamento</label>
              <select
                name="metodoPagamento"
                value={formData.metodoPagamento}
                onChange={handleChange}
              >
                <option value="Pix">Pix (5% de desconto)</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
              </select>
            </div>

            {formData.metodoPagamento === 'Cartão de Crédito' && (
              <div className="credit-card-fields">
                <div className="form-group">
                  <label>Número do Cartão</label>
                  <input
                    type="text"
                    name="cartaoNumero"
                    value={formData.cartaoNumero}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Validade (MM/AA)</label>
                    <input
                      type="text"
                      name="cartaoValidade"
                      value={formData.cartaoValidade}
                      onChange={handleCardExpiryChange}
                      placeholder="MM/AA"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cartaoCVV"
                      value={formData.cartaoCVV}
                      onChange={handleCardCvvChange}
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nome no Cartão</label>
                  <input
                    type="text"
                    name="cartaoNome"
                    value={formData.cartaoNome}
                    onChange={handleChange}
                    placeholder="Como no cartão"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parcelas</label>
                  <select
                    name="parcelas"
                    value={formData.parcelas}
                    onChange={handleParcelasChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <option key={num} value={num}>
                        {num}x de R$ {formatCurrency(formData.precoTotal / num)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="total-section">
              <h3>Total: R$ {formatCurrency(formData.precoTotal)}</h3>
              {formData.metodoPagamento === 'Pix' && (
                <p className="discount-text">Você economizou R$ {formatCurrency(formData.precoTotal * 0.05)} com Pix!</p>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'PROCESSANDO...' : 'CONTINUAR PARA PAGAMENTO'}
            </button>
          </form>
        )}

        {step === 2 && formData.metodoPagamento === 'Pix' && renderPixPayment()}
        {step === 3 && renderConfirmation()}

        <div className="compra-footer">
          <p>Problemas com seu pedido? Contate nosso suporte:</p>
          <p>{merchantInfo.email} | {merchantInfo.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default FinalizarCompra;