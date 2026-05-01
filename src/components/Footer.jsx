import logo from '../assets/fancy_logo_v3.png';
import { Phone, Clock, Mail, MapPin } from 'lucide-react';
import { useNavigate } from "react-router-dom";

function Footer() {
    const navigate = useNavigate();
    return (
        <footer className="bg-amber-950 text-amber-100">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                {/* Top Section */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand + Contact */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Nano Bake House" className="h-14 w-14 rounded-xl shadow-md" />
                            <h2 className="text-xl font-bold text-white">FANCY CAKES PATISSERIE</h2>
                        </div>

                        <p className="text-sm text-amber-200/80">
                            Freshly baked cakes crafted with love. Order online and enjoy fast delivery.
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Phone size={18} />
                                <span className="text-sm">+1 240-797-8542</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={18} />
                                <span className="text-sm">info@fancycake.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} />
                                <span className="text-sm">7513, Maple Ave</span>
                            </div>
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                            <Clock size={16} /> Opening Hours
                        </h4>
                        <ul className="text-sm text-amber-200/80 space-y-1">
                            <li>Mon - Fri: 9am – 5pm</li>
                            <li>Saturday: 10am – 6pm</li>
                            <li>Sunday: Closed</li>
                        </ul>

                        <div className="mt-4">
                            <button
                                onClick={() => navigate("/shop")}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition"
                            >
                                Order Now 🍰

                            </button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-amber-200/80">
                            <li><a href="#" className="hover:text-white transition">Signature Cakes</a></li>
                            <li><a href="#" className="hover:text-white transition">Wedding Cakes</a></li>
                            <li><a href="#" className="hover:text-white transition">Cupcakes</a></li>
                            <li><a href="#" className="hover:text-white transition">Custom Orders</a></li>
                            <li><a href="#" className="hover:text-white transition">Track Order</a></li>
                        </ul>
                    </div>

                    {/* Newsletter + Social */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Stay Updated
                        </h4>

                        <p className="text-sm text-amber-200/80">
                            Subscribe for offers & new cakes 🎂
                        </p>

                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full px-3 py-2 rounded-l-lg bg-white text-black outline-none border border-gray-300 focus:border-amber-500"
                            />
                            <button className="bg-amber-500 hover:bg-amber-600 px-4 rounded-r-lg">
                                Subscribe
                            </button>
                        </div>

                        {/* Social */}
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-white transition">Instagram</a>
                            <a href="#" className="hover:text-white transition">Facebook</a>
                            <a href="#" className="hover:text-white transition">TikTok</a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-10 border-t border-amber-900 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-amber-300">

                    <p>© {new Date().getFullYear()} Nano Bake House. All rights reserved.</p>

                    <div className="flex gap-4 mt-2 md:mt-0">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;