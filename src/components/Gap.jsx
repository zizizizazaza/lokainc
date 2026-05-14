export default function Gap() {
  return (
    <section className="prose-section gap-section" id="gap">
      <div className="prose-block">
        <div className="prose-kicker reveal"><span className="rule" /> The structural gap</div>
        <h2 className="prose-heading reveal reveal-delay-1">
          Navigating a living system<br />with a dead map.
        </h2>
        <div className="prose-body reveal reveal-delay-2">
          <p>Policies are interventions. Crises are counterfactual failures. Yet the tools we use to make decisions operate on mere statistical association.</p>
          <p>Legacy models treat humanity as a predictable mass. But economic systems are no longer stationary. AI is rewriting reality faster than any historical model can follow.</p>
        </div>
      </div>
      <div className="drift-figure reveal reveal-delay-3">
        <svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <linearGradient id="realityGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line x1="20" y1="180" x2="500" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity="0.55" />
          <text x="24" y="172" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="18" fill="currentColor" opacity="0.7">Model</text>
          <path d="M 20 180 Q 80 178 120 175 T 220 168 Q 260 158 290 138 T 360 80 Q 400 55 440 38 T 500 16 L 500 180 L 20 180 Z" fill="currentColor" opacity="0.07" />
          <path d="M 20 180 Q 80 178 120 175 T 220 168 Q 260 158 290 138 T 360 80 Q 400 55 440 38 T 500 16" fill="none" stroke="url(#realityGrad)" strokeWidth="2.2" strokeLinecap="round" />
          <text x="495" y="32" textAnchor="end" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="20" fill="currentColor" opacity="0.95">Reality</text>
          <circle cx="500" cy="16" r="5" fill="currentColor" />
        </svg>
        <div className="drift-caption">
          The map was right once.<br />The territory has moved.
        </div>
      </div>
    </section>
  );
}
