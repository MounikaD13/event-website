import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Menu, X, ChevronDown, LogOut, User, Calendar } from 'lucide-react';

const commonLinks = [
  { name: 'Business', path: '/business' },
  { name: 'Weddings', path: '/weddings' },
  { name: 'Milestones', path: '/milestones' },
  { name: 'About', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

const adminLinks = [
  ...commonLinks,
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Manage Events', path: '/admin/events' },
  { name: 'Users', path: '/admin/users' },
];

const userLinks = [
  ...commonLinks,
  { name: 'My Bookings', path: '/booking' },
];

const publicLinks = [
  ...commonLinks,
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

  const currentLinks = isAuthenticated
    ? user?.role === 'admin'
      ? adminLinks
      : userLinks
    : publicLinks;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
        ? 'bg-[#1A1C1B]/95 backdrop-blur-md border-white/10 shadow-lg py-5 lg:py-6'
        : 'bg-[#1A1C1B]/60 backdrop-blur-md border-white/10 py-8 lg:py-10'
        }`}
    >
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-16 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img src="/logo.svg" alt="Elysium Logo" className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-['Playfair_Display'] text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] text-white uppercase transition-all duration-300">
              ELYSIUM
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-center gap-x-8 xl:gap-x-12 flex-1 mx-12">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white font-['Playfair_Display'] text-[15px] md:text-[16px] lg:text-[18px] hover:text-[#C1A27B] transition-all duration-300 whitespace-nowrap flex items-center gap-1.5"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Auth */}
          <div className="hidden lg:flex items-center justify-end shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 flex items-center gap-2 font-['Playfair_Display'] transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[15px] md:text-[16px] tracking-wider uppercase">Sign Out</span>
                </button>
                <div className="flex items-center gap-3 px-5 py-2.5 border border-white/40 rounded-full hover:bg-white/10 transition-all text-white cursor-default">
                  <div className="w-8 h-8 rounded-full bg-[#C1A27B] flex items-center justify-center">
                    <span className="text-[15px] font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-[15px] md:text-[16px]">{user?.name}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-white/30 pl-10 mr-8 md:mr-10">
                <Link
                  to="/signin"
                  className="text-white font-['Playfair_Display'] tracking-[0.15em] text-[13px] md:text-[14px] uppercase hover:text-[#C1A27B] transition-all duration-300 w-[120px] md:w-[130px] h-[44px] md:h-[48px]  border-white/20 rounded-md hover:border-[#C1A27B]/50  flex items-center justify-center leading-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                >
                  LOGIN
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white"
          >
            {mobileOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden bg-white ${mobileOpen ? 'max-h-[600px] border-t mt-3' : 'max-h-0'
          }`}
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="text-gray-800 font-['Playfair_Display'] text-lg md:text-xl py-3.5 border-b border-gray-100 transition-all hover:text-[#C1A27B]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 text-red-500 font-['Playfair_Display'] text-base md:text-lg py-3 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/signin" className="text-gray-600 font-['Playfair_Display'] text-lg md:text-xl text-center font-bold py-5 px-10 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-widest">LOGIN</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
