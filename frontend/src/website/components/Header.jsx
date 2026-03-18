import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Twitter,
    Facebook,
    Instagram,
    MapPin,
    Mail,
    Clock,
    Menu,
    X
} from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';

const PinterestIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.377-.293 1.189-.332 1.348-.051.21-.169.255-.389.153-1.455-.675-2.364-2.802-2.364-4.504 0-3.666 2.664-7.033 7.676-7.033 4.032 0 7.158 2.872 7.158 6.707 0 4.004-2.522 7.226-6.023 7.226-1.177 0-2.282-.611-2.661-1.333l-.723 2.752c-.261 1.006-.97 2.268-1.442 3.033 1.055.326 2.17.502 3.329.502 6.622 0 11.988-5.366 11.988-11.987S18.639 0 12.017 0z" />
    </svg>
);

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const NavLink = ({ label, to, active = false }) => (
        <Link
            to={to}
            onClick={() => setIsMenuOpen(false)}
            className={`text-[12px] md:text-[13px] font-semibold tracking-widest transition-colors ${active ? 'text-[#FF5A2D]' : 'text-[#64748B] hover:text-[#FF5A2D]'}`}
        >
            {label}
        </Link>
    );

    return (
        <header className="w-full font-['Roboto'] sticky top-0 z-[100] shadow-md bg-white">
            {/* TOP BAR - Hidden on small devices */}
            <div className="hidden lg:flex h-[35px] w-full items-center overflow-hidden">
                <div className="bg-[#FF5A2D] h-full px-6 flex items-center space-x-5 text-white">
                    <Twitter size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Facebook size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                    <PinterestIcon size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Instagram size={15} className="cursor-pointer hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 bg-[#091E3E] h-full flex items-center justify-between px-6 text-white text-[12px] font-medium tracking-wide">
                    <div className="flex items-center space-x-2">
                        <Clock size={13} className="text-[#FF5A2D]" />
                        <span className="opacity-90">Mon to Sat: 9.00 am - 3.00 pm</span>
                    </div>
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-2">
                            <MapPin size={13} className="text-[#FF5A2D]" />
                            <span className="opacity-90">Banka Bihar - 813102</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail size={13} className="text-[#FF5A2D]" />
                            <span className="opacity-90">info@littleseeds.org.in</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN NAVIGATION BAR */}
            <div className="h-[60px] md:h-[60px] w-full bg-white flex items-center justify-between px-6 md:px-10 border-b border-gray-50">
                {/* Logo */}
                <div className="flex items-center">
                    <img
                        src={logoImg}
                        alt="Little Seeds"
                        onClick={() => navigate('/')}
                        className="h-[36px] md:h-[48px] cursor-pointer"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Logo'; }}
                    />
                </div>

                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center space-x-8">
                    <NavLink label="HOME" to="/" active={location.pathname === '/'} />
                    <NavLink label="ABOUT US" to="/about" active={location.pathname === '/about'} />
                    <NavLink label="PROGRAMS" to="/programs" active={location.pathname === '/programs'} />
                    <NavLink label="GALLERY" to="/gallery" active={location.pathname === '/gallery'} />
                    <NavLink label="FAQS" to="/faq" active={location.pathname === '/faq'} />
                    <NavLink label="EVENTS" to="/events" active={location.pathname === '/events'} />
                    <NavLink label="CONTACT" to="/contact" active={location.pathname === '/contact'} />
                </nav>

                {/* Desktop Buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="px-5 py-2 border border-[#FF5A2D] text-[#FF5A2D] rounded-[4px] text-[12px] font-semibold tracking-widest hover:bg-[#FF5A2D] hover:text-white transition-all"
                    >
                        PARENT LOGIN
                    </button>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="px-5 py-[9px] bg-[#091E3E] text-white rounded-[4px] text-[12px] font-semibold tracking-widest hover:bg-[#0C2A54] transition-all"
                    >
                        TEACHER LOGIN
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-[#091E3E]"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Sidebar/Menu */}
            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[60px] md:top-[68px] bg-white z-[90] animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col p-8 space-y-6">
                        <NavLink label="HOME" to="/" active={location.pathname === '/'} />
                        <NavLink label="ABOUT US" to="/about" active={location.pathname === '/about'} />
                        <NavLink label="PROGRAMS" to="/programs" active={location.pathname === '/programs'} />
                        <NavLink label="GALLERY" to="/gallery" active={location.pathname === '/gallery'} />
                        <NavLink label="FAQS" to="/faq" active={location.pathname === '/faq'} />
                        <NavLink label="EVENTS" to="/events" active={location.pathname === '/events'} />
                        <NavLink label="CONTACT" to="/contact" active={location.pathname === '/contact'} />

                        <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
                            <button
                                onClick={() => { navigate('/admin/login'); setIsMenuOpen(false); }}
                                className="w-full py-3 border border-[#FF5A2D] text-[#FF5A2D] rounded-[4px] text-[12px] font-bold tracking-widest"
                            >
                                PARENT LOGIN
                            </button>
                            <button
                                onClick={() => { navigate('/admin/login'); setIsMenuOpen(false); }}
                                className="w-full py-3 bg-[#091E3E] text-white rounded-[4px] text-[12px] font-bold tracking-widest"
                            >
                                TEACHER LOGIN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
