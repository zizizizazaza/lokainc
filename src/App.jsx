import React, { useEffect, useState, useRef } from 'react';

// --- 物理引擎：实现微秒级丝滑的 Lerp (线性插值) 滚动与鼠标追踪 ---
const useCinematicPhysics = () => {
  const [metrics, setMetrics] = useState({ 
    scrollY: 0, 
    scrollProgress: 0,
    mouseX: 0, 
    mouseY: 0 
  });
  
  const requestRef = useRef();
  const target = useRef({ scrollY: 0, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    const handleScroll = () => { target.current.scrollY = window.scrollY; };
    const handleMouseMove = (e) => {
      target.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updatePhysics = () => {
      setMetrics(prev => {
        const newScrollY = prev.scrollY + (target.current.scrollY - prev.scrollY) * 0.08;
        const newMouseX = prev.mouseX + (target.current.mouseX - prev.mouseX) * 0.05;
        const newMouseY = prev.mouseY + (target.current.mouseY - prev.mouseY) * 0.05;
        
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? newScrollY / maxScroll : 0;

        return { scrollY: newScrollY, scrollProgress, mouseX: newMouseX, mouseY: newMouseY };
      });
      requestRef.current = requestAnimationFrame(updatePhysics);
    };
    requestRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return metrics;
};

// --- 白底与黑色深渊 (The White Background & Black Abyss Sphere) ---
const FluidWorldModel = ({ physics }) => {
  const { scrollY, scrollProgress, mouseX, mouseY } = physics;
  
  const scale = 1 + scrollProgress * 1.8; 
  const yOffset = scrollY * 0.45; 
  const rotateX = scrollProgress * 180 + mouseY * 15;
  const rotateY = scrollProgress * 90 + mouseX * 15;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden bg-[#f4f4f5]">
      
      {/* 流体扭曲的数学滤镜 */}
      <svg className="hidden">
        <defs>
          <filter id="fluid-refraction" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" result="noise">
              <animate attributeName="baseFrequency" values="0.012;0.018;0.012" dur="30s" repeatCount="indefinite" />
            </feTurbulence>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -12" in="noise" result="coloredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="coloredNoise" scale="80" xChannelSelector="R" yChannelSelector="G" result="displacement" />
            <feGaussianBlur in="displacement" stdDeviation="1.5" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* 极简的阴影晕染，模拟空间感 */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(circle at ${50 + mouseX * 20}% ${50 + mouseY * 20}%, rgba(0, 0, 0, 0.05) 0%, transparent 60%)`
        }}
      />

      {/* 核心深色流体球体 (The Black Abyss) */}
      <div 
        className="relative w-[450px] h-[450px] md:w-[600px] md:h-[600px] rounded-full will-change-transform"
        style={{
          transform: `translate3d(${mouseX * -35}px, ${yOffset}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          filter: 'url(#fluid-refraction)',
          boxShadow: `
            inset 0 0 100px rgba(0,0,0,1),
            inset 0 20px 80px rgba(255,255,255,0.1),
            0 20px 80px rgba(0,0,0,0.15)
          `,
          background: 'linear-gradient(135deg, rgba(10,15,25,1) 0%, rgba(0,0,0,1) 100%)',
          opacity: Math.max(0, 1 - Math.pow(scrollProgress, 5)) 
        }}
      >
        <div className="absolute inset-[8%] rounded-full border border-white/10 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full border-[0.5px] border-white/20" 
             style={{ transform: `rotateZ(${scrollY * 0.08}deg)` }} 
        />
      </div>

      {/* 胶片颗粒 */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
};

const RevealText = ({ children, progress, threshold = 0.5, className = "" }) => {
  const distance = Math.max(0, progress - threshold) * 15;
  const opacity = Math.min(1, distance * 2);
  const translateY = Math.max(0, 40 - distance * 50);

  return (
    <div 
      className={`will-change-transform ${className}`}
      style={{ 
        opacity, 
        transform: `translate3d(0, ${translateY}px, 0)`,
        transition: 'opacity 0.1s linear, transform 0.1s linear'
      }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const physics = useCinematicPhysics();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&family=JetBrains+Mono:wght@100;300;400&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
      
      body {
        background-color: #f4f4f5; /* 稳定的亮色底 */
        color: #000000; 
        font-family: 'Inter', sans-serif;
        overflow-x: hidden;
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      .font-serif { font-family: 'Playfair Display', serif; }

      ::-webkit-scrollbar { width: 0px; background: transparent; }

      .track-tightest { letter-spacing: -0.04em; }
      .track-widest-plus { letter-spacing: 0.3em; }
      .text-balance { text-wrap: balance; }

      /* 魔法发生的地方：利用反色混合实现截图里那完美的黑白穿透感 */
      .blend-layer {
        color: #d1d5db; /* 这种浅灰色在白底上会反相成深灰黑，在黑球上会反相成亮白 */
        mix-blend-mode: difference;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="relative min-h-[900vh] selection:bg-black selection:text-white">
      
      {/* 底层：白底 + 黑球 */}
      <FluidWorldModel physics={physics} />

      {/* 表层：所有的文字被包裹在 blend-layer 中，自动实现反色质感 */}
      <div className="relative z-10 w-full h-full blend-layer pointer-events-none">
        
        {/* FIXED HUD */}
        <nav className="fixed top-0 w-full z-50 px-8 py-8 flex justify-between items-start pointer-events-none">
          <div className="font-mono text-[10px] uppercase track-widest-plus flex flex-col gap-1">
            <span className="font-bold">Loka Labs</span>
            <span>World Model</span>
          </div>
          <div className="font-mono text-[10px] uppercase track-widest-plus text-right flex flex-col gap-1">
            <span>Sys.Status: Active</span>
            <span>Depth: {(physics.scrollProgress * 100).toFixed(1)}%</span>
          </div>
        </nav>

        {/* 史诗级叙事长卷 (使用最新完善的 PDF 文案内容) */}
        <main className="w-full">
          
          {/* SEQ 1: 首页场景 - 还原极具压迫感的大标题，保证字体与黑球完美重叠交融 */}
          <section className="h-[100vh] flex flex-col justify-center items-center px-6 relative">
            <div 
              className="text-center will-change-transform flex flex-col items-center"
              style={{ 
                transform: `translate3d(0, ${-physics.scrollY * 0.5}px, 0)`,
                opacity: Math.max(0, 1 - physics.scrollProgress * 8)
              }}
            >
              <h1 className="text-6xl sm:text-8xl md:text-[8.5rem] font-light track-tightest leading-[1.0] mb-8 text-balance">
                The Economic<br />World Model.
              </h1>
              <p className="font-mono text-[10px] uppercase track-widest-plus max-w-lg leading-relaxed text-balance opacity-80">
                When the cost of simulation approaches zero,<br/>the cost of not simulating becomes indefensible.
              </p>
            </div>
            
            <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-50">
               <div className="w-[1px] h-16 bg-gradient-to-b from-current to-transparent" />
            </div>
          </section>

          {/* SEQ 1.5: 核心哲学 - Judea Pearl */}
          <section className="h-[100vh] flex items-center justify-center px-6">
            <RevealText progress={physics.scrollProgress} threshold={0.08} className="text-center max-w-4xl mx-auto">
               <h2 className="text-2xl md:text-4xl font-serif italic font-light leading-relaxed mb-8 text-balance">
                 "The three rungs of the Ladder of Causation: <br className="hidden md:block"/>
                 <span className="font-medium opacity-100">Association, Intervention, Counterfactual.</span>"
               </h2>
               <p className="font-mono text-[10px] uppercase track-widest-plus opacity-70">
                 — Judea Pearl, The Book of Why
               </p>
            </RevealText>
          </section>

          {/* SEQ 2: 结构性断层 */}
          <section className="h-[120vh] flex items-center px-6 lg:px-24">
            <RevealText progress={physics.scrollProgress} threshold={0.20} className="max-w-3xl">
              <h2 className="font-mono text-[10px] uppercase track-widest-plus mb-10 flex items-center gap-4 opacity-70">
                <span className="w-6 h-[1px] bg-current" /> Structural Gap
              </h2>
              <h3 className="text-4xl md:text-6xl font-light leading-tight track-tightest mb-8">
                Navigating a living system<br />with a dead map.
              </h3>
              <div className="space-y-6 text-lg font-light leading-relaxed max-w-xl opacity-80">
                <p>Policies are interventions. Crises are counterfactual failures. Yet the tools we use to make decisions operate on mere statistical association.</p>
                <p>Legacy models treat humanity as a predictable mass. But economic systems are no longer stationary. AI is rewriting reality faster than any historical model can follow.</p>
              </div>
            </RevealText>
          </section>

          {/* SEQ 3: 催化剂 - Why Now */}
          <section className="h-[120vh] flex items-center justify-end px-6 lg:px-24">
            <RevealText progress={physics.scrollProgress} threshold={0.35} className="max-w-2xl text-right">
               <h2 className="font-mono text-[10px] uppercase track-widest-plus mb-10 flex items-center justify-end gap-4 opacity-70">
                Catalyst <span className="w-6 h-[1px] bg-current" />
              </h2>
              <h3 className="text-4xl md:text-6xl font-light leading-tight track-tightest mb-12">
                History has failed<br />as a predictive tool.
              </h3>
              
              <div className="flex flex-col gap-8 text-left border-l border-current pl-8 ml-auto max-w-lg opacity-90">
                <div>
                  <div className="text-2xl font-medium mb-2">Cost Collapse</div>
                  <div className="text-sm font-light leading-relaxed opacity-80">Generative agent simulation cost dropped 280x in two years. Two curves are crossing: simulation cost falls exponentially, real-world trial cost rises.</div>
                </div>
                <div>
                  <div className="text-2xl font-medium mb-2">Novel Worlds</div>
                  <div className="text-sm font-light leading-relaxed opacity-80">Charter cities and AI jurisdictions are being built from zero. Using past data to predict these environments isn't just inaccurate; it's reckless.</div>
                </div>
              </div>
            </RevealText>
          </section>

          {/* SEQ 4: 技术架构 - 映射因果阶梯 */}
          <section className="h-[150vh] flex items-center px-6 lg:px-24">
            <RevealText progress={physics.scrollProgress} threshold={0.50} className="max-w-4xl">
              <h3 className="text-4xl md:text-6xl font-light leading-tight track-tightest mb-4">
                Others stop at Layer 1.<br />Loka Labs has all three.
              </h3>
              <p className="font-mono text-[10px] uppercase track-widest-plus mb-16 opacity-70">Deterministic guardrails for a stochastic world.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="border-t border-current pt-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-mono text-[9px] opacity-70">LAYER 1</div>
                    <div className="font-mono text-[9px] border border-current px-2 py-1">[ASSOCIATION]</div>
                  </div>
                  <div className="text-xl font-medium mb-3">Behavioral<br/>Simulation</div>
                  <div className="text-sm font-light leading-relaxed opacity-80">Models heterogeneous actors. Outputs state space evolution: how environments change from t to t+1.</div>
                </div>
                
                <div className="border-t border-current pt-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-mono text-[9px] opacity-70">LAYER 2</div>
                    <div className="font-mono text-[9px] border border-current px-2 py-1">[INTERVENTION]</div>
                  </div>
                  <div className="text-xl font-medium mb-3">Economic<br/>Engine</div>
                  <div className="text-sm font-light leading-relaxed opacity-80">The physics of an economy. Forces changes to propagate through the agent network, revealing second-order effects.</div>
                </div>

                <div className="border-t border-current pt-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-mono text-[9px] opacity-70">LAYER 3</div>
                    <div className="font-mono text-[9px] border border-current px-2 py-1">[COUNTERFACTUAL]</div>
                  </div>
                  <div className="text-xl font-medium mb-3">Formal<br/>Verification</div>
                  <div className="text-sm font-light leading-relaxed opacity-80">Mathematically proves properties hold. Results are not just probable. They are provable.</div>
                </div>
              </div>
              <div className="mt-12 font-serif italic text-xl opacity-70">
                "Agents simulate decisions. Economics enforces the rules. Math proves the results."
              </div>
            </RevealText>
          </section>

          {/* SEQ 5: 公开验证 - Ground Truth */}
          <section className="h-[120vh] flex items-center justify-end px-6 lg:px-24">
             <RevealText progress={physics.scrollProgress} threshold={0.68} className="max-w-2xl text-right">
               <h3 className="text-4xl md:text-5xl font-light leading-tight track-tightest mb-12">
                The error is public, timestamped,<br/>and verifiable by anyone.
              </h3>
              
              <div className="flex flex-col gap-6 text-left border-l border-current pl-8 ml-auto max-w-lg opacity-90">
                <div>
                  <div className="font-mono text-[10px] uppercase track-widest-plus mb-2 opacity-70">Ground Truth Calibration</div>
                  <div className="text-sm font-light opacity-80">We do not depend on synthetic data. Anchored on public macroeconomic data and decades of controlled behavioral economics research (Kahneman, Thaler).</div>
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[10px] uppercase track-widest-plus mb-2 opacity-70">Live Public Verification</div>
                  <div className="text-sm font-light opacity-80">Taylor Swift Eras Tour & 2026 FIFA World Cup. Pre-event economic impact prediction vs real verified data. Not a client testimonial, an accuracy test anyone can check.</div>
                </div>
              </div>
            </RevealText>
          </section>

          {/* SEQ 6: 降维打击与 CTA */}
          <section className="h-[100vh] flex flex-col items-center justify-center px-6 text-center">
            <RevealText progress={physics.scrollProgress} threshold={0.82} className="max-w-4xl flex flex-col items-center">
               
               {/* Academic Backing */}
               <div className="mb-16 flex flex-col items-center gap-2">
                  <span className="px-3 py-1 border border-current font-mono text-[9px] uppercase tracking-widest opacity-70">Built on</span>
                  <span className="font-serif italic text-lg opacity-90">Formal Verification (2007 Turing Award) <br/> & Distributed AI at Scale (NSDI/OSDI)</span>
               </div>

               <h3 className="text-5xl md:text-7xl font-light leading-[1.1] track-tightest mb-8">
                Simulation is not an improvement.<br />It is a prerequisite.
              </h3>
              <p className="font-mono text-[10px] uppercase track-widest-plus mb-16 opacity-70">
                Data sovereignty by design. Runs entirely on client infrastructure.
              </p>
              
              <button className="pointer-events-auto group relative px-10 py-5 overflow-hidden border border-current transition-colors duration-500">
                <span className="relative z-10 font-mono text-[10px] uppercase track-widest-plus transition-colors duration-500">
                  Initiate Sovereign Node
                </span>
              </button>
            </RevealText>
          </section>

        </main>
      </div>
    </div>
  );
}