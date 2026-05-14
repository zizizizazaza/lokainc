import ShaderBackground from './components/ShaderBackground';
import Header from './components/Header';
import ScrollNav from './components/ScrollNav';
import Hero from './components/Hero';
import Quote from './components/Quote';
import Gap from './components/Gap';
import Catalyst from './components/Catalyst';
import Ladder from './components/Ladder';
import Infrastructure from './components/Infrastructure';
import Verification from './components/Verification';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { useReveal } from './hooks/useReveal';

export default function App() {
  useReveal();
  return (
    <>
      <ShaderBackground />
      <Header />
      <ScrollNav />
      <main>
        <Hero />
        <Quote />
        <Gap />
        <Catalyst />
        <Ladder />
        <Infrastructure />
        <Verification />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
