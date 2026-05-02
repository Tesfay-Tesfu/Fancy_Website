import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, Heart, Phone, Mail } from 'lucide-react';
import logo from '../assets/fancy_logo_v3.png';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSearchSuggestions } from '../services/woocommerce';
import { getCartCount } from '../utils/cart';
import { getWishlistCount } from '../utils/wishlist';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount());
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.slug}`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await fetchSearchSuggestions(value);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Sync cart count on mount and whenever cart-updated fires
  useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);

  // Sync wishlist count
  useEffect(() => {
    const sync = () => setWishlistCount(getWishlistCount());
    window.addEventListener('wishlist-updated', sync);
    return () => window.removeEventListener('wishlist-updated', sync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('user_id');
    const firstName = localStorage.getItem('first_name');
    if (userId && firstName) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">

      {/* Top info bar */}
      <div className="bg-amber-950 text-amber-100 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+12407978542" className="flex items-center gap-1.5 hover:text-white transition">
              <Phone size={12} />
              +1 240-797-8542
            </a>
            <a href="mailto:info@fancycake.com" className="hidden sm:flex items-center gap-1.5 hover:text-white transition">
              <Mail size={12} />
              info@fancycake.com
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 text-amber-300">
            <span>Mon–Fri: 9am–5pm</span>
            <span className="text-amber-700">|</span>
            <span>Sat: 10am–6pm</span>
          </div>
        </div>
      </div>

      <header className="w-full bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 hover:bg-amber-50 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-3 cursor-pointer">
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <img
                src={logo}
                alt="FANCY CAKES PATISSERIE"
                className="h-14 w-14 md:h-14 md:w-14 rounded-xl shadow-sm"
              />
              <h1 className="text-xl md:text-2xl font-bold text-amber-950 whitespace-nowrap">
                FANCY CAKES PATISSERIE
              </h1>
            </Link>
          </div>
        </div>

        {/* CENTER: Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6 relative" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400 group-focus-within:text-amber-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              placeholder="Search cakes, cupcakes..."
              className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-full transition"
            >
              <Search size={14} />
            </button>
          </form>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  >
                    <img
                      src={product.images?.[0]?.src || 'https://via.placeholder.com/40'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-500">${product.price}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Link to="/shop" className="px-3 py-2 hover:bg-amber-50 rounded-full">Shop</Link>
            <Link to="/delivery" className="px-3 py-2 hover:bg-amber-50 rounded-full">Delivery Map</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-1">

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:bg-amber-50 rounded-full">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* User */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  navigate('/dashboard/profile');
                } else {
                  navigate('/login');
                }
              }}
              className="p-2 hover:bg-amber-50 rounded-full flex items-center gap-2"
            >
              <User size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-amber-50 rounded-full">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* CTA */}
            <button className="hidden md:block ml-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
              onClick={() => navigate('/shop')}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-amber-100 bg-white px-4 py-4 space-y-4 animate-fadeIn">

          {/* Mobile Search */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                placeholder="Search..."
                className="w-full pl-9 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded-full transition"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-1"></div>
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full text-left p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    >
                      <img
                        src={product.images?.[0]?.src || 'https://via.placeholder.com/32'}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">${product.price}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link to="/shop" className="py-2 px-3 hover:bg-amber-50 rounded-lg">Shop</Link>
            <Link to="/delivery" className="py-2 px-3 hover:bg-amber-50 rounded-lg">Delivery</Link>
            <Link to="/about" className="py-2 px-3 hover:bg-amber-50 rounded-lg">About</Link>
            <Link to="/faqs" className="py-2 px-3 hover:bg-amber-50 rounded-lg">FAQs</Link>
            <a href="#" className="py-2 px-3 hover:bg-amber-50 rounded-lg">Contact</a>
          </nav>

          {/* CTA */}
          <button className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold">
            Order Now 🍰
          </button>
        </div>
      )}
    </header>
    </div>
  );
}

export default Header;