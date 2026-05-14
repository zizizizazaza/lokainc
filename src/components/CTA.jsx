export default function CTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-badge reveal">
        <span className="pill">Built on</span>
        <span className="credit">
          Formal Verification (2007 Turing Award)<br />&amp; Distributed AI at Scale (NSDI / OSDI)
        </span>
      </div>
      <h2 className="cta-heading reveal reveal-delay-1">
        Simulation is not an improvement.<br />It is a prerequisite.
      </h2>
      <div className="cta-sub reveal reveal-delay-2">
        Data sovereignty by design. Runs entirely on client infrastructure.
      </div>
      <button type="button" className="cta-button reveal reveal-delay-3">
        <span>Start simulating</span>
        <span className="arrow">→</span>
      </button>
      <div className="cta-meta reveal reveal-delay-4">
        <span>Air-gapped deployment</span>
        <span>On-prem GPU cluster</span>
        <span>SOC 2 · ISO 27001</span>
      </div>
    </section>
  );
}
