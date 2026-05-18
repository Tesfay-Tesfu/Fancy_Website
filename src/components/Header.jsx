import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, Phone, Mail, LogOut, ChevronDown } from 'lucide-react';
import logo from '../assets/fancy_logo.jpeg';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSearchSuggestions } from '../services/woocommerce';
import { getCartCount, clearCart } from '../utils/cart';
import { getWishlistCount, clearWishlist } from '../utils/wishlist';
import { secureGet, secureRemove } from '../utils/secureStorage';

function Header() {
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [suggestions,   setSuggestions]   = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [isSearching,   setIsSearching]   = useState(false);
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [firstName,     setFirstName]     = useState('');
  const [cartCount,     setCartCount]     = useState(getCartCount());
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount());
  const navigate        = useNavigate();
  const searchTimeoutRef = useRef(null);
  const dropdownRef      = useRef(null);

  // ── Search handlers ──────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.slug}`);
    setShowDropdown(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await fetchSearchSuggestions(value);
          setSuggestions(results);
          setShowDropdown(true);
        } catch { setSuggestions([]); }
        finally { setIsSearching(false); }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearCart();
    clearWishlist();
    secureRemove('fcp_user_id');
    secureRemove('fcp_username');
    secureRemove('fcp_email');
    secureRemove('fcp_first_name');
    secureRemove('fcp_last_name');
    secureRemove('fcp_billing');
    secureRemove('fcp_shipping');
    setIsLoggedIn(false);
    setFirstName('');
    setIsMenuOpen(false);
    navigate('/');
  };

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);

  useEffect(() => {
    const sync = () => setWishlistCount(getWishlistCount());
    window.addEventListener('wishlist-updated', sync);
    return () => window.removeEventListener('wishlist-updated', sync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userId = secureGet('fcp_user_id');
    const fn     = secureGet('fcp_first_name');
    setIsLoggedIn(!!(userId && fn));
    setFirstName(fn || '');
  }, []);

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [navigate]);

  // ── Search dropdown (shared) ─────────────────────────────────────────────
  const SearchDropdown = () => (
    showDropdown ? (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-2" />
            Searching…
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((product) => (
            <button key={product.id} onClick={() => handleSuggestionClick(product)}
              className="w-full text-left p-3 hover:bg-amber-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3">
              <img src={product.images?.[0]?.src || 'https://via.placeholder.com/40'}
                alt={product.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                <p className="text-xs text-amber-600 font-semibold">${product.price}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
        )}
      </div>
    ) : null
  );

  return (
    <div className="sticky top-0 z-50 w-full">

      {/* ── Top info bar ── */}
      <div className="bg-black text-amber-100 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 gap-2">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <a href="tel:+12407978542" className="flex items-center gap-1.5 hover:text-white transition">
              <Phone size={12} />
              +1 240-531-2733
            </a>
            <a href="mailto:info@fancycake.com"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition">
              <Mail size={11} />
              fancycakesbyselam@gmail.com
            </a>
          </div>
          <div className="hidden md:flex items-center gap-3 text-amber-300 shrink-0">
            <span>Monday: Closed</span>
            <span className="text-amber-700">|</span>
            <span>Tue - Sat: 10:00 am – 7:00 pm</span>
            <span>Sunday:11:00 am - 6:00 pm</span>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-3 gap-3">

          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="md:hidden p-2 hover:bg-amber-50 rounded-lg shrink-0 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src={logo} alt="Fancy Cakes Patisserie"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-contain shadow-sm shrink-0 bg-white p-0.5" />
              <span className="hidden sm:block text-base md:text-xl font-bold text-amber-950 leading-tight truncate">
                FANCY CAKES PATISSERIE
              </span>
            </Link>
          </div>

          {/* CENTER: Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={handleInputChange}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                placeholder="Search cakes, cupcakes…"
                className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm
                  focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-full transition">
                <Search size={13} />
              </button>
            </form>
            <SearchDropdown />
          </div>

          {/* RIGHT: Nav + Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium mr-1">
              <Link to="/"     className="px-3 py-2 hover:bg-amber-50 rounded-full transition">Home</Link>
              <Link to="/shop"     className="px-3 py-2 hover:bg-amber-50 rounded-full transition">Shop</Link>
              <Link to="/delivery" className="px-3 py-2 hover:bg-amber-50 rounded-full transition">Delivery</Link>
              <Link to="/about"    className="px-3 py-2 hover:bg-amber-50 rounded-full transition">About</Link>
            </nav>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-amber-50 rounded-full transition">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* User */}
            <button
              onClick={() => navigate(isLoggedIn ? '/dashboard/profile' : '/login')}
              className="p-2 hover:bg-amber-50 rounded-full transition flex items-center gap-1"
              title={isLoggedIn ? firstName : 'Sign in'}
            >
              <User size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-amber-50 rounded-full transition">
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Order Now CTA (desktop) */}
            <button
              onClick={() => navigate('/shop')}
              className="hidden md:block ml-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition">
              Order Now
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-100 bg-white px-4 py-4 space-y-4">

            {/* Mobile search */}
            <div className="relative" ref={dropdownRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={handleInputChange}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                  placeholder="Search cakes…"
                  className="w-full pl-9 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                <button type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 text-white p-1.5 rounded-full">
                  <Search size={13} />
                </button>
              </form>
              <SearchDropdown />
            </div>

            {/* Mobile nav links */}
            <nav className="grid grid-cols-2 gap-2 text-sm font-medium">
              {[
                 { to: '/',              label: '🏠 Home' },
                { to: '/shop',           label: '🛍 Shop' },
                { to: '/delivery',       label: '🚚 Delivery' },
                { to: '/about',          label: '🎂 About Us' },
                { to: '/faqs',           label: '❓ FAQs' },
                { to: '/ordering-guide', label: '📋 Ordering Guide' },
                { to: '/cart',           label: '🛒 Cart' + (cartCount > 0 ? ` (${cartCount})` : '') },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-amber-50 rounded-xl text-slate-700 hover:text-amber-700 transition text-center">
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth section */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard/profile" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 py-2.5 px-3 bg-amber-50 rounded-xl text-amber-800 font-medium text-sm">
                    <User size={16} />
                    Hi, {firstName}
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-medium text-sm transition">
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl border border-amber-300 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Order Now */}
            <button onClick={() => { navigate('/shop'); setIsMenuOpen(false); }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm transition">
              Order Now 🍰
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default Header;
