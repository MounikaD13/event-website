import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar, MapPin, Users, DollarSign, CheckCircle2,
  ArrowLeft, Clock, Star, Sparkles, CreditCard, Info
} from 'lucide-react';
import { eventsData } from '../data/events';
import api from '../utils/api';
import toast from 'react-hot-toast';

const packages = [
  {
    id: 'essential',
    name: 'Essential',
    price: 'Included',
    features: ['Event coordination', 'Venue setup', 'Basic décor', 'Day-of support'],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '+$1,500',
    features: ['Everything in Essential', 'Custom florals', 'Photography (8hrs)', 'Welcome reception', 'Guest transportation'],
    popular: true,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    price: '+$4,000',
    features: ['Everything in Premium', 'Videography', 'Live music/band', 'Honeymoon suite', 'Concierge service', 'Post-event dinner'],
    popular: false,
  },
];

export default function BookingPage() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const eventFromState = location.state?.event;
  const [selectedEvent, setSelectedEvent] = useState(eventFromState || eventsData[0]);
  const [selectedPackage, setSelectedPackage] = useState('premium');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [form, setForm] = useState({
    guests: '',
    date: selectedEvent?.date || '',
    specialRequests: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleConfirm = async () => {
    if (!form.guests) { toast.error('Please enter expected guest count'); return; }
    setLoading(true);
    try {
      await api.post('/contact', {
        fullName: user.name,
        email: user.email,
        phone: 'Not Provided', // Minimal placeholder since BookingPage lacks phone field
        eventDate: form.date || selectedEvent.date,
        eventType: selectedEvent.type,
        guestCount: form.guests,
        referredBy: 'Website Booking Flow',
        message: form.specialRequests || `Booking request for ${selectedEvent.title} - ${selectedPackage} package.`
      });
      setBooked(true);
      toast.success('Booking confirmed! Our team will contact you shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#A3B19B] to-[#D8C3A5] flex items-center justify-center mx-auto mb-6 animate-pulse-pastel">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#4A4F4D] mb-3">Booking Confirmed!</h1>
          <p className="text-[#4A4F4D]/60 mb-2">
            Your <span className="text-[#A3B19B] font-semibold">{selectedEvent.title}</span> booking has been received.
          </p>
          <p className="text-[#4A4F4D]/50 text-sm mb-8">
            A confirmation has been sent to <span className="text-[#A3B19B]">{user?.email}</span>. Our team will contact you within 24 hours to finalize details.
          </p>
          <div className="glass rounded-2xl border border-[#A3B19B]/20 p-5 mb-8 text-left space-y-3">
            <h3 className="text-sm font-semibold text-[#A3B19B]/70 uppercase tracking-wider mb-3">Booking Summary</h3>
            {[
              { label: 'Event', value: selectedEvent.title },
              { label: 'Location', value: selectedEvent.location },
              { label: 'Package', value: packages.find(p => p.id === selectedPackage)?.name },
              { label: 'Guests', value: form.guests },
              { label: 'Date', value: form.date || selectedEvent.date },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-[#4A4F4D]/40">{label}</span>
                <span className="text-[#4A4F4D] font-medium">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Link to="/events" className="flex-1 py-3 rounded-xl glass border border-[#A3B19B]/20 text-[#A3B19B] text-sm font-semibold text-center hover:border-[#A3B19B]/50 transition-all">
              Browse More
            </Link>
            <Link to="/contact" className="flex-1 py-3 rounded-xl btn-pastel text-sm font-bold text-center flex items-center justify-center gap-1.5">
              Contact Us <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#A3B19B]/70 hover:text-[#A3B19B] transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ─ LEFT: Event + Package ─ */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Card Preview */}
            <div className="glass rounded-2xl border border-[#A3B19B]/15 overflow-hidden">
              <div className="relative h-56">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6]/90 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#A3B19B] text-white mb-2 inline-block">
                    {selectedEvent.type}
                  </span>
                  <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#4A4F4D]">{selectedEvent.title}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-[#4A4F4D]/70">
                      <MapPin className="w-3.5 h-3.5 text-[#A3B19B]" /> {selectedEvent.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#4A4F4D]/70">
                      <Star className="w-3.5 h-3.5 fill-[#A3B19B] text-[#A3B19B]" /> {selectedEvent.rating} ({selectedEvent.reviews})
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-[#4A4F4D]/60 leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>

            {/* Package Selection */}
            <div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#4A4F4D] mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A3B19B]" /> Choose Your Package
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 ${
                      selectedPackage === pkg.id
                        ? 'border-[#A3B19B] bg-[#A3B19B]/5'
                        : 'border-[#A3B19B]/15 glass hover:border-[#A3B19B]/40'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-[#A3B19B] text-white whitespace-nowrap">
                        Most Popular
                      </span>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 mb-3 flex items-center justify-center ${
                      selectedPackage === pkg.id ? 'border-[#A3B19B] bg-[#A3B19B]' : 'border-[#A3B19B]/30'
                    }`}>
                      {selectedPackage === pkg.id && <div className="w-2 h-2 rounded-full bg-[#FAF9F6]" />}
                    </div>
                    <h3 className="font-semibold text-[#4A4F4D] mb-1">{pkg.name}</h3>
                    <p className="text-[#A3B19B] font-bold text-sm mb-3">{pkg.price}</p>
                    <ul className="space-y-1.5">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-[#4A4F4D]/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#A3B19B] mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Details Form */}
            <div className="glass rounded-2xl border border-[#A3B19B]/15 p-6">
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#4A4F4D] mb-5 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#A3B19B]" /> Event Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 inline mr-1 text-[#A3B19B]" /> Guest Count *
                    </label>
                    <input
                      name="guests"
                      type="number"
                      value={form.guests}
                      onChange={handleChange}
                      placeholder="Expected number of guests"
                      min="1"
                      max={selectedEvent.capacity}
                      className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all"
                    />
                    <p className="text-xs text-[#4A4F4D]/30 mt-1">Max capacity: {selectedEvent.capacity} guests</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#A3B19B]" /> Event Date
                    </label>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm transition-all"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A4F4D]/60 mb-2 uppercase tracking-wider">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={form.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special requirements, dietary needs, accessibility, theme preferences..."
                    className="w-full px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─ RIGHT: Order Summary ─ */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl border border-[#A3B19B]/20 p-6 sticky top-28">
              <h2 className="font-['Playfair_Display'] text-lg font-bold text-[#4A4F4D] mb-5 pb-4 border-b border-[#A3B19B]/10">
                Booking Summary
              </h2>

              {/* Event Info */}
              <div className="space-y-3 mb-5 pb-5 border-b border-[#A3B19B]/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50">Event</span>
                  <span className="text-[#4A4F4D] font-medium text-right max-w-[150px] truncate">{selectedEvent.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Venue</span>
                  <span className="text-[#4A4F4D]">{selectedEvent.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Date</span>
                  <span className="text-[#4A4F4D]">{form.date || selectedEvent.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50">Package</span>
                  <span className="text-[#A3B19B] font-semibold capitalize">{selectedPackage}</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2 mb-5 pb-5 border-b border-[#A3B19B]/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50">Base Price</span>
                  <span className="text-[#4A4F4D]">{selectedEvent.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50">Package Add-on</span>
                  <span className="text-[#4A4F4D]">{packages.find(p => p.id === selectedPackage)?.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4F4D]/50">Booking Fee</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-[#A3B19B]/10">
                  <span className="text-[#4A4F4D]">Starting From</span>
                  <span className="pastel-gradient text-lg">{selectedEvent.price}</span>
                </div>
              </div>

              {/* Booked By */}
              <div className="mb-5 px-3 py-3 rounded-xl bg-[#A3B19B]/5 border border-[#A3B19B]/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A3B19B] to-[#D8C3A5] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-xs text-[#A3B19B]/70 font-semibold">Booking for</p>
                  <p className="text-sm text-[#4A4F4D] font-medium">{user?.name}</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 rounded-xl btn-pastel font-bold text-white flex items-center justify-center gap-2 text-sm disabled:opacity-70 mb-3"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#0f0e17]/40 border-t-[#0f0e17] rounded-full animate-spin" />Confirming...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Confirm Booking</>
                )}
              </button>

              <p className="text-center text-xs text-[#4A4F4D]/30 leading-relaxed">
                No payment required now. Our team will contact you to finalize payment details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
