
import React from 'react';
import BriefExcerpt from './BriefExcerpt';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-7 xl:col-span-6 mb-12 lg:mb-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-secondary text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Built for Physician-Founded DTC
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-primary leading-tight mb-6">
              The Marketing Playbook for Physician-Founded Brands
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
              Your medical credentials are your competitive advantage. The WhiteCoat Brief™ turns them into campaigns that convert — with 10 ad concepts, hook variants, and a 4-week testing roadmap built specifically for your brand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-accent hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"
              >
                Get Your WhiteCoat Brief — $2,500
              </a>
              <a
                href="#whats-inside"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 text-base font-bold rounded-lg text-primary bg-white hover:bg-slate-50 transition-all"
              >
                See What's Inside ↓
              </a>
            </div>
            <p className="mt-8 text-sm text-muted font-medium italic">
              "Built for doctors who sell products, not appointments."
            </p>
          </div>
          
          <div className="lg:col-span-5 xl:col-span-6 relative">
            <div className="relative z-10 space-y-4">
              <div className="transform translate-x-4 lg:translate-x-8">
                <BriefExcerpt header="01 — OPPORTUNITY LANDSCAPE">
{`⊘ SATURATED ANGLES           ◎ OPPORTUNITY GAPS
— "Dermatologist recommended" — "Developed BY a surgeon"
— Clinical, cold aesthetic    — Warm authority positioning
— Fear-based messaging        — Hope-forward storytelling
— Generic "clean beauty"      — Medical-grade credentialing`}
                </BriefExcerpt>
              </div>
              <div className="transform -translate-x-4 lg:-translate-x-8">
                <BriefExcerpt header="02 — STRATEGIC DIRECTION">
{`Core Positioning
> "The only skincare line developed by a surgeon who's treated 10,000 patients."

01  CREDENTIAL AS MOAT
    Your MD isn't a trust badge. It's the product story.

02  AUTHORITY WITHOUT ARROGANCE  
    Warm expertise beats cold clinical.`}
                </BriefExcerpt>
              </div>
              <div className="transform translate-x-2 lg:translate-x-4 scale-95 opacity-80">
                <BriefExcerpt header="03 — CREATIVE CONCEPTS">
{`HOOK VARIANTS
├── VARIANT A - "The product I give every patient"
├── VARIANT B - "Why would a surgeon create this?"
└── VARIANT C - "I've seen 10,000 patients..."`}
                </BriefExcerpt>
              </div>
            </div>
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
