import { html, useState, useEffect, Reveal, photo } from './lib.js';

const SECTIONS = [['hospitality', 'Hospitality'], ['tours', 'Tours & Travels'], ['adventures', 'Adventures'], ['courier', 'Courier']];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('');
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      let current = '';
      SECTIONS.concat([['contact', '']]).forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const close = () => setOpen(false);
  return html`
    <div>
      <div className="scroll-progress" style=${{ width: `${progress}%` }}></div>
      <header className=${`site-header${scrolled ? ' scrolled' : ''}`}>
        <a className="brand" href="#top" aria-label="Kenchain Groups home"><span className="brand-mark">K</span><span>kenchain<span className="brand-light"> groups</span></span></a>
        <button className="menu-btn" type="button" aria-controls="nav" aria-expanded=${open} onClick=${() => setOpen(!open)}>${open ? 'Close' : 'Menu'}</button>
        <nav id="nav" className=${open ? 'open' : ''} aria-label="Main navigation">
          ${SECTIONS.map(([id, label]) => html`<a key=${id} href=${`#${id}`} className=${active === id ? 'active' : ''} onClick=${close}>${label}</a>`)}
          <a href="#contact" className="nav-cta" onClick=${close}>Contact us</a>
        </nav>
      </header>
    </div>`;
}

const SLIDES = ['1506744038136-46273834b3fb', '1507525428034-b723cf961d3e', '1566073771259-6a8506099945', '1476514525535-07fb3b4ae5f1'].map(id => photo(id, 2000));
const WORDS = ['good planning.', 'great stays.', 'big adventures.', 'safe delivery.'];

export function Hero() {
  const [slide, setSlide] = useState(0);
  const [word, setWord] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const a = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6500);
    const b = setInterval(() => setWord(w => (w + 1) % WORDS.length), 3000);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  return html`
    <section className="hero-section">
      <div className="hero-slides" aria-hidden="true">
        ${SLIDES.map((src, i) => html`<div key=${src} className=${`hero-slide${i === slide ? ' on' : ''}`} style=${{ backgroundImage: `url(${src})` }}></div>`)}
        <div className="hero-tint"></div>
      </div>
      <div className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot"></span> One group. Four specialist services.</p>
          <h1>Good journeys start with <span key=${word} className="word-swap">${WORDS[word]}</span></h1>
          <p className="hero-intro">Find your stay, book a getaway, make room for adventure, or move a parcel. Each service has its own team and booking flow.</p>
          <div className="hero-actions"><a className="btn btn-primary" href="#tours">Explore trips <span aria-hidden="true">↗</span></a><a className="text-link" href="#hospitality">Find a stay <span aria-hidden="true">↓</span></a></div>
          <div className="hero-proof"><span>01 / Hospitality</span><span>02 / Tours & Travels</span><span>03 / Adventures</span><span>04 / Courier</span></div>
          <div className="slide-dots" role="tablist" aria-label="Background photos">
            ${SLIDES.map((_, i) => html`<button key=${i} type="button" role="tab" aria-selected=${i === slide} aria-label=${`Photo ${i + 1}`} className=${i === slide ? 'on' : ''} onClick=${() => setSlide(i)}></button>`)}
          </div>
        </div>
        <div className="hero-art hero-photo floaty">
          <img src=${photo('1566073771259-6a8506099945', 1500)} alt="A welcoming resort framed by tropical greenery and a swimming pool" />
          <div className="hero-photo-shade"></div>
          <div className="art-caption"><span>THE NEXT CHAPTER</span><strong>Out there, waiting.</strong></div>
          <span className="hero-photo-pill">Stay · Explore · Discover</span>
        </div>
      </div>
    </section>`;
}

export function Film() {
  return html`
    <section className="section-block travel-film-section" aria-labelledby="film-title">
      <div className="section-wrap travel-film-layout">
        <${Reveal} className="travel-film-copy">
          <p className="eyebrow">A little inspiration before you go</p>
          <h2 id="film-title">Let the journey begin.</h2>
          <p className="section-lead">From quiet resort mornings to big-sky views, find the kind of escape you want to come back talking about.</p>
          <div className="film-meta"><span className="film-play-mark" aria-hidden="true">▶</span><span><strong>Destination inspiration</strong><small>Travel film · 7 seconds</small></span></div>
          <p className="media-credit">Video by <a href="https://www.pexels.com/video/drone-shot-of-hotel-and-resort-with-a-mountain-view-4185232/" target="_blank" rel="noopener noreferrer">Grisha Grishkoff on Pexels</a>.</p>
        </${Reveal}>
        <${Reveal} as="figure" className="travel-film" delay=${120}>
          <video controls preload="none" playsInline poster=${photo('1520250497591-112f2f40a3f4', 1300)} aria-label="Aerial video of a resort with pools and mountain views">
            <source src="https://videos.pexels.com/video-files/4185232/4185232-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <figcaption>Dream the destination. We’ll help with the details.</figcaption>
        </${Reveal}>
      </div>
    </section>`;
}

export function Footer() {
  return html`
    <footer className="site-footer"><div className="section-wrap footer-inner">
      <a className="brand" href="#top"><span className="brand-mark">K</span><span>kenchain<span className="brand-light"> groups</span></span></a>
      <p>Stays, trips, adventures and logistics. Thoughtfully connected.</p>
      <span>© ${new Date().getFullYear()} Kenchain Groups</span>
    </div></footer>`;
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return html`<button type="button" className=${`to-top${show ? ' show' : ''}`} aria-label="Back to top" onClick=${() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>`;
}
