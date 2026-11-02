import React from 'react';
import htm from 'htm';

export { React };
export const html = htm.bind(React.createElement);
export const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

export const money = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const csrfToken = () => {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
};

const API_BASE = (window.KENCHAIN_CONFIG?.API_BASE || '').replace(/\/+$/, '');

function resolveApiUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function api(url, options = {}) {
  const response = await fetch(resolveApiUrl(url), {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.method === 'POST' ? { 'X-CSRFToken': csrfToken() } : {}),
      ...(options.headers || {}),
    },
  });
  let data;
  try { data = await response.json(); } catch { data = { error: 'The server returned an unreadable response.' }; }
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

const u = (id, w = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=82`;
export const photo = u;
export const propertyPhotos = [
  '1566073771259-6a8506099945', '1542314831-068cd1dbfeeb', '1520250497591-112f2f40a3f4',
  '1571896349842-33c89424de2d', '1510798831971-661eb04b3739', '1540518614846-7eded433c457',
].map(id => u(id));
export const tourPhotos = [
  '1501785888041-af3ef285b470', '1476514525535-07fb3b4ae5f1', '1507525428034-b723cf961d3e',
  '1500530855697-b586d89ba3ee', '1464822759023-fed622ff2c3b', '1530789253388-582c481c54b0',
].map(id => u(id));

// Toasts
export const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

// Fade/slide in when scrolled into view (content stays visible if IntersectionObserver is missing)
export function Reveal({ as = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (shown || !ref.current) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);
  return React.createElement(as, {
    ref,
    className: `rv${shown ? ' rv-in' : ''} ${className}`.trim(),
    style: { transitionDelay: `${delay}ms` },
    ...rest,
  }, children);
}

// Shared submit logic for the two booking forms
export function useBooking(endpoint, numericFields, onReference, afterReset) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    numericFields.forEach(key => { payload[key] = Number(payload[key]); });
    setBusy(true); setError('');
    try {
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      setDone({ reference: data.reference, message: data.message });
      onReference(data.reference);
      toast(`Request sent · ${data.reference}`, 'success');
      form.reset();
      if (afterReset) afterReset();
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, done, submit, clear: () => setDone(null) };
}

export function SuccessCard({ done, onClose }) {
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(done.reference); toast('Reference copied', 'success'); }
    catch { toast('Copy failed — select the reference and copy it manually.', 'error'); }
  };
  return html`
    <div className="success-card" role="status">
      <div className="success-check" aria-hidden="true">✓</div>
      <div>
        <strong>Request received</strong>
        <p>${done.message}</p>
        <div className="ref-row"><code>${done.reference}</code>
          <button type="button" className="mini-btn" onClick=${copy}>Copy</button>
          <a className="mini-btn" href="#booking-status">Check status ↓</a></div>
      </div>
      <button type="button" className="success-close" aria-label="Dismiss" onClick=${onClose}>×</button>
    </div>`;
}

export function CardSkeletons() {
  return [0, 1, 2].map(i => html`
    <div className="listing-card skeleton-card" key=${i} aria-hidden="true">
      <div className="sk sk-img"></div><div className="sk sk-line w40"></div>
      <div className="sk sk-line w70"></div><div className="sk sk-line"></div>
    </div>`);
}
