import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from './components/ConfigContext'; // <-- Importa o Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider>  {/* Envolvendo o App com o contexto */}
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
