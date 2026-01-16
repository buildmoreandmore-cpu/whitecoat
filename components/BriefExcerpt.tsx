
import React from 'react';

interface BriefExcerptProps {
  header: string;
  children: React.ReactNode;
}

const BriefExcerpt: React.FC<BriefExcerptProps> = ({ header, children }) => {
  return (
    <div className="bg-[#F8FAFC] border-l-4 border-secondary rounded-r-lg p-6 sm:p-8 brief-mockup-shadow font-mono text-xs sm:text-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="mb-6 pb-2 border-b border-slate-200">
        <span className="text-secondary font-bold">━━━ {header} ━━━</span>
      </div>
      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
};

export default BriefExcerpt;
