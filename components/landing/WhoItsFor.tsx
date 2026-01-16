export default function WhoItsFor() {
  return (
    <section className="py-24 bg-white" id="who-its-for">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-secondary font-bold tracking-widest text-sm uppercase mb-4 block">
            WHO THIS IS FOR
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-primary mb-6">
            Built for Doctors Who Sell Products
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-emerald-50/50 p-8 sm:p-12 rounded-2xl border border-emerald-100">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center">
              <span className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center mr-4 text-sm">
                ✓
              </span>
              This is for you if:
            </h3>
            <ul className="space-y-6">
              {[
                "You're a licensed physician with a consumer product line",
                'You sell through Shopify (or similar e-commerce)',
                'Your credentials ARE your competitive advantage',
                "You're doing $50K - $2M in annual product revenue",
                "You're tired of agencies that don't get healthcare",
                'You want strategy before you commit to execution',
              ].map((item, i) => (
                <li key={i} className="flex items-start text-slate-700">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 p-8 sm:p-12 rounded-2xl border border-slate-200 opacity-80">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center">
              <span className="w-8 h-8 bg-slate-400 text-white rounded-full flex items-center justify-center mr-4 text-sm">
                ✕
              </span>
              This is NOT for you if:
            </h3>
            <ul className="space-y-6">
              {[
                "You're looking for the cheapest option",
                'You want someone to "just run ads"',
                "You're not willing to lean into your credentials",
                'You need patient acquisition for a practice (try Plastix)',
              ].map((item, i) => (
                <li key={i} className="flex items-start text-slate-500">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
