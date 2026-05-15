import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Check, MapPin, Truck,
  CreditCard, ClipboardList, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { getCart, clearCart } from '../utils/cart'
import usePageTitle from '../hooks/usePageTitle'
import { secureGet } from '../utils/secureStorage'
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
  { name: 'postcode',   label: 'Zipcode',       half: true },
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
  { name: 'postcode',   label: 'Zipcode',       half: true },
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

// ── DeliveryDatePicker component ─────────────────────────────────────────────
function DeliveryDatePicker({ deliveryDate, setDeliveryDate, label = 'Preferred Delivery Date', hint = 'We need at least 24 hours notice.' }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="mt-5 rounded-2xl border-2 border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">📅</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label} <span className="text-red-500">*</span></p>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>
      <input
        type="date"
        value={deliveryDate}
        min={minDate}
        max={maxDateStr}
        onChange={(e) => setDeliveryDate(e.target.value)}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800
          focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition
          ${!deliveryDate ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
      />
      {!deliveryDate && (
        <p className="text-xs text-red-500">⚠ Please select a preferred delivery date to continue.</p>
      )}
      {deliveryDate && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Delivery requested for{' '}
          {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-GB', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
          })}
        </p>
      )}
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
  const [deliveryDate,     setDeliveryDate]      = useState('')  // ISO date string
  const [postcode,         setPostcode]          = useState('')  // for hand delivery

  // Custom order note fields
  const [orderNote, setOrderNote] = useState({
    birthdayName:    '',
    birthdayDate:    '',
    cakeMessage:     '',
    specialRequests: '',
  })

  // Order state
  const [placing,      setPlacing]      = useState(false)
  const [orderError,   setOrderError]   = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = secureGet('fcp_user_id')
    if (!userId) { navigate('/login'); return }

    const u = {
      id:         userId,
      first_name: secureGet('fcp_first_name') || '',
      last_name:  secureGet('fcp_last_name')  || '',
      email:      secureGet('fcp_email')      || '',
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
    if (step === 1 && selectedShipping) {
      const title = (selectedShipping.title || selectedShipping.method_id || '').toLowerCase()
      const isPickup   = title.includes('pickup') || title.includes('pick up') || title.includes('collection')
      const isDelivery = !isPickup
      // Date required only for Store Pickup
      if (isPickup && !deliveryDate) return
      // Postcode required only for Hand Delivery
      if (isDelivery && !postcode.trim()) return
    }
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
      // total_price already includes addon amounts (set in SingleProduct handleAddToCart)
      const lineTotal    = (item.total_price * item.quantity).toFixed(2)
      const lineSubtotal = lineTotal

      const li = {
        product_id: item.product_id,
        quantity:   item.quantity,
        subtotal:   lineSubtotal,
        total:      lineTotal,
      }
      if (item.variation_id) li.variation_id = item.variation_id

      // Build meta_data: variation description + addon breakdown
      const meta = []
      if (item.variation_description) {
        meta.push({ key: 'variation_description', value: item.variation_description })
      }
      // Store the per-unit price so the admin can see the addon-inclusive price
      meta.push({ key: '_unit_price_with_addons', value: String(item.total_price) })
      if (meta.length) li.meta_data = meta

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
      // Store requested delivery date as order meta and customer note
      meta_data: [
        ...(deliveryDate          ? [{ key: '_requested_delivery_date', value: deliveryDate }]                    : []),
        ...(postcode              ? [{ key: '_delivery_postcode',       value: postcode }]                        : []),
        ...(orderNote.birthdayName ? [{ key: '_birthday_name',          value: orderNote.birthdayName }]          : []),
        ...(orderNote.birthdayDate ? [{ key: '_birthday_date',          value: orderNote.birthdayDate }]          : []),
        ...(orderNote.cakeMessage  ? [{ key: '_cake_message',           value: orderNote.cakeMessage }]           : []),
        ...(orderNote.specialRequests ? [{ key: '_special_requests',    value: orderNote.specialRequests }]       : []),
      ],
      customer_note: [
        deliveryDate          ? `Delivery/Pickup date: ${new Date(deliveryDate).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}` : '',
        orderNote.birthdayName ? `Birthday name: ${orderNote.birthdayName}` : '',
        orderNote.birthdayDate ? `Birthday date: ${orderNote.birthdayDate}` : '',
        orderNote.cakeMessage  ? `Cake message: ${orderNote.cakeMessage}`   : '',
        orderNote.specialRequests ? `Special requests: ${orderNote.specialRequests}` : '',
      ].filter(Boolean).join('\n') || '',
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
            <p><span className="font-semibold text-slate-600">Total:</span> ${parseFloat(orderSuccess.total).toFixed(2)}</p>
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
                <>
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
                            {cost && parseFloat(cost) > 0 ? `$${parseFloat(cost).toFixed(2)}` : 'Free'}
                          </span>
                        </label>
                      )
                    })}
                  </div>

                  {/* ── Method-specific info + date/postcode ── */}
                  {selectedShipping && (() => {
                    const title = (selectedShipping.title || selectedShipping.method_id || '').toLowerCase()
                    const isPickup   = title.includes('pickup') || title.includes('pick up') || title.includes('collection')
                    const isDelivery = !isPickup

                    return (
                      <div className="mt-5 space-y-4">

                        {/* Info banner */}
                        <div className={`rounded-2xl border-2 p-4 space-y-2
                          ${isPickup ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
                          <p className={`text-sm font-semibold ${isPickup ? 'text-blue-800' : 'text-amber-800'}`}>
                            {isPickup ? '🏪 Store Pickup Information' : '🚚 Hand Delivery Information'}
                          </p>
                          {isPickup ? (
                            <ul className="text-xs text-blue-700 space-y-1">
                              <li>• Pickup times: <strong>Monday – Friday 2pm – 4pm</strong></li>
                              <li>• Pickup times: <strong>Saturday 10am – 11am</strong></li>
                              <li>• Please bring your order confirmation email.</li>
                            </ul>
                          ) : (
                            <ul className="text-xs text-amber-700 space-y-1">
                              <li>• We deliver <strong>8am – 6pm, Tuesday – Saturday</strong></li>
                              <li>• We deliver <strong>8am – 2pm on Sundays</strong></li>
                              <li>• You'll receive a <strong>2-hour delivery slot</strong> by email the day before your delivery.</li>
                              <li>• Sadly, we're unable to take specific time requests.</li>
                            </ul>
                          )}
                        </div>

                        {/* Postcode field — hand delivery only */}
                        {isDelivery && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                              Delivery Postcode <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={postcode}
                              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                              placeholder="e.g. MD20 1AA"
                              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 uppercase
                                focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition
                                ${!postcode ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                            />
                            {!postcode && (
                              <p className="mt-1 text-xs text-red-500">⚠ Please enter your delivery postcode.</p>
                            )}
                          </div>
                        )}

                        {/* Date picker — only for Store Pickup */}
                        {isPickup && (
                          <DeliveryDatePicker
                            deliveryDate={deliveryDate}
                            setDeliveryDate={setDeliveryDate}
                            label="Preferred Pickup Date"
                            hint="Choose a date when we are open for pickup."
                          />
                        )}
                      </div>
                    )
                  })()}
                </>
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
                        ${(item.total_price * item.quantity).toFixed(2)}
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
                    {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}
                  </p>
                  {deliveryDate && (
                    <p className="text-xs text-slate-500 mt-1">
                      📅 {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  )}
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
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-amber-600">${total.toFixed(2)}</span>
                </div>
              </section>

              {/* ── Custom Order Note ── */}
              <section className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    🎂 Order Personalisation <span className="text-xs font-normal text-slate-400">(optional)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add any special details for your cake — these will be attached to your order.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Birthday / recipient name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Name on Cake / Recipient Name
                    </label>
                    <input
                      type="text"
                      value={orderNote.birthdayName}
                      onChange={(e) => setOrderNote((p) => ({ ...p, birthdayName: e.target.value }))}
                      placeholder="e.g. Happy Birthday Sarah"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800
                        placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition bg-white"
                    />
                  </div>

                  {/* Birthday / event date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Event / Birthday Date
                    </label>
                    <input
                      type="date"
                      value={orderNote.birthdayDate}
                      onChange={(e) => setOrderNote((p) => ({ ...p, birthdayDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800
                        focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition bg-white"
                    />
                  </div>
                </div>

                {/* Iced message / cake inscription */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Iced Message / Cake Inscription
                  </label>
                  <input
                    type="text"
                    value={orderNote.cakeMessage}
                    onChange={(e) => setOrderNote((p) => ({ ...p, cakeMessage: e.target.value }))}
                    placeholder="e.g. Happy 30th Birthday! 🎉"
                    maxLength={60}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800
                      placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition bg-white"
                  />
                  <p className="mt-1 text-xs text-slate-400 text-right">{orderNote.cakeMessage.length}/60 characters</p>
                </div>

                {/* Special requests */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Special Requests / Additional Notes
                  </label>
                  <textarea
                    value={orderNote.specialRequests}
                    onChange={(e) => setOrderNote((p) => ({ ...p, specialRequests: e.target.value }))}
                    rows={3}
                    placeholder="Any allergies, colour preferences, design requests, or other notes for our team…"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800
                      placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition resize-none bg-white"
                  />
                </div>

                {/* Summary of filled fields */}
                {(orderNote.birthdayName || orderNote.birthdayDate || orderNote.cakeMessage || orderNote.specialRequests) && (
                  <div className="rounded-xl bg-white border border-amber-200 px-4 py-3 space-y-1">
                    <p className="text-xs font-semibold text-amber-700 mb-1.5">📋 Order note preview:</p>
                    {orderNote.birthdayName    && <p className="text-xs text-slate-600">• Name: <strong>{orderNote.birthdayName}</strong></p>}
                    {orderNote.birthdayDate    && <p className="text-xs text-slate-600">• Event date: <strong>{new Date(orderNote.birthdayDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>}
                    {orderNote.cakeMessage     && <p className="text-xs text-slate-600">• Message: <strong>"{orderNote.cakeMessage}"</strong></p>}
                    {orderNote.specialRequests && <p className="text-xs text-slate-600">• Notes: <strong>{orderNote.specialRequests}</strong></p>}
                  </div>
                )}
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
