import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import SingleProduct from './pages/SingleProduct'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import WishlistPage from './pages/Wishlist'
import DeliveryMap from './pages/DeliveryMap'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsPage from './pages/Terms'
import AboutUs from './pages/AboutUs'
import FAQs from './pages/FAQs'
import OrderingGuide from './pages/OrderingGuide'

// Dashboard sub-pages
import Profile        from './pages/dashboard/Profile'
import Address        from './pages/dashboard/Address'
import Orders         from './pages/dashboard/Orders'
import DashWishlist   from './pages/dashboard/Wishlist'
import Reviews        from './pages/dashboard/Reviews'
import Returns        from './pages/dashboard/Returns'
import DashTerms      from './pages/dashboard/Terms'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-slate-900">
        <Header />

        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/shop"                  element={<Shop />} />
          <Route path="/products/:productSlug" element={<SingleProduct />} />
          <Route path="/signup"                element={<Signup />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/cart"                  element={<Cart />} />
          <Route path="/checkout"              element={<Checkout />} />
          <Route path="/wishlist"              element={<WishlistPage />} />
          <Route path="/delivery"              element={<DeliveryMap />} />
          <Route path="/privacy-policy"        element={<PrivacyPolicy />} />
          <Route path="/terms"                 element={<TermsPage />} />
          <Route path="/about"                 element={<AboutUs />} />
          <Route path="/faqs"                  element={<FAQs />} />
          <Route path="/ordering-guide"        element={<OrderingGuide />} />

          {/* Dashboard — redirect /dashboard → /dashboard/profile */}
          <Route path="/dashboard"             element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="/dashboard/profile"     element={<Profile />} />
          <Route path="/dashboard/address"     element={<Address />} />
          <Route path="/dashboard/orders"      element={<Orders />} />
          <Route path="/dashboard/wishlist"    element={<DashWishlist />} />
          <Route path="/dashboard/reviews"     element={<Reviews />} />
          <Route path="/dashboard/returns"     element={<Returns />} />
          <Route path="/dashboard/terms"       element={<DashTerms />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
