'use client'

import { useQuestionnaire } from './QuestionnaireProvider'

export default function Pricing() {
  const { openQuestionnaire } = useQuestionnaire()

  const tiers = [
    {
      name: 'BRIEF ONLY',
      tagline: 'The Playbook',
      price: '$2,500',
      description: 'Perfect for: Teams with in-house execution capability',
      features: [
        'Complete WhiteCoat Brief™',
        '60-min discovery call',
        '60-min strategy review',
        'Delivered in 7 days',
        'PDF + Notion formats',
      ],
      cta: 'Get the Brief',
      popular: false,
    },
    {
      name: 'BRIEF + BUILD',
      tagline: 'Playbook + Landing Page',
      price: '$5,000',
      description: 'Perfect for: Brands ready to launch but need the assets',
      features: [
        'Everything in Brief Only, plus:',
        'Shopify landing page build',
        'Email opt-in flow setup',
        'Product page optimization',
        'Mobile-responsive design',
      ],
      cta: 'Get Brief + Build',
      popular: true,
    },
    {
      name: 'BRIEF + LAUNCH',
      tagline: 'Playbook + Full Activation',
      price: '$7,500',
      description: 'Perfect for: Brands who want hands-off execution',
      features: [
        'Everything in Brief + Build, plus:',
        '4-week ad management',
        'Weekly optimization reports',
        'Creative iterations based on data',
        'Dedicated Slack channel',
      ],
      cta: 'Get Brief + Launch',
      popular: false,
    },
  ]

  return (
    <section className="py-24 bg-surface" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary mb-6">
            Choose Your Level of Execution
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Every package starts with the WhiteCoat Brief. Choose how much
            support you need to bring it to life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white p-8 rounded-2xl shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                tier.popular
                  ? 'border-2 border-secondary scale-105 z-10'
                  : 'border border-slate-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <span className="font-mono text-secondary text-xs font-bold tracking-widest">
                  {tier.name}
                </span>
                <h3 className="text-2xl font-bold text-primary mt-2">
                  {tier.tagline}
                </h3>
                <div className="text-4xl font-heading font-extrabold text-primary mt-4">
                  {tier.price}
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed italic">
                {tier.description}
              </p>
              <ul className="space-y-4 mb-10 flex-grow">
                {tier.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-start text-sm text-slate-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-secondary mr-3 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={openQuestionnaire}
                className={`w-full py-4 px-6 rounded-lg text-center font-bold transition-all ${
                  tier.popular
                    ? 'bg-secondary text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                    : 'bg-primary text-white hover:bg-slate-800'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-700">
              <span className="font-bold">
                Ongoing Partnership — $3,500/month
              </span>
              <br />
              <span className="text-sm">
                After your initial brief, we can continue with monthly creative
                refreshes and continuous optimization.
              </span>
              <a
                href="#contact"
                className="ml-2 text-secondary font-bold hover:underline"
              >
                Learn more →
              </a>
            </p>
          </div>
          <p className="mt-8 text-slate-500 text-sm">
            Have questions?{' '}
            <a href="#faq" className="text-secondary hover:underline">
              See FAQ below ↓
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
