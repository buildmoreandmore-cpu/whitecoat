
import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import WhatsInside from './components/WhatsInside';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import WhoItsFor from './components/WhoItsFor';
import SocialProof from './components/SocialProof';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-sans antialiased text-slate-800">
      <Navigation />
      <main>
        <Hero />
        <ProblemSection />
        <WhatsInside />
        <HowItWorks />
        <Pricing />
        <WhoItsFor />
        <SocialProof />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
      
      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-secondary transition-colors z-50 focus:outline-none"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
    </div>
  );
};

export default App;
