
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      day: "Day 1",
      title: "Discovery Call",
      description: "60-minute deep dive into your brand, products, audience, and goals. We learn what makes you different."
    },
    {
      day: "Days 2-3",
      title: "Competitive Analysis",
      description: "We analyze your market, identify saturated angles, and map opportunity gaps only you can exploit."
    },
    {
      day: "Days 4-6",
      title: "Brief Development",
      description: "We build your complete WhiteCoat Brief — positioning, 10 ad concepts, testing roadmap, deployment checklist."
    },
    {
      day: "Day 7",
      title: "Strategy Review",
      description: "60-minute walkthrough of your brief. We explain every recommendation and answer every question."
    }
  ];

  return (
    <section className="py-24 bg-primary text-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-emerald-400 font-bold tracking-widest text-sm uppercase mb-4 block">HOW IT WORKS</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold mb-6">
            From Kickoff to Playbook in 7 Days
          </h2>
        </div>

        <div className="relative">
          {/* Horizontal line for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-24 h-24 bg-slate-800 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10 transition-transform hover:scale-110">
                  <span className="font-mono text-emerald-400 font-bold text-lg">{step.day}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-slate-800/50 rounded-2xl p-8 border border-slate-700 max-w-4xl mx-auto">
          <h4 className="text-lg font-bold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            What you get:
          </h4>
          <ul className="grid sm:grid-cols-2 gap-4 text-slate-300">
            <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> Complete WhiteCoat Brief™ (PDF + Notion)</li>
            <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> 10 ad concepts with 40+ hook variants</li>
            <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> 4-week testing roadmap</li>
            <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> Deployment checklist</li>
            <li className="flex items-start"><span className="text-emerald-400 mr-2">•</span> 2 hours of strategy calls</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
