import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, MapPin, Package, Heart, Star, FileText, RotateCcw, LogOut, ChevronRight
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      navigate('/login')
      return
    }
    setUser({
      id: userId,
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      first_name: localStorage.getItem('first_name') || 'Guest',
      last_name: localStorage.getItem('last_name') || 'User',
    })
  }, [navigate])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const getInitials = () => `${user?.first_name?.[0]}${user?.last_name?.[0]}`

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'address', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
  ]

  if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading your profile...</div>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR */}
          <aside className="lg:col-span-3 space-y-6">
            {/* PROFILE CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl ring-4 ring-indigo-50">
                {getInitials()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-slate-800 truncate">{user.first_name} {user.last_name}</h3>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* NAVIGATION */}
            <nav className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </button>
                  )
                })}
              </div>
              
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

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {menuItems.find(i => i.id === activeSection)?.label}
              </h1>
              <p className="text-slate-500 mt-1">Manage your {activeSection} settings below.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 min-h-[500px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Package size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No content available</h3>
              <p className="text-slate-500 mt-2 max-w-sm">
                We are currently building the {activeSection} section. Check back later for updates.
              </p>
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}

export default Dashboard