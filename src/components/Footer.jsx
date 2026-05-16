import { useState } from 'react';
import { Phone, Clock, Mail, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/fancy_logo.jpeg';

const quickLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/ordering-guide', label: 'Ordering Guide' },
  { to: '/delivery', label: 'Delivery Areas' },
  { to: '/return-policy', label: 'Return & Refund Policy' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
]

// Collapsible section for mobile
function FooterSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-amber-900 md:border-none">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-4 md:py-0 md:cursor-default md:pointer-events-none"
      >
        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{title}</h4>
        <span className="md:hidden text-amber-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <div className={`pb-4 md:pb-0 md:block ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  )
}

function Footer() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="bg-black text-amber-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-10">

          {/* Brand + Contact — always visible */}
          <div className="py-6 md:py-0 border-b border-amber-900 md:border-none space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Fancy Cakes Patisserie" className="h-12 w-12 rounded-lg object-contain bg-white p-0.5 shadow-md shrink-0" />
              <span className="text-base font-bold text-white leading-tight">FANCY CAKES<br />PATISSERIE</span>
            </Link>

            <p className="text-sm text-amber-200/80 leading-relaxed">
              Freshly baked cakes crafted with love. Order online and enjoy fast delivery.
            </p>

            <div className="space-y-2 text-sm">
              <a href="tel:+12407978542" className="flex items-center gap-2 hover:text-white transition">
                <Phone size={15} className="shrink-0" /> +1 240-531-2733
              </a>
              <a href="mailto:info@fancycake.com" className="flex items-center gap-2 hover:text-white transition">
                <Mail size={15} className="shrink-0" /> fancycakesbyselam@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={15} className="shrink-0 mt-0.5" />
                <span>9332 Georgia Ave, Silver Spring, MD 20910</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <FooterSection title="Opening Hours">
            <ul className="text-sm text-amber-200/80 space-y-2">
              <li className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-amber-400" /> Monday: Closed</li>
              <li className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-amber-400" /> Tue- Sat: 10:00 am – 7:00 pm</li>
              <li className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-amber-400" /> Sunday: 11:00 am - 6:00 pm</li>
            </ul>
            <button onClick={() => navigate('/shop')}
              className="mt-4 w-40 bg-amber-500 hover:bg-amber-400 text-white py-2.5 rounded-xl text-sm font-semibold transition">
              Order Now 🍰
            </button>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection title="Quick Links">
            <ul className="space-y-2 text-sm text-amber-200/80">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white hover:pl-1 block transition-all">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Newsletter */}
          <FooterSection title="Stay Updated">
            <p className="text-sm text-amber-200/80 mb-3">
              Subscribe for offers & new cakes 🎂
            </p>
            {subscribed ? (
              <div className="rounded-xl bg-amber-800/50 border border-amber-700 px-4 py-3 text-sm text-amber-200 text-center">
                ✓ Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 border border-amber-800 text-white
                    placeholder-amber-400/60 text-sm focus:outline-none focus:border-amber-500 transition"
                />
                <button type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition shrink-0">
                  Subscribe
                </button>
              </form>
            )}
            {/* Social */}
            <div className="flex gap-4 pt-6">
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">TikTok</a>
            </div>
          </FooterSection>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 border-t border-amber-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-300">

          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Fancy Cakes Patisserie. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/faqs" className="hover:text-white transition">FAQs</Link>
            <Link to="/return-policy" className="hover:text-white transition">Returns</Link>
          </div>

          <p className="text-amber-500/70 text-center">
            Developed by{' '}
            <a href="https://afromerica.org" target="_blank" rel="noreferrer"
              className="text-amber-400 hover:text-white font-semibold transition">
              Afro-Merica
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
