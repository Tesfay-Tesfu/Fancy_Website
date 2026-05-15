import usePageTitle from '../hooks/usePageTitle'
import { Shield } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    body: `When you place an order or create an account, we collect personal information including your name, email address, phone number, delivery address, and payment details. We may also collect browsing data such as pages visited and time spent on our site to improve your experience.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information to process and fulfil your orders, send order confirmations and delivery updates, respond to customer service enquiries, send promotional emails (only with your consent), and improve our website and services.`,
  },
  {
    title: '3. Sharing Your Information',
    body: `We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers (e.g. payment processors, delivery partners) solely to fulfil your order. All third parties are required to keep your information confidential.`,
  },
  {
    title: '4. Cookies',
    body: `Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can disable cookies in your browser settings, though some features may not function correctly as a result.`,
  },
  {
    title: '5. Data Security',
    body: `We implement industry-standard security measures to protect your personal data. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '6. Data Retention',
    body: `We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. You may request deletion of your account and associated data at any time by contacting us.`,
  },
  {
    title: '7. Your Rights',
    body: `You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities. To exercise any of these rights, please contact us at info@fancycake.com.`,
  },
  {
    title: '8. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.`,
  },
]

export default function PrivacyPolicy() {
  usePageTitle('Privacy Policy')
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4">
          <Shield size={26} className="text-amber-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2025</p>
        <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
          At Fancy Cakes Patisserie, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-center">
        {sections.map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
        <p className="text-sm text-slate-700">Questions about this policy?</p>
        <a href="mailto:info@fancycake.com" className="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800 transition">
          fancycakesbyselam@gmail.com
        </a>
      </div>
    </main>
  )
}
