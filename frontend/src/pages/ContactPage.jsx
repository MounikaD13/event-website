import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Send, MessageSquare, User, Calendar,
  Users, Target, DollarSign, HelpCircle, Sparkles, Clock, Globe
} from 'lucide-react';
import { submitInquiry } from '../store/slices/userAccountSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { createSocket } from '../utils/socket';

const ContactPage = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.userAccount);
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const [inquiryForm, setInquiryForm] = useState({
    eventType: 'Wedding', eventDate: '', guestCount: '', phone: '',
    referredBy: 'Other', budgetRange: '', location: '',
    estimatedDuration: '', specificServices: '', isFlexibleDate: false, message: '',
  });

  const [contactForm, setContactForm] = useState({ fullName: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [liveChannelReady, setLiveChannelReady] = useState(false);

  useEffect(() => {
    const socket = createSocket();

    const handleConnect = () => setLiveChannelReady(true);
    const handleDisconnect = () => setLiveChannelReady(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      setLiveChannelReady(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, []);

  const handleInquiryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInquiryForm({ ...inquiryForm, [name]: type === 'checkbox' ? checked : value });
  };
  const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(submitInquiry(inquiryForm)).unwrap();
      toast.success('Thank you! Our team will reach out soon.');
      setInquiryForm({ eventType: 'Wedding', eventDate: '', guestCount: '', phone: '', referredBy: 'Other', budgetRange: '', location: '', estimatedDuration: '', specificServices: '', isFlexibleDate: false, message: '' });
    } catch (err) { toast.error(err || 'Failed to submit inquiry'); }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.fullName || !contactForm.email || !contactForm.message) { toast.error('Please fill in all fields'); return; }
    if (!/\S+@\S+\.\S+/.test(contactForm.email)) { toast.error('Please enter a valid email address'); return; }
    setContactLoading(true);
    try {
      await api.post('/contact', contactForm);
      toast.success('Message sent! We\'ll get back to you soon.');
      setContactForm({ fullName: '', email: '', message: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setContactLoading(false); }
  };

  const inputCls = "w-full px-4 py-3.5 bg-white border border-[#E8E1D5] rounded-xl text-[#2C2828] text-sm placeholder:text-[#B5AFA5] focus:border-[#C1A27B] focus:ring-2 focus:ring-[#C1A27B]/10 transition-all outline-none";
  const labelCls = "block text-[10px] font-bold text-[#8B7355] uppercase tracking-[0.2em] mb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <div className="relative min-h-[45vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden bg-black pt-20 pb-12">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/images/contact_bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="font-cursive text-[#C1A27B] text-3xl md:text-4xl block mb-3">Get in Touch</span>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 mb-5">
            <span className={`h-2 w-2 rounded-full ${liveChannelReady ? 'bg-green-400' : 'bg-white/50'}`} />
            {liveChannelReady ? 'Live Support Channel Ready' : 'Connecting Support Channel'}
          </div>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold text-white mb-4">
            {isAuthenticated ? 'Request a ' : 'Contact Our '}
            <span className="text-[#C1A27B]">{isAuthenticated ? 'Consultation' : 'Experts'}</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {isAuthenticated
              ? 'Tell us your vision and we\'ll craft the perfect event experience for you.'
              : 'Have a question? Our team of luxury event planners is here to help.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl p-7 md:p-8 border border-[#E8E1D5] shadow-sm">
              <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#2C2828] mb-6">Contact Information</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: 'Elysium.events.com' },
                  { icon: Phone, label: 'Call Us', value: '+91 9876543210' },
                  { icon: MapPin, label: 'Visit Us', value: 'Siddartha, Mogalrajpuram, Vijayawada, AP' },
                  { icon: Clock, label: 'Hours', value: 'Mon–Sat: 9AM – 7PM' },
                ].map(({ icon: Icon, label, value }) => ( // eslint-disable-line no-unused-vars
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#C1A27B]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#C1A27B]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-widest">{label}</p>
                      <p className="text-sm text-[#4A4F4D] font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card (Black Card) */}
            <div className="bg-gradient-to-br from-[#4A4F4D] to-[#2C2828] rounded-2xl p-7 md:p-8 text-white flex-grow flex flex-col">
              <Globe className="w-8 h-8 text-[#C1A27B] mb-4" />
              <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-4">Elite Destination Planning</h3>
              <div className="space-y-4 mb-8">
                <p className="text-white/70 text-sm leading-relaxed font-light">
                  From the royal palaces of Udaipur to the serene beaches of Goa and Vizag, we specialize in curating ultra-luxury destination experiences across the Indian subcontinent.
                </p>
                <p className="text-white/70 text-sm leading-relaxed font-light">
                  Our dedicated concierge team manages every intricate detail—from high-profile logistics and luxury hospitality to grand-scale decor—ensuring your celebration is a legendary affair that reflects your unique vision and heritage.
                </p>
                <p className="text-white/70 text-sm leading-relaxed font-light">
                  Whether you are planning a grand wedding in Vijayawada or a corporate retreat in the hills, Elysium brings unparalleled sophistication to your doorstep.
                </p>
              </div>
              <div className="mt-auto">
                <Link to="/events" className="inline-flex items-center gap-2 text-[#C1A27B] text-sm font-bold uppercase tracking-widest hover:gap-3 transition-all">
                  Explore Destinations <Sparkles className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-2">
            {isAuthenticated ? (
              <form onSubmit={handleInquirySubmit} className="bg-white rounded-2xl p-7 md:p-10 border border-[#E8E1D5] shadow-sm">
                <div className="mb-8">
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C2828] mb-1">Event Consultation Request</h2>
                  <p className="text-sm text-[#8B7355]">Fill in your details and our team will create a tailored proposal.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className={labelCls}><Target className="w-3 h-3" /> Event Type</label>
                    <select name="eventType" value={inquiryForm.eventType} onChange={handleInquiryChange} className={inputCls}>
                      {['Wedding','Birthday','Corporate','Graduation','Anniversary','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}><Calendar className="w-3 h-3" /> Event Date</label>
                    <input type="date" name="eventDate" value={inquiryForm.eventDate} onChange={handleInquiryChange} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Users className="w-3 h-3" /> Guest Count</label>
                    <input type="number" name="guestCount" value={inquiryForm.guestCount} onChange={handleInquiryChange} required placeholder="e.g. 500+" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Phone className="w-3 h-3" /> Contact Phone</label>
                    <input type="tel" name="phone" value={inquiryForm.phone} onChange={handleInquiryChange} required placeholder="+91 90000 00000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><DollarSign className="w-3 h-3" /> Budget Range</label>
                    <input type="text" name="budgetRange" value={inquiryForm.budgetRange} onChange={handleInquiryChange} placeholder="e.g. ₹20 Lakhs - ₹50 Lakhs" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="w-3 h-3" /> Location Preference</label>
                    <input type="text" name="location" value={inquiryForm.location} onChange={handleInquiryChange} placeholder="e.g. Vijayawada, AP" className={inputCls} />
                  </div>
                </div>

                <div className="mb-5">
                  <label className={labelCls}><HelpCircle className="w-3 h-3" /> How did you hear about us?</label>
                  <select name="referredBy" value={inquiryForm.referredBy} onChange={handleInquiryChange} className={inputCls}>
                    {['Instagram','Facebook','Google','Friend','Other'].map(r => <option key={r} value={r}>{r === 'Google' ? 'Google Search' : r === 'Friend' ? 'A Friend' : r}</option>)}
                  </select>
                </div>

                <div className="mb-5">
                  <label className={labelCls}><MessageSquare className="w-3 h-3" /> Special Requirements & Vision</label>
                  <textarea name="message" value={inquiryForm.message} onChange={handleInquiryChange} required rows={4} placeholder="Tell us about the atmosphere, theme, and key goals..." className={inputCls + " h-auto py-3.5 resize-none"} />
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <input type="checkbox" id="isFlexibleDate" name="isFlexibleDate" checked={inquiryForm.isFlexibleDate} onChange={handleInquiryChange}
                    className="w-4 h-4 accent-[#C1A27B] rounded" />
                  <label htmlFor="isFlexibleDate" className="text-sm text-[#8B7355]">Our dates are flexible (within ± 7 days)</label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-4 btn-earthy rounded-xl text-sm font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Request Consultation</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-7 md:p-10 border border-[#E8E1D5] shadow-sm">
                <div className="mb-8">
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C2828] mb-1">Send Us a Message</h2>
                  <p className="text-sm text-[#8B7355]">
                    Have a question? We'll get back within 24 hours.{' '}
                    <Link to="/signup" className="text-[#C1A27B] font-semibold hover:underline">Sign up</Link> for a full consultation experience.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelCls}><User className="w-3 h-3" /> Full Name</label>
                    <input type="text" name="fullName" value={contactForm.fullName} onChange={handleContactChange} required placeholder="Your full name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Mail className="w-3 h-3" /> Email Address</label>
                    <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required placeholder="your@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MessageSquare className="w-3 h-3" /> Your Message</label>
                    <textarea name="message" value={contactForm.message} onChange={handleContactChange} required rows={5} placeholder="Tell us about what you're looking for..." className={inputCls + " h-auto py-3.5 resize-none"} />
                  </div>

                  <button type="submit" disabled={contactLoading}
                    className="w-full py-4 btn-earthy rounded-xl text-sm font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-3 disabled:opacity-50">
                    {contactLoading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;