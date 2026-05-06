import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  User, MapPin, Package, Heart, Star,
  FileText, RotateCcw, LogOut, ChevronRight
} from 'lucide-react'
import usePageTitle from '../hooks/usePageTitle'
import { clearCart } from '../utils/cart'
import { clearWishlist } from '../utils/wishlist'
import { secureGet, secureRemove } from '../utils/secureStorage'

const menuItems = [
  { path: '/dashboard/profile',  label: 'My Profile',        icon: User },
  { path: '/dashboard/address',  label: 'Addresses',          icon: MapPin },
  { path: '/dashboard/orders',   label: 'Order History',      icon: Package },
  { path: '/dashboard/wishlist', label: 'Wishlist',            icon: Heart },
  { path: '/dashboard/reviews',  label: 'My Reviews',         icon: Star },
  { path: '/dashboard/returns',  label: 'Returns & Refunds',  icon: RotateCcw },
  { path: '/dashboard/terms',    label: 'Terms of Service',   icon: FileText },
]

export default function DashboardLayout({ children }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Set page title from current menu item
  const currentMenu = menuItems.find((m) => m.path === location.pathname)
  usePageTitle(currentMenu ? `${currentMenu.label} — Account` : 'My Account')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userId = secureGet('fcp_user_id')
    if (!userId) { navigate('/login'); return }
    setUser({
      id:         userId,
      username:   secureGet('fcp_username')   || '',
      email:      secureGet('fcp_email')      || '',
      first_name: secureGet('fcp_first_name') || 'Guest',
      last_name:  secureGet('fcp_last_name')  || 'User',
    })
  }, [navigate])

  const handleLogout = () => {
    clearCart()
    clearWishlist()
    secureRemove('fcp_user_id')
    secureRemove('fcp_username')
    secureRemove('fcp_email')
    secureRemove('fcp_first_name')
    secureRemove('fcp_last_name')
    secureRemove('fcp_billing')
    secureRemove('fcp_shipping')
    navigate('/login')
  }
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : '?'

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Loading…
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── SIDEBAR ── */}
          <aside className="lg:col-span-3 space-y-5">

            {/* Avatar card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl ring-4 ring-amber-50">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
              <ul className="space-y-1">
                {menuItems.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path ||
                    (path === '/dashboard/profile' && location.pathname === '/dashboard')
                  return (
                    <li key={path}>
                      <Link
                        to={path}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                          ${active
                            ? 'bg-amber-50 text-amber-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                          {label}
                        </span>
                        {active && <ChevronRight size={16} />}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ── PAGE CONTENT ── */}
          <main className="lg:col-span-9">
            {/* Pass user down via context-like prop cloning */}
            {children(user)}
          </main>

        </div>
      </div>
    </div>
  )
}
