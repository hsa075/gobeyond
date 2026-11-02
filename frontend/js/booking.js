import { html, useState, useEffect, useRef, useMemo, Reveal, api, money, todayISO, propertyPhotos, tourPhotos, useBooking, SuccessCard, CardSkeletons } from './lib.js';

function useList(url) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    api(url).then(d => alive && setItems(d.results || [])).catch(e => alive && (setError(e.message), setItems([])));
    return () => { alive = false; };
  }, [url]);
  return { items, error };
}

const Tags = ({ list }) => html`<div className="amenities">${(list || []).slice(0, 4).map(t => html`<span key=${t}>${t}</span>`)}</div>`;

export function Hospitality({ onReference }) {
  const { items, error } = useList('/api/hospitality/properties/');
  const [selected, setSelected] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const formRef = useRef(null);
  const reset = () => { setSelected(''); setCheckIn(''); setCheckOut(''); };
  const { busy, error: formError, done, submit, clear } = useBooking('/api/hospitality/bookings/', ['guests', 'rooms_requested'], onReference, reset);
  const choose = id => {
    setSelected(String(id));
    formRef.current && formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const onCheckIn = value => { setCheckIn(value); if (checkOut && checkOut <= value) setCheckOut(''); };
  return html`
    <section className="section-block hospitality-section" id="hospitality">
      <div className="section-wrap">
        <${Reveal} className="section-heading">
          <div><p className="eyebrow">01 / Stay well</p><h2>Hospitality</h2><p className="section-lead">A place to land, recharge and feel looked after. Browse accommodation and send a stay request.</p></div>
          <div className="section-tag tag-gold">Rooms & stays</div>
        </${Reveal}>
        <div className="listing-grid" aria-live="polite">
          ${items === null && html`<${CardSkeletons} />`}
          ${error && html`<p className="empty-state">Could not load accommodation: ${error}. Check that the backend is running and demo data has been loaded.</p>`}
          ${items && !error && items.length === 0 && html`<p className="empty-state">No active accommodation is listed yet. The team can add properties from the admin panel.</p>`}
          ${(items || []).map((item, index) => html`
            <${Reveal} as="article" className="listing-card" key=${item.id} delay=${(index % 3) * 90}>
              <div className="listing-image"><img src=${propertyPhotos[index % propertyPhotos.length]} alt=${`Accommodation inspiration for ${item.name}`} loading="lazy" decoding="async" /></div>
              <div className="card-topline"><span className="card-index">⌂</span><span className="card-location">${item.location}</span></div>
              <h3>${item.name}</h3><p>${item.description}</p>
              <${Tags} list=${item.amenities} />
              <div className="card-bottom"><div className="price">${money(item.nightly_rate)}<small>per room / night</small></div>
                <button className="card-action" type="button" onClick=${() => choose(item.id)}>Request stay ↗</button></div>
            </${Reveal}>`)}
        </div>
        <${Reveal} className="booking-panel">
          <div className="panel-intro"><p className="eyebrow">Make it yours</p><h3>Request a stay</h3><p>Submit your preferred dates. The hospitality team will review room availability and confirm the reservation with you.</p>
            <div className="flow-steps"><span><b>1</b> Choose stay</span><span><b>2</b> Add dates</span><span><b>3</b> Receive reference</span></div></div>
          <form className="form-grid" ref=${formRef} onSubmit=${submit}>
            <label className="field field-wide">Accommodation
              <select name="property_id" required value=${selected} onChange=${e => setSelected(e.target.value)}>
                <option value="">${items === null ? 'Loading stays…' : 'Choose accommodation'}</option>
                ${(items || []).map(i => html`<option key=${i.id} value=${i.id}>${i.name} · ${i.location}</option>`)}
              </select></label>
            <label className="field">Check-in<input name="check_in" type="date" required min=${todayISO()} value=${checkIn} onChange=${e => onCheckIn(e.target.value)} /></label>
            <label className="field">Check-out<input name="check_out" type="date" required min=${checkIn || todayISO()} value=${checkOut} onChange=${e => setCheckOut(e.target.value)} /></label>
            <label className="field">Guests<input name="guests" type="number" min="1" max="40" defaultValue="2" required /></label>
            <label className="field">Rooms<input name="rooms_requested" type="number" min="1" max="10" defaultValue="1" required /></label>
            <label className="field">Full name<input name="full_name" autoComplete="name" maxLength="100" required /></label>
            <label className="field">Phone number<input name="contact" autoComplete="tel" maxLength="150" required /></label>
            <label className="field field-wide">Email address<input name="email" type="email" autoComplete="email" maxLength="254" required /></label>
            <label className="field field-wide">Special requests <span className="optional">Optional</span><textarea name="special_requests" rows="3" maxLength="1000" placeholder="Accessibility needs, arrival time, or preferences"></textarea></label>
            <div className="field-wide form-bottom">
              <button className="btn btn-dark" type="submit" disabled=${busy}>${busy ? 'Submitting…' : 'Request a stay'} <span aria-hidden="true">↗</span></button>
              ${formError && html`<p className="form-message error" role="alert">${formError}</p>`}
            </div>
            ${done && html`<div className="field-wide"><${SuccessCard} done=${done} onClose=${clear} /></div>`}
          </form>
        </${Reveal}>
      </div>
    </section>`;
}

export function Tours({ onReference }) {
  const { items, error } = useList('/api/tours/packages/');
  const [selected, setSelected] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('All');
  const formRef = useRef(null);
  const reset = () => { setSelected(''); setDate(''); };
  const { busy, error: formError, done, submit, clear } = useBooking('/api/tours/bookings/', ['travelers'], onReference, reset);
  const categories = useMemo(() => ['All', ...new Set((items || []).map(i => i.category).filter(Boolean))], [items]);
  const choose = id => {
    setSelected(String(id));
    formRef.current && formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return html`
    <section className="section-block tours-section" id="tours">
      <div className="section-wrap">
        <${Reveal} className="section-heading">
          <div><p className="eyebrow">02 / Go somewhere</p><h2>Tours & Travels</h2><p className="section-lead">Curated itineraries for weekend escapes, domestic holidays, international trips and group travel.</p></div>
          <div className="section-tag tag-teal">Trips & packages</div>
        </${Reveal}>
        ${categories.length > 2 && html`
          <div className="chip-row" role="group" aria-label="Filter tours by category">
            ${categories.map(c => html`<button key=${c} type="button" className=${`chip${c === category ? ' active' : ''}`} aria-pressed=${c === category} onClick=${() => setCategory(c)}>${c}</button>`)}
          </div>`}
        <div className="listing-grid tour-grid" aria-live="polite">
          ${items === null && html`<${CardSkeletons} />`}
          ${error && html`<p className="empty-state">Could not load tour packages: ${error}. Check that the backend is running and demo data has been loaded.</p>`}
          ${items && !error && items.length === 0 && html`<p className="empty-state">No active tour packages are listed yet. Add packages from the admin panel or load the demo data.</p>`}
          ${(items || []).map((item, index) => (category === 'All' || item.category === category) && html`
            <${Reveal} as="article" className="listing-card" key=${item.id} delay=${(index % 3) * 90}>
              <div className="listing-image"><img src=${tourPhotos[index % tourPhotos.length]} alt=${`Travel inspiration for ${item.destination}`} loading="lazy" decoding="async" /></div>
              <div className="card-topline"><span className="card-index">✳</span><span className="category-pill">${item.category}</span></div>
              <h3>${item.title}</h3>
              <p className="card-location">${item.destination} · ${item.duration_days} day${item.duration_days === 1 ? '' : 's'}</p>
              <p>${item.description}</p>
              <${Tags} list=${item.inclusions} />
              <div className="card-bottom"><div className="price">${money(item.price_per_person)}<small>per person</small></div>
                <button className="card-action" type="button" onClick=${() => choose(item.id)}>Choose trip ↗</button></div>
            </${Reveal}>`)}
        </div>
        <${Reveal} className="booking-panel tour-booking-panel">
          <div className="panel-intro"><p className="eyebrow">Plan the route</p><h3>Book a trip</h3><p>Choose a package and departure date. Your request is saved to the database so the travel team can follow up.</p>
            <div className="flow-steps"><span><b>1</b> Pick a package</span><span><b>2</b> Set travel date</span><span><b>3</b> Confirm itinerary</span></div></div>
          <form className="form-grid" ref=${formRef} onSubmit=${submit}>
            <label className="field field-wide">Tour package
              <select name="package_id" required value=${selected} onChange=${e => setSelected(e.target.value)}>
                <option value="">${items === null ? 'Loading packages…' : 'Choose a tour package'}</option>
                ${(items || []).map(i => html`<option key=${i.id} value=${i.id}>${i.title} · ${i.destination}</option>`)}
              </select></label>
            <label className="field">Departure date<input name="travel_date" type="date" required min=${todayISO()} value=${date} onChange=${e => setDate(e.target.value)} /></label>
            <label className="field">Travellers<input name="travelers" type="number" min="1" max="100" defaultValue="2" required /></label>
            <label className="field">Full name<input name="full_name" autoComplete="name" maxLength="100" required /></label>
            <label className="field">Phone number<input name="contact" autoComplete="tel" maxLength="150" required /></label>
            <label className="field field-wide">Email address<input name="email" type="email" autoComplete="email" maxLength="254" required /></label>
            <label className="field field-wide">Special requests <span className="optional">Optional</span><textarea name="special_requests" rows="3" maxLength="1000" placeholder="Pickup location, interests, or accessibility needs"></textarea></label>
            <div className="field-wide form-bottom">
              <button className="btn btn-dark" type="submit" disabled=${busy}>${busy ? 'Submitting…' : 'Request this trip'} <span aria-hidden="true">↗</span></button>
              ${formError && html`<p className="form-message error" role="alert">${formError}</p>`}
            </div>
            ${done && html`<div className="field-wide"><${SuccessCard} done=${done} onClose=${clear} /></div>`}
          </form>
        </${Reveal}>
      </div>
    </section>`;
}
