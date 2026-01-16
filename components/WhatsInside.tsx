
import React from 'react';
import BriefExcerpt from './BriefExcerpt';

const WhatsInside: React.FC = () => {
  return (
    <section className="py-24" id="whats-inside">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">WHAT'S INSIDE</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary mb-6">
            A Complete Marketing Playbook. Not Just Ideas.
          </h2>
        </div>

        <div className="space-y-24">
          {/* Section 01 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h3 className="text-2xl font-bold text-primary mb-4">Section 01 — Opportunity Landscape</h3>
              <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                "We analyze your competitive landscape to find the gaps. What are competitors saying? Where are they leaving opportunities? What can YOU say that no one else can?"
              </p>
            </div>
            <BriefExcerpt header="01 — OPPORTUNITY LANDSCAPE">
{`⊘ SATURATED ANGLES           ◎ OPPORTUNITY GAPS
— "Dermatologist recommended" — "Developed BY a surgeon"
— Clinical, cold aesthetic    — Warm authority positioning
— Fear-based messaging        — Hope-forward storytelling
— Generic "clean beauty"      — Medical-grade credentialing`}
            </BriefExcerpt>
          </div>

          {/* Section 02 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:flex-row-reverse">
            <BriefExcerpt header="02 — STRATEGIC DIRECTION">
{`Core Positioning
> "The only skincare line developed by a surgeon 
   who's treated 10,000 patients."

01  CREDENTIAL AS MOAT
    Your MD isn't a trust badge. It's the product story.

02  AUTHORITY WITHOUT ARROGANCE  
    Warm expertise beats cold clinical.`}
            </BriefExcerpt>
            <div className="mb-12 lg:mb-0 lg:order-first">
              <h3 className="text-2xl font-bold text-primary mb-4">Section 02 — Strategic Positioning</h3>
              <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                "Your positioning statement and three strategic pillars. This is the foundation everything else builds on — the 'why you' that makes competitors irrelevant."
              </p>
            </div>
          </div>

          {/* Section 03 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <h3 className="text-2xl font-bold text-primary mb-4">Section 03 — Creative Concepts (10 Ads)</h3>
              <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                "10 distinct ad concepts, each exploiting a different gap in your market. Every concept includes 4 hook variants, body copy, visual asset direction, and CTA buttons. Ready to hand to your designer."
              </p>
            </div>
            <BriefExcerpt header="03 — CREATIVE CONCEPTS">
{`AD 03
The Surgeon's Secret
Expert Authority Format

HOOK VARIANTS
├── VARIANT A - "The product I give every patient"
├── VARIANT B - "Why would a breast surgeon create...?"
├── VARIANT C - "I've seen 10,000 patients..."
└── VARIANT D - "I couldn't find what they needed."

VISUAL ASSETS
├── Hero Shot — Doctor in scrubs, product in hand
├── Lifestyle — Patient applying, morning light
└── UGC — Real testimonial, 6-week journey`}
            </BriefExcerpt>
          </div>

          {/* Section 04 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center lg:flex-row-reverse">
            <BriefExcerpt header="04 — TESTING ROADMAP">
{`4-Week Sprint Plan

Week 1 │ Hook Testing    │ Ad 1 vs Ad 3     │ CTR, Hook Rate
Week 2 │ Format Testing  │ Hero vs UGC      │ CTR, CPM
Week 3 │ Audience Testing│ By persona       │ CVR, CPA
Week 4 │ Scale Winners   │ Top 3 performers │ ROAS`}
            </BriefExcerpt>
            <div className="mb-12 lg:mb-0 lg:order-first">
              <h3 className="text-2xl font-bold text-primary mb-4">Section 04 — Testing Roadmap</h3>
              <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-6">
                "A systematic 4-week A/B testing plan. We don't guess — we test hooks first, then formats, then audiences. By week 4, you're scaling winners with confidence."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsInside;
