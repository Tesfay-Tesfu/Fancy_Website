import usePageTitle from '../hooks/usePageTitle'
import { FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using any part of our services, including but not limited to browsing our website, placing orders, or interacting with our staff, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our services.`,
  },
  {
    title: '2. Ordering and Payment',
    body: `Order Placement: All orders placed through our website, over the phone, or in person are subject to acceptance by our bakery.
Payment: Payment for orders must be made in full at the time of placing the order. We accept payment via Clover. Prices for products and services are listed in us dollar and are subject to change without prior notice.`,
  },
  {
    title: '3. Order Fulfillment and Availability',
    body: `Product Availability: While we strive to maintain accurate inventory levels, some products may become unavailable due to unforeseen circumstances. In such cases, we reserve the right to cancel or modify your order and provide a suitable alternative or refund.
Delivery Times: Our delivery times are estimates and may vary depending on factors such as order volume, traffic conditions, and weather. We will make every effort to deliver your order within the specified time frame but cannot guarantee exact delivery times.`,
  },
  {
    title: '4.  Cancellations and Refunds',
    body: `Cancellation Policy: Please refer to our specific cancellation policy for custom cake orders as outlined in our Refund and Cancellation Policy.
Refunds: Refunds for canceled orders will be processed according to our Refund Policy, as outlined in our Refund and Cancellation Policy.`,
  },
  {
    title: '5. Quality Assurance',
    body: `Product Quality: We take pride in the quality and freshness of our products. If you are unsatisfied with your order for any reason, please contact us immediately, and we will do our best to resolve the issue to your satisfaction.
      Allergen Disclaimer: Please review our allergen notification regarding nut processing and vegan/egg-free options to ensure that our products meet your dietary needs and preferences.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All content included on our website, such as text, graphics, logos, images, and software, is the property of Fancy cakes and patisserie by Selam and is protected by copyright laws. You may not reproduce, distribute, or use any content from our website without prior written permission.`,
  },
  {
    title: '7. Privacy Policy',
    body: `Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and disclose your personal information.`,
  },
  {
    title: '8. Changes to Terms of Service',
    body: `We reserve the right to update or modify these Terms of Service at any time without prior notice. Any changes will be effective immediately upon posting on our website. It is your responsibility to review these terms periodically for changes.`,
  },
  {
    title: '9. Product Liability',
    body: `Once any product leaves our bakery premises and is in the possession of the customer or designated recipient, [Fancy Cakes and patisserie by Selam] relinquishes responsibility for any damage incurred thereafter. We do not assume liability for any damage, spoilage, or mishandling of products once they have been delivered or collected by the customer. It is the customer’s responsibility to handle and store the products appropriately upon receipt to maintain their quality and integrity. Claims for damaged products must be made promptly upon receipt, and we will make every effort to address such issues to the best of our ability within the scope of our policies.`,
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
      <div className="space-y-6 text-center">
        {sections.map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
        <p className="text-sm text-slate-700">Questions about these terms?</p>

        <a
          href="mailto:info@fancycake.com"
          className="mt-2 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800 transition"
        >
          info@fancycake.com
        </a>

        <div className="mt-2">
          <a
            href="tel:+12405312733"
            className="inline-block text-sm font-semibold text-amber-700 hover:text-amber-800 transition"
          >
            +1 240-531-2733
          </a>
        </div>
      </div>
    </main>
  )
}
