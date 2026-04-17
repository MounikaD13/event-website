import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));

    // Mock login — replace with real API
    login({
      name: form.email.split('@')[0],
      email: form.email,
      id: Date.now(),
    });

    toast.success('Welcome back! Signed in successfully.');
    setLoading(false);
    navigate(from, { replace: true, state: location.state });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80')" }}
    >
      {/* Overlay to give the 'half white' / translucent look */}
      <div className="absolute inset-0 bg-[#FAF9F6]/85 backdrop-blur-[2px]"></div>

      {/* Bg decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#A3B19B]/10 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#A3B19B]/10 rounded-full blur-3xl z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A3B19B] to-[#D8C3A5] flex items-center justify-center animate-pulse-pastel">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="font-['Playfair_Display'] text-2xl font-bold pastel-gradient block">OVERSEAS</span>
              <span className="text-[10px] text-[#A3B19B]/70 tracking-[3px] uppercase">Event Planners</span>
            </div>
          </Link>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#4A4F4D] mb-2">Welcome Back</h1>
          <p className="text-[#4A4F4D]/50 text-sm">Sign in to continue your extraordinary journey</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-[#A3B19B]/15 p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          {/* Info banner if redirected from booking */}
          {location.state?.from === '/booking' && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-[#A3B19B]/10 border border-[#A3B19B]/20">
              <Sparkles className="w-4 h-4 text-[#A3B19B] mt-0.5 shrink-0" />
              <p className="text-sm text-[#A3B19B]/90">Please sign in to book events and contact our team.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${
                    errors.email ? 'border-red-500/60' : 'border-[#A3B19B]/20'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#4A4F4D]/60 uppercase tracking-wider">Password</label>
                <Link to="/#" className="text-xs text-[#A3B19B]/70 hover:text-[#A3B19B] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${
                    errors.password ? 'border-red-500/60' : 'border-[#A3B19B]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4F4D]/40 hover:text-[#A3B19B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#A3B19B]/10" />
            <span className="text-xs text-[#4A4F4D]/30">OR</span>
            <div className="flex-1 h-px bg-[#A3B19B]/10" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#4A4F4D]/50">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#A3B19B] font-semibold hover:underline transition-all">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
