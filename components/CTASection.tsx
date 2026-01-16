
import React from 'react';

const CTASection: React.FC = () => {
  return (
    <section className="py-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-[3rem] p-8 sm:p-16 lg:p-24 text-center relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50 rounded-full translate-y-1/2 -translate-x-1/2 -z-10"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-primary leading-tight mb-8">
              Ready for Marketing That Actually Gets Healthcare?
            </h2>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Book a free 20-minute intro call. We'll learn about your brand, answer your questions, and tell you honestly if the WhiteCoat Brief is right for you.
            </p>
            <div className="flex flex-col items-center gap-6">
              <a
                href="#"
                className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-lg font-bold rounded-xl text-white bg-accent hover:bg-amber-600 transition-all shadow-xl shadow-amber-200"
              >
                Book Your Free Intro Call
              </a>
              <div className="text-slate-500 font-medium">
                No pitch deck. No pressure. Just a conversation.
              </div>
              <div className="mt-4">
                <span className="text-slate-400">Or email us directly: </span>
                <a href="mailto:hello@whitecoatbrief.com" className="text-primary font-bold hover:text-secondary transition-colors">hello@whitecoatbrief.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
