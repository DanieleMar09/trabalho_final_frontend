import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/FinalizaCompra.css';

// Configurações - ATUALIZE COM SEUS ENDPOINTS REAIS!
const API_BASE_URL = 'https://localhost:7239/api/Pedidos';
const PIX_EXPIRATION_TIME = 1800; // 30 minutos em segundos

// Componente de Progresso
const ProgressSteps = ({ currentStep }) => {
  const steps = ['Endereço', 'Pagamento', 'Confirmação'];
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div key={index} className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}>
          <div className="progress-number">
            {currentStep > index + 1 ? '✓' : index + 1}
          </div>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
};

// Componente de Informações do Veículo
const VeiculoInfo = ({ veiculo }) => {
  if (!veiculo) return (
    <div className="veiculo-info">
      <h3>Veículo Adquirido</h3>
      <p className="error-text">Nenhuma informação do veículo disponível</p>
    </div>
  );
  
  return (
    <div className="veiculo-info">
      <h3>Veículo Adquirido</h3>
      <div className="detail-row"><span>Modelo:</span><span>{veiculo.modelo || 'Não especificado'}</span></div>
      <div className="detail-row"><span>Ano:</span><span>{veiculo.ano || 'Não especificado'}</span></div>
      {veiculo.placa && (
        <div className="detail-row"><span>Placa:</span><span>{veiculo.placa}</span></div>
      )}
    </div>
  );
};

// Componente Principal
const FinalizarCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Dados do merchant
  const merchantInfo = {
    name: 'DANI&THUR AUTOMÓVEIS',
    city: 'SABARÁ/MG',
    phone: '(31) 99999-9999',
    email: 'vendas@danithur.com.br'
  };

  // Tenta obter os dados do state ou do localStorage
  const carrinhoData = state || JSON.parse(localStorage.getItem('carrinho')) || {};
 
  // Estado do formulário
  const [formData, setFormData] = useState({
    precoTotal: carrinhoData.precoFinal || 0,
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
  const [pixData, setPixData] = useState({
    qrCodeBase64: null,
    payload: null,
    valor: 0,
    transactionId: null,
    expiresAt: null,
    status: 'pending'
  });
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(PIX_EXPIRATION_TIME);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [boletoUrl, setBoletoUrl] = useState('');

  // Verificação inicial do veículo
  useEffect(() => {
    if (!carrinhoData || !carrinhoData.carrosId) {
      setError('Nenhum veículo selecionado. Redirecionando...');
      const timer = setTimeout(() => navigate('/carrinho'), 3000);
      return () => clearTimeout(timer);
    }
  }, [carrinhoData, navigate]);

  // Formata valores monetários
  const formatCurrency = (v) => {
    return (v / 100).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Formata tempo mm:ss
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Consulta CEP
  const consultarCep = useCallback(async (cep) => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    try {
      setIsConsultingCep(true);
      setError(null);
      const { data } = await axios.get(`https://viacep.com.br/ws/${cleaned}/json/`);
      if (data.erro) throw new Error('CEP não encontrado');
      setFormData((p) => ({
        ...p,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));
    } catch {
      setError('CEP não encontrado. Preencha manualmente.');
    } finally {
      setIsConsultingCep(false);
    }
  }, []);

  // Handlers para campos do formulário
  const handleCepChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5, 8)}`;
    setFormData((p) => ({ ...p, cep: v }));
    if (v.replace(/\D/g, '').length === 8) consultarCep(v);
  };

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleCardNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData((p) => ({ ...p, cartaoNumero: v.slice(0, 19) }));
  };

  const handleCardExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    setFormData((p) => ({ ...p, cartaoValidade: v.slice(0, 5) }));
  };

  const handleCardCvvChange = (e) =>
    setFormData((p) => ({ ...p, cartaoCVV: e.target.value.replace(/\D/g, '').slice(0, 4) }));

  const handleParcelasChange = (e) =>
    setFormData((p) => ({ ...p, parcelas: Math.min(Math.max(1, +e.target.value || 1), 12) }));

  // Envia a compra para o backend
  const enviarCompraParaBackend = async () => {
    setIsLoading(true);
    setError(null);
    
    // Validações iniciais
    if (!carrinhoData.carrosId) {
      setError('Nenhum veículo selecionado');
      throw new Error('Veículo não selecionado');
    }

    try {
      const enderecoEntrega = {
        cep: formData.cep,
        logradouro: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || null,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.estado
      };

      // Payload corrigido para o backend
      const payload = {
        usuarioId: carrinhoData.usuariosId || 1, // ID do usuário
        veiculoId: carrinhoData.carrosId, // ID do veículo
        precoTotal: formData.precoTotal,
        metodoPagamento: formData.metodoPagamento === 'Pix' ? 1 : 
                       formData.metodoPagamento === 'Boleto' ? 2 : 3,
        observacoes: formData.observacoes || null,
        enderecoEntrega: enderecoEntrega,
        parcelas: formData.metodoPagamento === 'Cartão de Crédito' ? formData.parcelas : null,
        dadosCartao: formData.metodoPagamento === 'Cartão de Crédito' ? {
          numero: formData.cartaoNumero.replace(/\s/g, ''),
          validade: formData.cartaoValidade,
          cvv: formData.cartaoCVV,
          nomeTitular: formData.cartaoNome
        } : null
      };

      // Envio para API
      const response = await axios.post(`${API_BASE_URL}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Tratamento da resposta para diferentes métodos
      if (formData.metodoPagamento === 'Pix') {
        setPixData({
          qrCodeBase64: response.data.qrCodeBase64,
          payload: response.data.codigoPix,
          valor: response.data.valor || formData.precoTotal,
          transactionId: response.data.transactionId,
          expiresAt: Date.now() + (response.data.expiracao * 1000),
          status: 'aguardando_pagamento'
        });
        setTimeLeft(response.data.expiracao || PIX_EXPIRATION_TIME);
      } else if (formData.metodoPagamento === 'Boleto') {
        setBoletoUrl(response.data.urlBoleto);
      }

      setNumeroPedido(response.data.numeroPedido);
      
      // Limpar carrinho após compra
      localStorage.removeItem('carrinho');

      return response.data;

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      let errorMessage = 'Erro ao processar pagamento';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Dados inválidos: ' + (error.response.data.errors 
            ? Object.values(error.response.data.errors).join(', ')
            : error.response.data.message);
        } else {
          errorMessage = `Erro no servidor (${error.response.status}): ${error.response.data.message || error.response.statusText}`;
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica o status do pagamento
  const verificarPagamento = useCallback(async () => {
    if (!pixData.transactionId || pixData.status !== 'pending') return;
    
    try {
      setIsVerifyingPayment(true);
      
      // Código para produção
      const response = await axios.get(
        `${API_BASE_URL}/verificar-pagamento/${pixData.transactionId}`
      );

      if (response.data?.pago) {
        setPixData(prev => ({...prev, status: 'paid'}));
        setStep(3);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      setError('Falha ao verificar pagamento. Tente novamente.');
      return false;
    } finally {
      setIsVerifyingPayment(false);
    }
  }, [pixData.transactionId, pixData.status]);

  // Efeitos para timer e verificação
  useEffect(() => {
    if (step !== 2 || formData.metodoPagamento !== 'Pix' || !pixData.transactionId) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setPixData(prev => ({...prev, status: 'expired'}));
          setError('Tempo para pagamento expirou.');
          clearInterval(timer);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, formData.metodoPagamento, pixData.transactionId]);

  useEffect(() => {
    if (step !== 2 || formData.metodoPagamento !== 'Pix' || pixData.status !== 'pending') return;
    
    const intervalId = setInterval(verificarPagamento, 15000);
    return () => clearInterval(intervalId);
  }, [step, formData.metodoPagamento, pixData.status, verificarPagamento]);

  // Handlers de submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await enviarCompraParaBackend();
      setStep(2);
    } catch (error) {
      console.error('Erro no submit:', error);
    }
  };

  const handlePaymentConfirmation = async () => {
    try {
      const paid = await verificarPagamento();
      if (!paid) {
        setError('Pagamento ainda não confirmado. Tente novamente em alguns instantes.');
      }
    } catch (error) {
      setError('Erro ao verificar pagamento. Tente novamente.');
    }
  };

  // Renderização do PIX
  const renderPixPayment = () => {
    if (!pixData.payload && !pixData.qrCodeBase64) {
      return (
        <div className="pix-loading">
          <p>Carregando dados do PIX...</p>
          {error && <p className="error-text">{error}</p>}
          <div className="spinner"></div>
        </div>
      );
    }

    return (
      <div className="pix-payment-container">
        <h2 className="section-title">Pagamento via Pix</h2>
        
        {pixData.status === 'expired' ? (
          <div className="pix-expired">
            <p>O QR Code expirou. Por favor, inicie uma nova compra.</p>
            <button onClick={() => navigate('/')} className="submit-button">
              VOLTAR À LOJA
            </button>
          </div>
        ) : (
          <>
            <p className="payment-instructions">
              Escaneie o QR Code ou copie o código.
              {pixData.status === 'aguardando_pagamento' && (
                <> Expira em <strong>{formatTime(timeLeft)}</strong></>
              )}
              {pixData.status === 'paid' && (
                <span className="payment-success">✓ Pagamento confirmado!</span>
              )}
            </p>

            <div className="qr-code-container">
              {pixData.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code Pix"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              
              {(!pixData.qrCodeBase64 || pixData.status === 'paid') && (
                <QRCodeSVG 
                  value={pixData.payload} 
                  size={256}
                  level="H"
                  includeMargin
                />
              )}
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span>Valor:</span>
                <strong>{formatCurrency(pixData.valor)}</strong>
              </div>
              <div className="detail-row">
                <span>Beneficiário:</span>
                <strong>{merchantInfo.name}</strong>
              </div>
              <div className="detail-row">
                <span>Identificador:</span>
                <strong>#{pixData.transactionId}</strong>
              </div>
            </div>

            {pixData.payload && (
              <div className="pix-code-container">
                <label>Código Pix (Copia e Cola):</label>
                <div className="pix-code-wrapper">
                  <textarea 
                    className="pix-code" 
                    value={pixData.payload} 
                    readOnly 
                    rows={3}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.payload);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="copy-button"
                  >
                    {copySuccess ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {pixData.status === 'pending' && (
              <button
                onClick={handlePaymentConfirmation}
                disabled={isVerifyingPayment}
                className="submit-button"
              >
                {isVerifyingPayment ? 'VERIFICANDO...' : 'JÁ PAGUEI'}
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  // Renderização do Boleto
  const renderBoletoPayment = () => {
    return (
      <div className="boleto-payment-container">
        <h2 className="section-title">Pagamento via Boleto Bancário</h2>
        <div className="boleto-instructions">
          <p>Seu boleto foi gerado com sucesso!</p>
          <div className="detail-row">
            <span>Valor:</span>
            <strong>{formatCurrency(formData.precoTotal)}</strong>
          </div>
          <div className="detail-row">
            <span>Vencimento:</span>
            <strong>{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</strong>
          </div>
          <div className="detail-row">
            <span>Código:</span>
            <strong>{numeroPedido}</strong>
          </div>
          
          <button 
            className="submit-button"
            onClick={() => {
              window.open(boletoUrl || '#', '_blank');
            }}
          >
            IMPRIMIR BOLETO
          </button>
          
          <button 
            onClick={() => setStep(3)}
            className="submit-button secondary"
          >
            JÁ PAGUEI O BOLETO
          </button>
        </div>
      </div>
    );
  };

  // Renderização do Cartão
  const renderCartaoPayment = () => {
    return (
      <div className="cartao-payment-container">
        <h2 className="section-title">Pagamento via Cartão de Crédito</h2>
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <p>Pagamento processado com sucesso!</p>
          <div className="detail-row">
            <span>Valor:</span>
            <strong>{formatCurrency(formData.precoTotal)}</strong>
          </div>
          <div className="detail-row">
            <span>Parcelas:</span>
            <strong>
              {formData.parcelas}x de {formatCurrency(formData.precoTotal / formData.parcelas)}
            </strong>
          </div>
          <div className="detail-row">
            <span>Nº do Pedido:</span>
            <strong>#{numeroPedido}</strong>
          </div>
          
          <button 
            onClick={() => setStep(3)}
            className="submit-button"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    );
  };

  // Renderização da confirmação
  const renderConfirmation = () => (
    <div className="confirmation-section">
      <div className="confirmation-icon">✓</div>
      <h2 className="confirmation-title">COMPRA CONCLUÍDA!</h2>
      <p className="confirmation-subtitle">Obrigado por comprar na {merchantInfo.name}!</p>
      
      <div className="order-details">
        <h3>Detalhes do Pedido</h3>
        <div className="detail-row">
          <span>Nº do Pedido:</span>
          <span>#{numeroPedido}</span>
        </div>
        <div className="detail-row">
          <span>Valor:</span>
          <span>{formatCurrency(formData.precoTotal)}</span>
        </div>
        <div className="detail-row">
          <span>Método:</span>
          <span>{formData.metodoPagamento}</span>
        </div>
        {formData.metodoPagamento === 'Cartão de Crédito' && (
          <div className="detail-row">
            <span>Parcelas:</span>
            <span>
              {formData.parcelas}x de {formatCurrency(formData.precoTotal / formData.parcelas)}
            </span>
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
      
      <VeiculoInfo veiculo={carrinhoData.veiculo || carrinhoData} />
      
      <div className="confirmation-actions">
        <button onClick={() => navigate('/')} className="submit-button">
          VOLTAR À LOJA
        </button>
        <button onClick={() => window.print()} className="submit-button secondary">
          IMPRIMIR COMPROVANTE
        </button>
      </div>
    </div>
  );

  // Renderização condicional se não houver veículo
  if (!carrinhoData || !carrinhoData.carrosId) {
    return (
      <div className="finalizar-compra-container">
        <div className="compra-box">
          <h2>Nenhum veículo selecionado</h2>
          <p>Por favor, selecione um veículo no carrinho antes de finalizar a compra.</p>
          <button 
            onClick={() => navigate('/carrinho')}
            className="submit-button"
          >
            VOLTAR AO CARRINHO
          </button>
        </div>
      </div>
    );
  }

  // Renderização normal
  return (
    <div className="finalizar-compra-container">
      <div className="compra-box">
        <div className="compra-header">
          <h1 className="compra-title">FINALIZAR COMPRA</h1>
          <ProgressSteps currentStep={step} />
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSubmit} className="compra-form">
            <VeiculoInfo veiculo={carrinhoData.veiculo || carrinhoData} />

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
              {isConsultingCep && <span className="loading-text">Consultando…</span>}
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
                  maxLength="2"
                  required
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
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}x de {formatCurrency(formData.precoTotal / (i + 1))}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="total-section">
              <h3>Total: {formatCurrency(formData.precoTotal)}</h3>
              {formData.metodoPagamento === 'Pix' && (
                <p className="discount-text">
                  Você economizou {formatCurrency(formData.precoTotal * 0.05)} pagando com Pix!
                </p>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'PROCESSANDO…' : 'CONTINUAR PARA PAGAMENTO'}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            {formData.metodoPagamento === 'Pix' && renderPixPayment()}
            {formData.metodoPagamento === 'Boleto' && renderBoletoPayment()}
            {formData.metodoPagamento === 'Cartão de Crédito' && renderCartaoPayment()}
          </>
        )}

        {step === 3 && renderConfirmation()}

        <div className="compra-footer">
          Problemas com seu pedido? Contate: {merchantInfo.email} | {merchantInfo.phone}
        </div>
      </div>
    </div>
  );
};

export default FinalizarCompra;