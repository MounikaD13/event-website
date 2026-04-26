import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Menu, X, LogOut, User, LayoutDashboard, Settings, Calendar } from 'lucide-react';

/* ─── Link configs by role ─── */
const publicLinks = [
  { name: 'Events', path: '/events' },
  { name: 'About', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

const userLinks = [
  { name: 'Events', path: '/events' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Dashboard', path: '/dashboard' },
];

const adminLinks = [
  { name: 'Events', path: '/events' },
  // { name: 'Contact Us', path: '/contact' },
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Manage Events', path: '/admin/events' },
  { name: 'Manage Services', path: '/admin/services' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, role } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';
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
    setProfileOpen(false);
  }, [location]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const currentLinks = isAuthenticated
    ? isAdmin ? adminLinks : userLinks
    : publicLinks;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
        ? 'bg-[#FBF8F3]/95 backdrop-blur-xl border-[#E7DDCF] shadow-lg py-3 lg:py-4'
        : 'bg-[#FBF8F3]/85 backdrop-blur-xl border-[#E7DDCF]/80 py-5 lg:py-6'
        }`}
    >
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-16 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/images/icon.jpg"
              alt="Elysium Logo"
              className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-['Playfair_Display'] text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] text-[#252938] uppercase transition-all duration-300">
              ELYSIUM
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center justify-center gap-x-8 xl:gap-x-12 flex-1 mx-12">
            {currentLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-['Playfair_Display'] text-[15px] lg:text-[17px] transition-all duration-300 whitespace-nowrap ${location.pathname === link.path
                  ? 'text-[#C29B5F]'
                  : 'text-[#3F4A50] hover:text-[#C29B5F]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side — Auth / Profile */}
          <div className="hidden lg:flex items-center justify-end shrink-0 gap-4">
            {isAuthenticated ? (
              <div className="relative flex items-center gap-4" ref={profileRef}>
                {/* Profile Avatar Button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-full border border-[#E7DDCF] hover:border-[#C29B5F]/50 hover:bg-white transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C29B5F] to-[#A97F3D] flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">{initials}</span>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs text-[#636A78] leading-none mb-0.5">{isAdmin ? 'Admin' : 'Member'}</p>
                    <p className="text-sm text-[#252938] font-medium leading-none truncate max-w-[120px]">{user?.name}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-[#E7DDCF] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                  >
                    {/* User Info */}
                    <div className="p-5 border-b border-[#EFE7DA]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C29B5F] to-[#A97F3D] flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#252938] truncate">{user?.name}</p>
                          <p className="text-xs text-[#636A78] truncate">{user?.email}</p>
                        </div>
                      </div>
                      <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C29B5F]/15 text-[#C29B5F] border border-[#C29B5F]/20">
                        {isAdmin ? ' Administrator' : 'Premium Member'}
                      </span>
                    </div>

                    {/* Menu Items */}
                    {/*<div className="p-2">
                      {!isAdmin && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#4F5968] hover:text-[#252938] hover:bg-[#FAF6EF] transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#C29B5F]" /> Dashboard
                          </Link>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#4F5968] hover:text-[#252938] hover:bg-[#FAF6EF] transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#C29B5F]" /> Admin Console
                          </Link>
                          <Link
                            to="/admin/events"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#4F5968] hover:text-[#252938] hover:bg-[#FAF6EF] transition-all"
                          >
                            <Calendar className="w-4 h-4 text-[#C29B5F]" /> Manage Events
                          </Link>
                          <Link
                            to="/admin/services"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#4F5968] hover:text-[#252938] hover:bg-[#FAF6EF] transition-all"
                          >
                            <Settings className="w-4 h-4 text-[#C29B5F]" /> Manage Services
                          </Link>
                        </>
                      )}
                    </div>*/}

                    {/* Logout */}
                    <div className="p-2 border-t border-[#EFE7DA]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="text-[#252938] font-['Playfair_Display'] tracking-[0.15em] text-[13px] md:text-[14px] uppercase hover:text-[#C29B5F] transition-all duration-300 w-[120px] md:w-[130px] h-[44px] md:h-[48px] flex items-center justify-center leading-none"
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile — Right Side: Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#252938]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-[700px] border-t border-white/10 mt-3' : 'max-h-0'
          }`}
      >
        <div className="bg-[#FBF8F3] backdrop-blur-xl px-6 py-6 flex flex-col gap-1">
          {/* User Info (mobile) */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-[#E7DDCF]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C29B5F] to-[#A97F3D] flex items-center justify-center">
                <span className="text-sm font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#252938] truncate">{user?.name}</p>
                <p className="text-xs text-[#636A78]">{isAdmin ? 'Administrator' : 'Premium Member'}</p>
              </div>
            </div>
          )}

          {/* Nav Links */}
          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`font-['Playfair_Display'] text-lg py-3.5 px-3 rounded-xl transition-all ${location.pathname === link.path
                ? 'text-[#C1A27B] bg-[#C1A27B]/10'
                : 'text-[#3F4A50] hover:text-[#252938] hover:bg-[#FAF6EF]'
                }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Profile & Auth links (mobile) */}
          <div className="pt-4 mt-3 border-t border-[#E7DDCF] flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-400 hover:text-red-300 font-['Playfair_Display'] text-lg py-3.5 px-3 rounded-xl hover:bg-red-500/10 transition-all w-full text-left"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                onClick={() => setMobileOpen(false)}
                className="text-[#252938] font-['Playfair_Display'] text-lg text-center font-bold py-4 px-6 border border-[#E7DDCF] rounded-xl hover:border-[#C29B5F]/50 hover:bg-[#FAF6EF] transition-all uppercase tracking-widest"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}