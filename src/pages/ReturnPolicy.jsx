import usePageTitle from '../hooks/usePageTitle'
import { RotateCcw, Mail, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const sections = [
  {
    title: 'Our Returns Policy',
    icon: RotateCcw,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    content: [
      'As our products are freshly baked to order, we are unable to accept returns on food items unless they arrive damaged, incorrect, or unsatisfactory.',
      'All claims must be raised within 24 hours of delivery, accompanied by clear photographs of the issue and your order number.',
      'We reserve the right to assess each case individually and offer a replacement, partial refund, or full refund at our discretion.',
    ],
  },
  {
    title: 'Refund Timelines',
    icon: Clock,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    content: [
      'Once a refund is approved, it will be processed within 5–7 business days back to your original payment method.',
      'Bank processing times may vary. Please allow up to 10 business days for the refund to appear on your statement.',
      'You will receive an email confirmation once your refund has been issued.',
    ],
  },
  {
    title: 'Cancellations',
    icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    content: [
      'Cancellations made more than 72 hours before the scheduled delivery or collection date will receive a full refund.',
      'Cancellations made within 72 hours will forfeit the deposit paid.',
      'Same-day cancellations are non-refundable as production will have already begun.',
    ],
  },
  {
    title: 'Eligible Refund Situations',
    icon: CheckCircle,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    content: [
      'Product arrived visibly damaged during transit.',
      'Order received was incorrect (wrong flavour, size, or design).',
      'Product was not delivered within the agreed timeframe due to our error.',
      'Significant quality issue that was not caused by improper storage after delivery.',
    ],
  },
  {
    title: 'Non-Eligible Situations',
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    content: [
      'Change of mind after the order has been placed.',
      'Damage caused by improper storage or handling after delivery.',
      'Minor variations in colour or decoration due to the handmade nature of our products.',
      'Claims raised more than 24 hours after delivery.',
    ],
  },
]

export default function ReturnPolicy() {
  usePageTitle('Return & Refund Policy')

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4">
          <RotateCcw size={26} className="text-amber-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Return & Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2025</p>
        <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
          Customer satisfaction is our priority. Please read our policy carefully so you know exactly what to expect if something isn't right with your order.
        </p>
      </div>

      {/* Policy sections */}
      <div className="space-y-5">
        {sections.map(({ title, icon: Icon, iconBg, iconColor, content }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} />
              </div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
            </div>
            <ul className="space-y-2">
              {content.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How to raise a claim */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">How to Raise a Claim</h2>
        <ol className="space-y-3">
          {[
            'Take clear photos of the product showing the issue.',
            'Note your order number from your confirmation email.',
            'Email us within 24 hours of delivery with the photos and order number.',
            'Our team will review your claim and respond within 1 business day.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="shrink-0 h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Contact */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Contact Support</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          To raise a return or refund request, email us with your order details and photos.
        </p>
        <a
          href="mailto:support@fancycakespatisserie.com"
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
        >
          <Mail size={15} />
          Email Support
        </a>
      </div>
    </main>
  )
}
