import { useEffect } from 'react';

const useLeitor = (ativado) => {
  useEffect(() => {
    if (!ativado) return;

    const elementos = [
      'h1, h2, h3, h4, h5, h6',
      'button, a',
      'input, select, textarea',
      '[aria-label], [role]',
      '.config-option'
    ].join(', ');

    const lerElemento = (elemento) => {
      let texto = '';

      if (elemento.hasAttribute('aria-label')) {
        texto = elemento.getAttribute('aria-label');
      } else if (elemento.hasAttribute('alt')) {
        texto = elemento.getAttribute('alt');
      } else if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT') {
        const id = elemento.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) texto = label.textContent;
        }
      } else {
        texto = elemento.textContent || '';
      }

      texto = texto.trim().replace(/\s+/g, ' ');

      if (texto && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    };

    const handleMouseOver = (e) => {
      lerElemento(e.target);
    };

    const handleFocus = (e) => {
      lerElemento(e.target);
    };

    const elementosInterativos = document.querySelectorAll(elementos);

    elementosInterativos.forEach((el) => {
      el.setAttribute('tabindex', '0');
      el.addEventListener('mouseover', handleMouseOver);
      el.addEventListener('focus', handleFocus);
    });

    return () => {
      elementosInterativos.forEach((el) => {
        el.removeEventListener('mouseover', handleMouseOver);
        el.removeEventListener('focus', handleFocus);
      });
    };
  }, [ativado]);
};

export default useLeitor;
