import { useEffect, useRef, useState } from 'react';

const NODES = {
  P: { tag: 'Policy', x: 165, y: 190 },
  M: { tag: 'Market', x: 300, y: 100 },
  W: { tag: 'Welfare', x: 435, y: 190 },
  C: { tag: 'Confound', x: 300, y: 270 },
};

const RUNGS = {
  1: {
    name: 'Association',
    verb: 'Seeing · Observing',
    tab: 'Rung 01 · Observational',
    state: 'P(Y | X)',
    q: '"How are policy, market, and welfare correlated?"',
    desc: 'Joint distributions over observed variables. Patterns, not mechanisms.',
    formula: 'P(Y | X = x)',
  },
  2: {
    name: 'Intervention',
    verb: 'Doing · Intervening',
    tab: 'Rung 02 · Interventional',
    state: 'P(Y | do(X))',
    q: '"If I execute policy do(P), how does the system react?"',
    desc: 'Sever P from its causes, fix its value, and propagate the consequence through the structural model.',
    formula: 'P(Y | do(X = x))',
  },
  3: {
    name: 'Counterfactual',
    verb: 'Imagining · Retrospection',
    tab: 'Rung 03 · Counterfactual',
    state: 'P(Yₓ | X = x′, Y = y′)',
    q: '"What would welfare have been, had we chosen otherwise?"',
    desc: 'A factual world and a counterfactual twin run in parallel. The system imagines alternate histories and quantifies regret.',
    formula: 'P(Y_{P=1} | P=0, observed)',
  },
};

const NS = 'http://www.w3.org/2000/svg';

function makeEl(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const k in attrs) {
    if (k === 'text') node.textContent = attrs[k];
    else node.setAttribute(k, attrs[k]);
  }
  parent.appendChild(node);
  return node;
}

function drawNode(parent, x, y, label, tag, opts = {}) {
  const cls = 'node-circle' + (opts.intervened ? ' intervened' : '');
  makeEl('circle', { cx: x, cy: y, r: opts.r || 22, class: cls, opacity: opts.opacity || 1 }, parent);
  makeEl('text', { x, y, class: 'node-label' + (opts.intervened ? ' intervened' : ''), opacity: opts.labelOp || 1, text: label }, parent);
  if (tag) makeEl('text', { x, y: y + (opts.r || 22) + 16, class: 'node-tag', text: tag }, parent);
}

function drawEdge(parent, ax, ay, bx, by, opts = {}) {
  const e = makeEl('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'edge' }, parent);
  if (opts.dashed) e.setAttribute('stroke-dasharray', '4 5');
  else e.setAttribute('marker-end', 'url(#arrow)');
  if (opts.opacity) e.setAttribute('opacity', opts.opacity);
  if (opts.label) {
    makeEl('text', {
      x: (ax + bx) / 2, y: (ay + by) / 2 - 8,
      class: 'edge-label', text: opts.label,
    }, parent);
  }
}

function renderRung(n, edgesG, nodesG, extrasG) {
  edgesG.innerHTML = ''; nodesG.innerHTML = ''; extrasG.innerHTML = '';

  if (n == 1) {
    const { P, M, W, C } = NODES;
    drawEdge(edgesG, P.x, P.y, M.x, M.y, { dashed: true, label: 'ρ ≈ 0.62' });
    drawEdge(edgesG, M.x, M.y, W.x, W.y, { dashed: true, label: 'ρ ≈ 0.48' });
    drawEdge(edgesG, C.x, C.y, P.x, P.y, { dashed: true, opacity: 0.7 });
    drawEdge(edgesG, C.x, C.y, W.x, W.y, { dashed: true, opacity: 0.7 });
    drawNode(nodesG, P.x, P.y, 'P', P.tag);
    drawNode(nodesG, M.x, M.y, 'M', M.tag);
    drawNode(nodesG, W.x, W.y, 'W', W.tag);
    drawNode(nodesG, C.x, C.y, 'C', C.tag);
  } else if (n == 2) {
    const { P, M, W, C } = NODES;
    drawEdge(edgesG, C.x, C.y, P.x, P.y, { dashed: true, opacity: 0.18 });
    const mx = (P.x + C.x) / 2, my = (P.y + C.y) / 2;
    makeEl('line', { x1: mx - 10, y1: my - 10, x2: mx + 10, y2: my + 10, class: 'scissor', opacity: 1 }, edgesG);
    makeEl('line', { x1: mx + 10, y1: my - 10, x2: mx - 10, y2: my + 10, class: 'scissor', opacity: 1 }, edgesG);
    drawEdge(edgesG, C.x, C.y, W.x, W.y, { opacity: 0.55 });
    drawEdge(edgesG, P.x, P.y, M.x, M.y, { label: 'β = 0.71' });
    drawEdge(edgesG, M.x, M.y, W.x, W.y, { label: 'β = 0.54' });
    makeEl('text', { x: P.x, y: P.y - 38, class: 'node-tag', 'text-anchor': 'middle', text: 'do( P )', style: 'fill: oklch(0.62 0.07 45); opacity: 0.95;' }, extrasG);
    drawNode(nodesG, P.x, P.y, 'P', P.tag, { intervened: true });
    drawNode(nodesG, M.x, M.y, 'M', M.tag);
    drawNode(nodesG, W.x, W.y, 'W', W.tag);
    drawNode(nodesG, C.x, C.y, 'C', C.tag, { opacity: 0.55, labelOp: 0.55 });
  } else if (n == 3) {
    const F = { P: { x: 70, y: 180 }, M: { x: 150, y: 100 }, W: { x: 230, y: 180 } };
    const G = { P: { x: 370, y: 180 }, M: { x: 450, y: 100 }, W: { x: 530, y: 180 } };
    makeEl('text', { x: 150, y: 38, class: 'node-tag', 'text-anchor': 'middle', text: 'Factual  ·  P = 1' }, extrasG);
    makeEl('text', { x: 450, y: 38, class: 'node-tag', 'text-anchor': 'middle', text: 'Counterfactual  ·  P = 0' }, extrasG);
    makeEl('line', { x1: 300, y1: 60, x2: 300, y2: 290, stroke: '#111', 'stroke-width': 1, 'stroke-dasharray': '2 6', opacity: 0.3 }, extrasG);
    drawEdge(edgesG, F.P.x, F.P.y, F.M.x, F.M.y, {});
    drawEdge(edgesG, F.M.x, F.M.y, F.W.x, F.W.y, {});
    drawNode(nodesG, F.P.x, F.P.y, 'P', '', { r: 19, intervened: true });
    drawNode(nodesG, F.M.x, F.M.y, 'M', '', { r: 19 });
    drawNode(nodesG, F.W.x, F.W.y, 'W', '', { r: 19 });
    makeEl('text', { x: F.W.x, y: F.W.y + 35, class: 'node-tag', text: 'W = 0.71' }, extrasG);
    drawEdge(edgesG, G.P.x, G.P.y, G.M.x, G.M.y, { opacity: 0.55 });
    drawEdge(edgesG, G.M.x, G.M.y, G.W.x, G.W.y, { opacity: 0.55 });
    drawNode(nodesG, G.P.x, G.P.y, 'P′', '', { r: 19 });
    drawNode(nodesG, G.M.x, G.M.y, 'M′', '', { r: 19, opacity: 0.7, labelOp: 0.7 });
    drawNode(nodesG, G.W.x, G.W.y, 'W′', '', { r: 19, opacity: 0.7, labelOp: 0.7 });
    makeEl('text', { x: G.W.x, y: G.W.y + 35, class: 'node-tag', text: 'W′ = 0.43' }, extrasG);
    makeEl('path', { d: 'M 230 220 Q 300 250 370 220', fill: 'none', stroke: '#111', 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.45 }, extrasG);
    makeEl('text', { x: 300, y: 268, class: 'edge-label', 'text-anchor': 'middle', text: 'Δ W = +0.28 (regret)', style: 'fill: oklch(0.62 0.07 45); opacity: 0.95; font-weight: 500;' }, extrasG);
  }
}

export default function Ladder() {
  const [rung, setRung] = useState(1);
  const edgesRef = useRef(null);
  const nodesRef = useRef(null);
  const extrasRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    if (edgesRef.current && nodesRef.current && extrasRef.current) {
      renderRung(rung, edgesRef.current, nodesRef.current, extrasRef.current);
    }
  }, [rung]);

  useEffect(() => {
    if (!stageRef.current) return;
    let ran = false;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !ran) {
            ran = true;
            const seq = [2, 3, 1];
            let i = 0;
            const tick = () => {
              if (i >= seq.length) return;
              setRung(seq[i]);
              i++;
              if (i < seq.length) setTimeout(tick, 2600);
            };
            setTimeout(tick, 2000);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(stageRef.current);
    return () => obs.disconnect();
  }, []);

  const cfg = RUNGS[rung];

  return (
    <section className="ladder-section" id="ladder">
      <div className="ladder-header">
        <div>
          <div className="ladder-kicker reveal">Architecture · Pearl hierarchy</div>
          <h2 className="ladder-title reveal reveal-delay-1">
            Three rungs.<br />One causal substrate.
          </h2>
        </div>
        <div>
          <div className="ladder-sub reveal reveal-delay-2">
            Architected upon Judea Pearl's Hierarchy of Causality. We discard correlative guessing for structural understanding. Select a rung to inspect the operative graph and the question it answers.
          </div>
        </div>
      </div>

      <div className="ladder-stage-wrap">
        <div className="rung-list reveal">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className={`rung-btn${rung === n ? ' active' : ''}`}
              onClick={() => setRung(n)}
            >
              <span className="rung-num">{`0${n} →`}</span>
              <span className="rung-name">{RUNGS[n].name}</span>
              <span className="rung-verb">{RUNGS[n].verb}</span>
            </button>
          ))}
        </div>

        <div className="ladder-stage reveal reveal-delay-1" ref={stageRef}>
          <div className="stage-tab">
            <span>{cfg.tab}</span>
            <span>{cfg.state}</span>
          </div>
          <svg className="dag-svg" viewBox="0 0 600 340" aria-hidden="true">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
              </marker>
            </defs>
            <g ref={edgesRef} />
            <g ref={nodesRef} />
            <g ref={extrasRef} />
          </svg>
          <div className="stage-readout">
            <div className="readout-q">{cfg.q}</div>
            <div>
              <div className="readout-desc">{cfg.desc}</div>
              <div className="readout-formula">{cfg.formula}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
