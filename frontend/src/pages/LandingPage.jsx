import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight, Star, Award, Users, Globe, Sparkles,
  Heart, Briefcase, PartyPopper, ChevronRight,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import EventCard from '../components/EventCard';
import { destinations, testimonials, heroSlides } from '../data/events';
import { fetchEvents } from '../store/slices/eventsSlice';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

/* ── Scroll reveal hook ──────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

const stats = [
  { value: '500+', label: 'Events Planned', icon: Sparkles },
  { value: '120+', label: 'Destinations', icon: Globe },
  { value: '10K+', label: 'Happy Clients', icon: Users },
  { value: '15+', label: 'Years Experience', icon: Award },
];

const categories = [
  { name: 'Weddings', icon: Heart, color: '#c084fc', type: 'weddings' },
  { name: 'Birthdays', icon: PartyPopper, color: '#f472b6', type: 'birthdays' },
  { name: 'Milestones', icon: Sparkles, color: '#fb923c', type: 'milestone' },
  { name: 'Business', icon: Briefcase, color: '#667280', type: 'bussiness' },
];

const mapEventToCard = (event) => ({
  ...event,
  id: event._id,
  type: event.category,
  price: event.price ? `$${Number(event.price).toLocaleString()}` : '$0',
  rating: '4.9',
  reviews: '128',
  capacity: event.totalTickets,
  date: event.date
    ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '',
  image: event.image?.startsWith('http')
    ? event.image
    : event.image
      ? `${API_ORIGIN}${event.image}`
      : '/images/events_gallery_bg.png',
});

export default function LandingPage() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [activeSlide, setActiveSlide] = useState(0);
  const [statsRef, statsVisible] = useReveal();
  const [catRef, catVisible] = useReveal();
  const [eventsRef, eventsVisible] = useReveal();
  const [destRef, destVisible] = useReveal();
  const [testimonialRef, testimonialVisible] = useReveal();
  const [aboutRef, aboutVisible] = useReveal();
  const featuredEvents = events.slice(0, 4).map(mapEventToCard);

  useEffect(() => {
    if (!events.length) {
      dispatch(fetchEvents());
    }
  }, [dispatch, events.length]);

  return (
    <div className="bg-[#FAF9F6]">

      {/* ══════════════════════════════════════════════════
          1. HERO SLIDER
      ══════════════════════════════════════════════════ */}
      <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          onSlideChange={(s) => setActiveSlide(s.activeIndex)}
          loop
          className="h-full"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={slide.id} className="relative h-full overflow-hidden">
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${activeSlide === i ? 'scale-110' : 'scale-100'}`}
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="max-w-5xl mx-auto px-6 text-center mt-16">
                  <span className="font-cursive text-5xl sm:text-7xl md:text-8xl text-white/90 drop-shadow-md -rotate-2 block mb-2">
                    {slide.cursiveTitle}
                  </span>
                  <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-medium text-white tracking-[0.12em] uppercase drop-shadow-lg -mt-2">
                    {slide.mainTitle}
                  </h1>
                  <div className="flex items-center justify-center gap-4 mt-10 md:mt-16">
                    <Link to="/contact" className="btn-earthy px-10 py-4 rounded-full text-sm font-bold tracking-[0.2em] uppercase shadow-2xl hover:scale-105 transition-transform">
                      BOOK NOW
                    </Link>
                    <Link to="/events" className="px-10 py-4 rounded-full border-2 border-white/40 text-white text-sm font-bold tracking-[0.2em] uppercase hover:bg-white/10 transition-all">
                      EXPLORE
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* SaaS trust strip */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-3xl border border-[#E7DDCF] bg-white/95 backdrop-blur-md shadow-[0_22px_40px_rgba(34,37,49,0.12)] p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Client Satisfaction', value: '98.7%' },
              { label: 'Avg Planning Cycle', value: '11 Days' },
              { label: 'Global Vendor Partners', value: '1,200+' },
              { label: 'Event Success Score', value: '4.9/5' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#222531]">{item.value}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#667280] mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. STATS BAR
      ══════════════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-[#3F4A50] py-16 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <stat.icon className="w-7 h-7 text-[#C1A27B] mb-3 opacity-80" />
                <span className="font-['Playfair_Display'] text-3xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-white/50 uppercase tracking-[0.18em] mt-1 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          3. CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section ref={catRef} className="py-20 bg-[#FAF9F6] border-b border-[#EBE5DA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">What We Do</span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#4A4F4D] mt-3 font-medium">
              Event Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/events?type=${cat.type}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-[#EBE5DA] hover:border-[#C1A27B]/40 hover:shadow-md transition-all duration-300 group transition-all duration-700 ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${cat.color}18` }}>
                  <cat.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" style={{ color: cat.color }} />
                </div>
                <p className="text-xs font-semibold text-[#667280] tracking-wide text-center leading-tight">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. FEATURED EVENTS
      ══════════════════════════════════════════════════ */}
      <section ref={eventsRef} className="py-20 bg-white border-b border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 transition-all duration-700 ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div>
              <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">Handpicked For You</span>
              <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#4A4F4D] mt-2 font-medium">
                Featured Events
              </h2>
            </div>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C1A27B] hover:gap-3 transition-all shrink-0">
              View All Events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading && featuredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#EBE5DA] p-8 text-center text-sm text-[#667280]">
              Loading featured events...
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#EBE5DA] p-8 text-center text-sm text-[#667280]">
              No events available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event, i) => (
              <div
                key={event.id || i}
                className={`transition-all duration-700 ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <EventCard event={event} />
              </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. ABOUT SECTION
      ══════════════════════════════════════════════════ */}
      <section id="about" ref={aboutRef} className="py-20 bg-[#FAF9F6] border-b border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className={`transition-all duration-700 ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold block mb-3">Our Story</span>
              <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl text-[#4A4F4D] mb-6 font-medium leading-tight">
                Creating Memories<br />Beyond Borders
              </h2>
              <p className="text-[#667280]/80 text-base leading-relaxed mb-4">
                For over 15 years, Overseas Events has been transforming dreams into reality. We specialize in destination events that transcend ordinary gatherings — creating experiences that linger in memory long after the last dance.
              </p>
              <p className="text-[#667280]/60 text-sm leading-relaxed mb-8">
                From intimate beach weddings in Bali to grand corporate galas in Dubai, our dedicated team of planners handle every detail with care, creativity, and uncompromising attention to quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/events" className="btn-earthy px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase shadow-sm">
                  Explore Gallery
                </Link>
                <Link to="/contact" className="px-8 py-3 rounded-full border border-[#C1A27B] text-[#C1A27B] text-sm font-semibold tracking-widest uppercase hover:bg-[#C1A27B] hover:text-white transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
            <div
              className={`transition-all duration-700 grid grid-cols-2 gap-4 ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: '180ms' }}
            >
              <img
                src="/images/about_ceremony.jpg"
                alt="Event ceremony"
                className="h-72 w-full object-cover rounded-2xl shadow-md"
              />
              <img
                src="/images/about_gala.jpg"
                alt="Event gala"
                className="h-72 w-full object-cover rounded-2xl shadow-md mt-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. DESTINATIONS
      ══════════════════════════════════════════════════ */}
      <section id="destinations" ref={destRef} className="py-20 bg-white border-b border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${destVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">Our World</span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#4A4F4D] mt-3 font-medium">
              Top Event Locations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.slice(0, 3).map((dest, i) => (
              <div
                key={dest.id}
                className={`relative rounded-3xl overflow-hidden group shadow-sm border border-[#EBE5DA] transition-all duration-700 ${destVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <p className="text-white font-['Playfair_Display'] text-xl font-semibold">{dest.name}</p>
                    <p className="text-white/60 text-xs mt-1">{dest.tagline} · {dest.eventsCount} events</p>
                  </div>
                  <Link
                    to={`/events?dest=${dest.dest}`}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-[#C1A27B] hover:border-[#C1A27B] transition-all"
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/events" className="btn-earthy px-10 py-4 font-bold rounded-full text-sm tracking-widest uppercase">
              Explore All Destinations →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          7. TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section ref={testimonialRef} className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${testimonialVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">Kind Words</span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#4A4F4D] mt-3 font-medium">
              Client Testimonials
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl p-6 border border-[#EBE5DA] shadow-sm flex flex-col justify-between transition-all duration-700 ${testimonialVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[#C1A27B] text-[#C1A27B]" />
                    ))}
                  </div>
                  <p className="text-[#667280]/75 text-sm leading-relaxed italic mb-6">"{t.text}"</p>
                </div>
                <div className="border-t border-[#EBE5DA] pt-4">
                  <p className="text-xs font-bold tracking-widest text-[#667280] uppercase">{t.name}</p>
                  <p className="text-xs text-[#C1A27B] mt-0.5">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          8. CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#4A4F4D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-8 h-8 text-[#C1A27B] mx-auto mb-5 opacity-80" />
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-white font-medium mb-4">
            Ready to Plan Your Dream Event?
          </h2>
          <p className="text-white/55 text-base mb-10 leading-relaxed">
            Let our team of expert planners turn your vision into an unforgettable experience. We handle every detail so you can enjoy every moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn-earthy px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm shadow-lg hover:scale-105 transition-transform w-full sm:w-auto text-center">
              Start Planning
            </Link>
            <Link to="/contact" className="px-10 py-4 rounded-full border-2 border-white/30 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/10 transition-all w-full sm:w-auto text-center">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
