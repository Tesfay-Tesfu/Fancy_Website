import { useState } from 'react'
import usePageTitle from '../hooks/usePageTitle'
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    category: 'Ordering',
    items: [
      { q: 'How far in advance should I order?', a: 'We recommend placing your order at least 5–7 business days in advance. For wedding cakes or large orders, please allow 2–4 weeks.' },
      { q: 'Can I customise my cake?', a: 'Absolutely! All our cakes can be customised in terms of size, flavour, colour, and design. Use the product options on each listing or contact us directly for a fully bespoke creation.' },
      { q: 'How do I place an order?', a: 'Browse our shop, select your product, choose your options, and add to cart. Complete checkout online. You\'ll receive an order confirmation by email.' },
      { q: 'Can I order for same-day delivery?', a: 'Same-day delivery is available for orders placed before 10am, subject to availability. Please call us to confirm before placing your order.' },
    ],
  },
  {
    category: 'Delivery & Collection',
    items: [
      { q: 'What areas do you deliver to?', a: 'We deliver across our local service area. Check our Delivery Map page to see if your postcode is covered.' },
      { q: 'How much does delivery cost?', a: 'Delivery is free for Zone 1 postcodes. Zone 2 is $5.00 and Zone 3 is $10.00. Delivery fees are shown at checkout.' },
      { q: 'Can I collect my order?', a: 'Yes! Collection is available from our bakery at 7513 Maple Ave. Select "Collection" at checkout and we\'ll have your order ready at your chosen time.' },
      { q: 'How are cakes packaged for delivery?', a: 'All cakes are carefully boxed and secured to prevent movement during transit. We use insulated packaging for cream-based cakes in warm weather.' },
    ],
  },
  {
    category: 'Products & Ingredients',
    items: [
      { q: 'Do you cater for dietary requirements?', a: 'We offer gluten-free, dairy-free, and vegan options on selected products. Please check the product description or contact us to discuss your needs.' },
      { q: 'What allergens are present in your products?', a: 'Our kitchen handles nuts, gluten, dairy, eggs, and soy. We cannot guarantee a completely allergen-free environment. Always inform us of allergies before ordering.' },
      { q: 'How long do your cakes stay fresh?', a: 'Most cakes are best consumed within 2–3 days of delivery. Buttercream cakes can be stored at room temperature; cream-filled cakes should be refrigerated.' },
      { q: 'Do you use artificial ingredients?', a: 'No. We use real butter, fresh eggs, natural vanilla, and real fruit. We never use artificial flavourings or preservatives.' },
    ],
  },
  {
    category: 'Payments & Cancellations',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards, and bank transfers. Payment is taken in full at the time of ordering.' },
      { q: 'Can I cancel or change my order?', a: 'Cancellations more than 72 hours before delivery receive a full refund. Within 72 hours, the deposit is forfeited. Modifications must be requested at least 48 hours in advance.' },
      { q: 'What if my cake arrives damaged?', a: 'Please photograph the damage immediately and contact us within 24 hours of delivery. We will arrange a replacement or refund as appropriate.' },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition gap-4"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-amber-600 shrink-0" />
          : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQs() {
  usePageTitle('FAQs')
  const [search, setSearch] = useState('')

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      ({ q, a }) =>
        q.toLowerCase().includes(search.toLowerCase()) ||
        a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4">
          <HelpCircle size={26} className="text-amber-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto">
          Can't find what you're looking for? <a href="mailto:info@fancycake.com" className="text-amber-600 hover:underline font-medium">Contact us</a> and we'll be happy to help.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800
            placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition shadow-sm"
        />
      </div>

      {/* FAQ categories */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <HelpCircle size={32} strokeWidth={1.5} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm">No results for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">{category}</h2>
              <div className="space-y-3">
                {items.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Still need help */}
      <div className="mt-12 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center space-y-2">
        <p className="font-semibold text-slate-800">Still have a question?</p>
        <p className="text-sm text-slate-500">Our team is happy to help with anything not covered above.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-3">
          <a href="mailto:info@fancycake.com" className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition">
            Email Us
          </a>
          <a href="tel:+12407978542" className="rounded-full border border-amber-300 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition">
            Call Us
          </a>
        </div>
      </div>
    </main>
  )
}
