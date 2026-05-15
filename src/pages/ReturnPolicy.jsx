import usePageTitle from '../hooks/usePageTitle'
import { RotateCcw, Mail, Phone, Clock, AlertCircle, CheckCircle, XCircle, StickyNote } from 'lucide-react'

const sections = [
  {
    title: 'Allergen Notification for Nut Processing',
    icon: StickyNote,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    content: [
      'Nut Allergen Statement: Please be aware that our facility processes nuts and nut products. While we take every precaution to prevent cross-contamination, there is a risk of trace amounts of nuts in all of our products.',
      'Ingredient Labeling: All products containing nuts or nut-derived ingredients will be clearly labeled as such on our menu and packaging.',
      'Allergen Awareness: Our staff is trained to handle allergens safely and can provide information about specific allergens present in our products upon request.'

    ],
  },
  {
    title: 'Allergen Notification for Vegan and Egg-Free Options',
    icon: StickyNote,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    content: [
      'Vegan-Friendly Offerings: We are pleased to offer a variety of vegan options that do not contain any animal-derived ingredients, including dairy and eggs.',
      'Egg-Free Alternatives: Many of our products can be prepared without eggs upon request. Please inquire about egg-free options when placing your order.',
      'Ingredient Transparency: Our vegan and egg-free options are made with carefully selected ingredients to ensure both quality and taste. We prioritize using plant-based alternatives to achieve delicious and satisfying results.',
      'Cross-Contamination Mitigation: While we take measures to prevent cross-contamination during preparation, please note that our vegan and egg-free options are produced in the same facility as products containing nuts and other allergens.'
    ],
  },
  {
    title: 'Customer Awareness and Responsibility',
    icon: StickyNote,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    content: [
      'Allergy Disclosure: It is essential for customers with food allergies or dietary restrictions to inform our staff of their specific requirements when placing an order.',
      'Informed Choices: We encourage customers to review our menu and ingredient lists carefully and ask questions about any concerns regarding allergens or dietary preferences.',
      'Individual Risk Assessment: Customers with severe allergies should carefully consider the potential risk of cross-contamination and consult with our staff to determine the safest options for their needs.',
      'Contact Information: If you have any questions or require further information about our allergen policies or ingredient options, please feel free to contact us.'
    ],
  },
  {
    title: 'Refund and Cancellation Policy for Custom Cake Orders',
    icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    content: [
      'We take great pride in the quality and freshness of our products. In the unlikely event that you are unsatisfied with your order, please contact us immediately, and we will do our utmost to resolve the issue to your satisfaction. We understand that circumstances may arise that require changes to your custom cake order. Please review our refund and cancellation policy for custom cake orders below:'
    ],
  },
  {
    title: 'Cancellation Policy',
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    content: [
      'Cancellation Deadline: Custom cake orders can be canceled or modified up to a week before the scheduled pickup or delivery time.',
      'Cancellation Process: To cancel or modify your custom cake order, please contact us directly by phone or email as soon as possible. We will confirm the cancellation and discuss any applicable fees, if applicable.',
      'Late Cancellations: Cancellations made after the specified deadline may be subject to a cancellation fee. This fee covers any costs incurred in the preparation of your custom cake up to the point of cancellation.',

    ],
  },
  {
    title: 'Refund Policy',
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    content: [
      'Refund Eligibility: Refunds for canceled custom cake orders are subject to approval and may be issued at the discretion of our bakery.',
      'Full Refunds: If you cancel your custom cake order within the specified cancellation deadline (a week in advance), you may be eligible for a full refund of any payment made.',
      'Partial Refunds: In some cases, a partial refund may be issued for canceled custom cake orders, considering any costs already incurred in the preparation of your order.',
      'Refund Processing Time: Refunds for canceled custom cake orders will be processed within 3-5 business days to the original payment method.',
    ],
  },
  {
    title: 'Changes to Orders',
    icon: AlertCircle,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    content: [
      'Modification Deadline: Any modifications to your custom cake order, such as changes to design, flavor, or size, must be requested at least 5 days before the scheduled pickup or delivery time.',
      'Modification Process: To request changes to your custom cake order, please contact us directly. We will do our best to accommodate your requests, depending on our production schedule and availability of ingredients.',
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
      <div className="flex justify-center">
        <div className="space-y-5 text-center w-full max-w-2xl">
          {sections.map(({ title, icon: Icon, iconBg, iconColor, content }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                >
                  <Icon size={18} className={iconColor} />
                </div>
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
              </div>

              <ul className="space-y-2">
                {content.map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-center gap-2 text-sm text-slate-600 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-500" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Contact Support</h2>
        </div>

        <p className="text-sm text-slate-600 mb-4 max-w-md">
          If you have any questions or need to cancel or modify your custom cake order, please don’t hesitate to contact us:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <a
            href="mailto:support@fancycakespatisserie.com"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <Mail size={15} />
            fancycakesbyselam@gmail.com
          </a>

          <a
            href="tel:+12405312733"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
          >
            <Phone size={15} />
            +1 240-531-2733
          </a>
        </div>
      </div>
    </main>
  )
}
