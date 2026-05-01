import DashboardLayout from '../../components/DashboardLayout'
import { Star } from 'lucide-react'

function ReviewsContent() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Reviews you've left on products.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
          <Star size={36} strokeWidth={1.5} className="text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No reviews yet</h3>
        <p className="text-slate-400 mt-2 max-w-sm text-sm">
          After purchasing a product you can leave a review. Your feedback helps other customers.
        </p>
      </div>
    </>
  )
}

export default function Reviews() {
  return <DashboardLayout>{() => <ReviewsContent />}</DashboardLayout>
}
