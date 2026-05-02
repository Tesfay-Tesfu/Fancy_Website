import usePageTitle from '../hooks/usePageTitle'
import { ShoppingCart, Palette, Truck, CheckCircle, Clock, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: ShoppingCart,
    step: '01',
    title: 'Browse & Choose',
    color: 'bg-amber-100 text-amber-700',
    desc: 'Explore our full range of cakes in the shop. Filter by category, size, or flavour to find the perfect match for your occasion.',
    tips: ['Use the category filters to narrow down your search', 'Check the product description for available sizes', 'Read customer reviews for inspiration'],
  },
  {
    icon: Palette,
    step: '02',
    title: 'Customise Your Order',
    color: 'bg-pink-100 text-pink-700',
    desc: 'Select your preferred size, flavour, and colour options. For fully bespoke designs, add your requirements in the order notes or contact us directly.',
    tips: ['Select your size from the dropdown — price updates automatically', 'Choose your base colour and piping colour', 'Add a personalised message for free'],
  },
  {
    icon: Clock,
    step: '03',
    title: 'Choose Your Date',
    color: 'bg-blue-100 text-blue-700',
    desc: 'We need at least 5 business days notice for standard orders. Wedding cakes and large orders require 2–4 weeks. Select your preferred delivery or collection date at checkout.',
    tips: ['Order early for peak dates (Christmas, Valentine\'s, Easter)', 'Same-day orders available before 10am (call to confirm)', 'Weekend delivery slots fill up fast — book ahead'],
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Checkout & Pay',
    color: 'bg-green-100 text-green-700',
    desc: 'Complete your order securely online. We accept all major cards and bank transfers. You\'ll receive an order confirmation email immediately.',
    tips: ['Check your postcode is in our delivery zone', 'Apply any discount codes at checkout', 'Save your details for faster future orders'],
  },
  {
    icon: Truck,
    step: '05',
    title: 'Delivery or Collection',
    color: 'bg-purple-100 text-purple-700',
    desc: 'Your cake will be freshly baked and carefully packaged. Choose home delivery or collect from our bakery at a time that suits you.',
    tips: ['You\'ll receive a delivery notification on the day', 'Someone must be available to receive the order', 'Inspect your cake upon receipt and contact us immediately if there are any issues'],
  },
]

const tips = [
  { title: 'Plan Ahead', desc: 'The earlier you order, the more options you have for customisation and scheduling.' },
  { title: 'Be Specific', desc: 'The more detail you provide about your design, the closer we can match your vision.' },
  { title: 'Check Allergens', desc: 'Always inform us of any dietary requirements or allergies before placing your order.' },
  { title: 'Confirm Details', desc: 'Double-check your delivery address, date, and contact number before completing checkout.' },
]

export default function OrderingGuide() {
  usePageTitle('Ordering Guide')
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
          How It Works
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Your Ordering Guide</h1>
        <p className="mt-4 max-w-xl mx-auto text-slate-500 text-sm leading-relaxed">
          Ordering your perfect cake is simple. Follow these steps and we'll take care of the rest.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6 mb-14">
        {steps.map(({ icon: Icon, step, title, color, desc, tips: stepTips }) => (
          <div key={step} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Step number + icon */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <span className="text-xs font-bold text-slate-300">{step}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-900 mb-1">{title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{desc}</p>
              <ul className="space-y-1">
                {stepTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-slate-500">
                    <CheckCircle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Pro tips */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold text-slate-900 mb-5">Pro Tips</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map(({ title, desc }) => (
            <div key={title} className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-800 mb-1">{title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-amber-950 text-white p-8 text-center space-y-4">
        <h2 className="text-xl font-extrabold">Ready to get started?</h2>
        <p className="text-amber-200 text-sm">Browse our full collection and place your order today.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/shop" className="rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-bold transition">
            Shop Now
          </Link>
          <a href="tel:+12407978542" className="rounded-full border border-amber-700 hover:border-amber-500 px-6 py-2.5 text-sm font-bold text-amber-200 hover:text-white transition flex items-center gap-2">
            <Phone size={14} /> Call Us
          </a>
        </div>
      </div>
    </main>
  )
}
