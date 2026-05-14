import { useEffect, useRef } from 'react';

export default function Verification() {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = cv.getBoundingClientRect();
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 60;
    const predicted = [], actual = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = 0.25 + Math.sin(t * Math.PI * 1.5) * 0.18 + Math.sin(t * Math.PI * 5) * 0.05 + t * 0.32;
      predicted.push(base);
      const noise = (Math.sin(t * 37 + 1) + Math.cos(t * 23)) * 0.012;
      actual.push(base + noise);
    }

    let progress = 0;
    let started = false;
    let raf;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) started = true; }),
      { threshold: 0.25 }
    );
    obs.observe(cv);

    const draw = () => {
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      const padL = 24, padR = 20, padT = 24, padB = 30;
      const cw = w - padL - padR;
      const ch = h - padT - padB;
      const eventX = padL + cw * 0.5;

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT + ch); ctx.lineTo(padL + cw, padT + ch); ctx.stroke();

      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.moveTo(eventX, padT); ctx.lineTo(eventX, padT + ch); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('Event', eventX + 8, padT + 11);

      const animLen = Math.floor(N * progress);

      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i <= animLen; i++) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch * (1 - predicted[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      for (let i = 0; i <= animLen; i++) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch * (1 - (predicted[i] + 0.025));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let i = animLen; i >= 0; i--) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch * (1 - (predicted[i] - 0.025));
        ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= animLen; i++) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch * (1 - actual[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (let i = 0; i <= animLen; i += 6) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch * (1 - actual[i]);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = () => {
      if (started && progress < 1) progress = Math.min(1, progress + 0.011);
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      obs.disconnect();
    };
  }, []);

  return (
    <section className="verification-section" id="verify">
      <div className="chart-wrap reveal">
        <div className="chart-title">Prediction · Verified Outcome</div>
        <canvas ref={cvRef} width="640" height="360" />
        <div className="chart-legend">
          <span className="dashed">Pre-event prediction</span>
          <span>Verified outcome</span>
        </div>
      </div>
      <div className="prose-block">
        <div className="prose-kicker reveal">Public verification <span className="rule" /></div>
        <h2 className="prose-heading reveal reveal-delay-1">
          The error is public,<br />timestamped, and verifiable<br />by anyone.
        </h2>
        <div className="prose-stats reveal reveal-delay-2">
          <div>
            <div className="stat-title">Ground Truth Calibration</div>
            <div className="stat-desc">We do not depend on synthetic data. Anchored on public macroeconomic data and decades of controlled behavioral economics research (Kahneman, Thaler).</div>
          </div>
          <div>
            <div className="stat-title">Live Public Verification</div>
            <div className="stat-desc">Major live events &amp; 2026 World Cup. Pre-event economic-impact prediction vs real verified data. Not a client testimonial — an accuracy test anyone can check.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
