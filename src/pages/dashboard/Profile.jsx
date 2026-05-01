import DashboardLayout from '../../components/DashboardLayout'
import { User, Mail, Phone, AtSign } from 'lucide-react'

function ProfileContent({ user }) {
  const fields = [
    { icon: User,    label: 'First Name',  value: user.first_name },
    { icon: User,    label: 'Last Name',   value: user.last_name },
    { icon: AtSign,  label: 'Username',    value: user.username },
    { icon: Mail,    label: 'Email',       value: user.email },
  ]

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your account information.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
          <div className="h-20 w-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-bold ring-4 ring-amber-50">
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">
              Active account
            </span>
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className="text-amber-600" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          To update your name, email or password please contact support.
        </p>
      </div>
    </>
  )
}

export default function Profile() {
  return <DashboardLayout>{(user) => <ProfileContent user={user} />}</DashboardLayout>
}
