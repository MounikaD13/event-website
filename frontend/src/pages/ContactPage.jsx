import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Mail, Phone, MapPin, Clock, Send, ArrowRight, MessageSquare,
  Globe, Sparkles, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const contactInfo = [
  { icon: Mail, label: 'Email Us', value: 'hello@overseas.events', href: 'mailto:hello@overseas.events' },
  { icon: Phone, label: 'Call Us', value: '+1 (888) OVERSEAS', href: 'tel:+18886837472' },
  { icon: MapPin, label: 'Visit Us', value: '123 Event Blvd, New York, NY 10001' },
  { icon: Clock, label: 'Working Hours', value: 'Mon–Fri: 9am–6pm EST' },
];

const eventTypes = ['Wedding', 'Corporate Event', 'Private Party', 'Gala / Fundraiser', 'Conference', 'Retreat', 'Other'];
const budgetRanges = ['Under $5,000', '$5,000 – $10,000', '$10,000 – $20,000', '$20,000 – $50,000', '$50,000+'];

export default function ContactPage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    eventType: '',
    budget: '',
    date: '',
    guests: '',
    destination: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      toast('Please sign up to contact us or book an event', { id: 'auth-required', icon: '🔐' });
      navigate('/signup', { state: { from: '/contact' } });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.eventType) errs.eventType = 'Select an event type';
    if (!form.message.trim()) errs.message = 'Please describe your event vision';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success('Your enquiry has been submitted! We\'ll be in touch within 24 hours.');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 bg-[#FAF9F6]">
      {/* Header */}
      <div className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/images/contact_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/80 to-[#FAF9F6]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <span className="text-[#A3B19B] text-xs uppercase tracking-[4px] font-semibold">Get In Touch</span>
          <h1 className="font-['Playfair_Display'] text-5xl font-bold text-[#4A4F4D] mt-3 mb-4">
            Contact <span className="pastel-gradient">Our Team</span>
          </h1>
          <p className="text-[#4A4F4D]/50 text-lg max-w-2xl mx-auto">
            Ready to plan your dream event? Tell us your vision and our experts will craft the perfect experience.
          </p>

          {/* Greeting */}
          <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 glass rounded-full border border-[#A3B19B]/20">
            <Sparkles className="w-4 h-4 text-[#A3B19B]" />
            <span className="text-sm text-[#4A4F4D]">
              Welcome back, <span className="text-[#A3B19B] font-semibold">{user?.name}</span>!
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ─ Sidebar Info ─ */}
          <div className="space-y-6">
            {/* Contact Cards */}
            {contactInfo.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="glass rounded-2xl p-5 border border-[#A3B19B]/10 hover:border-[#A3B19B]/30 transition-all duration-300 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#A3B19B]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#A3B19B]" />
                </div>
                <div>
                  <p className="text-xs text-[#A3B19B]/70 uppercase tracking-wider font-semibold mb-1">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm text-[#4A4F4D]/80 hover:text-[#A3B19B] transition-colors">{value}</a>
                  ) : (
                    <p className="text-sm text-[#4A4F4D]/80">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Why Choose Us */}
            <div className="glass rounded-2xl p-6 border border-[#A3B19B]/10">
              <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#4A4F4D] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#A3B19B]" />
                Why Choose Us?
              </h3>
              {[
                'End-to-end event management',
                '120+ global destinations',
                'Dedicated personal planner',
                '24/7 support throughout',
                '100% satisfaction guarantee',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 mb-3 last:mb-0">
                  <CheckCircle2 className="w-4 h-4 text-[#A3B19B] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#4A4F4D]/60">{item}</span>
                </div>
              ))}
            </div>

            {/* Live Chat CTA */}
            <div className="glass rounded-2xl p-5 border border-[#A3B19B]/20 bg-gradient-to-br from-[#A3B19B]/5 to-transparent">
              <MessageSquare className="w-8 h-8 text-[#A3B19B] mb-3" />
              <h4 className="font-semibold text-[#4A4F4D] mb-1">Need Immediate Help?</h4>
              <p className="text-sm text-[#4A4F4D]/50 mb-4">Our agents are available on live chat Mon–Fri.</p>
              <button className="w-full py-2.5 rounded-xl btn-pastel text-sm font-bold flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Start Live Chat
              </button>
            </div>
          </div>

          {/* ─ Contact Form ─ */}
          <div className="lg:col-span-2">
            {submitted ? (
              /* Success State */
              <div className="glass rounded-3xl border border-[#A3B19B]/20 p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A3B19B] to-[#D8C3A5] flex items-center justify-center mx-auto mb-6 animate-pulse-pastel">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#4A4F4D] mb-3">
                  Enquiry Submitted!
                </h2>
                <p className="text-[#4A4F4D]/60 mb-2 max-w-sm">
                  Thank you, <span className="text-[#A3B19B]">{user?.name}</span>! Our team will review your enquiry and reach out within <span className="text-[#A3B19B] font-semibold">24 hours</span>.
                </p>
                <p className="text-sm text-[#4A4F4D]/40 mb-8">Check your inbox at <span className="text-[#A3B19B]/70">{form.email}</span></p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 rounded-full btn-pastel font-bold text-sm"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <div className="glass rounded-3xl border border-[#A3B19B]/15 p-8">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#4A4F4D] mb-6">
                  Tell Us About Your Event
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Full Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={`w-full px-4 py-3 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.name ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Email *</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all ${errors.email ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Row 2: Phone + Event Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Phone Number</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Event Type *</label>
                      <select
                        name="eventType"
                        value={form.eventType}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-[#FAF9F6]/60 border rounded-xl text-sm transition-all appearance-none ${errors.eventType ? 'border-red-500/60' : 'border-[#A3B19B]/20'} ${form.eventType ? 'text-[#4A4F4D]' : 'text-[#4A4F4D]/30'}`}
                      >
                        <option value="" disabled className="bg-[#F2EFE9]">Select type</option>
                        {eventTypes.map((t) => <option key={t} value={t} className="bg-[#F2EFE9] text-[#4A4F4D]">{t}</option>)}
                      </select>
                      {errors.eventType && <p className="mt-1 text-xs text-red-400">{errors.eventType}</p>}
                    </div>
                  </div>

                  {/* Row 3: Date + Guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Preferred Date</label>
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm transition-all"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Expected Guests</label>
                      <input
                        name="guests"
                        type="number"
                        value={form.guests}
                        onChange={handleChange}
                        placeholder="e.g. 100"
                        min="1"
                        className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 4: Budget + Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Budget Range</label>
                      <select
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-sm transition-all appearance-none ${form.budget ? 'text-[#4A4F4D]' : 'text-[#4A4F4D]/30'}`}
                      >
                        <option value="" disabled className="bg-[#F2EFE9]">Select budget</option>
                        {budgetRanges.map((b) => <option key={b} value={b} className="bg-[#F2EFE9] text-[#4A4F4D]">{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Dream Destination</label>
                      <input
                        name="destination"
                        value={form.destination}
                        onChange={handleChange}
                        placeholder="e.g. Bali, Santorini..."
                        className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">Your Vision *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your dream event — theme, style, specific requirements, ideas..."
                      className={`w-full px-4 py-3 bg-[#FAF9F6]/60 border rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all resize-none ${errors.message ? 'border-red-500/60' : 'border-[#A3B19B]/20'}`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />Sending Enquiry...</>
                    ) : (
                      <>Send Enquiry <Send className="w-4 h-4" /></>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#4A4F4D]/30">
                    By submitting, you agree to our{' '}
                    <span className="text-[#A3B19B]/60 hover:text-[#A3B19B] cursor-pointer">Privacy Policy</span>
                    {' '}and{' '}
                    <span className="text-[#A3B19B]/60 hover:text-[#A3B19B] cursor-pointer">Terms of Service</span>.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
