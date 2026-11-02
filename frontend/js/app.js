import { createRoot } from 'react-dom/client';
import { html, useState, useCallback, ToastContext } from './lib.js';
import { Header, Hero, Film, Footer, BackToTop } from './chrome.js';
import { Hospitality, Tours } from './booking.js';
import { Adventures, Courier, BookingStatus, Contact } from './more.js';

function Toasts({ items }) {
  return html`<div className="toast-stack" aria-live="polite">${items.map(t => html`<div key=${t.id} className=${`toast ${t.kind}`}>${t.text}</div>`)}</div>`;
}

function App() {
  const [toasts, setToasts] = useState([]);
  const [reference, setReference] = useState('');
  const [service, setService] = useState('general');
  const notify = useCallback((text, kind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list.slice(-2), { id, text, kind }]);
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 4500);
  }, []);
  return html`
    <${ToastContext.Provider} value=${notify}>
      <${Header} />
      <main id="top">
        <${Hero} />
        <${Film} />
        <${Hospitality} onReference=${setReference} />
        <${Tours} onReference=${setReference} />
        <${Adventures} onAsk=${setService} />
        <${Courier} />
        <${BookingStatus} reference=${reference} setReference=${setReference} />
        <${Contact} service=${service} setService=${setService} />
      </main>
      <${Footer} />
      <${BackToTop} />
      <${Toasts} items=${toasts} />
    </${ToastContext.Provider}>`;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);
