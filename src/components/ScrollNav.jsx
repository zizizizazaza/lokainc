import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Thesis' },
  { id: 'quote', label: 'Quote' },
  { id: 'gap', label: 'The gap' },
  { id: 'catalyst', label: 'Catalyst' },
  { id: 'ladder', label: 'Ladder' },
  { id: 'infra', label: 'Stack' },
  { id: 'verify', label: 'Verify' },
  { id: 'cta', label: 'Begin' },
];

export default function ScrollNav() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0, rootMargin: '-40% 0px -55% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const hidden = active === 'hero';

  return (
    <nav className={`scroll-nav${hidden ? ' hidden' : ''}`} aria-label="Section progress">
      {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          data-target={s.id}
          className={active === s.id ? 'active' : ''}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
