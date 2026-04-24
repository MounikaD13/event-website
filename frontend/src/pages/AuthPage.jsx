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

/* ─── Color Palette ───────────────────────────────────────────
   Golden / Champagne — warm, luxury, executive feel
──────────────────────────────────────────────────────────────── */
const C = {
  primary: '#C1A27B',   // brand gold
  primaryHover: '#A88D68',   // darker gold
  primaryLight: 'rgba(193,162,123,0.12)',
  border: 'rgba(193,162,123,0.25)',
  borderFocus: 'rgba(193,162,123,0.60)',
  label: '#5D5449',
  placeholder: '#A8A298',
  inputBg: '#FCFAF7',
  tabBg: '#F7F2EB',
  text: '#2C2828',
};

/* ─── Shared style atoms ─── */
const S = {
  label: {
    display: 'block', fontSize: '10px', fontWeight: '800',
    color: C.label, textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '6px',
    transition: 'color 0.3s ease',
  },
  input: {
    width: '100%', height: '46px', padding: '0 16px 0 44px',
    background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: '12px', fontSize: '14px', color: C.text,
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
  },
  plainInput: {
    width: '100%', height: '46px', padding: '0 16px',
    background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: '12px', fontSize: '14px', color: C.text,
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
  },
  icon: {
    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
    width: '18px', height: '18px', color: C.primary, opacity: 0.65, pointerEvents: 'none',
    transition: 'all 0.3s ease',
  },
  eye: {
    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: C.placeholder,
    transition: 'color 0.3s ease',
  },
  primaryBtn: {
    width: '100%', height: '48px', background: C.primary, color: '#fff',
    border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '12px',
    textTransform: 'uppercase', letterSpacing: '0.25em', cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', fontFamily: 'inherit',
    boxShadow: '0 10px 20px -5px rgba(193,162,123,0.3)',
  },
  secondaryBtn: {
    width: '100%', height: '48px', background: 'transparent', color: C.primary,
    border: `1.5px solid ${C.border}`, borderRadius: '12px', fontWeight: '800',
    fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.22em',
    cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'inherit',
  },
  field: { marginBottom: '16px' },
  error: { fontSize: '11px', color: '#E53E3E', fontWeight: '600', marginTop: '4px', paddingLeft: '2px' },
};

/* ─── Sub-components ──────────────────────────────────────────────── */
const EyeBtn = ({ show, toggle }) => (
  <button type="button" onClick={toggle} style={S.eye} aria-label={show ? 'Hide' : 'Show'}>
    {show ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
  </button>
);

const Field = ({ label, name, type = 'text', placeholder, autoComplete, Icon, value, onChange, error, rightEl }) => {
  const [focused, setFocused] = useState(false);
  const inputSt = Icon
    ? { ...S.input, paddingRight: rightEl ? '40px' : '14px', border: `1.5px solid ${focused ? C.borderFocus : C.border}`, background: focused ? '#fff' : C.inputBg }
    : { ...S.plainInput, paddingRight: rightEl ? '40px' : '14px', border: `1.5px solid ${focused ? C.borderFocus : C.border}`, background: focused ? '#fff' : C.inputBg };
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon style={S.icon} />}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          autoComplete={autoComplete} style={inputSt}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {rightEl}
      </div>
      {error && <p style={S.error}>{error}</p>}
    </div>
  );
};

const StepBar = ({ steps, step }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: '6px', marginBottom: '16px' }}>
    {steps.map((label, i) => (
      <div key={label} style={{
        borderRadius: '7px', border: `1.5px solid ${i <= step ? C.border : 'rgba(193,162,123,0.12)'}`,
        background: i === step ? C.primaryLight : i < step ? 'rgba(193,162,123,0.06)' : '#FAF8F8',
        padding: '6px 4px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {i < step
            ? <CheckCircle style={{ width: 11, height: 11, color: C.primary, flexShrink: 0 }} />
            : <span style={{ fontSize: '9px', fontWeight: '800', color: i <= step ? C.primary : C.placeholder, flexShrink: 0 }}>0{i + 1}</span>
          }
          <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: i <= step ? C.primary : C.placeholder }}>
            {label}
          </span>
        </div>
      </div>
    ))}
  </div>
);

const OtpBox = ({ email, enteredOtp, setEnteredOtp, errors, setErrors, isSubmitting, onVerify, onResend, onChangeEmail }) => (
  <>
    <div style={{ textAlign: 'center', background: C.inputBg, border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
      <p style={{ fontSize: '10px', fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '3px' }}>Code sent to</p>
      <p style={{ fontSize: '13px', fontWeight: '700', color: C.text, wordBreak: 'break-all', margin: '0 0 4px' }}>{email}</p>
      {onChangeEmail && (
        <button type="button" onClick={onChangeEmail} style={{ fontSize: '11px', color: C.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
          Change Email
        </button>
      )}
    </div>
    <div style={S.field}>
      <label style={{ ...S.label, textAlign: 'center' }}>Enter 6-Digit Code</label>
      <input type="text" inputMode="numeric" placeholder="— — — — — —" value={enteredOtp}
        onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); if (errors.otp) setErrors(p => ({ ...p, otp: '' })); }}
        style={{ width: '100%', height: '58px', padding: '0 16px', background: C.inputBg, border: `1.5px solid ${C.border}`, borderRadius: '10px', fontSize: '26px', letterSpacing: '0.3em', fontWeight: '700', textAlign: 'center', color: C.text, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        onFocus={(e) => { e.target.style.borderColor = C.borderFocus; e.target.style.background = '#fff'; }}
        onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.background = C.inputBg; }}
      />
      {errors.otp && <p style={{ ...S.error, textAlign: 'center' }}>{errors.otp}</p>}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <button onClick={onVerify} disabled={isSubmitting} style={{ ...S.primaryBtn, height: '44px' }}>
        {isSubmitting ? 'Verifying…' : 'Verify Code'}
      </button>
      <button onClick={onResend} disabled={isSubmitting} style={{ ...S.secondaryBtn, height: '44px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <RefreshCcw style={{ width: 13, height: 13 }} /> Resend
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
    setAuthMode(mode); setStep(0); setErrors({});
  }, [location.pathname]);

  const switchMode = (mode) => {
    setAuthMode(mode); setStep(0); setEnteredOtp(''); setErrors({});
    navigate(mode === 'signin' ? '/signin' : '/signup', { replace: true });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Required'; if (!form.password) errs.password = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try { await dispatch(login({ email: form.email, password: form.password })).unwrap(); toast.success('Welcome back!'); navigate('/', { replace: true }); }
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
      setStep(1); setEnteredOtp(''); toast.success(`OTP sent to ${form.email}!`);
    } catch (err) { toast.error(err || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    setLoading(true);
    try {
      if (authMode === 'signup') await dispatch(verifySignupOtp({ email: form.email, otp: enteredOtp })).unwrap();
      else await dispatch(verifyForgotOtp({ email: form.email, otp: enteredOtp })).unwrap();
      setStep(2); setErrors({}); toast.success('OTP verified!');
    } catch (err) { toast.error(err || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (authMode === 'signup') await dispatch(sendSignupOtp(form.email)).unwrap();
      else await dispatch(sendForgotOtp(form.email)).unwrap();
      setEnteredOtp(''); toast.success('New OTP sent!');
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

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100vh', width: '100%', overflowY: 'auto',
      backgroundImage: "url('/images/hero_wedding_aesthetic.png')",
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 16px 40px', boxSizing: 'border-box', position: 'relative',
    }}>
      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(0,0,0,0.60) 0%,rgba(0,0,0,0.20) 50%,rgba(0,0,0,0.45) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} />
      <style>{`
        @keyframes card-reveal {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        button:hover {
          filter: brightness(1.05);
        }
        input:focus + svg {
          color: ${C.primary} !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Content wrapper — single column, no gap so we control spacing manually */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>

        {/* ── Brand header — horizontal compact layout ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe style={{ width: 19, height: 19, color: '#fff', opacity: 0.88 }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: '700', letterSpacing: '0.28em', color: '#fff', display: 'block', lineHeight: 1.1 }}>OVERSEAS</span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)', letterSpacing: '3.5px', textTransform: 'uppercase', fontWeight: '600' }}>Destination Planners</span>
            </div>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px', lineHeight: 1.2, textAlign: 'center' }}>
            {authMode === 'signup' ? 'Begin Your Journey' : authMode === 'signin' ? 'Welcome Back' : 'Secure Account'}
          </h1>
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.58)', margin: 0, textAlign: 'center' }}>
            {authMode === 'signup' ? 'Crafting unforgettable moments, worldwide.' : authMode === 'signin' ? 'Resume planning your next spectacular event.' : 'Verify your identity to reset your password.'}
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.92)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px', 
          border: '1px solid rgba(255, 255, 255, 0.5)', 
          padding: '32px', 
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.35)',
          animation: 'card-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>

          {/* Tab switcher */}
          {authMode !== 'forgotpassword' && (
            <div style={{ display: 'flex', background: C.tabBg, borderRadius: '14px', padding: '5px', marginBottom: '24px', border: `1px solid ${C.border}` }}>
              {[['signup', 'Sign Up'], ['signin', 'Sign In']].map(([m, label]) => (
                <button key={m} type="button" onClick={() => switchMode(m)} style={{
                  flex: 1, height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em',
                  background: authMode === m ? '#fff' : 'transparent',
                  color: authMode === m ? C.primary : C.placeholder,
                  boxShadow: authMode === m ? '0 4px 12px rgba(193,162,123,0.2)' : 'none',
                  transition: 'all 0.3s ease', fontFamily: 'inherit',
                }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Step bar */}
          {authMode === 'signup' && <StepBar steps={['Email', 'Verify', 'Register']} step={step} />}
          {authMode === 'forgotpassword' && <StepBar steps={['Email', 'Verify', 'Reset']} step={step} />}

          {/* ───── SIGN IN ───── */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn}>
              <Field label="Email Address" name="email" type="email" placeholder="hello@overseas.com" autoComplete="email" Icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
              <Field label="Password" name="password" type={showPwd ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" Icon={Lock} value={form.password} onChange={handleChange} error={errors.password} rightEl={<EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />} />
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '16px' }}>
                <button type="button" onClick={() => { setAuthMode('forgotpassword'); setStep(0); setErrors({}); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.primary, fontWeight: '600', fontFamily: 'inherit' }}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" disabled={isSubmitting} style={{ ...S.primaryBtn, marginTop: 0 }}>
                {isSubmitting ? 'Processing…' : 'Enter Destination'}
              </button>
            </form>
          )}

          {/* ───── FORGOT PASSWORD ───── */}
          {authMode === 'forgotpassword' && (
            <>
              {step === 0 && (
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                  <Field label="Account Email" name="email" type="email" placeholder="your@email.com" autoComplete="email" Icon={Mail} value={form.email} onChange={handleChange} error={errors.email} />
                  <button type="submit" disabled={isSubmitting} style={{ ...S.primaryBtn, marginTop: '4px' }}>{isSubmitting ? 'Sending…' : 'Send Reset Code'}</button>
                </form>
              )}
              {step === 1 && <OtpBox email={form.email} enteredOtp={enteredOtp} setEnteredOtp={setEnteredOtp} errors={errors} setErrors={setErrors} isSubmitting={isSubmitting} onVerify={handleVerifyOtp} onResend={handleResendOtp} />}
              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                  <Field label="New Password" name="password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password" Icon={Lock} value={form.password} onChange={handleChange} error={errors.password} rightEl={<EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />} />
                  <Field label="Confirm Password" name="confirmPassword" type={showCfm ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password" Icon={Lock} value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} rightEl={<EyeBtn show={showCfm} toggle={() => setShowCfm(!showCfm)} />} />
                  <button type="submit" disabled={isSubmitting} style={{ ...S.primaryBtn, marginTop: '4px' }}>{isSubmitting ? 'Saving…' : 'Reset Password'}</button>
                </form>
              )}
              <button type="button" onClick={() => switchMode('signin')} style={{ display: 'block', width: '100%', marginTop: '14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.placeholder, fontWeight: '600', textAlign: 'center', fontFamily: 'inherit' }}>
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
                  <button type="submit" disabled={isSubmitting} style={{ ...S.primaryBtn, marginTop: '4px' }}>{isSubmitting ? 'Sending…' : 'Begin Verification'}</button>
                </form>
              )}

              {step === 1 && <OtpBox email={form.email} enteredOtp={enteredOtp} setEnteredOtp={setEnteredOtp} errors={errors} setErrors={setErrors} isSubmitting={isSubmitting} onVerify={handleVerifyOtp} onResend={handleResendOtp} onChangeEmail={() => setStep(0)} />}

              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleComplete(); }}>
                  {/* Scrollable area only for the multi-field registration step */}
                  <div style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto', paddingRight: '4px' }}>

                    {/* Name + Mobile */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={S.field}>
                        <label style={S.label}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <User style={S.icon} />
                          <InputRaw name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
                        </div>
                        {errors.name && <p style={S.error}>{errors.name}</p>}
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Mobile</label>
                        <div style={{ position: 'relative' }}>
                          <Phone style={S.icon} />
                          <InputRaw name="mobile" value={form.mobile} onChange={handleChange} placeholder="+91 99999 99999" autoComplete="tel" type="tel" />
                        </div>
                        {errors.mobile && <p style={S.error}>{errors.mobile}</p>}
                      </div>
                    </div>

                    {/* Password + Confirm */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={S.field}>
                        <label style={S.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock style={S.icon} />
                          <InputRaw name="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" autoComplete="new-password" type={showPwd ? 'text' : 'password'} paddingRight="40px" />
                          <EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />
                        </div>
                        {errors.password && <p style={S.error}>{errors.password}</p>}
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Confirm</label>
                        <div style={{ position: 'relative' }}>
                          <Lock style={S.icon} />
                          <InputRaw name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat" autoComplete="new-password" type={showCfm ? 'text' : 'password'} paddingRight="40px" />
                          <EyeBtn show={showCfm} toggle={() => setShowCfm(!showCfm)} />
                        </div>
                        {errors.confirmPassword && <p style={S.error}>{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {/* Gender */}
                    <div style={S.field}>
                      <label style={S.label}>Identify As</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {['Male', 'Female', 'Other'].map((g) => (
                          <button key={g} type="button"
                            onClick={() => { setForm({ ...form, gender: g }); if (errors.gender) setErrors(p => ({ ...p, gender: '' })); }}
                            style={{ height: '40px', borderRadius: '9px', border: `1.5px solid ${form.gender === g ? C.primary : C.border}`, background: form.gender === g ? C.primary : '#fff', color: form.gender === g ? '#fff' : C.label, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit' }}>
                            {g}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p style={S.error}>{errors.gender}</p>}
                    </div>

                    {/* Address */}
                    <div style={S.field}>
                      <label style={S.label}>Mailing Address</label>
                      <TextareaRaw name="address" value={form.address} onChange={handleChange} placeholder="Your full address…" rows={2} />
                      {errors.address && <p style={S.error}>{errors.address}</p>}
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} style={{ ...S.primaryBtn, marginTop: '14px' }}>
                    {isSubmitting ? 'Creating Account…' : 'Complete Registration'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
            <p style={{ fontSize: '9.5px', color: 'rgba(44,40,40,0.38)', textTransform: 'uppercase', letterSpacing: '0.2em', lineHeight: '1.9', margin: 0 }}>
              Crafting memories since 2012<br />
              <span style={{ color: C.primary, fontWeight: '700', cursor: 'pointer' }}>Privacy Policy</span>
              {' · '}
              <span style={{ color: C.primary, fontWeight: '700', cursor: 'pointer' }}>Terms of Use</span>
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
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
      style={{ ...S.input, paddingLeft: '40px', paddingRight: paddingRight || '14px', border: `1.5px solid ${focused ? C.borderFocus : C.border}`, background: focused ? '#fff' : C.inputBg }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

function TextareaRaw({ name, value, onChange, placeholder, rows = 2 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ width: '100%', padding: '10px 14px', background: focused ? '#fff' : C.inputBg, border: `1.5px solid ${focused ? C.borderFocus : C.border}`, borderRadius: '10px', fontSize: '13.5px', color: C.text, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.18s, background 0.18s' }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}
