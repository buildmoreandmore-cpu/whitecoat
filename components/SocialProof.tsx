
import React from 'react';

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      quote: "Finally, a marketing partner who understands I can't just make any claim I want. The brief gave me 10 ad concepts I could actually use — and they knew which ones would get me in trouble.",
      author: "Dr. Sarah M.",
      role: "Dermatologist & Skincare Founder"
    },
    {
      quote: "I've worked with three agencies. None of them understood how to position my surgical background as a selling point. The WhiteCoat Brief nailed it in the first section.",
      author: "Dr. James T.",
      role: "Plastic Surgeon & Supplement Brand"
    },
    {
      quote: "The testing roadmap alone was worth it. I stopped guessing and started knowing what worked.",
      author: "Dr. Rachel K.",
      role: "OB-GYN & Intimate Wellness Brand"
    }
  ];

  return (
    <section className="py-24 bg-surface" id="proof">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">PROOF</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary mb-6">
            What Physician Founders Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  ))}
                </div>
                <blockquote className="text-slate-700 leading-relaxed mb-8 italic">
                  "{t.quote}"
                </blockquote>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="font-bold text-primary">{t.author}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
          <div className="font-heading text-2xl font-extrabold text-slate-400 tracking-tighter uppercase italic">Shopify</div>
          <div className="font-heading text-2xl font-extrabold text-slate-400 tracking-tighter uppercase italic">Meta Ads</div>
          <div className="font-heading text-2xl font-extrabold text-slate-400 tracking-tighter uppercase italic">TikTok</div>
          <div className="font-heading text-2xl font-extrabold text-slate-400 tracking-tighter uppercase italic">Klaviyo</div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
