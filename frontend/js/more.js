import { html, useState, Reveal, api, useToast } from './lib.js';

export function Adventures({ onAsk }) {
  const points = [
    ['01', '🥾', 'Trekking & camping', 'Guided trails, overnight camps and weekend escapes.'],
    ['02', '🛶', 'Water & air sports', 'Rafting, kayaking and other experiences with trained operators.'],
    ['03', '🧗', 'Team outings', 'Group activities and outdoor challenges built around your team.'],
  ];
  return html`
    <section className="section-block adventure-section" id="adventures">
      <div className="section-wrap division-layout">
        <${Reveal}><p className="eyebrow">03 / Take the scenic route</p><h2>Adventures</h2><p className="section-lead">Get outside with guided experiences for first-timers, weekend wanderers and teams who like a challenge.</p>
          <a className="btn btn-light" href="#contact" onClick=${() => onAsk('adventures')}>Ask about adventures <span aria-hidden="true">↗</span></a></${Reveal}>
        <div className="service-points">
          ${points.map(([n, icon, title, text], i) => html`
            <${Reveal} as="article" key=${n} delay=${i * 110}>
              <span>${n}</span><div><h3><span className="adv-icon" aria-hidden="true">${icon}</span> ${title}</h3><p>${text}</p></div>
            </${Reveal}>`)}
        </div>
      </div>
    </section>`;
}

export function Courier() {
  const [number, setNumber] = useState('');
  const [state, setState] = useState({ loading: false, data: null, error: '' });
  const track = async event => {
    event.preventDefault();
    setState({ loading: true, data: null, error: '' });
    try {
      const data = await api(`/api/track/${encodeURIComponent(number.trim().toUpperCase())}/`);
      setState({ loading: false, data, error: '' });
    } catch (err) {
      setState({ loading: false, data: null, error: err.message });
    }
  };
  const { loading, data, error } = state;
  return html`
    <section className="section-block courier-section" id="courier">
      <div className="section-wrap courier-layout">
        <${Reveal}><p className="eyebrow">04 / On the move</p><h2>Courier</h2><p className="section-lead">From important documents to everyday parcels, keep an eye on the journey from pickup to delivery.</p>
          <div className="courier-features"><span>Pickup & delivery</span><span>Tracking updates</span><span>Business parcels</span></div>
          <figure className="courier-photo"><img src="https://images.pexels.com/photos/4440800/pexels-photo-4440800.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Cardboard parcels stacked and ready for shipping" loading="lazy" /><figcaption>Every parcel has a journey.</figcaption></figure>
        </${Reveal}>
        <${Reveal} as="form" className="track-card" delay=${120} onSubmit=${track}>
          <div className="track-icon">↗</div><h3>Track a parcel</h3><p>Enter the tracking number shared with you.</p>
          <label htmlFor="track-id">Tracking number</label>
          <div className="inline-input"><input id="track-id" required maxLength="16" placeholder="e.g. KC1234567890" value=${number} onChange=${e => setNumber(e.target.value)} />
            <button className="btn btn-dark" type="submit" disabled=${loading}>${loading ? 'Looking…' : 'Track'}</button></div>
          <div className="result-box" role="status" aria-live="polite">
            ${error && html`<div className="result-card"><strong>Parcel not found</strong><p>${error}</p></div>`}
            ${data && html`
              <div className="result-card">
                <div className="result-head"><strong>${data.tracking_number}</strong><span className="badge">${data.status}</span></div>
                <p className="route">${data.origin} <span aria-hidden="true">→</span> ${data.destination}</p>
                ${data.events && data.events.length > 0
                  ? html`<ol className="timeline">${data.events.map((ev, i) => html`
                      <li key=${i} className=${i === 0 ? 'latest' : ''}><span className="dot"></span>
                        <div><b>${ev.location || 'In transit'}</b><small>${ev.time}${ev.note ? ` · ${ev.note}` : ''}</small></div></li>`)}</ol>`
                  : html`<p>No tracking updates have been added yet.</p>`}
              </div>`}
          </div>
        </${Reveal}>
      </div>
    </section>`;
}

export function BookingStatus({ reference, setReference }) {
  const [state, setState] = useState({ loading: false, data: null, error: '' });
  const check = async event => {
    event.preventDefault();
    setState({ loading: true, data: null, error: '' });
    try {
      const data = await api(`/api/bookings/${encodeURIComponent(reference.trim().toUpperCase())}/`);
      setState({ loading: false, data, error: '' });
    } catch (err) {
      setState({ loading: false, data: null, error: err.message });
    }
  };
  const { loading, data, error } = state;
  return html`
    <section className="section-block status-section" id="booking-status">
      <div className="section-wrap status-layout">
        <${Reveal}><p className="eyebrow">Already sent a request?</p><h2>Check your booking</h2><p className="section-lead">Use the reference shown after submitting a stay or trip request to see its latest status.</p></${Reveal}>
        <${Reveal} as="form" className="status-form" delay=${120} onSubmit=${check}>
          <label htmlFor="booking-ref">Booking reference</label>
          <div className="inline-input"><input id="booking-ref" required maxLength="16" placeholder="HSP-1A2B3C4D or TRV-1A2B3C4D" value=${reference} onChange=${e => setReference(e.target.value)} />
            <button className="btn btn-dark" type="submit" disabled=${loading}>${loading ? 'Checking…' : 'Check status'}</button></div>
          <div className="result-box" role="status" aria-live="polite">
            ${error && html`<div className="result-card"><strong>Booking not found</strong><p>${error}</p></div>`}
            ${data && html`
              <div className="result-card">
                <div className="result-head"><strong>${data.type}</strong><span className=${`badge badge-${String(data.status).toLowerCase()}`}>${data.status}</span></div>
                <p>${data.reference} · ${data.item}</p>
                <p>Date: ${data.date} · Request created: ${data.submitted}</p>
              </div>`}
          </div>
        </${Reveal}>
      </div>
    </section>`;
}

export function Contact({ service, setService }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', kind: '' });
  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setBusy(true); setMessage({ text: '', kind: '' });
    try {
      const data = await api('/api/inquiries/', { method: 'POST', body: JSON.stringify(payload) });
      setMessage({ text: `Thanks, ${data.name}. Your enquiry has been saved. Our team will follow up.`, kind: 'success' });
      toast('Enquiry sent', 'success');
      form.reset();
      setService('general');
    } catch (err) {
      setMessage({ text: err.message, kind: 'error' });
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return html`
    <section className="section-block contact-section" id="contact">
      <div className="section-wrap contact-layout">
        <${Reveal}><p className="eyebrow">Need a hand?</p><h2>Let's talk about it.</h2><p className="section-lead">For adventures, courier support, corporate queries or anything else, send the team a note.</p>
          <div className="contact-details"><span>✉ hello@kenchaingroups.com</span><span>◎ India-wide service</span></div></${Reveal}>
        <${Reveal} as="form" className="contact-card" delay=${120} onSubmit=${submit}>
          <label className="field">Your name<input name="name" autoComplete="name" maxLength="100" required /></label>
          <label className="field">Phone or email<input name="contact" maxLength="150" required /></label>
          <label className="field">What can we help with?
            <select name="service" value=${service} onChange=${e => setService(e.target.value)}>
              <option value="general">General enquiry</option><option value="adventures">Adventures</option><option value="courier">Courier</option>
            </select></label>
          <label className="field">Message<textarea name="message" rows="4" maxLength="2000" placeholder="Tell us a little about what you need"></textarea></label>
          <button className="btn btn-primary" type="submit" disabled=${busy}>${busy ? 'Sending…' : 'Send enquiry'} <span aria-hidden="true">↗</span></button>
          <p className=${`form-message ${message.kind}`} role="status" aria-live="polite">${message.text}</p>
        </${Reveal}>
      </div>
    </section>`;
}
