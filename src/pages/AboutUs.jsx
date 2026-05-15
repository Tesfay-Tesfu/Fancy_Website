import usePageTitle from '../hooks/usePageTitle'
import { Heart, Award, Users, Cake } from 'lucide-react'
import { Link } from 'react-router-dom'

const values = [
  { icon: Heart,  title: 'Made with Love',     desc: 'Every cake is handcrafted with care, using only the finest ingredients sourced locally where possible.' },
  { icon: Award,  title: 'Quality First',       desc: 'We never compromise on quality. From the sponge to the final decoration, every detail matters.' },
  { icon: Users,  title: 'Community Focused',   desc: 'We are proud to be part of the local community, supporting events, celebrations, and milestones.' },
  { icon: Cake,   title: 'Custom Creations',    desc: 'No two cakes are the same. We work closely with each customer to bring their vision to life.' },
]

const team = [
  { name: 'Sarah Johnson',  role: 'Head Pastry Chef',     initial: 'SJ', color: 'bg-pink-100 text-pink-700' },
  { name: 'Marcus Lee',     role: 'Cake Designer',         initial: 'ML', color: 'bg-blue-100 text-blue-700' },
  { name: 'Amara Osei',     role: 'Flavour Specialist',    initial: 'AO', color: 'bg-amber-100 text-amber-700' },
  { name: 'Priya Sharma',   role: 'Customer Experience',   initial: 'PS', color: 'bg-green-100 text-green-700' },
]

export default function AboutUs() {
  usePageTitle('About Us')
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Hero */}
      <div className="mb-14 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
          Our Story
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
          Baked with Passion,<br />Delivered with Love
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-slate-500 leading-relaxed">
          Fancy Cakes Patisserie was founded with one simple belief — that every celebration deserves a cake as special as the moment itself. What started as a home kitchen hobby has grown into a beloved local bakery trusted by thousands of families.
        </p>
      </div>

      {/* Story section */}
      <div className="grid gap-8 lg:grid-cols-2 mb-16 items-center">
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
          <p>
            Our journey began in 2018 when our founder, Selam, started baking custom birthday cakes for friends and family. Word spread quickly — not just about the taste, but about the artistry and attention to detail that went into every creation.
          </p>
          <p>
            By 2018 we had opened our first dedicated kitchen, and today we serve hundreds of customers each month across the local area and beyond. From intimate birthday cakes to elaborate multi-tier wedding centrepieces, we pour the same love into every order.
          </p>
          <p>
            We believe great cake starts with great ingredients. We source our butter, eggs, and cream locally, and we never use artificial flavourings or preservatives. What you taste is real — real butter, real vanilla, real fruit.
          </p>
        </div>
        <div className="rounded-3xl bg-amber-50 border border-amber-100 p-8 text-center space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '2018', label: 'Founded' },
              { value: '5,000+', label: 'Cakes Made' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '100%', label: 'Handmade' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl bg-white border border-amber-100 p-4 shadow-sm">
                <p className="text-2xl font-extrabold text-amber-700">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">What We Stand For</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Icon size={22} className="text-amber-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Meet the Team</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map(({ name, role, initial, color }) => (
            <div key={name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center space-y-3">
              <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center text-2xl font-extrabold ${color}`}>
                {initial}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-black text-white p-10 text-center space-y-4">
        <h2 className="text-2xl font-extrabold">Ready to order your dream cake?</h2>
        <p className="text-amber-200 text-sm max-w-md mx-auto">Browse our full collection or get in touch to discuss a custom creation.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/shop" className="rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-bold transition">
            Shop Now
          </Link>
          <a href="mailto:fancycakesbyselam@gmail.com " className="rounded-full border border-amber-700 hover:border-amber-500 px-6 py-2.5 text-sm font-bold text-amber-200 hover:text-white transition">
            Contact Us
          </a>
        </div>
      </div>
    </main>
  )
}
