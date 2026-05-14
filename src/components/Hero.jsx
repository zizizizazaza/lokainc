export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-title-group">
        <h1 className="hero-h1 reveal">
          <span className="h1-line h1-sans">The Economic</span>
          <span className="h1-line h1-bold"><span className="h1-accent">World</span> Model.</span>
        </h1>
        <p className="hero-tagline reveal reveal-delay-2">
          When the cost of simulation approaches zero,<br />
          the cost of not simulating becomes indefensible.
        </p>
        <div className="hero-cta-row reveal reveal-delay-3">
          <a href="https://lokaworld.vercel.app/" target="_blank" rel="noreferrer" className="hero-cta">
            <span>Start simulating</span>
            <span className="arrow">→</span>
          </a>
          <span className="hero-cta-meta">Runs on your infrastructure.</span>
        </div>
      </div>
      <div className="manifesto-block reveal reveal-delay-3">
        Relying on historical data alone traps policy in the associative layer. To govern complex systems, to design charter cities, to stress-test global financial infrastructure — we must model causality, not correlation.
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-arrow">↓</span>
      </div>
    </section>
  );
}
