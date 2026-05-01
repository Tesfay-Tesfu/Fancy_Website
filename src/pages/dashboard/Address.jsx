import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { MapPin, Pencil, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { updateCustomerAddress } from '../../services/woocommerce'

// ── localStorage helpers ──────────────────────────────────────────────────────
const saveAddressLocally = (type, data) =>
  localStorage.setItem(`customer_${type}`, JSON.stringify(data))

const loadAddressLocally = (type) => {
  try { return JSON.parse(localStorage.getItem(`customer_${type}`)) || null }
  catch { return null }
}

const emptyAddress = () => ({
  first_name: '', last_name: '', company: '',
  address_1: '', address_2: '', city: '',
  state: '', postcode: '', country: '', email: '', phone: '',
})

// ── Field configs ─────────────────────────────────────────────────────────────
const billingFields = [
  { name: 'first_name', label: 'First Name',      half: true },
  { name: 'last_name',  label: 'Last Name',       half: true },
  { name: 'company',    label: 'Company',         half: false },
  { name: 'email',      label: 'Email',           half: true },
  { name: 'phone',      label: 'Phone',           half: true },
  { name: 'address_1',  label: 'Address Line 1',  half: false },
  { name: 'address_2',  label: 'Address Line 2',  half: false },
  { name: 'city',       label: 'City',            half: true },
  { name: 'state',      label: 'State / County',  half: true },
  { name: 'postcode',   label: 'Postcode',        half: true },
  { name: 'country',    label: 'Country (ISO)',   half: true },
]

const shippingFields = [
  { name: 'first_name', label: 'First Name',      half: true },
  { name: 'last_name',  label: 'Last Name',       half: true },
  { name: 'company',    label: 'Company',         half: false },
  { name: 'address_1',  label: 'Address Line 1',  half: false },
  { name: 'address_2',  label: 'Address Line 2',  half: false },
  { name: 'city',       label: 'City',            half: true },
  { name: 'state',      label: 'State / County',  half: true },
  { name: 'postcode',   label: 'Postcode',        half: true },
  { name: 'country',    label: 'Country (ISO)',   half: true },
]

const REQUIRED = ['address_1', 'city', 'postcode', 'country']

// ── AddressCard ───────────────────────────────────────────────────────────────
function AddressCard({ type, userId, userDefaults }) {
  const isBilling = type === 'billing'
  const fields    = isBilling ? billingFields : shippingFields
  const title     = isBilling ? 'Billing Address' : 'Shipping Address'

  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [form, setForm] = useState(() => {
    const saved = loadAddressLocally(type)
    if (saved) return saved
    const base = emptyAddress()
    base.first_name = userDefaults.first_name || ''
    base.last_name  = userDefaults.last_name  || ''
    if (isBilling) base.email = userDefaults.email || ''
    return base
  })

  const hasData = !!(form.address_1 || form.city || form.postcode)

  const showToast = (kind, msg) => {
    setToast(kind); setToastMsg(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    const missing = REQUIRED.filter((k) => !form[k])
    if (missing.length) {
      showToast('error', 'Please fill in Address Line 1, City, Postcode and Country.')
      return
    }
    setSaving(true)
    try {
      await updateCustomerAddress(userId, isBilling ? { billing: form } : { shipping: form })
      saveAddressLocally(type, form)
      setEditing(false)
      showToast('success', `${title} saved successfully.`)
    } catch (err) {
      showToast('error', err.message || 'Failed to save address.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(loadAddressLocally(type) || emptyAddress())
    setEditing(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <MapPin size={17} className="text-amber-600" />
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
          >
            <Pencil size={13} />
            {hasData ? 'Update' : 'Add'}
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-6 mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm
          ${toast === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'}`}
        >
          {toast === 'success'
            ? <CheckCircle size={14} className="shrink-0" />
            : <AlertCircle size={14} className="shrink-0" />}
          {toastMsg}
        </div>
      )}

      <div className="p-6">
        {editing ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    {f.label}
                    {REQUIRED.includes(f.name) && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'}
                    name={f.name}
                    value={form[f.name] || ''}
                    onChange={handleChange}
                    placeholder={f.label}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800
                      placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30
                      focus:border-amber-400 transition"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold
                  text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving…' : 'Save Address'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium
                  text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition"
              >
                Cancel
              </button>
            </div>
          </>
        ) : hasData ? (
          <address className="not-italic space-y-1 text-sm text-slate-700 leading-relaxed">
            {(form.first_name || form.last_name) && (
              <p className="font-semibold text-slate-900">{form.first_name} {form.last_name}</p>
            )}
            {form.company   && <p className="text-slate-500">{form.company}</p>}
            {form.address_1 && <p>{form.address_1}</p>}
            {form.address_2 && <p>{form.address_2}</p>}
            <p>{[form.city, form.state, form.postcode].filter(Boolean).join(', ')}</p>
            {form.country   && <p className="uppercase tracking-wide text-xs text-slate-400">{form.country}</p>}
            {isBilling && form.email && <p className="pt-1 text-slate-500">{form.email}</p>}
            {isBilling && form.phone && <p className="text-slate-500">{form.phone}</p>}
          </address>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MapPin size={32} strokeWidth={1.5} className="mb-3 text-slate-200" />
            <p className="text-sm text-slate-400">No {type} address saved yet.</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700 transition"
            >
              + Add address
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function AddressContent({ user }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Addresses</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your billing and shipping addresses.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <AddressCard type="billing"  userId={user.id} userDefaults={user} />
        <AddressCard type="shipping" userId={user.id} userDefaults={user} />
      </div>
    </>
  )
}

export default function Address() {
  return <DashboardLayout>{(user) => <AddressContent user={user} />}</DashboardLayout>
}
