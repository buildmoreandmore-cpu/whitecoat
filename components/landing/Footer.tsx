export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <a
              href="#"
              className="font-heading text-2xl font-extrabold tracking-tight text-primary mb-4 block"
            >
              WhiteCoat Brief<span className="text-secondary">™</span>
            </a>
            <p className="text-slate-500 max-w-xs leading-relaxed">
              Marketing intelligence for physician-founded brands. We turn
              medical credentials into competitive advantages.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-6">Links</h4>
            <ul className="space-y-4 text-slate-500">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-secondary transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-secondary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-secondary transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/admin/login"
                  className="hover:text-secondary transition-colors"
                >
                  Admin
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-500">
              <li>
                <a
                  href="mailto:hello@whitecoatbrief.com"
                  className="hover:text-secondary transition-colors"
                >
                  hello@whitecoatbrief.com
                </a>
              </li>
              <li className="flex space-x-4 pt-2">
                <a
                  href="#"
                  className="text-slate-400 hover:text-secondary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-secondary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
          <p>
            © 2026 WhiteCoat Brief™ — A Productized Service for Physician
            Founders.
          </p>
        </div>
      </div>
    </footer>
  )
}
