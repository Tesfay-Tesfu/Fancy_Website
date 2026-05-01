import DashboardLayout from '../../components/DashboardLayout'
import { RotateCcw, Mail } from 'lucide-react'

function ReturnsContent() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Returns & Refunds</h1>
        <p className="text-sm text-slate-500 mt-1">Our returns and refund policy.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100">

        {/* Policy summary */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <RotateCcw size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Return Policy</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              As our products are freshly baked to order, we are unable to accept returns on food items
              unless they arrive damaged or are incorrect.
            </p>
            <p>
              If you have received a damaged, incorrect, or unsatisfactory product, please contact us
              within <strong className="text-slate-800">24 hours</strong> of delivery with photos and
              your order number.
            </p>
            <p>
              Refunds are processed within <strong className="text-slate-800">5–7 business days</strong> back
              to your original payment method once approved.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail size={20} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Contact Support</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            To raise a return or refund request, please email us with your order details.
          </p>
          <a
            href="mailto:support@fancycakespatisserie.com"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <Mail size={15} />
            Email Support
          </a>
        </div>
      </div>
    </>
  )
}

export default function Returns() {
  return <DashboardLayout>{() => <ReturnsContent />}</DashboardLayout>
}
