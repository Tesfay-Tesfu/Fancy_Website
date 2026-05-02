import usePageTitle from '../hooks/usePageTitle'
import { FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Orders & Payment',
    body: `All orders must be placed at least 5 business days in advance. Full payment is required at the time of ordering. We accept major credit/debit cards and bank transfers. Prices are inclusive of applicable taxes.`,
  },
  {
    title: '2. Cancellations & Modifications',
    body: `Cancellations made more than 72 hours before the collection/delivery date will receive a full refund. Cancellations within 72 hours will forfeit the deposit. Same-day cancellations are non-refundable. Order modifications are subject to availability and must be requested at least 48 hours in advance.`,
  },
  {
    title: '3. Allergens',
    body: `Our products are made in a kitchen that handles nuts, gluten, dairy, eggs, and soy. We cannot guarantee an allergen-free environment. Please inform us of any allergies before ordering. We accept no liability for allergic reactions where allergen information was not disclosed at the time of ordering.`,
  },
  {
    title: '4. Delivery',
    body: `Delivery is available within our service area. Delivery fees are calculated at checkout based on distance. We are not responsible for delays caused by incorrect delivery information provided by the customer. Risk of damage passes to the customer upon delivery.`,
  },
  {
    title: '5. Product Appearance',
    body: `While we strive to match all designs as closely as possible, slight variations in colour, decoration, and finish may occur due to the handmade nature of our products. Reference images are for inspiration only and do not constitute an exact guarantee of appearance.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All images, designs, recipes, and content on this website are the property of Fancy Cakes Patisserie. Reproduction or redistribution without written permission is strictly prohibited.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `Our liability is limited to the value of the order placed. We are not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.`,
  },
  {
    title: '8. Governing Law',
    body: `These terms are governed by the laws of the jurisdiction in which Fancy Cakes Patisserie operates. Any disputes shall be subject to the exclusive jurisdiction of the local courts.`,
  },
]

export default function Terms() {
  usePageTitle('Terms & Conditions')
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4">
          <FileText size={26} className="text-amber-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2025</p>
        <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
          By placing an order with Fancy Cakes Patisserie you agree to the following terms. Please read them carefully before completing your purchase.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
        <p className="text-sm text-slate-700">Questions about these terms?</p>
        <a href="mailto:info@fancycake.com" className="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800 transition">
          info@fancycake.com
        </a>
      </div>
    </main>
  )
}
