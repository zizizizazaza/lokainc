export default function Catalyst() {
  return (
    <section className="prose-section right catalyst-section" id="catalyst">
      <div className="stat-block reveal">
        <div>
          <div className="stat-row">
            <div className="stat-figure">280<sup>×</sup></div>
            <div className="arrow">↓</div>
          </div>
          <div className="stat-caption">
            Generative-agent simulation cost, two-year collapse.
          </div>
        </div>
        <div className="stat-divider" />
        <div>
          <div className="stat-row">
            <div className="stat-counter">Real-world trial cost</div>
            <div className="arrow">↑</div>
          </div>
          <div className="stat-caption">
            The curves have crossed. Simulation is now the cheaper instrument.
          </div>
        </div>
      </div>
      <div className="prose-block">
        <div className="prose-kicker reveal">The catalyst <span className="rule" /></div>
        <h2 className="prose-heading reveal reveal-delay-1">
          History has failed<br />as a predictive tool.
        </h2>
        <div className="prose-stats reveal reveal-delay-2">
          <div>
            <div className="stat-title">Cost Collapse</div>
            <div className="stat-desc">Generative agent simulation cost dropped 280× in two years. Two curves are crossing: simulation cost falls exponentially, real-world trial cost rises.</div>
          </div>
          <div>
            <div className="stat-title">Novel Worlds</div>
            <div className="stat-desc">Charter cities and AI jurisdictions are being built from zero. Using past data to predict these environments isn't just inaccurate; it's reckless.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
