import { useState, useEffect, useRef, useMemo } from 'react';
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
  { value: '850+', label: 'Events Planned', icon: Sparkles, target: 850 },
  { value: '25+', label: 'Destinations', icon: Globe, target: 25 },
  { value: '15K+', label: 'Happy Clients', icon: Users, target: 15000 },
  { value: '20+', label: 'Years Experience', icon: Award, target: 20 },
];

const categories = [
  { name: 'Weddings', type: 'weddings', image: '/images/events/wedding.jpg', desc: 'Curating royal unions and timeless romantic tales.' },
  { name: 'Birthdays', type: 'birthdays', image: '/images/hero_birthday_party.png', desc: 'Crafting vibrant celebrations for every age and joy.' },
  { name: 'Milestones', type: 'milestone', image: '/images/events/stage.jpg', desc: 'Marking legendary achievements with grand productions.' },
  { name: 'Businesses', type: 'bussiness', image: '/images/event_dubai_gala.jpg', desc: 'Elevating corporate visions through high-end networking.' },
];

const interestImages = {
  weddings: [
    '/images/events/wedding.jpg',
    '/images/events/mehendi.jpg',
    '/images/event_beach_wedding.jpg',
    '/images/about_ceremony.jpg',
    '/images/events/decor.jpg'
  ],
  birthdays: [
    '/images/hero_birthday_party.png',
    '/images/event_beach_wedding.jpg',
    '/images/events/decor.jpg',
    '/images/about_gala.jpg'
  ],
  milestone: [
    '/images/events/stage.jpg',
    '/images/events/conference.jpg',
    '/images/event_dubai_gala.jpg',
    '/images/about_gala.jpg'
  ],
  bussiness: [
    '/images/event_dubai_gala.jpg',
    '/images/event_tokyo_conf.jpg',
    '/images/events/conference.jpg',
    '/images/about_gala.jpg'
  ],
  default: [
    '/images/events/wedding.jpg',
    '/images/hero_birthday_party.png',
    '/images/events/stage.jpg',
    '/images/event_dubai_gala.jpg',
    '/images/about_ceremony.jpg',
    '/images/about_gala.jpg'
  ]
};



export default function LandingPage() {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.events);
  const [activeSlide, setActiveSlide] = useState(0);
  const [statsRef, statsVisible] = useReveal();
  const [catRef, catVisible] = useReveal();
  const [eventsRef, eventsVisible] = useReveal();
  const [destRef, destVisible] = useReveal();
  const [testimonialRef, testimonialVisible] = useReveal();
  const [aboutRef, aboutVisible] = useReveal();


  useEffect(() => {
    if (!events.length) {
      dispatch(fetchEvents());
    }
  }, [dispatch, events.length]);

  // Interest Tracking & Personalization Logic
  const { dashboard } = useSelector((state) => state.userAccount);
  const [userInterest, setUserInterest] = useState(null);

  useEffect(() => {
    const trackInterest = () => {
      const scores = { weddings: 0, birthdays: 0, milestone: 0, bussiness: 0 };
      
      // 1. Check past inquiries (High weight)
      if (dashboard.inquiries?.length) {
        dashboard.inquiries.forEach(inq => {
          const type = inq.eventType?.toLowerCase();
          if (type === 'wedding' || type === 'weddings') scores.weddings += 10;
          else if (type === 'birthday' || type === 'birthdays') scores.birthdays += 10;
          else if (type === 'milestone') scores.milestone += 10;
          else if (type === 'business' || type === 'corporate' || type === 'bussiness') scores.bussiness += 10;
        });
      }

      // 2. Check category clicks from localStorage (Medium weight)
      const clicks = JSON.parse(localStorage.getItem('elysium_category_clicks') || '{}');
      Object.keys(clicks).forEach(cat => {
        if (scores[cat] !== undefined) scores[cat] += clicks[cat];
      });

      const top = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      if (top[0][1] > 0) setUserInterest(top[0][0]);
    };

    trackInterest();
  }, [dashboard.inquiries]);

  const handleCategoryClick = (type) => {
    const clicks = JSON.parse(localStorage.getItem('elysium_category_clicks') || '{}');
    clicks[type] = (clicks[type] || 0) + 1;
    localStorage.setItem('elysium_category_clicks', JSON.stringify(clicks));
  };

  // Personalize images based on interest
  const personalizedGallery = useMemo(() => {
    if (!userInterest || !interestImages[userInterest]) {
      return interestImages.default;
    }
    return interestImages[userInterest];
  }, [userInterest]);

  return (
    <div className="bg-[#FAF9F6]">

      {/* 1. HERO SLIDER */}
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
                    <Link to="/events" className="btn-earthy px-12 py-5 rounded-full text-sm font-bold tracking-[0.25em] uppercase shadow-2xl hover:scale-105 transition-transform">
                      EXPLORE MORE
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. STATS BAR (Moved up after Hero) */}
      <section ref={statsRef} className="bg-[#F6F1EB] py-24 relative overflow-hidden border-b border-[#E3DCD3]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C1A27B]/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center text-center transition-all duration-[1000ms] ease-out ${statsVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 border border-[#E3DCD3] shadow-sm group hover:border-[#C1A27B]/50 transition-all hover:-translate-y-1">
                  <stat.icon className="w-8 h-8 text-[#C1A27B] opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="relative overflow-hidden group">
                  <span className="font-['Playfair_Display'] text-5xl md:text-6xl font-bold text-[#3D3833] tracking-tight block mb-2 group-hover:text-[#C1A27B] transition-colors duration-500">
                    {stat.value}
                  </span>
                  <div className="w-0 h-0.5 bg-[#C1A27B]/30 mx-auto group-hover:w-full transition-all duration-700" />
                </div>
                <span className="text-[11px] text-[#8C8479] uppercase tracking-[0.4em] mt-4 font-bold leading-relaxed">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. EVENT CATEGORIES (Moved up as requested) */}
      <section ref={catRef} className="py-24 bg-white border-b border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">Bespoke Experiences</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#2C2828] mt-3 font-medium">
              Event Categories
            </h2>
            <div className="w-20 h-1 bg-[#C1A27B] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className={`group relative h-[420px] rounded-[2.5rem] overflow-hidden shadow-xl border border-[#EBE5DA] transition-all duration-700 ${catVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
                <div className="absolute inset-0 bg-[#C1A27B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-['Playfair_Display'] text-3xl font-bold text-white mb-3 tracking-wide">
                      {cat.name}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {cat.desc}
                    </p>
                    <Link
                      to={`/events?type=${cat.type}`}
                      onClick={() => handleCategoryClick(cat.type)}
                      className="inline-flex items-center gap-3 bg-white text-[#2C2828] px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-[#C1A27B] hover:text-white transition-all"
                    >
                      Browse {cat.name} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ══════════════════════════════════════════════════
          4. FEATURED EVENTS
      ══════════════════════════════════════════════════ */}
      <section ref={eventsRef} className="py-24 bg-white border-b border-[#EBE5DA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 transition-all duration-700 ${eventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div>
              <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">
                {userInterest ? `Your Personalized Inspiration: ${userInterest.charAt(0).toUpperCase() + userInterest.slice(1)}` : 'Handpicked Inspiration'}
              </span>
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#4A4F4D] mt-2 font-medium">
                Behold Our Miracles
              </h2>
            </div>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-[#C1A27B] hover:gap-4 transition-all shrink-0">
              View All Events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className={`transition-all duration-700 ${eventsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 1.5 },
                1024: { slidesPerView: 2 },
              }}
              className="pb-16 !overflow-visible"
            >
              {personalizedGallery.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="relative h-[450px] md:h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl group border border-[#EBE5DA]">
                    <img 
                      src={img} 
                      alt="Inspiration" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
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
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-white shadow-sm border border-[#EBE5DA] group hover:border-[#C1A27B]/40 transition-all">
                  <div className="p-3 bg-[#C1A27B]/10 rounded-2xl text-[#C1A27B] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C2828] text-xs uppercase tracking-widest mb-2">Heritage Mastery</h4>
                    <p className="text-xs text-[#667280] leading-relaxed">Specializing in the intricate tapestry of South Indian rituals, from vibrant Mehendi carnivals to soulful Muhurthams.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-3xl bg-white shadow-sm border border-[#EBE5DA] group hover:border-[#C1A27B]/40 transition-all">
                  <div className="p-3 bg-[#C1A27B]/10 rounded-2xl text-[#C1A27B] group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C2828] text-xs uppercase tracking-widest mb-2">Iconic Venues</h4>
                    <p className="text-xs text-[#667280] leading-relaxed">Exclusive access to Taj Falaknuma, Hampi's ruins, and Kerala's pristine backwaters for legendary celebrations.</p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`transition-all duration-700 grid grid-cols-2 gap-4 ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: '180ms' }}
            >
              <img
                src="/images/hero_indian_wedding.png"
                alt="Traditional Indian Wedding"
                className="h-80 w-full object-cover rounded-[2.5rem] shadow-xl border-4 border-white"
              />
              <img
                src="/images/places/hyderabad.jpg"
                alt="Taj Falaknuma Palace"
                className="h-80 w-full object-cover rounded-[2.5rem] shadow-xl mt-12 border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. DESTINATIONS
      ══════════════════════════════════════════════════ */}
      <section id="destinations" ref={destRef} className="py-24 bg-white border-b border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${destVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold">Exquisite Venues</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#4A4F4D] mt-3 font-medium">
              Top Event Locations
            </h2>
            <div className="w-20 h-1 bg-[#C1A27B] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {destinations.slice(0, 6).map((dest, i) => (
              <div
                key={dest.id}
                className={`relative rounded-[2.5rem] overflow-hidden group shadow-lg border border-[#EBE5DA] transition-all duration-700 ${destVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                  <div>
                    <p className="text-white font-['Playfair_Display'] text-2xl font-bold tracking-wide">{dest.name}</p>
                    <p className="text-white/70 text-sm mt-2 font-light uppercase tracking-[0.2em]">{dest.tagline}</p>
                  </div>
                  <Link
                    to={`/events?dest=${dest.dest}`}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-[#C1A27B] hover:border-[#C1A27B] transition-all text-white"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-16">
            <Link to="/events" className="btn-earthy px-12 py-5 font-bold rounded-full text-sm tracking-[0.25em] uppercase shadow-lg">
              Explore All Destinations
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

      {/* 8. CTA BANNER */}
      <section className="py-24 bg-[#4A4F4D] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/events_gallery_bg.png')] opacity-10 bg-cover bg-center" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-1 bg-[#C1A27B] mx-auto mb-10 rounded-full" />
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl text-white font-medium mb-8 leading-tight">
            Ready to Plan Our Dream Event?
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Let our team of expert planners turn your vision into an unforgettable masterpiece. From heritage palaces to backwater retreats, we weave magic into every detail.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/contact" 
              className="group relative px-16 py-6 overflow-hidden rounded-full bg-[#C1A27B] text-[#2C2828] font-bold tracking-[0.3em] uppercase text-sm shadow-[0_20px_50px_rgba(193,162,123,0.3)] hover:scale-105 transition-all duration-500"
            >
              <span className="relative z-10">Start Planning Now</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
