export default function Quote() {
  return (
    <section className="quote-section" id="quote">
      <div className="quote-inner">
        <div className="quote-mark reveal">"</div>
        <div className="quote-text reveal reveal-delay-1">
          The three rungs of the Ladder of Causation:{' '}
          <strong>Association, Intervention, Counterfactual.</strong>
        </div>
        <div className="quote-cite reveal reveal-delay-2">— Judea Pearl, The Book of Why</div>
      </div>
    </section>
  );
}
