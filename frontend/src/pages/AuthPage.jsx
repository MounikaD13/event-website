import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Eye, EyeOff, Mail, Lock, User, Globe, Phone, CheckCircle, RefreshCcw,
} from 'lucide-react';
import {
  login, register, sendSignupOtp, verifySignupOtp,
  sendForgotOtp, verifyForgotOtp, resetPassword,
} from '../store/slices/authSlice';
import toast from 'react-hot-toast';

/* ─── Sub-components ──────────────────────────────────────────────── */
const EyeBtn = ({ show, toggle }) => (
  <button 
    type="button" 
    onClick={toggle} 
    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-0 text-[#A8A298] transition-colors hover:text-[#C1A27B]" 
    aria-label={show ? 'Hide' : 'Show'}
  >
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);

const Field = ({ label, name, type = 'text', placeholder, autoComplete, Icon, value, onChange, error, rightEl }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-all duration-300 ${focused ? 'text-[#C1A27B] opacity-100' : 'text-[#C1A27B] opacity-65'}`} />}
        <input 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          autoComplete={autoComplete} 
          className={`w-full h-11.5 text-sm text-[#2C2828] outline-none rounded-xl transition-all duration-300 border-1.5 ${Icon ? 'pl-11' : 'px-4'} ${rightEl ? 'pr-10' : 'pr-4'} ${focused ? 'border-[#C1A27B] bg-white shadow-sm ring-4 ring-[#C1A27B]/5' : 'border-[#C1A27B]/25 bg-[#FCFAF7]'}`}
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)} 
        />
        {rightEl}
      </div>
      {error && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{error}</p>}
    </div>
  );
};

const StepBar = ({ steps, step }) => (
  <div className="grid gap-1.5 mb-4" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
    {steps.map((label, i) => (
      <div 
        key={label} 
        className={`rounded-lg border-1.5 p-1.5 text-center transition-all duration-300 ${i <= step ? 'border-[#C1A27B]' : 'border-[#C1A27B]/10'} ${i === step ? 'bg-[#C1A27B]/10' : i < step ? 'bg-[#C1A27B]/5' : 'bg-[#FAF8F8]'}`}
      >
        <div className="flex items-center justify-center gap-1">
          {i < step
            ? <CheckCircle size={11} className="text-[#C1A27B] shrink-0" />
            : <span className={`text-[9px] font-extrabold shrink-0 ${i <= step ? 'text-[#C1A27B]' : 'text-[#A8A298]'}`}>0{i + 1}</span>
          }
          <span className={`text-[9px] font-bold uppercase tracking-wider ${i <= step ? 'text-[#C1A27B]' : 'text-[#A8A298]'}`}>
            {label}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const OtpBox = ({ email, enteredOtp, setEnteredOtp, errors, setErrors, isSubmitting, onVerify, onResend, onChangeEmail }) => (
  <>
    <div className="text-center bg-[#FCFAF7] border-1.5 border-[#C1A27B]/25 rounded-xl p-3 mb-3.5">
      <p className="text-[10px] font-bold text-[#C1A27B] uppercase tracking-widest mb-0.5">Code sent to</p>
      <p className="text-[13px] font-bold text-[#2C2828] break-all mb-1">{email}</p>
      {onChangeEmail && (
        <button 
          type="button" 
          onClick={onChangeEmail} 
          className="text-[11px] text-[#C1A27B] bg-transparent border-none cursor-pointer underline font-semibold"
        >
          Change Email
        </button>
      )}
    </div>
    <div className="mb-4">
      <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 text-center">Enter 6-Digit Code</label>
      <input 
        type="text" 
        inputMode="numeric" 
        placeholder="— — — — — —" 
        value={enteredOtp}
        onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (errors.otp) setErrors(p => ({ ...p, otp: '' })); }}
        className="w-full h-14.5 px-4 bg-[#FCFAF7] border-1.5 border-[#C1A27B]/25 rounded-xl text-2xl tracking-[0.3em] font-bold text-center text-[#2C2828] outline-none transition-all focus:border-[#C1A27B] focus:bg-white focus:ring-4 focus:ring-[#C1A27B]/5"
      />
      {errors.otp && <p className="text-[11px] text-red-600 font-semibold mt-1 text-center">{errors.otp}</p>}
    </div>
    <div className="grid grid-cols-2 gap-2.5">
      <button 
        onClick={onVerify} 
        disabled={isSubmitting} 
        className="h-11 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? 'Verifying…' : 'Verify Code'}
      </button>
      <button 
        onClick={onResend} 
        disabled={isSubmitting} 
        className="h-11 bg-transparent text-[#C1A27B] border-1.5 border-[#C1A27B]/25 rounded-xl font-extrabold text-[12px] uppercase tracking-[0.22em] cursor-pointer transition-all hover:bg-[#C1A27B]/5"
      >
        <span className="inline-flex items-center gap-1.5">
          <RefreshCcw size={13} /> Resend
        </span>
      </button>
    </div>
  </>
);

/* ─── Main Component ─────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading: reduxLoading } = useSelector((s) => s.auth);

  const [authMode, setAuthMode] = useState(location.pathname === '/signin' ? 'signin' : 'signup');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', mobile: '', address: '', gender: '' });

  const isSubmitting = loading || reduxLoading;

  useEffect(() => {
    const mode = location.pathname === '/signin' ? 'signin' : 'signup';
    setAuthMode(mode); 
    setStep(0); 
    setErrors({});
  }, [location.pathname]);

  const switchMode = (mode) => {
    setAuthMode(mode); 
    setStep(0); 
    setEnteredOtp(''); 
    setErrors({});
    navigate(mode === 'signin' ? '/signin' : '/signup', { replace: true });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Required'; 
    if (!form.password) errs.password = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try { 
      await dispatch(login({ email: form.email, password: form.password })).unwrap(); 
      toast.success('Welcome back!'); 
      navigate('/', { replace: true }); 
    }
    catch (err) { toast.error(err || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    const errs = {};
    if (!form.email) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (authMode === 'signup') await dispatch(sendSignupOtp(form.email)).unwrap();
      else await dispatch(sendForgotOtp(form.email)).unwrap();
      setStep(1); 
      setEnteredOtp(''); 
      toast.success(`OTP sent to ${form.email}!`);
    } catch (err) { toast.error(err || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    setLoading(true);
    try {
      if (authMode === 'signup') await dispatch(verifySignupOtp({ email: form.email, otp: enteredOtp })).unwrap();
      else await dispatch(verifyForgotOtp({ email: form.email, otp: enteredOtp })).unwrap();
      setStep(2); 
      setErrors({}); 
      toast.success('OTP verified!');
    } catch (err) { toast.error(err || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (authMode === 'signup') await dispatch(sendSignupOtp(form.email)).unwrap();
      else await dispatch(sendForgotOtp(form.email)).unwrap();
      setEnteredOtp(''); 
      toast.success('New OTP sent!');
    } catch (err) { toast.error(err || 'Failed to resend'); }
    finally { setLoading(false); }
  };

  const handleComplete = async () => {
    if (authMode === 'signup') {
      const errs = {};
      if (!form.name.trim()) errs.name = 'Required';
      if (!form.mobile.trim()) errs.mobile = 'Required';
      if (!form.password) errs.password = 'Required';
      else if (form.password.length < 6) errs.password = 'Min 6 chars';
      if (!form.confirmPassword) errs.confirmPassword = 'Required';
      else if (form.password !== form.confirmPassword) errs.confirmPassword = 'No match';
      if (!form.address.trim()) errs.address = 'Required';
      if (!form.gender) errs.gender = 'Select one';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setLoading(true);
      try {
        await dispatch(register({ name: form.name, email: form.email, password: form.password, mobileNumber: form.mobile, address: form.address, gender: form.gender })).unwrap();
        toast.success('Account created!'); switchMode('signin');
        setForm(p => ({ ...p, password: '', confirmPassword: '' }));
      } catch (err) { toast.error(err || 'Registration failed'); }
      finally { setLoading(false); }
    } else {
      const errs = {};
      if (!form.password) errs.password = 'Required';
      if (!form.confirmPassword) errs.confirmPassword = 'Required';
      else if (form.password !== form.confirmPassword) errs.confirmPassword = 'No match';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setLoading(true);
      try { await dispatch(resetPassword({ email: form.email, password: form.password })).unwrap(); toast.success('Password reset!'); switchMode('signin'); }
      catch (err) { toast.error(err || 'Reset failed'); }
      finally { setLoading(false); }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-20 px-4 bg-cover bg-center overflow-y-auto overflow-x-hidden" style={{ backgroundImage: "url('/images/hero_wedding_aesthetic.png')" }}>
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/25 to-black/45" />
      <div className="absolute inset-0 backdrop-blur-md pointer-events-none" />

      <style>{`
        @keyframes card-reveal {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card { animation: card-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-[460px]">

        {/* Brand header */}
        <div className="flex flex-col items-center mb-4 scale-95 md:scale-100">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0">
              <Globe size={19} className="text-white opacity-90" />
            </div>
            <div className="text-left">
              <span className="font-['Playfair_Display'] text-lg font-bold tracking-[0.28em] text-white block leading-none">ELYSIUM</span>
              <span className="text-[8px] text-white/45 tracking-[3.5px] uppercase font-semibold">Event Planners</span>
            </div>
          </Link>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-white mb-1 text-center">
            {authMode === 'signup' ? 'Begin Your Journey' : authMode === 'signin' ? 'Welcome Back' : 'Secure Account'}
          </h1>
          <p className="text-[12.5px] text-white/60 text-center">
            {authMode === 'signup' ? 'Crafting unforgettable moments, worldwide.' : authMode === 'signin' ? 'Resume planning your next spectacular event.' : 'Verify your identity to reset your password.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/92 backdrop-blur-2xl rounded-[32px] border border-white/50 p-8 shadow-2xl animate-card">

          {/* Tab switcher */}
          {authMode !== 'forgotpassword' && (
            <div className="flex bg-[#F7F2EB] rounded-2xl p-1 mb-6 border border-[#C1A27B]/25">
              {[['signup', 'Sign Up'], ['signin', 'Sign In']].map(([m, label]) => (
                <button 
                  key={m} 
                  type="button" 
                  onClick={() => switchMode(m)} 
                  className={`flex-1 h-9.5 rounded-xl border-none cursor-pointer text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${authMode === m ? 'bg-white text-[#C1A27B] shadow-lg' : 'bg-transparent text-[#A8A298]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Step bar */}
          {(authMode === 'signup' || authMode === 'forgotpassword') && (
            <StepBar steps={authMode === 'signup' ? ['Email', 'Verify', 'Register'] : ['Email', 'Verify', 'Reset']} step={step} />
          )}

          {/* ───── SIGN IN ───── */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn}>
              <Field label="Email Address" name="email" type="email" placeholder="hello@overseas.com" autoComplete="email" Icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
              <Field label="Password" name="password" type={showPwd ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" Icon={Lock} value={form.password} onChange={handleChange} error={errors.password} rightEl={<EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />} />
              <div className="text-right -mt-2 mb-4">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('forgotpassword'); setStep(0); setErrors({}); }}
                  className="bg-transparent border-none cursor-pointer text-xs text-[#C1A27B] font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-12 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(193,162,123,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing…' : 'LETS GET PLANNING'}
              </button>
            </form>
          )}

          {/* ───── FORGOT PASSWORD ───── */}
          {authMode === 'forgotpassword' && (
            <>
              {step === 0 && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                  <Field label="Account Email" name="email" type="email" placeholder="your@email.com" autoComplete="email" Icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
                  <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(193,162,123,0.3)] disabled:opacity-50 mt-1">{isSubmitting ? 'Sending…' : 'Send Reset Code'}</button>
                </form>
              )}
              {step === 1 && <OtpBox email={form.email} enteredOtp={enteredOtp} setEnteredOtp={setEnteredOtp} errors={errors} setErrors={setErrors} isSubmitting={isSubmitting} onVerify={handleVerifyOtp} onResend={handleResendOtp} />}
              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                  <Field label="New Password" name="password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password" Icon={Lock} value={form.password} onChange={handleChange} error={errors.password} rightEl={<EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />} />
                  <Field label="Confirm Password" name="confirmPassword" type={showCfm ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" Icon={Lock} value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} rightEl={<EyeBtn show={showCfm} toggle={() => setShowCfm(!showCfm)} />} />
                  <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(193,162,123,0.3)] disabled:opacity-50 mt-1">{isSubmitting ? 'Saving…' : 'Reset Password'}</button>
                </form>
              )}
              <button type="button" onClick={() => switchMode('signin')} className="block w-full mt-3.5 bg-transparent border-none cursor-pointer text-xs text-[#A8A298] font-bold text-center">
                ← Back to Sign In
              </button>
            </>
          )}

          {/* ───── SIGN UP ───── */}
          {authMode === 'signup' && (
            <>
              {step === 0 && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                  <Field label="Your Email Address" name="email" type="email" placeholder="your@email.com" autoComplete="email" Icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
                  <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(193,162,123,0.3)] disabled:opacity-50 mt-1">{isSubmitting ? 'Sending…' : 'Begin Verification'}</button>
                </form>
              )}

              {step === 1 && <OtpBox email={form.email} enteredOtp={enteredOtp} setEnteredOtp={setEnteredOtp} errors={errors} setErrors={setErrors} isSubmitting={isSubmitting} onVerify={handleVerifyOtp} onResend={handleResendOtp} onChangeEmail={() => setStep(0)} />}

              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                  {/* Scrollable area only for the multi-field registration step */}
                  <div className="max-h-[calc(100vh-360px)] overflow-y-auto pr-1">

                    {/* Name + Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="mb-4">
                        <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Full Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C1A27B] opacity-65 pointer-events-none" />
                          <InputRaw name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
                        </div>
                        {errors.name && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.name}</p>}
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Mobile</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C1A27B] opacity-65 pointer-events-none" />
                          <InputRaw name="mobile" value={form.mobile} onChange={handleChange} placeholder="+91 99999 99999" autoComplete="tel" type="tel" />
                        </div>
                        {errors.mobile && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.mobile}</p>}
                      </div>
                    </div>

                    {/* Password + Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="mb-4">
                        <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Password</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C1A27B] opacity-65 pointer-events-none" />
                          <InputRaw name="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" autoComplete="new-password" type={showPwd ? 'text' : 'password'} paddingRight="pr-10" />
                          <EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />
                        </div>
                        {errors.password && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.password}</p>}
                      </div>
                      <div className="mb-4">
                        <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Confirm</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C1A27B] opacity-65 pointer-events-none" />
                          <InputRaw name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat" autoComplete="new-password" type={showCfm ? 'text' : 'password'} paddingRight="pr-10" />
                          <EyeBtn show={showCfm} toggle={() => setShowCfm(!showCfm)} />
                        </div>
                        {errors.confirmPassword && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="mb-4">
                      <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Identify As</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <button key={g} type="button"
                            onClick={() => { setForm({ ...form, gender: g }); if (errors.gender) setErrors(p => ({ ...p, gender: '' })); }}
                            className={`h-10 rounded-xl border-1.5 transition-all duration-200 text-[11px] font-bold uppercase tracking-widest cursor-pointer ${form.gender === g ? 'bg-[#C1A27B] text-white border-[#C1A27B]' : 'bg-white text-[#5D5449] border-[#C1A27B]/25 hover:border-[#C1A27B]'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.gender}</p>}
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label className="block text-[10px] font-extrabold text-[#5D5449] uppercase tracking-[0.22em] mb-1.5 transition-colors">Mailing Address</label>
                      <TextareaRaw name="address" value={form.address} onChange={handleChange} placeholder="Your full address…" rows={2} />
                      {errors.address && <p className="text-[11px] text-red-600 font-semibold mt-1 pl-0.5">{errors.address}</p>}
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-[#C1A27B] text-white border-none rounded-xl font-extrabold text-[12px] uppercase tracking-[0.25em] cursor-pointer transition-all hover:brightness-105 active:scale-95 shadow-[0_10px_20px_-5px_rgba(193,162,123,0.3)] disabled:opacity-50 mt-3.5">
                    {isSubmitting ? 'Creating Account…' : 'Complete Registration'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-4.5 pt-3.5 border-t border-[#C1A27B]/25 text-center">
            <p className="text-[9.5px] text-[#2C2828]/40 uppercase tracking-[0.2em] leading-[1.9]">
              Crafting memories since 2012<br />
              <span className="text-[#C1A27B] font-bold cursor-pointer hover:underline transition-all">Privacy Policy</span>
              {' · '}
              <span className="text-[#C1A27B] font-bold cursor-pointer hover:underline transition-all">Terms of Use</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Raw input helpers (stateful focus) ─────────────────────────── */
function InputRaw({ name, value, onChange, placeholder, autoComplete, type = 'text', paddingRight }) {
  const [focused, setFocused] = useState(false);
  return (
    <input 
      type={type} 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      autoComplete={autoComplete}
      className={`w-full h-11.5 pl-11 outline-none transition-all duration-300 rounded-xl text-sm text-[#2C2828] border-1.5 ${paddingRight || 'pr-3.5'} ${focused ? 'border-[#C1A27B] bg-white shadow-sm ring-4 ring-[#C1A27B]/5' : 'border-[#C1A27B]/25 bg-[#FCFAF7]'}`}
      onFocus={() => setFocused(true)} 
      onBlur={() => setFocused(false)} 
    />
  );
}

function TextareaRaw({ name, value, onChange, placeholder, rows = 2 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea 
      name={name} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      rows={rows}
      className={`w-full p-3.5 outline-none transition-all duration-300 rounded-xl text-[13.5px] text-[#2C2828] resize-none border-1.5 leading-relaxed ${focused ? 'border-[#C1A27B] bg-white shadow-sm ring-4 ring-[#C1A27B]/5' : 'border-[#C1A27B]/25 bg-[#FCFAF7]'}`}
      onFocus={() => setFocused(true)} 
      onBlur={() => setFocused(false)} 
    />
  );
}