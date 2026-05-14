import { useEffect, useRef, useState } from 'react';

const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

function fitCanvas(cv) {
  const r = cv.getBoundingClientRect();
  const d = dpr();
  cv.width = r.width * d;
  cv.height = r.height * d;
  cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
}

function useAgentSwarm(cvRef, setStatus) {
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let agents = [];
    let count = 0;
    let raf;

    const init = () => {
      fitCanvas(cv);
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      agents = [];
      for (let i = 0; i < 120; i++) {
        agents.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
          type: Math.random() < 0.15 ? 1 : 0,
        });
      }
    };
    init();
    window.addEventListener('resize', init);
    let t = 0;
    const tick = () => {
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      t += 0.012;
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const a = agents[i], b = agents[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 28) {
            ctx.strokeStyle = `rgba(17,17,17,${(1 - d / 28) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      agents.forEach((a) => {
        a.x += a.vx + Math.sin(a.phase + t) * 0.15;
        a.y += a.vy + Math.cos(a.phase + t * 0.7) * 0.15;
        if (a.x < 0) a.x = w; if (a.x > w) a.x = 0;
        if (a.y < 0) a.y = h; if (a.y > h) a.y = 0;
        ctx.fillStyle = a.type ? 'rgba(17,17,17,0.85)' : 'rgba(17,17,17,0.45)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.type ? 1.8 : 1.1, 0, Math.PI * 2);
        ctx.fill();
      });
      count = Math.min(count + 6, 12480);
      setStatus(`N = ${count.toLocaleString()}`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
}

function useNetwork(cvRef, setStatus) {
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let nodes = [], edges = [], pulseSrc = 0, pulseStart = 0, deltas = 0, raf;

    const init = () => {
      fitCanvas(cv);
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      nodes = [];
      const N = 16;
      for (let i = 0; i < N; i++) {
        nodes.push({ x: 20 + Math.random() * (w - 40), y: 20 + Math.random() * (h - 40), activated: 0 });
      }
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        const others = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
          .filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
        const k = 2 + Math.floor(Math.random() * 2);
        for (let m = 0; m < k; m++) {
          const j = others[m].j;
          if (!edges.find((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
            edges.push({ a: i, b: j });
          }
        }
      }
    };
    init();
    window.addEventListener('resize', init);

    const startPulse = () => {
      pulseSrc = Math.floor(Math.random() * nodes.length);
      pulseStart = performance.now();
      nodes.forEach((n) => (n.activated = 0));
      nodes[pulseSrc].activated = 1;
    };
    startPulse();
    const iv = setInterval(startPulse, 4500);

    const tick = () => {
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      const elapsed = (performance.now() - pulseStart) / 1000;
      edges.forEach((e) => {
        const a = nodes[e.a], b = nodes[e.b];
        ctx.strokeStyle = 'rgba(17,17,17,0.18)';
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      const wave = elapsed * 90;
      nodes.forEach((n, i) => {
        if (i === pulseSrc) { n.activated = 1; return; }
        const src = nodes[pulseSrc];
        const d = Math.hypot(n.x - src.x, n.y - src.y);
        if (wave >= d && n.activated < 1) {
          n.activated = Math.min(1, n.activated + 0.05);
          if (n.activated === 1) deltas++;
        }
      });
      if (elapsed < 3) {
        const src = nodes[pulseSrc];
        ctx.strokeStyle = `rgba(17,17,17,${Math.max(0, 0.5 - elapsed * 0.15)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(src.x, src.y, wave, 0, Math.PI * 2); ctx.stroke();
      }
      nodes.forEach((n, i) => {
        const r = 3 + n.activated * 2;
        ctx.fillStyle = i === pulseSrc ? 'rgba(17,17,17,1)' : `rgba(17,17,17,${0.3 + n.activated * 0.7})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        if (i === pulseSrc) {
          ctx.strokeStyle = 'rgba(17,17,17,0.6)';
          ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI * 2); ctx.stroke();
        }
      });
      setStatus(`Δ = ${deltas}`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); clearInterval(iv); window.removeEventListener('resize', init); };
  }, []);
}

function useProofTree(cvRef, setStatus) {
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let tree = [], frame = 0, paths = 0, raf;

    const build = () => {
      fitCanvas(cv);
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      tree = [];
      const recurse = (x, y, dx, depth, parent) => {
        if (depth > 5) return;
        const id = tree.length;
        const verdict = depth >= 3
          ? (Math.random() < 0.18 ? 'fail' : (Math.random() < 0.5 ? 'pass' : 'open'))
          : 'open';
        tree.push({ id, x, y, parent, depth, verdict, born: depth * 18 + Math.random() * 6 });
        if (verdict === 'fail') return;
        const ny = y + (h - 30) / 6;
        recurse(x - dx, ny, dx * 0.55, depth + 1, id);
        recurse(x + dx, ny, dx * 0.55, depth + 1, id);
      };
      recurse(cv.getBoundingClientRect().width / 2, 25, cv.getBoundingClientRect().width * 0.22, 0, -1);
    };
    build();
    const onResize = () => { build(); frame = 0; };
    window.addEventListener('resize', onResize);

    const tick = () => {
      const w = cv.getBoundingClientRect().width;
      const h = cv.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      frame++;
      if (frame > 600) { build(); frame = 0; paths = 0; }
      tree.forEach((n) => {
        if (frame < n.born) return;
        if (n.parent >= 0) {
          const p = tree[n.parent];
          ctx.strokeStyle = n.verdict === 'fail'
            ? 'rgba(180,60,40,0.7)'
            : n.verdict === 'pass'
              ? 'rgba(17,17,17,0.85)'
              : 'rgba(17,17,17,0.35)';
          ctx.lineWidth = n.verdict === 'pass' ? 1.4 : 0.8;
          if (n.verdict === 'fail') ctx.setLineDash([2, 3]); else ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          ctx.setLineDash([]);
        }
        let fill;
        if (n.verdict === 'pass') fill = 'rgba(17,17,17,0.9)';
        else if (n.verdict === 'fail') fill = 'rgba(180,60,40,0.85)';
        else fill = 'rgba(17,17,17,0.4)';
        ctx.fillStyle = fill;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.depth === 0 ? 3.5 : 2, 0, Math.PI * 2); ctx.fill();
      });
      paths = Math.min(paths + 7, 1048576);
      setStatus(`paths = ${paths.toLocaleString()}`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
}

function LayerL1() {
  const ref = useRef(null);
  const [s, setS] = useState('N = 0');
  useAgentSwarm(ref, setS);
  return (
    <div className="layer-canvas-wrap">
      <span className="layer-tag">L1 · Agents</span>
      <canvas ref={ref} />
      <span className="layer-state">{s}</span>
    </div>
  );
}
function LayerL2() {
  const ref = useRef(null);
  const [s, setS] = useState('Δ = 0');
  useNetwork(ref, setS);
  return (
    <div className="layer-canvas-wrap">
      <span className="layer-tag">L2 · Network</span>
      <canvas ref={ref} />
      <span className="layer-state">{s}</span>
    </div>
  );
}
function LayerL3() {
  const ref = useRef(null);
  const [s, setS] = useState('paths = 0');
  useProofTree(ref, setS);
  return (
    <div className="layer-canvas-wrap">
      <span className="layer-tag">L3 · State-space</span>
      <canvas ref={ref} />
      <span className="layer-state">{s}</span>
    </div>
  );
}

export default function Infrastructure() {
  return (
    <section className="infrastructure-section" id="infra">
      <div className="infra-header">
        <div className="infra-kicker reveal">Infrastructure · three layers</div>
        <h2 className="infra-heading reveal reveal-delay-1">
          Others stop at Layer 1.<br />Loka Labs has all three.
        </h2>
        <div className="display-serif reveal reveal-delay-2">A vertically-integrated causal stack.</div>
      </div>

      <div className="feature-block reveal">
        <LayerL1 />
        <div className="feature-label">Layer 1 — Association</div>
        <div className="feature-title">Behavioral Simulation</div>
        <div className="feature-text">Models heterogeneous actors. Outputs state-space evolution: how environments change from t to t+1. High-fidelity instantiation of synthetic populations governed by calibrated micro-foundations, creating emergent macro-economic phenomena without forcing top-down equilibrium constraints.</div>
      </div>

      <div className="feature-block reveal reveal-delay-1">
        <LayerL2 />
        <div className="feature-label">Layer 2 — Intervention</div>
        <div className="feature-title">Economic Engine</div>
        <div className="feature-text">The physics of an economy. Forces changes to propagate through the agent network, revealing second-order effects. A proprietary compute engine designed specifically for the nonlinear dynamics of financial flows, resource allocation, and trade networks.</div>
      </div>

      <div className="feature-block reveal reveal-delay-2">
        <LayerL3 />
        <div className="feature-label">Layer 3 — Counterfactual</div>
        <div className="feature-title">Formal Verification</div>
        <div className="feature-text">Mathematically proves properties hold. Before implementation, every proposed intervention is exhaustively stress-tested across a massive state space to identify systemic vulnerabilities and unintended consequences. Results are not just probable. They are provable.</div>
      </div>

      <div className="feature-quote reveal reveal-delay-3">
        <span className="qmark">Operating principle</span>
        <span className="qline" />
        <span><em>Agents simulate decisions. Economics enforces the rules. Math proves the results.</em></span>
      </div>
    </section>
  );
}
