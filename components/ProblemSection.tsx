
import React from 'react';

const ProblemSection: React.FC = () => {
  const problems = [
    {
      title: "They Bury Your Credentials",
      description: "Generic agencies treat your MD as a footnote. But your medical expertise IS your competitive advantage — it should be the headline.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      )
    },
    {
      title: "They Risk Your License",
      description: "One bad claim can trigger FDA, FTC, or medical board scrutiny. Most agencies don't know the difference between 'clinically proven' and 'clinically tested'.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
      )
    },
    {
      title: "They Don't Understand DTC",
      description: "Medical practice agencies know patient acquisition. E-commerce agencies know Shopify. You need both — and nobody's built for that.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    }
  ];

  return (
    <section className="py-24 bg-surface" id="problem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">THE PROBLEM</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary mb-6">
            Your Marketing Agency Doesn't Get It
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Generic agencies lack the clinical literacy required to scale a physician-founded brand without risking your credentials or your revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">{problem.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-xl font-semibold text-primary">
            "You need marketing intelligence built for physician-founded brands. That's the WhiteCoat Brief."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
