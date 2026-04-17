import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Globe, Phone, ArrowRight,
  CheckCircle2, RefreshCcw, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh','Belgium',
  'Brazil','Canada','Chile','China','Colombia','Croatia','Czech Republic','Denmark','Egypt',
  'Ethiopia','Finland','France','Germany','Ghana','Greece','Hungary','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan','Kenya','South Korea','Kuwait',
  'Lebanon','Malaysia','Mexico','Morocco','Netherlands','New Zealand','Nigeria','Norway',
  'Pakistan','Palestine','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia',
  'Saudi Arabia','Singapore','South Africa','Spain','Sri Lanka','Sudan','Sweden','Switzerland',
  'Thailand','Turkey','UAE','Ukraine','United Kingdom','United States','Vietnam','Zimbabwe',
];

const STEPS = ['Account Info', 'Verify OTP', 'Complete'];

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp] = useState('123456'); // Mock OTP for frontend demo
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', country: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep0 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.country) errs.country = 'Please select your country';
    return errs;
  };

  const handleSendOtp = async () => {
    const errs = validateStep0();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpSent(true);
    setStep(1);
    setLoading(false);
    toast.success(`OTP sent to ${form.email}! (Demo: 123456)`);
  };

  const handleOtpChange = (value, index) => {
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (errors.otp) setErrors({ ...errors, otp: '' });
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    if (entered !== mockOtp) { setErrors({ otp: 'Incorrect OTP. Try 123456' }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep(2);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setOtp(['', '', '', '', '', '']);
    toast.success('New OTP sent! (Demo: 123456)');
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success('Account created! Please sign in to continue.');
    navigate('/signin', { state: location.state });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1400&q=80')" }}
    >
      {/* Overlay to give the 'half white' / translucent look */}
      <div className="absolute inset-0 bg-[#FAF9F6]/85 backdrop-blur-[2px]"></div>

      {/* Bg decorations */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#A3B19B]/10 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#A3B19B]/10 rounded-full blur-3xl z-0" />

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
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#4A4F4D] mb-2">Create Account</h1>
          <p className="text-[#4A4F4D]/50 text-sm">Join thousands planning extraordinary events</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                i === step
                  ? 'bg-[#A3B19B] text-white'
                  : i < step
                  ? 'bg-[#A3B19B]/20 text-[#A3B19B]'
                  : 'bg-[#f8f5f0]/5 text-[#4A4F4D]/30'
              }`}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 ${i < step ? 'text-[#A3B19B]' : 'text-[#4A4F4D]/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-[#A3B19B]/15 p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>

          {/* ── STEP 0: Account Details ── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.name ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.email ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-11 pr-12 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.password ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4F4D]/40 hover:text-[#A3B19B] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-12 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.confirmPassword ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4F4D]/40 hover:text-[#A3B19B] transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Country / Origin</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3B19B]/60" />
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6]/60 border rounded-xl text-sm transition-all appearance-none ${errors.country ? 'border-red-500/60' : 'border-[#A3B19B]/20'} ${form.country ? 'text-[#4A4F4D]' : 'text-[#4A4F4D]/30'}`}
                  >
                    <option value="" disabled className="bg-[#F2EFE9] text-[#4A4F4D]/50">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-[#F2EFE9] text-[#4A4F4D]">{c}</option>
                    ))}
                  </select>
                </div>
                {errors.country && <p className="mt-1.5 text-xs text-red-400">{errors.country}</p>}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />Sending OTP...</>
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 1: OTP Verification ── */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div>
                <div className="w-16 h-16 rounded-full bg-[#A3B19B]/15 border border-[#A3B19B]/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-[#A3B19B]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#4A4F4D] mb-1">Check Your Email</h3>
                <p className="text-sm text-[#4A4F4D]/50">
                  We sent a 6-digit code to<br />
                  <span className="text-[#A3B19B] font-medium">{form.email}</span>
                </p>
                <p className="text-xs text-[#A3B19B]/60 mt-2 italic">(Demo: use code 123456)</p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className={`w-12 h-14 text-center text-xl font-bold bg-[#FAF9F6]/60 border-2 rounded-xl text-[#4A4F4D] transition-all ${
                      digit ? 'border-[#A3B19B]' : 'border-[#A3B19B]/20'
                    } ${errors.otp ? 'border-red-500/60' : ''}`}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-red-400">{errors.otp}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />Verifying...</>
                ) : (
                  <>Verify OTP <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={() => setStep(0)}
                  className="text-[#4A4F4D]/40 hover:text-[#4A4F4D] transition-colors"
                >
                  ← Go back
                </button>
                <span className="text-[#4A4F4D]/20">|</span>
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-[#A3B19B]/70 hover:text-[#A3B19B] transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Success ── */}
          {step === 2 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A3B19B] to-[#D8C3A5] flex items-center justify-center mx-auto animate-pulse-pastel">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#4A4F4D] mb-2">
                  You're All Set! 🎉
                </h3>
                <p className="text-[#4A4F4D]/50 text-sm">
                  Welcome to Overseas Events, <span className="text-[#A3B19B] font-semibold">{form.name}</span>! Your account has been verified.
                </p>
              </div>
              <div className="glass border border-[#A3B19B]/20 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A3B19B]" />
                  <span className="text-[#4A4F4D]/70">Email verified: <span className="text-[#4A4F4D]">{form.email}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#A3B19B]" />
                  <span className="text-[#4A4F4D]/70">Country: <span className="text-[#4A4F4D]">{form.country}</span></span>
                </div>
              </div>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />Creating account...</>
                ) : (
                  <>Start Exploring <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}

          {/* Sign In Link */}
          {step === 0 && (
            <>
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-[#A3B19B]/10" />
                <span className="text-xs text-[#4A4F4D]/30">OR</span>
                <div className="flex-1 h-px bg-[#A3B19B]/10" />
              </div>
              <p className="text-center text-sm text-[#4A4F4D]/50">
                Already have an account?{' '}
                <Link to="/signin" className="text-[#A3B19B] font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
