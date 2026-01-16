import {
  Navigation,
  Hero,
  ProblemSection,
  WhatsInside,
  HowItWorks,
  Pricing,
  WhoItsFor,
  SocialProof,
  FAQ,
  CTASection,
  Footer,
  BackToTop,
  QuestionnaireProvider,
} from '@/components/landing'

export default function Home() {
  return (
    <QuestionnaireProvider>
      <div className="min-h-screen font-sans antialiased text-slate-800">
        <Navigation />
        <main>
          <Hero />
          <ProblemSection />
          <WhatsInside />
          <HowItWorks />
          <Pricing />
          <WhoItsFor />
          <SocialProof />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </QuestionnaireProvider>
  )
}
