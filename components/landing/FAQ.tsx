'use client'

import { useState } from 'react'

interface AccordionItemProps {
  question: string
  answer: string
}

function AccordionItem({ question, answer }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-200 py-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <h3 className="text-lg font-bold text-primary pr-8">{question}</h3>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      <div
        className={`mt-4 text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p>{answer}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const faqs = [
    {
      question: 'What exactly is a WhiteCoat Brief?',
      answer:
        "It's a comprehensive marketing intelligence document built specifically for your brand. It includes competitive analysis, strategic positioning, 10 complete ad concepts (with 40+ hook variants), a 4-week testing roadmap, and a deployment checklist. Think of it as your marketing playbook — everything you need to run effective campaigns.",
    },
    {
      question: 'Do you only work with MDs?',
      answer:
        'We work with licensed healthcare professionals who have created consumer product brands — MDs, DOs, NPs, PAs, and specialists. If you have medical credentials and sell products (not just services), we can help.',
    },
    {
      question: 'What if I already have a marketing team?',
      answer:
        'Perfect. The brief is designed to be executed by any competent team. Hand it to your in-house marketers or existing agency. We also offer execution packages if you want us to build it out.',
    },
    {
      question: 'How do you handle compliance?',
      answer:
        "Every recommendation is made with FTC, FDA, and medical board guidelines in mind. We know what claims require substantiation, what language triggers scrutiny, and how to position medical credentials without crossing lines. We're not lawyers, but we know the red flags.",
    },
    {
      question: 'What platforms do you focus on?',
      answer:
        'The brief covers Meta (Facebook/Instagram), TikTok, and Google. Ad concepts are platform-optimized with specific hook variants for each. We can also adapt for Pinterest, YouTube, or LinkedIn if relevant to your audience.',
    },
    {
      question: 'How long does it take?',
      answer:
        '7 days from kickoff to delivery. Day 1 is discovery, Days 2-6 we build the brief, Day 7 we walk you through it.',
    },
  ]

  return (
    <section className="py-24 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary">
            Questions
          </h2>
        </div>

        <div className="bg-slate-50 rounded-2xl p-8 sm:p-12 border border-slate-100">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
