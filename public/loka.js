/* ============================================================
   Loka Labs — Standalone homepage scripts
   ============================================================ */

/* ---------- 1. Reveal-on-scroll ---------- */
(function reveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal, .uc-rise, .team-fly, .fly-in').forEach((el) => obs.observe(el));
})();

/* ---------- 2. Scroll-nav — removed ---------- */

/* ---------- 2b. Header backdrop on scroll ---------- */
(function headerScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 80) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- 3. Contact modal ---------- */
(function contactModal() {
  const overlay = document.getElementById('contact-overlay');
  const openBtn = document.getElementById('open-contact');
  const closeBtn = document.getElementById('contact-close');
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  const successEmail = document.getElementById('contact-success-email');
  const errBox = document.getElementById('contact-error');
  const submit = document.getElementById('contact-submit');
  const submitLabel = document.getElementById('contact-submit-label');
  const WEB3FORMS_ACCESS_KEY = '3181ff54-df0a-4280-9f85-33c11d4b064e';

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    form.hidden = false;
    success.hidden = true;
    errBox.hidden = true;
    form.reset();
    submitLabel.textContent = 'Submit inquiry';
    submit.disabled = false;
  }
  openBtn.addEventListener('click', open);
  const openBtn2 = document.getElementById('open-contact-2');
  if (openBtn2) openBtn2.addEventListener('click', open);
  ['open-contact-hero', 'open-contact-cta'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', open);
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    submitLabel.textContent = 'Sending…';
    errBox.hidden = true;
    const fd = new FormData(form);
    const topic = fd.get('topic') || 'General inquiry';
    const org = fd.get('organization') || '';
    const messageBody = `Topic: ${topic}\nOrganization: ${org}\n\n${fd.get('message') || ''}`;
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `[${topic}] ${fd.get('name') || fd.get('email')} — loka.inc`,
      from_name: fd.get('name') || 'loka.inc visitor',
      email: fd.get('email'),
      message: messageBody,
    };
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        successEmail.textContent = payload.email;
        form.hidden = true;
        success.hidden = false;
      } else {
        errBox.textContent = data.message || 'Something went wrong.';
        errBox.hidden = false;
        submit.disabled = false;
        submitLabel.textContent = 'Submit inquiry';
      }
    } catch (err) {
      errBox.textContent = err.message || 'Network error.';
      errBox.hidden = false;
      submit.disabled = false;
      submitLabel.textContent = 'Submit inquiry';
    }
  });
})();

/* ---------- 4. Shader background (WebGL) ---------- */
(function shaderBg() {
  const canvas = document.getElementById('glcanvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const vs = `attribute vec4 aVertexPosition; void main() { gl_Position = aVertexPosition; }`;
  const fs = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    float fbm(vec2 x) {
      float v = 0.0; float a = 0.5; vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 5; ++i) { v += a * snoise(x); x = rot * x * 2.0 + shift; a *= 0.5; }
      return v;
    }
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;
      vec2 q = vec2(0.0);
      q.x = fbm(st + 0.00 * u_time);
      q.y = fbm(st + vec2(1.0));
      vec2 r = vec2(0.0);
      r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
      r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);
      float f = fbm(st + r);
      vec3 color1 = vec3(0.29, 0.35, 0.42);
      vec3 color2 = vec3(0.54, 0.48, 0.42);
      vec3 color3 = vec3(0.80, 0.80, 0.79);
      vec3 color4 = vec3(0.10, 0.11, 0.12);
      vec3 color = mix(color3, color1, clamp((f*f) * 4.0, 0.0, 1.0));
      color = mix(color, color2, clamp(length(q), 0.0, 1.0));
      color = mix(color, color4, clamp(length(r.x), 0.0, 1.0));
      float highlight = smoothstep(0.4, 0.6, f);
      color += vec3(0.2) * highlight;
      float dist = distance(st, vec2(st.x, st.x * 0.8 + 0.1));
      float mask = smoothstep(0.8, 0.2, dist + (fbm(st * 3.0) * 0.3));
      mask *= smoothstep(0.0, 0.2, st.y) * smoothstep(1.0, 0.8, st.y);
      vec3 baseBg = vec3(0.808, 0.800, 0.788);
      vec3 finalColor = mix(baseBg, color, mask * 0.85);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  const aLoc = gl.getAttribLocation(program, 'aVertexPosition');
  const resLoc = gl.getUniformLocation(program, 'u_resolution');
  const timeLoc = gl.getUniformLocation(program, 'u_time');
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);
  const tick = (now) => {
    now *= 0.001;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aLoc);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(timeLoc, now * 0.2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

/* ---------- 5. Ladder DAG ---------- */
(function ladderDAG() {
  const edgesG = document.getElementById('dag-edges');
  const nodesG = document.getElementById('dag-nodes');
  const extrasG = document.getElementById('dag-extras');
  const tabLabel = document.getElementById('stage-tab-label');
  const tabState = document.getElementById('stage-tab-state');
  const roQ = document.getElementById('readout-q');
  const roDesc = document.getElementById('readout-desc');
  const roFormula = document.getElementById('readout-formula');
  const btns = document.querySelectorAll('.rung-btn');
  if (!edgesG) return;

  const NS = 'http://www.w3.org/2000/svg';
  const NODES = { P: { tag: 'Policy', x: 165, y: 190 }, M: { tag: 'Market', x: 300, y: 100 }, W: { tag: 'Welfare', x: 435, y: 190 }, C: { tag: 'Confound', x: 300, y: 270 } };
  const RUNGS = {
    1: { tab: 'Rung 01 · Observational', state: 'P(Y | X)', q: '"How are policy, market, and welfare correlated?"', desc: 'Joint distributions over observed variables. Patterns, not mechanisms.', formula: 'P(Y | X = x)' },
    2: { tab: 'Rung 02 · Interventional', state: 'P(Y | do(X))', q: '"If I execute policy do(P), how does the system react?"', desc: 'Sever P from its causes, fix its value, and propagate the consequence through the structural model.', formula: 'P(Y | do(X = x))' },
    3: { tab: 'Rung 03 · Counterfactual', state: 'P(Yₓ | X = x′, Y = y′)', q: '"What would welfare have been, had we chosen otherwise?"', desc: 'A factual world and a counterfactual twin run in parallel. The system imagines alternate histories and quantifies regret.', formula: 'P(Y_{P=1} | P=0, observed)' },
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) { if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    parent.appendChild(n); return n;
  }
  function node(parent, x, y, label, tag, opts = {}) {
    const cls = 'node-circle' + (opts.intervened ? ' intervened' : '');
    el('circle', { cx: x, cy: y, r: opts.r || 22, class: cls, opacity: opts.opacity || 1 }, parent);
    el('text', { x, y, class: 'node-label' + (opts.intervened ? ' intervened' : ''), opacity: opts.labelOp || 1, text: label }, parent);
    if (tag) el('text', { x, y: y + (opts.r || 22) + 16, class: 'node-tag', text: tag }, parent);
  }
  function edge(parent, ax, ay, bx, by, opts = {}) {
    const e = el('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'edge' }, parent);
    if (opts.dashed) e.setAttribute('stroke-dasharray', '4 5'); else e.setAttribute('marker-end', 'url(#arrow)');
    if (opts.opacity) e.setAttribute('opacity', opts.opacity);
    if (opts.label) el('text', { x: (ax + bx) / 2, y: (ay + by) / 2 - 8, class: 'edge-label', text: opts.label }, parent);
  }

  function render(n) {
    edgesG.innerHTML = ''; nodesG.innerHTML = ''; extrasG.innerHTML = '';
    const cfg = RUNGS[n];
    tabLabel.textContent = cfg.tab;
    tabState.textContent = cfg.state;
    roQ.textContent = cfg.q;
    roDesc.textContent = cfg.desc;
    roFormula.textContent = cfg.formula;

    if (n === 1) {
      const { P, M, W, C } = NODES;
      edge(edgesG, P.x, P.y, M.x, M.y, { dashed: true, label: 'ρ ≈ 0.62' });
      edge(edgesG, M.x, M.y, W.x, W.y, { dashed: true, label: 'ρ ≈ 0.48' });
      edge(edgesG, C.x, C.y, P.x, P.y, { dashed: true, opacity: 0.7 });
      edge(edgesG, C.x, C.y, W.x, W.y, { dashed: true, opacity: 0.7 });
      node(nodesG, P.x, P.y, 'P', P.tag);
      node(nodesG, M.x, M.y, 'M', M.tag);
      node(nodesG, W.x, W.y, 'W', W.tag);
      node(nodesG, C.x, C.y, 'C', C.tag);
    } else if (n === 2) {
      const { P, M, W, C } = NODES;
      edge(edgesG, C.x, C.y, P.x, P.y, { dashed: true, opacity: 0.18 });
      const mx = (P.x + C.x) / 2, my = (P.y + C.y) / 2;
      el('line', { x1: mx - 10, y1: my - 10, x2: mx + 10, y2: my + 10, class: 'scissor', opacity: 1 }, edgesG);
      el('line', { x1: mx + 10, y1: my - 10, x2: mx - 10, y2: my + 10, class: 'scissor', opacity: 1 }, edgesG);
      edge(edgesG, C.x, C.y, W.x, W.y, { opacity: 0.55 });
      edge(edgesG, P.x, P.y, M.x, M.y, { label: 'β = 0.71' });
      edge(edgesG, M.x, M.y, W.x, W.y, { label: 'β = 0.54' });
      el('text', { x: P.x, y: P.y - 38, class: 'node-tag', 'text-anchor': 'middle', text: 'do( P )', style: 'fill: oklch(0.62 0.07 45); opacity: 0.95;' }, extrasG);
      node(nodesG, P.x, P.y, 'P', P.tag, { intervened: true });
      node(nodesG, M.x, M.y, 'M', M.tag);
      node(nodesG, W.x, W.y, 'W', W.tag);
      node(nodesG, C.x, C.y, 'C', C.tag, { opacity: 0.55, labelOp: 0.55 });
    } else if (n === 3) {
      const F = { P: { x: 70, y: 180 }, M: { x: 150, y: 100 }, W: { x: 230, y: 180 } };
      const G = { P: { x: 370, y: 180 }, M: { x: 450, y: 100 }, W: { x: 530, y: 180 } };
      el('text', { x: 150, y: 38, class: 'node-tag', 'text-anchor': 'middle', text: 'Factual  ·  P = 1' }, extrasG);
      el('text', { x: 450, y: 38, class: 'node-tag', 'text-anchor': 'middle', text: 'Counterfactual  ·  P = 0' }, extrasG);
      el('line', { x1: 300, y1: 60, x2: 300, y2: 290, stroke: '#111', 'stroke-width': 1, 'stroke-dasharray': '2 6', opacity: 0.3 }, extrasG);
      edge(edgesG, F.P.x, F.P.y, F.M.x, F.M.y, {});
      edge(edgesG, F.M.x, F.M.y, F.W.x, F.W.y, {});
      node(nodesG, F.P.x, F.P.y, 'P', '', { r: 19, intervened: true });
      node(nodesG, F.M.x, F.M.y, 'M', '', { r: 19 });
      node(nodesG, F.W.x, F.W.y, 'W', '', { r: 19 });
      el('text', { x: F.W.x, y: F.W.y + 35, class: 'node-tag', text: 'W = 0.71' }, extrasG);
      edge(edgesG, G.P.x, G.P.y, G.M.x, G.M.y, { opacity: 0.55 });
      edge(edgesG, G.M.x, G.M.y, G.W.x, G.W.y, { opacity: 0.55 });
      node(nodesG, G.P.x, G.P.y, 'P′', '', { r: 19 });
      node(nodesG, G.M.x, G.M.y, 'M′', '', { r: 19, opacity: 0.7, labelOp: 0.7 });
      node(nodesG, G.W.x, G.W.y, 'W′', '', { r: 19, opacity: 0.7, labelOp: 0.7 });
      el('text', { x: G.W.x, y: G.W.y + 35, class: 'node-tag', text: "W′ = 0.43" }, extrasG);
      el('path', { d: 'M 230 220 Q 300 250 370 220', fill: 'none', stroke: '#111', 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.45 }, extrasG);
      el('text', { x: 300, y: 268, class: 'edge-label', 'text-anchor': 'middle', text: 'Δ W = +0.28 (regret)', style: 'fill: oklch(0.62 0.07 45); opacity: 0.95; font-weight: 500;' }, extrasG);
    }
  }

  btns.forEach((b) => {
    b.addEventListener('click', () => {
      const n = parseInt(b.dataset.rung, 10);
      btns.forEach((x) => x.classList.toggle('active', x === b));
      render(n);
    });
  });

  render(1);

  // Auto-advance on first scroll into view
  const stage = document.querySelector('.ladder-stage');
  let ran = false;
  const obs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !ran) {
        ran = true;
        const seq = [2, 3, 1];
        let i = 0;
        const tick = () => {
          if (i >= seq.length) return;
          const r = seq[i];
          btns.forEach((x) => x.classList.toggle('active', parseInt(x.dataset.rung, 10) === r));
          render(r);
          i++;
          if (i < seq.length) setTimeout(tick, 2600);
        };
        setTimeout(tick, 2000);
      }
    });
  }, { threshold: 0.4 });
  if (stage) obs.observe(stage);
})();

/* ---------- 6. Infrastructure: 3 layer canvases ---------- */
(function infraLayers() {
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  function fit(cv) {
    const r = cv.getBoundingClientRect();
    const d = dpr();
    cv.width = r.width * d; cv.height = r.height * d;
    cv.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
  }
  function setStatus(key, msg) {
    const el = document.querySelector(`[data-layer-state="${key}"]`);
    if (el) el.textContent = msg;
  }

  // L1 — agent swarm
  (function l1() {
    const cv = document.querySelector('[data-layer="l1"]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let agents = [], count = 0;
    function init() {
      fit(cv);
      const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
      agents = [];
      for (let i = 0; i < 120; i++) {
        agents.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, phase: Math.random()*Math.PI*2, type: Math.random()<0.15?1:0 });
      }
    }
    init();
    window.addEventListener('resize', init);
    let t = 0;
    function tick() {
      const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
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
        ctx.beginPath(); ctx.arc(a.x, a.y, a.type ? 1.8 : 1.1, 0, Math.PI * 2); ctx.fill();
      });
      count = Math.min(count + 6, 12480);
      setStatus('l1', `N = ${count.toLocaleString()}`);
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // L2 — network pulse
  (function l2() {
    const cv = document.querySelector('[data-layer="l2"]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let nodes = [], edges = [], pulseSrc = 0, pulseStart = 0, deltas = 0;
    function init() {
      fit(cv);
      const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
      nodes = [];
      for (let i = 0; i < 16; i++) nodes.push({ x: 20 + Math.random() * (w - 40), y: 20 + Math.random() * (h - 40), activated: 0 });
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        const others = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
          .filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
        const k = 2 + Math.floor(Math.random() * 2);
        for (let m = 0; m < k; m++) {
          const j = others[m].j;
          if (!edges.find((e) => (e.a === i && e.b === j) || (e.a === j && e.b === i))) edges.push({ a: i, b: j });
        }
      }
    }
    init();
    window.addEventListener('resize', init);
    function startPulse() {
      pulseSrc = Math.floor(Math.random() * nodes.length);
      pulseStart = performance.now();
      nodes.forEach((n) => (n.activated = 0));
      nodes[pulseSrc].activated = 1;
    }
    startPulse();
    setInterval(startPulse, 4500);
    function tick() {
      const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
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
      setStatus('l2', `Δ = ${deltas}`);
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // L3 — proof tree
  (function l3() {
    const cv = document.querySelector('[data-layer="l3"]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let tree = [], frame = 0, paths = 0;
    function build() {
      fit(cv);
      const h = cv.getBoundingClientRect().height, w = cv.getBoundingClientRect().width;
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
      recurse(w / 2, 25, w * 0.22, 0, -1);
    }
    build();
    window.addEventListener('resize', () => { build(); frame = 0; });
    function tick() {
      const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      frame++;
      if (frame > 600) { build(); frame = 0; paths = 0; }
      tree.forEach((n) => {
        if (frame < n.born) return;
        if (n.parent >= 0) {
          const p = tree[n.parent];
          ctx.strokeStyle = n.verdict === 'fail' ? 'rgba(180,60,40,0.7)' : n.verdict === 'pass' ? 'rgba(17,17,17,0.85)' : 'rgba(17,17,17,0.35)';
          ctx.lineWidth = n.verdict === 'pass' ? 1.4 : 0.8;
          if (n.verdict === 'fail') ctx.setLineDash([2, 3]); else ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          ctx.setLineDash([]);
        }
        let fill = n.verdict === 'pass' ? 'rgba(17,17,17,0.9)' : n.verdict === 'fail' ? 'rgba(180,60,40,0.85)' : 'rgba(17,17,17,0.4)';
        ctx.fillStyle = fill;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.depth === 0 ? 3.5 : 2, 0, Math.PI * 2); ctx.fill();
      });
      paths = Math.min(paths + 7, 1048576);
      setStatus('l3', `paths = ${paths.toLocaleString()}`);
      requestAnimationFrame(tick);
    }
    tick();
  })();
})();

/* ---------- 7. Verification chart ---------- */
(function verifyChart() {
  const cv = document.getElementById('verify-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const r = cv.getBoundingClientRect();
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const N = 60, predicted = [], actual = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const base = 0.25 + Math.sin(t * Math.PI * 1.5) * 0.18 + Math.sin(t * Math.PI * 5) * 0.05 + t * 0.32;
    predicted.push(base);
    const noise = (Math.sin(t * 37 + 1) + Math.cos(t * 23)) * 0.012;
    actual.push(base + noise);
  }
  let progress = 0, started = false;
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) started = true; }), { threshold: 0.25 });
  obs.observe(cv);
  function draw() {
    const w = cv.getBoundingClientRect().width, h = cv.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);
    const padL = 24, padR = 20, padT = 24, padB = 30;
    const cw = w - padL - padR, ch = h - padT - padB;
    const eventX = padL + cw * 0.5;
    ctx.strokeStyle = 'rgba(17,17,17,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT + ch); ctx.lineTo(padL + cw, padT + ch); ctx.stroke();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(17,17,17,0.45)';
    ctx.beginPath(); ctx.moveTo(eventX, padT); ctx.lineTo(eventX, padT + ch); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(17,17,17,0.7)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('Event', eventX + 8, padT + 11);
    const animLen = Math.floor(N * progress);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(17,17,17,0.55)'; ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = 0; i <= animLen; i++) {
      const x = padL + (i / (N - 1)) * cw, y = padT + ch * (1 - predicted[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(17,17,17,0.08)';
    ctx.beginPath();
    for (let i = 0; i <= animLen; i++) {
      const x = padL + (i / (N - 1)) * cw, y = padT + ch * (1 - (predicted[i] + 0.025));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = animLen; i >= 0; i--) {
      const x = padL + (i / (N - 1)) * cw, y = padT + ch * (1 - (predicted[i] - 0.025));
      ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(17,17,17,0.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= animLen; i++) {
      const x = padL + (i / (N - 1)) * cw, y = padT + ch * (1 - actual[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i <= animLen; i += 6) {
      const x = padL + (i / (N - 1)) * cw, y = padT + ch * (1 - actual[i]);
      ctx.fillStyle = 'rgba(17,17,17,0.6)';
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  function loop() {
    if (started && progress < 1) progress = Math.min(1, progress + 0.011);
    draw();
    requestAnimationFrame(loop);
  }
  loop();
})();
