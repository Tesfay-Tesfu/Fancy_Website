import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'

const ADDRESS   = '9332 Georgia Avenue, Silver Spring, MD 20910'
const MAPS_URL  = 'https://www.google.com/maps/search/?api=1&query=9332+Georgia+Avenue+Silver+Spring+MD+20910'
const EMBED_URL = 'https://maps.google.com/maps?q=9332+Georgia+Avenue,+Silver+Spring,+MD+20910&t=&z=15&ie=UTF8&iwloc=&output=embed'

const info = [
  {
    icon: MapPin,
    label: 'Address',
    value: ADDRESS,
    href: MAPS_URL,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 240-531-2733',
    href: 'tel:+12405312733',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'fancycakesbyselam@gmail.com',
    href: 'mailto:fancycakesbyselam@gmail.com',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Monday: Closed, Tue–Sat 10am–7pm , Sunday 11am–6pm',
    href: null,
  },
]

export default function LocationMap() {
  return (
    <section className="py-10">

      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Find Us</h2>
        <p className="mt-1 text-sm text-slate-500">
          Visit our bakery or place your order online for delivery.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Map embed */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-md bg-slate-100 min-h-[320px]">
          <iframe
            title="Fancy Cakes Patisserie location"
            src={EMBED_URL}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '320px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full absolute inset-0"
          />

          {/* Open in Google Maps button */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2
              text-xs font-semibold text-slate-700 shadow-md hover:bg-amber-600 hover:text-white transition z-10"
          >
            <ExternalLink size={12} />
            Open in Maps
          </a>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-4">
          {info.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                <Icon size={18} className="text-amber-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="text-sm font-medium text-slate-800 hover:text-amber-600 transition wrap-break-word"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Directions CTA */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3
              text-sm font-semibold text-white hover:bg-amber-700 transition shadow-sm mt-auto"
          >
            <MapPin size={16} />
            Get Directions
          </a>
        </div>
      </div>
    </section>
  )
}
