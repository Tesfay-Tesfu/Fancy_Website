import { useEffect, useState, useCallback, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { fetchCustomerOrders } from '../../services/woocommerce'
import {
  Package, Search, ChevronLeft, ChevronRight,
  X, RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  Clock, CheckCircle2, XCircle, Truck, RotateCcw,
  AlertCircle, Loader2
} from 'lucide-react'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'any',        label: 'All Orders' },
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'on-hold',    label: 'On Hold' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'refunded',   label: 'Refunded' },
  { value: 'failed',     label: 'Failed' },
]

const STATUS_STYLES = {
  pending:    { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200', icon: Clock },
  processing: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   icon: RefreshCw },
  'on-hold':  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200', icon: AlertCircle },
  completed:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  icon: CheckCircle2 },
  cancelled:  { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',  icon: XCircle },
  refunded:   { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200', icon: RotateCcw },
  failed:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    icon: XCircle },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: Package }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize
      ${s.bg} ${s.text} ${s.border}`}>
      <Icon size={11} strokeWidth={2.5} />
      {status.replace('-', ' ')}
    </span>
  )
}

// ── Order row (expandable) ────────────────────────────────────────────────────
function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(order.date_created).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all">

      {/* Header row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition text-left"
      >
        {/* Order number */}
        <div className="shrink-0 w-20">
          <p className="text-xs text-slate-400 font-medium">Order</p>
          <p className="text-sm font-bold text-slate-800">#{order.number || order.id}</p>
        </div>

        {/* Date */}
        <div className="shrink-0 w-28 hidden sm:block">
          <p className="text-xs text-slate-400 font-medium">Date</p>
          <p className="text-sm text-slate-700">{date}</p>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>

        {/* Items summary */}
        <div className="flex-1 min-w-0 hidden md:block">
          <p className="text-xs text-slate-400 font-medium">Items</p>
          <p className="text-sm text-slate-600 truncate">
            {order.line_items?.map((i) => i.name).join(', ') || '—'}
          </p>
        </div>

        {/* Total */}
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-400 font-medium">Total</p>
          <p className="text-sm font-bold text-slate-900">
            {order.currency_symbol || '£'}{parseFloat(order.total).toFixed(2)}
          </p>
        </div>

        {/* Expand icon */}
        <div className="shrink-0 text-slate-400 ml-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 bg-slate-50 space-y-5">

          {/* Line items */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Items Ordered</h4>
            <div className="space-y-2">
              {order.line_items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 p-3">
                  <img
                    src={item.image?.src || 'https://via.placeholder.com/48'}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    {item.meta_data?.filter(m => !m.key.startsWith('_')).map((m) => (
                      <p key={m.id} className="text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-500">{m.display_key}:</span> {m.display_value}
                      </p>
                    ))}
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 shrink-0">
                    {order.currency_symbol || '£'}{parseFloat(item.total).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses + totals */}
          <div className="grid sm:grid-cols-3 gap-4">

            {/* Shipping address */}
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Truck size={11} /> Shipping
              </h4>
              <address className="not-italic text-xs text-slate-600 space-y-0.5 leading-relaxed">
                <p className="font-semibold text-slate-800">{order.shipping?.first_name} {order.shipping?.last_name}</p>
                {order.shipping?.address_1 && <p>{order.shipping.address_1}</p>}
                {order.shipping?.address_2 && <p>{order.shipping.address_2}</p>}
                <p>{[order.shipping?.city, order.shipping?.state, order.shipping?.postcode].filter(Boolean).join(', ')}</p>
                {order.shipping?.country && <p className="uppercase text-slate-400">{order.shipping.country}</p>}
              </address>
            </div>

            {/* Payment */}
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Payment</h4>
              <p className="text-xs font-semibold text-slate-700">{order.payment_method_title || '—'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {order.date_paid
                  ? `Paid on ${new Date(order.date_paid).toLocaleDateString('en-GB')}`
                  : 'Not yet paid'}
              </p>
            </div>

            {/* Order totals */}
            <div className="rounded-xl bg-white border border-slate-100 p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Totals</h4>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{order.currency_symbol || '£'}{parseFloat(order.subtotal || order.total).toFixed(2)}</span>
                </div>
                {order.shipping_lines?.[0] && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.currency_symbol || '£'}{parseFloat(order.shipping_lines[0].total || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Total</span>
                  <span>{order.currency_symbol || '£'}{parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Orders page ──────────────────────────────────────────────────────────
function OrdersContent({ user }) {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [total,       setTotal]       = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [page,        setPage]        = useState(1)
  const [status,      setStatus]      = useState('any')
  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchRef = useRef(null)
  const PER_PAGE = 10

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchCustomerOrders({
        customerId: user.id,
        page,
        perPage: PER_PAGE,
        status,
        search,
      })
      setOrders(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, page, status, search])

  useEffect(() => { load() }, [load])

  // Debounced search — wait 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleStatusChange = (val) => {
    setStatus(val)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
    searchRef.current?.focus()
  }

  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const to   = Math.min(page * PER_PAGE, total)

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">
          {total > 0 ? `${total} order${total !== 1 ? 's' : ''} found` : 'View and track all your orders.'}
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number or product…"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
              placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative shrink-0">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="appearance-none w-full sm:w-44 pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm
              text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Refresh */}
        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm
            font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Active filters chips ── */}
      {(status !== 'any' || search) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {status !== 'any' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200
              px-3 py-1 text-xs font-semibold text-amber-700">
              Status: {STATUS_OPTIONS.find(o => o.value === status)?.label}
              <button onClick={() => handleStatusChange('any')} className="hover:text-amber-900">
                <X size={11} />
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200
              px-3 py-1 text-xs font-semibold text-slate-600">
              Search: "{search}"
              <button onClick={clearSearch} className="hover:text-slate-900">
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin text-amber-500" />
          <p className="text-sm">Loading your orders…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <button
            onClick={load}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-20 w-20 rounded-full bg-amber-50 flex items-center justify-center">
            <Package size={36} strokeWidth={1.5} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {search || status !== 'any' ? 'No orders match your filters' : 'No orders yet'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {search || status !== 'any'
                ? 'Try adjusting your search or filter.'
                : 'When you place an order it will appear here.'}
            </p>
          </div>
          {(search || status !== 'any') && (
            <button
              onClick={() => { clearSearch(); handleStatusChange('any') }}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-xs text-slate-400 mb-3">
            Showing {from}–{to} of {total} order{total !== 1 ? 's' : ''}
          </p>

          {/* Order list */}
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm
                  font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} /> Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 w-8 rounded-lg text-sm font-semibold transition
                          ${p === page
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm
                  font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default function Orders() {
  return <DashboardLayout>{(user) => <OrdersContent user={user} />}</DashboardLayout>
}
