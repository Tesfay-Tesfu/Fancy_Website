import { useState } from 'react'
import { MapPin, Truck, Clock, CheckCircle, XCircle, Search, Info, ChevronDown, ChevronUp } from 'lucide-react'
import deliveryMap from '../assets/delivery_map.jpeg'
import usePageTitle from '../hooks/usePageTitle'

// ── Delivery zones data ───────────────────────────────────────────────────────
const ZONES = [
  {
    id: 'zone1',
    name: 'Zone 1 — Local Delivery',
    color: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 border-green-200',
    fee: '$20',
    eta: 'Same day / Next day',
    postcodes: [
      'MD20', 'MD21', 'MD22', 'MD23', 'MD24', 'MD25',
      'MD26', 'MD27', 'MD28', 'MD29', 'MD30',
    ],
  },
  {
    id: 'zone2',
    name: 'Zone 2 — Extended Delivery',
    color: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    fee: '$30.00',
    eta: '1–2 days',
    postcodes: [
      'MD10', 'MD11', 'MD12', 'MD13', 'MD14', 'MD15',
      'MD16', 'MD17', 'MD18', 'MD19',
      'VA10', 'VA11', 'VA12', 'VA13',
    ],
  },
  {
    id: 'zone3',
    name: 'Zone 3 — Maximum Delivery Range',
    color: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    fee: '$50.00',
    eta: '2–3 days',
    postcodes: [
      'DC10', 'DC11', 'DC12', 'DC13', 'DC14',
      'VA20', 'VA21', 'VA22', 'VA23', 'VA24',
      'MD40', 'MD41', 'MD42',
    ],
  },
]

// Flatten all postcodes for lookup
const ALL_POSTCODES = ZONES.flatMap((z) =>
  z.postcodes.map((p) => ({ postcode: p.toUpperCase(), zone: z }))
)

// ── PostcodeChecker ───────────────────────────────────────────────────────────
function PostcodeChecker() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null) // null | { found: bool, zone? }

  const check = () => {
    const val = input.trim().toUpperCase()
    if (!val) return
    // Match by prefix (first 4–5 chars)
    const match = ALL_POSTCODES.find((p) =>
      val.startsWith(p.postcode) || p.postcode.startsWith(val)
    )
    setResult(match ? { found: true, zone: match.zone } : { found: false })
  }

  const handleKey = (e) => { if (e.key === 'Enter') check() }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={18} className="text-amber-600" />
        <h2 className="text-base font-bold text-slate-900">Check Your Postcode</h2>
      </div>
      <p className="text-sm text-slate-500">Enter your postcode to see if we deliver to your area.</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null) }}
            onKeyDown={handleKey}
            placeholder="e.g. MD20, VA12…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
              placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition"
          />
        </div>
        <button
          onClick={check}
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition shrink-0"
        >
          Check
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm
          ${result.found
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-700'}`}>
          {result.found
            ? <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
            : <XCircle size={16} className="shrink-0 mt-0.5 text-red-500" />}
          <div>
            {result.found ? (
              <>
                <p className="font-semibold">Great news! We deliver to <span className="uppercase">{input.trim()}</span>.</p>
                <p className="mt-0.5 text-xs text-green-700">
                  {result.zone.name} · Delivery fee: <strong>{result.zone.fee}</strong> · ETA: {result.zone.eta}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">Sorry, we don't currently deliver to <span className="uppercase">{input.trim()}</span>.</p>
                <p className="mt-0.5 text-xs text-red-600">Please contact us to discuss options.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── ZoneAccordion ─────────────────────────────────────────────────────────────
function ZoneAccordion({ zone }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full shrink-0 ${zone.color}`} />
          <span className="text-sm font-semibold text-slate-800">{zone.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${zone.badge}`}>
            {zone.fee}
          </span>
          {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
            <Clock size={13} /> Estimated delivery: <strong className="text-slate-700">{zone.eta}</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {zone.postcodes.map((p) => (
              <span key={p} className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-mono font-medium text-slate-700 shadow-sm">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DeliveryMap() {
  usePageTitle('Delivery Areas')
  const [mapZoomed, setMapZoomed] = useState(false)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Hero header */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
          <Truck size={13} /> Delivery Information
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Our Delivery Areas</h1>
        <p className="mt-3 max-w-xl mx-auto text-slate-500 text-sm leading-relaxed">
          We deliver freshly baked cakes across the local area. Check the map and postcode list below
          to see if we cover your location.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: MapPin,  label: 'Delivery Zones',  value: ZONES.length },
          { icon: Truck,   label: 'Postcodes Covered', value: ALL_POSTCODES.length + '+' },
          { icon: Clock,   label: 'Fastest Delivery', value: 'Same Day' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <Icon size={20} className="mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* LEFT — Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Delivery Map</h2>
            <button
              onClick={() => setMapZoomed(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition"
            >
              <Search size={13} /> View full size
            </button>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-md bg-slate-100 cursor-zoom-in"
            onClick={() => setMapZoomed(true)}>
            <img
              src={deliveryMap}
              alt="Delivery coverage map"
              className="w-full h-auto object-cover transition duration-300 hover:scale-105"
            />
            {/* Zone legend overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
              {ZONES.map((z) => (
                <div key={z.id} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${z.color}`} />
                  {z.name.split('—')[0].trim()}
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>Delivery areas are approximate. If your postcode isn't listed, please <a href="mailto:info@fancycake.com" className="underline font-medium">contact us</a> — we may still be able to help.</p>
          </div>
        </div>

        {/* RIGHT — Checker + Zones */}
        <div className="space-y-5">

          {/* Postcode checker */}
          <PostcodeChecker />

          {/* Delivery info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <Truck size={20} className="mx-auto mb-1.5 text-amber-600" />
              <p className="text-xs font-bold text-slate-800">Free Delivery</p>
              <p className="text-xs text-slate-500 mt-0.5">On orders over $50</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <Clock size={20} className="mx-auto mb-1.5 text-amber-600" />
              <p className="text-xs font-bold text-slate-800">Order by 2pm</p>
              <p className="text-xs text-slate-500 mt-0.5">For same-day delivery</p>
            </div>
          </div>

          {/* Zone accordions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Postcodes by Zone</h3>
            {ZONES.map((zone) => (
              <ZoneAccordion key={zone.id} zone={zone} />
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-amber-600 p-5 text-white text-center space-y-2">
            <p className="font-bold text-base">Not in our delivery area?</p>
            <p className="text-xs text-amber-100">We offer collection from our bakery. Place your order online and pick it up fresh!</p>
            <a href="/shop"
              className="inline-block mt-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition">
              Order for Collection
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen map modal */}
      {mapZoomed && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setMapZoomed(false)}>
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMapZoomed(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition"
              >
                ✕ Close
              </button>
              <img
                src={deliveryMap}
                alt="Delivery coverage map — full size"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </>
      )}
    </main>
  )
}
