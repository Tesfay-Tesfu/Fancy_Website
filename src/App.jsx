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

// Dashboard sub-pages
import Profile        from './pages/dashboard/Profile'
import Address        from './pages/dashboard/Address'
import Orders         from './pages/dashboard/Orders'
import DashWishlist   from './pages/dashboard/Wishlist'
import Reviews        from './pages/dashboard/Reviews'
import Returns        from './pages/dashboard/Returns'
import Terms          from './pages/dashboard/Terms'

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

          {/* Dashboard — redirect /dashboard → /dashboard/profile */}
          <Route path="/dashboard"             element={<Navigate to="/dashboard/profile" replace />} />
          <Route path="/dashboard/profile"     element={<Profile />} />
          <Route path="/dashboard/address"     element={<Address />} />
          <Route path="/dashboard/orders"      element={<Orders />} />
          <Route path="/dashboard/wishlist"    element={<DashWishlist />} />
          <Route path="/dashboard/reviews"     element={<Reviews />} />
          <Route path="/dashboard/returns"     element={<Returns />} />
          <Route path="/dashboard/terms"       element={<Terms />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
