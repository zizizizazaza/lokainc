export default function Header() {
  return (
    <header>
      <a href="#hero" className="brand">
        <span className="brand-mark" />
        <span className="brand-name">Loka Labs</span>
      </a>
      <a href="https://lokaworld.vercel.app/" target="_blank" rel="noreferrer" className="nav-cta">
        <span>Start simulating</span>
        <span className="nav-cta-arrow">→</span>
      </a>
    </header>
  );
}
