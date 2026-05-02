import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Check, MapPin, Truck,
  CreditCard, ClipboardList, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { getCart, clearCart } from '../utils/cart'
import usePageTitle from '../hooks/usePageTitle'
import {
  fetchShippingMethods, fetchPaymentGateways,
  placeOrder, updateCustomerAddress
} from '../services/woocommerce'

// ── helpers ───────────────────────────────────────────────────────────────────
const loadAddr = (type) => {
  try { return JSON.parse(localStorage.getItem(`customer_${type}`)) || null }
  catch { return null }
}
const saveAddr = (type, data) =>
  localStorage.setItem(`customer_${type}`, JSON.stringify(data))

const emptyAddr = (user = {}) => ({
  first_name: user.first_name || '', last_name: user.last_name || '',
  company: '', address_1: '', address_2: '',
  city: '', state: '', postcode: '',
  country: '', email: user.email || '', phone: '',
})

const REQUIRED_ADDR = ['first_name', 'last_name', 'address_1', 'city', 'postcode', 'country']

// ── wizard steps ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'shipping-address', label: 'Shipping Address', icon: MapPin },
  { id: 'shipping-method',  label: 'Shipping Method',  icon: Truck },
  { id: 'billing-address',  label: 'Billing Address',  icon: MapPin },
  { id: 'payment-method',   label: 'Payment Method',   icon: CreditCard },
  { id: 'summary',          label: 'Order Summary',    icon: ClipboardList },
]

// ── address form fields ───────────────────────────────────────────────────────
const SHIPPING_FIELDS = [
  { name: 'first_name', label: 'First Name',     half: true },
  { name: 'last_name',  label: 'Last Name',      half: true },
  { name: 'company',    label: 'Company',        half: false },
  { name: 'address_1',  label: 'Address Line 1', half: false },
  { name: 'address_2',  label: 'Address Line 2', half: false },
  { name: 'city',       label: 'City',           half: true },
  { name: 'state',      label: 'State / County', half: true },
  { name: 'postcode',   label: 'Postcode',       half: true },
  { name: 'country',    label: 'Country (ISO)',  half: true },
]

const BILLING_FIELDS = [
  { name: 'first_name', label: 'First Name',     half: true },
  { name: 'last_name',  label: 'Last Name',      half: true },
  { name: 'company',    label: 'Company',        half: false },
  { name: 'email',      label: 'Email',          half: true },
  { name: 'phone',      label: 'Phone',          half: true },
  { name: 'address_1',  label: 'Address Line 1', half: false },
  { name: 'address_2',  label: 'Address Line 2', half: false },
  { name: 'city',       label: 'City',           half: true },
  { name: 'state',      label: 'State / County', half: true },
  { name: 'postcode',   label: 'Postcode',       half: true },
  { name: 'country',    label: 'Country (ISO)',  half: true },
]

// ── AddressForm component ─────────────────────────────────────────────────────
function AddressForm({ fields, values, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            {f.label}
            {REQUIRED_ADDR.includes(f.name) && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type={f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'}
            name={f.name}
            value={values[f.name] || ''}
            onChange={onChange}
            placeholder={f.label}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800
              placeholder-slate-300 focus:outline-none focus:ring-2 transition
              ${errors?.[f.name]
                ? 'border-red-400 bg-red-50 focus:ring-red-200'
                : 'border-slate-200 focus:ring-amber-300/40 focus:border-amber-400'}`}
          />
          {errors?.[f.name] && (
            <p className="mt-1 text-xs text-red-500">{errors[f.name]}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Checkout component ───────────────────────────────────────────────────
export default function Checkout() {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [cart, setCart] = useState([])
  const [user, setUser] = useState(null)

  // Address state
  const [shippingAddr, setShippingAddr] = useState({})
  const [billingAddr,  setBillingAddr]  = useState({})
  const [sameAsShipping, setSameAsShipping] = useState(false)
  const [addrErrors, setAddrErrors] = useState({})

  // Methods state
  const [shippingMethods,  setShippingMethods]  = useState([])
  const [paymentGateways,  setPaymentGateways]  = useState([])
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [selectedPayment,  setSelectedPayment]  = useState(null)
  const [methodsLoading,   setMethodsLoading]   = useState(false)

  // Order state
  const [placing,      setPlacing]      = useState(false)
  const [orderError,   setOrderError]   = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (!userId) { navigate('/login'); return }

    const u = {
      id:         userId,
      first_name: localStorage.getItem('first_name') || '',
      last_name:  localStorage.getItem('last_name')  || '',
      email:      localStorage.getItem('email')      || '',
    }
    setUser(u)
    setCart(getCart())

    // Pre-fill addresses from localStorage or user defaults
    const savedShipping = loadAddr('shipping')
    const savedBilling  = loadAddr('billing')
    setShippingAddr(savedShipping || emptyAddr(u))
    setBillingAddr(savedBilling   || emptyAddr(u))
  }, [navigate])

  // ── fetch methods when reaching those steps ───────────────────────────────
  useEffect(() => {
    if (step === 1 && shippingMethods.length === 0) {
      setMethodsLoading(true)
      fetchShippingMethods()
        .then((data) => { setShippingMethods(data); if (data[0]) setSelectedShipping(data[0]) })
        .catch(() => {})
        .finally(() => setMethodsLoading(false))
    }
    if (step === 3 && paymentGateways.length === 0) {
      setMethodsLoading(true)
      fetchPaymentGateways()
        .then((data) => { setPaymentGateways(data); if (data[0]) setSelectedPayment(data[0]) })
        .catch(() => {})
        .finally(() => setMethodsLoading(false))
    }
  }, [step])

  // ── validation ────────────────────────────────────────────────────────────
  const validateAddress = (addr) => {
    const errs = {}
    REQUIRED_ADDR.forEach((k) => {
      if (!addr[k]?.trim()) errs[k] = 'This field is required.'
    })
    return errs
  }

  // ── navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    setAddrErrors({})

    if (step === 0) {
      const errs = validateAddress(shippingAddr)
      if (Object.keys(errs).length) { setAddrErrors(errs); return }
      // Persist shipping address
      saveAddr('shipping', shippingAddr)
      if (user?.id) updateCustomerAddress(user.id, { shipping: shippingAddr }).catch(() => {})
      if (sameAsShipping) {
        const merged = { ...shippingAddr, email: billingAddr.email, phone: billingAddr.phone }
        setBillingAddr(merged)
      }
    }

    if (step === 2) {
      const errs = validateAddress(billingAddr)
      if (Object.keys(errs).length) { setAddrErrors(errs); return }
      saveAddr('billing', billingAddr)
      if (user?.id) updateCustomerAddress(user.id, { billing: billingAddr }).catch(() => {})
    }

    if (step === 1 && !selectedShipping) return
    if (step === 3 && !selectedPayment)  return

    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setAddrErrors({})
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setPlacing(true)
    setOrderError(null)

    const lineItems = cart.map((item) => {
      const li = {
        product_id: item.product_id,
        quantity:   item.quantity,
      }
      if (item.variation_id) li.variation_id = item.variation_id
      if (item.variation_description) {
        li.meta_data = [{ key: 'variation_description', value: item.variation_description }]
      }
      return li
    })

    const payload = {
      payment_method:       selectedPayment?.id       || '',
      payment_method_title: selectedPayment?.title    || '',
      set_paid:             false,
      billing:              billingAddr,
      shipping:             shippingAddr,
      line_items:           lineItems,
      shipping_lines: selectedShipping ? [{
        method_id:    selectedShipping.method_id,
        method_title: selectedShipping.title || selectedShipping.method_id,
        total:        String(selectedShipping.settings?.cost?.value || '0'),
      }] : [],
      customer_id: user?.id ? parseInt(user.id) : 0,
    }

    try {
      const order = await placeOrder(payload)
      clearCart()
      setOrderSuccess(order)
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ── subtotal ──────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.total_price * i.quantity, 0)
  const shippingCost = parseFloat(selectedShipping?.settings?.cost?.value || 0)
  const total = subtotal + shippingCost

  // ── order success screen ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Order Placed!</h1>
            <p className="mt-2 text-slate-500">
              Thank you, <strong>{user?.first_name}</strong>! Your order{' '}
              <strong>#{orderSuccess.number || orderSuccess.id}</strong> has been received.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 w-full text-left space-y-2 text-sm">
            <p><span className="font-semibold text-slate-600">Order ID:</span> #{orderSuccess.id}</p>
            <p><span className="font-semibold text-slate-600">Status:</span> {orderSuccess.status}</p>
            <p><span className="font-semibold text-slate-600">Total:</span> £{parseFloat(orderSuccess.total).toFixed(2)}</p>
            <p><span className="font-semibold text-slate-600">Payment:</span> {orderSuccess.payment_method_title}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/shop" className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition">
              Continue Shopping
            </Link>
            <Link to="/dashboard/orders" className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              View Orders
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const done   = i < step
            const active = i === step
            const Icon   = s.icon
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">

                {/* Circle + label */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => done && setStep(i)}
                    disabled={!done}
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${done   ? 'bg-amber-500 border-amber-500 text-white cursor-pointer hover:bg-amber-600'  : ''}
                      ${active ? 'bg-white border-amber-500 text-amber-600 shadow-lg ring-4 ring-amber-100 scale-110' : ''}
                      ${!done && !active ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed' : ''}`}
                  >
                    {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </button>
                  <span className={`hidden sm:block text-xs font-semibold whitespace-nowrap transition-colors
                    ${active ? 'text-amber-600' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                    {s.label}
                  </span>
                </div>

                {/* Connector line between circles (not after last) */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 mb-5 sm:mb-[1.35rem] h-0.5 rounded-full overflow-hidden bg-slate-200">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: done ? '100%' : active ? '50%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile step label */}
        <p className="sm:hidden mt-3 text-center text-sm font-semibold text-amber-600">
          Step {step + 1} of {STEPS.length}: {STEPS[step].label}
        </p>
      </div>

      {/* Step card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 min-h-[400px] flex flex-col">

        <h2 className="text-xl font-extrabold text-slate-900 mb-1">{STEPS[step].label}</h2>
        <p className="text-sm text-slate-400 mb-6">
          {step === 0 && 'Where should we deliver your order?'}
          {step === 1 && 'Choose how you want your order delivered.'}
          {step === 2 && 'Enter your billing details.'}
          {step === 3 && 'Choose how you want to pay.'}
          {step === 4 && 'Review your order before placing it.'}
        </p>

        <div className="flex-1">

          {/* ── STEP 0: Shipping Address ── */}
          {step === 0 && (
            <div className="space-y-5">
              <AddressForm
                fields={SHIPPING_FIELDS}
                values={shippingAddr}
                onChange={(e) => setShippingAddr((p) => ({ ...p, [e.target.name]: e.target.value }))}
                errors={addrErrors}
              />
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 mt-2">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="h-4 w-4 accent-amber-600"
                />
                Use this address as my billing address too
              </label>
            </div>
          )}

          {/* ── STEP 1: Shipping Method ── */}
          {step === 1 && (
            <div>
              {methodsLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-amber-500" />
                  Loading shipping methods…
                </div>
              ) : shippingMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <Truck size={32} strokeWidth={1.5} className="text-slate-200" />
                  <p className="text-sm">No shipping methods available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map((method) => {
                    const cost = method.settings?.cost?.value
                    const isSelected = selectedShipping?.instance_id === method.instance_id
                    return (
                      <label
                        key={method.instance_id}
                        className={`flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all
                          ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={isSelected}
                          onChange={() => setSelectedShipping(method)}
                          className="accent-amber-600 h-4 w-4 shrink-0"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{method.title || method.method_id}</p>
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-amber-600' : 'text-slate-600'}`}>
                          {cost && parseFloat(cost) > 0 ? `£${parseFloat(cost).toFixed(2)}` : 'Free'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Billing Address ── */}
          {step === 2 && (
            <div className="space-y-5">
              {sameAsShipping && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Pre-filled from your shipping address. You can edit below.
                </div>
              )}
              <AddressForm
                fields={BILLING_FIELDS}
                values={billingAddr}
                onChange={(e) => setBillingAddr((p) => ({ ...p, [e.target.name]: e.target.value }))}
                errors={addrErrors}
              />
            </div>
          )}

          {/* ── STEP 3: Payment Method ── */}
          {step === 3 && (
            <div>
              {methodsLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-amber-500" />
                  Loading payment methods…
                </div>
              ) : paymentGateways.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <CreditCard size={32} strokeWidth={1.5} className="text-slate-200" />
                  <p className="text-sm">No payment methods available.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentGateways.map((gw) => {
                    const isSelected = selectedPayment?.id === gw.id
                    return (
                      <label
                        key={gw.id}
                        className={`flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all
                          ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={isSelected}
                          onChange={() => setSelectedPayment(gw)}
                          className="accent-amber-600 h-4 w-4 shrink-0 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{gw.title}</p>
                          {gw.description && (
                            <p className="text-xs text-slate-400 mt-0.5"
                              dangerouslySetInnerHTML={{ __html: gw.description }} />
                          )}
                        </div>
                        {gw.icon && (
                          <img src={gw.icon} alt={gw.title} className="h-6 object-contain" />
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Summary ── */}
          {step === 4 && (
            <div className="space-y-6">

              {/* Items */}
              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Items</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.name}</p>
                        {item.variation_description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.variation_description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800 shrink-0">
                        £{(item.total_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Addresses */}
              <div className="grid sm:grid-cols-2 gap-4">
                <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Truck size={13} /> Shipping Address
                  </h3>
                  <AddressSummary addr={shippingAddr} />
                </section>
                <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <CreditCard size={13} /> Billing Address
                  </h3>
                  <AddressSummary addr={billingAddr} />
                </section>
              </div>

              {/* Methods */}
              <div className="grid sm:grid-cols-2 gap-4">
                <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Shipping Method</h3>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedShipping?.title || selectedShipping?.method_id || '—'}
                  </p>
                  <p className="text-sm text-amber-600 font-bold">
                    {shippingCost > 0 ? `£${shippingCost.toFixed(2)}` : 'Free'}
                  </p>
                </section>
                <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Payment Method</h3>
                  <p className="text-sm font-semibold text-slate-800">{selectedPayment?.title || '—'}</p>
                </section>
              </div>

              {/* Totals */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingCost > 0 ? `£${shippingCost.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-amber-600">£{total.toFixed(2)}</span>
                </div>
              </section>

              {/* Order error */}
              {orderError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0" />
                  {orderError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold
              text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold
                text-white hover:bg-amber-700 transition shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold
                text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
            >
              {placing && <Loader2 size={15} className="animate-spin" />}
              {placing ? 'Placing Order…' : '🎂 Place Order'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

// ── small helper to display a saved address ───────────────────────────────────
function AddressSummary({ addr }) {
  if (!addr?.address_1) return <p className="text-xs text-slate-400">Not provided</p>
  return (
    <address className="not-italic text-sm text-slate-700 space-y-0.5 leading-relaxed">
      {(addr.first_name || addr.last_name) && (
        <p className="font-semibold">{addr.first_name} {addr.last_name}</p>
      )}
      {addr.company   && <p className="text-slate-400 text-xs">{addr.company}</p>}
      {addr.address_1 && <p>{addr.address_1}</p>}
      {addr.address_2 && <p>{addr.address_2}</p>}
      <p>{[addr.city, addr.state, addr.postcode].filter(Boolean).join(', ')}</p>
      {addr.country   && <p className="text-xs text-slate-400 uppercase">{addr.country}</p>}
      {addr.email     && <p className="text-xs text-slate-400 pt-0.5">{addr.email}</p>}
      {addr.phone     && <p className="text-xs text-slate-400">{addr.phone}</p>}
    </address>
  )
}
