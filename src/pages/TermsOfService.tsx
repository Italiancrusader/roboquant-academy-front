import React from "react";
import { FileText, Gavel, ShieldCheck, FileLock, Book, Mail } from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-9">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    <div className="text-base text-gray-300">{children}</div>
  </section>
);

const TermsOfService = () => (
  <main className="max-w-3xl mx-auto py-12 px-5 sm:px-8 text-gray-100 bg-background min-h-screen">
    <div className="mb-8 flex items-center gap-3">
      <FileText className="h-8 w-8 text-blue-600" />
      <h1 className="text-3xl font-bold">FXC Algo Trade LLC – Terms of Service</h1>
    </div>
    <div className="text-gray-400 mb-4">Effective date: 23 April 2025</div>
    <Section icon={Book} title="1  Acceptance of Terms">
      By accessing fxcrusher.com, roboquant.ai, purchasing any EA, indicator, mentorship, or enrolling in a course (collectively “Services”), <b>you agree</b> to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Services.
    </Section>
    <Section icon={FileLock} title="2  Eligibility & Account Security">
      You must be at least 18 years old and able to form a binding contract. You are responsible for all activity that occurs under your credentials and must promptly notify us of any unauthorised use.
    </Section>
    <Section icon={ShieldCheck} title="3  Products, Licences & Restrictions">
      Digital products are <b>licensed, not sold</b>. Unless a product page states otherwise, you receive a non-exclusive, non-transferable licence to install and use each EA, indicator, or script on up to <b>three (3)</b> MetaTrader terminals. Resale, sublicensing, or distribution is prohibited.
    </Section>
    <Section icon={FileText} title="4  No Investment Advice; Risk Disclosure">
      FXC Algo Trade LLC is <b>not</b> a registered investment adviser or broker-dealer. All information is provided for educational purposes only. Trading Forex, CFDs, or using algorithmic strategies involves significant risk of loss; past performance is <b>not</b> indicative of future results. You trade at your own risk.
    </Section>
    <Section icon={Gavel} title="5  Payments, Taxes & Refunds">
      Prices are denominated in U.S. dollars unless stated. We accept credit/debit cards (via Stripe), cryptocurrency, and bank transfer. Products are delivered digitally within 1–12 hours. <b>All sales are final</b> unless a specific product page grants a conditional money-back guarantee, in which case the stated conditions apply.
    </Section>
    <Section icon={ShieldCheck} title="6  User Conduct">
      You agree <b>not</b> to:
      <ol className="list-decimal ml-8 mt-2">
        <li>reverse-engineer, decompile, or share licensed code;</li>
        <li>scrape, overload, or attempt to compromise our servers;</li>
        <li>upload malware or infringing content;</li>
        <li>impersonate staff or other users.</li>
      </ol>
      <div className="mt-2">Violation may result in immediate termination of access without refund.</div>
    </Section>
    <Section icon={ShieldCheck} title="7  Intellectual Property">
      All site content, trademarks (“Fx Crusher”, “RoboQuant Academy”), logos, and software are the property of FXC Algo Trade LLC or its licensors and are protected by U.S. and international IP laws.
    </Section>
    <Section icon={Book} title="8  Third-Party Links & Tools">
      Our Services integrate with third-party platforms (prop-firm dashboards, payment processors, Discord, Telegram). We are not responsible for the availability or content of these third-party services.
    </Section>
    <Section icon={ShieldCheck} title="9  Disclaimer of Warranties">
      The Services are provided <b>“as is” and “as available.”</b> We do not warrant that the Services will be uninterrupted, secure, or error-free, nor that any strategy will be profitable.
    </Section>
    <Section icon={Gavel} title="10  Limitation of Liability">
      To the maximum extent permitted by law, FXC Algo Trade LLC’s total liability for any claim arising out of the Services will not exceed the greater of (a) USD 100 or (b) the amount you paid us during the six (6) months preceding the event. We will not be liable for indirect, incidental, or consequential damages.
    </Section>
    <Section icon={ShieldCheck} title="11  Indemnification">
      You agree to indemnify and hold harmless FXC Algo Trade LLC, its officers, employees, and agents from any claim, damage, liability, or expense (including attorneys’ fees) arising from your breach of these Terms or misuse of the Services.
    </Section>
    <Section icon={Gavel} title="12  Governing Law & Dispute Resolution">
      These Terms are governed by the laws of the State of Wyoming, USA, without regard to conflict-of-law principles. Any dispute shall be resolved by binding arbitration in Sheridan, WY, under the American Arbitration Association (AAA) rules. <b>You waive any right to participate in class actions.</b>
    </Section>
    <Section icon={FileText} title="13  Modification of Terms">
      We may update these Terms at any time by posting a revised version and updating the “Effective date” above. Continued use of the Services after changes constitutes acceptance.
    </Section>
    <Section icon={FileText} title="14  Severability">
      If any provision of these Terms is held unenforceable, the remaining provisions remain in full force and effect.
    </Section>
    <Section icon={Mail} title="15  Contact">
      Questions about these Terms? Email <a href="mailto:info@fxcrusher.com" className="underline text-blue-400">info@fxcrusher.com</a> or write to:<br/>
      FXC Algo Trade LLC, 30 N Gould St, Ste R, Sheridan, WY 82801 USA <br />
      Phone (US): +1 615 682 2248
    </Section>
  </main>
);

export default TermsOfService;
