import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Menu, X, ChevronDown, LogOut, User, Calendar } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/#about' },
  { name: 'Destinations', path: '/events#destinations' },
  { name: 'Gallery', path: '/events' },
  { name: 'Services', path: '/#services' },
  { name: 'Contact Us', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
          ? 'bg-[#4A4F4D]/90 backdrop-blur-md border-[#4A4F4D] shadow-sm py-5 lg:py-7'
          : 'bg-[#4A4F4D]/30 backdrop-blur-md border-white/10 py-10 lg:py-14'
        }`}
    >
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <span className="font-['Playfair_Display'] text-xl md:text-2xl lg:text-3xl tracking-[0.2em] text-white uppercase transition-all duration-300">
              OVERSEAS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-center gap-x-8 xl:gap-x-12 flex-1 mx-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white font-['Playfair_Display'] text-[13px] md:text-[14px] lg:text-[15px] hover:text-[#C1A27B] transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {link.name}
                {link.name === 'Destinations' && <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Auth */}
          <div className="hidden lg:flex items-center justify-end shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-full hover:bg-white/10 transition-all text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-[#C1A27B] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/booking"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-[#C1A27B] hover:bg-gray-50 transition-all mx-1"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Calendar className="w-4 h-4" />
                      My Bookings
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-all mx-1 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-white/30 pl-6">
                {/* User requirement: "user should get signin ONLY AFTER the signup"
                        So we only boldly offer Sign Up here. Navigating to Sign Up directly.
                    */}
                <Link
                  to="/signup"
                  className="text-white font-['Playfair_Display'] tracking-widest text-[13px] md:text-[14px] lg:text-[15px] uppercase hover:text-[#C1A27B] transition-all duration-300 px-10 py-3 border border-white/20 rounded-full hover:border-[#C1A27B]/50 whitespace-nowrap"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  SIGN UP NOW
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden bg-white ${mobileOpen ? 'max-h-[500px] border-t mt-3' : 'max-h-0'
          }`}
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-800 font-['Playfair_Display'] text-base md:text-lg py-3 border-b border-gray-100 transition-all"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-red-500 font-['Playfair_Display'] text-base md:text-lg py-2">Sign Out</button>
            ) : (
              <Link to="/signup" className="text-[#C1A27B] font-['Playfair_Display'] text-base md:text-lg font-bold py-2 block">SIGN UP NOW</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
