
import React from "react";
import { Mail, Phone, FileLock, ShieldCheck, Book, FileText } from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-6 w-6 text-blue-500" aria-hidden="true" />
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    <div className="text-base text-gray-300">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
  <main className="max-w-3xl mx-auto py-12 px-5 sm:px-8 text-gray-100 bg-background min-h-screen">
    <div className="mb-8 flex items-center gap-3">
      <FileLock className="h-8 w-8 text-blue-500" />
      <h1 className="text-3xl font-bold">FXC Algo Trade LLC – Privacy Policy</h1>
    </div>
    <div className="text-gray-400 mb-4">Last updated: 23 April 2025</div>

    <Section icon={Book} title="1  Who We Are">
      <strong>FXC Algo Trade LLC</strong> (d/b/a “Fx Crusher” and “RoboQuant Academy”)<br />
      30 N Gould St, Ste R, Sheridan, WY 82801 USA <br/>
      <span className="flex items-center gap-2 mt-1">
        <Mail className="w-4 h-4 inline-block" /> <b>Email:</b> <a href="mailto:info@fxcrusher.com" className="underline text-blue-400">info@fxcrusher.com</a>
      </span>
      <span className="flex items-center gap-2 mt-1">
        <Phone className="w-4 h-4 inline-block" /> <b>Phone (US):</b> <a href="tel:+16156822248" className="underline text-blue-400">+1 615 682 2248</a>
      </span>
      <span className="block mt-1"><b>WhatsApp / MX:</b> +52 998 480 8141</span>
    </Section>
    <Section icon={ShieldCheck} title="2  Scope">
      This Privacy Policy governs personal information collected through:
      <ul className="list-disc ml-8 mt-2">
        <li><b>fxcrusher.com</b> and all of its sub-pages;</li>
        <li><b>roboquant.ai</b> and any future academy sub-domains;</li>
        <li>checkout/landing pages we control;</li>
        <li>our Discord or Telegram bots and support channels.</li>
      </ul>
    </Section>
    <Section icon={FileText} title="3  Data We Collect">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border border-gray-700 rounded mb-2">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="py-2 px-2 border-b border-gray-600 font-semibold">Category</th>
              <th className="py-2 px-2 border-b border-gray-600 font-semibold">Examples</th>
              <th className="py-2 px-2 border-b border-gray-600 font-semibold">Purpose &amp; Legal Basis*</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700"><b>Account Data</b></td>
              <td className="py-2 px-2 border-b border-gray-700">name, email, phone, Discord ID</td>
              <td className="py-2 px-2 border-b border-gray-700">contract performance</td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700"><b>Payment Data</b></td>
              <td className="py-2 px-2 border-b border-gray-700">last 4 card digits, billing address (via Stripe/Coinbase)</td>
              <td className="py-2 px-2 border-b border-gray-700">contract &amp; legal obligation</td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700"><b>Course Progress</b></td>
              <td className="py-2 px-2 border-b border-gray-700">lesson timestamps, quiz scores</td>
              <td className="py-2 px-2 border-b border-gray-700">legitimate interest (service improvement)</td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700"><b>Usage Data</b></td>
              <td className="py-2 px-2 border-b border-gray-700">IP address, browser UA, pages viewed</td>
              <td className="py-2 px-2 border-b border-gray-700">legitimate interest / consent (EU)</td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700"><b>Marketing Data</b></td>
              <td className="py-2 px-2 border-b border-gray-700">cookies, ad click-IDs, pixel events</td>
              <td className="py-2 px-2 border-b border-gray-700">consent (EU), legitimate interest (elsewhere)</td>
            </tr>
          </tbody>
        </table>
        <div className="text-xs text-gray-400 mb-2">* Legal bases per GDPR where applicable.</div>
      </div>
    </Section>
    <Section icon={ShieldCheck} title="4  Tracking Technologies">
      We deploy first-party cookies plus the following third-party tools:
      <ul className="list-disc ml-8 mt-2">
        <li>Google Analytics 4 and Google Ads / Floodlight</li>
        <li>Meta (Facebook) Pixel &amp; Conversions API</li>
        <li>TikTok Pixel</li>
        <li>LinkedIn Insight Tag</li>
        <li>Hotjar and Microsoft Clarity (session replay/heatmaps)</li>
      </ul>
      <p className="mt-2">EU/UK visitors see a cookie consent banner that enables or disables non-essential cookies.</p>
    </Section>
    <Section icon={FileText} title="5  How We Use Data">
      <ul className="list-disc ml-8 mt-2">
        <li>Provide and manage courses, EAs, and indicators</li>
        <li>Process payments and prevent fraud</li>
        <li>Send transactional emails/SMS via Mailgun &amp; Twilio</li>
        <li>Personalise and measure advertising</li>
        <li>Satisfy tax, AML, and other legal obligations</li>
      </ul>
    </Section>
    <Section icon={FileText} title="6  Sharing of Information">
      <b>We do not sell your personal information.</b> We share data only with:
      <ul className="list-disc ml-8 mt-2">
        <li>payment processors (Stripe, Coinbase Commerce, crypto gateways);</li>
        <li>hosting/CDN vendors (AWS, Cloudflare, DigitalOcean);</li>
        <li>analytics/advertising partners listed in §4;</li>
        <li>community platforms (Discord, Telegram) when you link accounts;</li>
        <li>competent authorities when legally compelled.</li>
      </ul>
      <div className="mt-2">
        All vendors sign Data Processing Agreements and, where required, Standard Contractual Clauses for EU data transfers.
      </div>
    </Section>
    <Section icon={FileText} title="7  Data Retention">
      <ul className="list-disc ml-8 mt-2">
        <li>Account records — retained for the life of your account + 6 years (IRS).</li>
        <li>Marketing cookies — up to 24 months (Google/Meta defaults).</li>
        <li>Course analytics — rolling 3-year window.</li>
      </ul>
    </Section>
    <Section icon={ShieldCheck} title="8  Your Rights">
      <ul className="list-disc ml-8 mt-2">
        <li><b>EEA/UK:</b> access, rectification, erasure, restriction, portability, objection.</li>
        <li><b>California:</b> CCPA/CPRA access, deletion, “do not sell or share” rights.</li>
        <li><b>Others:</b> rights under your local laws.</li>
      </ul>
      <div className="mt-2">
        Submit requests to <a href="mailto:privacy@fxcrusher.com" className="underline text-blue-400">privacy@fxcrusher.com</a>; identity verification is required.
      </div>
    </Section>
    <Section icon={ShieldCheck} title="9  Security">
      We enforce TLS 1.3 encryption at rest and in transit, maintain server firewalls, conduct regular patch management, and follow role-based access control. Despite these measures, no method of transmission or storage is 100% secure.
    </Section>
    <Section icon={FileText} title="10  Opt-Out and Cookie Controls">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border border-gray-700 rounded mb-2">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="py-2 px-2 border-b border-gray-600 font-semibold">Service</th>
              <th className="py-2 px-2 border-b border-gray-600 font-semibold">Self-Service Opt-Out</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700">Google Analytics</td>
              <td className="py-2 px-2 border-b border-gray-700"><a href="https://tools.google.com/dlpage/gaoptout" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a></td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700">Meta Ads</td>
              <td className="py-2 px-2 border-b border-gray-700"><a href="https://facebook.com/adpreferences" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">facebook.com/adpreferences</a></td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700">TikTok Ads</td>
              <td className="py-2 px-2 border-b border-gray-700"><a href="https://tiktok.com/privacy/ads" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">tiktok.com/privacy/ads</a></td>
            </tr>
            <tr>
              <td className="py-2 px-2 border-b border-gray-700">LinkedIn</td>
              <td className="py-2 px-2 border-b border-gray-700"><a href="https://linkedin.com/psettings/guest-controls" className="underline text-blue-400" target="_blank" rel="noopener noreferrer">linkedin.com/psettings/guest-controls</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>You can also clear or block cookies directly in your browser settings.</div>
    </Section>
    <Section icon={ShieldCheck} title="11  Children’s Privacy">
      We do not knowingly collect data from children under 13 (U.S.) or under the age defined in your jurisdiction. If you believe a child has provided us with personal information, contact us and we will delete it immediately.
    </Section>
    <Section icon={FileText} title="12  Changes to This Policy">
      Material changes will be posted on this page and, where required by law, notified via email at least seven (7) days before taking effect. Continued use of our services after changes constitutes acceptance.
    </Section>
    <Section icon={Mail} title="13  Contact Us">
      Questions or complaints? Write to <a href="mailto:info@fxcrusher.com" className="underline text-blue-400">info@fxcrusher.com</a> or the address in §1.
    </Section>
  </main>
);

export default PrivacyPolicy;
