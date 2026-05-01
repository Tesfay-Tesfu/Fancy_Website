import DashboardLayout from '../../components/DashboardLayout'
import { FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Orders & Payment',
    body: `All orders must be placed at least 5 business days in advance. Full payment is required at the time of ordering.
    We accept major credit/debit cards and bank transfers. Prices are inclusive of VAT where applicable.`,
  },
  {
    title: '2. Cancellations',
    body: `Cancellations made more than 72 hours before the collection/delivery date will receive a full refund.
    Cancellations within 72 hours will forfeit the deposit. Same-day cancellations are non-refundable.`,
  },
  {
    title: '3. Allergens',
    body: `Our products are made in a kitchen that handles nuts, gluten, dairy, eggs, and soy.
    We cannot guarantee an allergen-free environment. Please inform us of any allergies before ordering.`,
  },
  {
    title: '4. Delivery',
    body: `Delivery is available within our service area. Delivery fees are calculated at checkout based on distance.
    We are not responsible for delays caused by incorrect delivery information provided by the customer.`,
  },
  {
    title: '5. Intellectual Property',
    body: `All images, designs, and content on this website are the property of Fancy Cakes Patisserie.
    Reproduction without written permission is prohibited.`,
  },
  {
    title: '6. Privacy',
    body: `We collect and store personal data solely for order processing and communication purposes.
    We do not sell or share your data with third parties. See our Privacy Policy for full details.`,
  },
]

function TermsContent() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-sm text-slate-500 mt-1">Last updated: January 2025</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">

        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-amber-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            By placing an order with Fancy Cakes Patisserie you agree to the following terms and conditions.
            Please read them carefully before completing your purchase.
          </p>
        </div>

        {sections.map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-base font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{body}</p>
          </div>
        ))}

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          For questions about these terms please contact us at{' '}
          <a href="mailto:info@fancycakespatisserie.com" className="text-amber-600 hover:underline">
            info@fancycakespatisserie.com
          </a>
        </p>
      </div>
    </>
  )
}

export default function Terms() {
  return <DashboardLayout>{() => <TermsContent />}</DashboardLayout>
}
