import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, MapPin, Award, Users, Globe, Sparkles, Play, Heart, Briefcase, PartyPopper, Sun } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import EventCard from '../components/EventCard';
import { eventsData, destinations, testimonials, heroSlides } from '../data/events';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
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
  { name: 'Weddings', icon: Heart, color: 'text-purple-400' },
  { name: 'Corporate', icon: Briefcase, color: 'text-[#667280]' },
  { name: 'Private Parties', icon: PartyPopper, color: 'text-pink-500' },
  { name: 'Conferences', icon: Globe, color: 'text-blue-400' },
  { name: 'Galas', icon: Sparkles, color: 'text-orange-400' },
  { name: 'Retreats', icon: Sun, color: 'text-green-500' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [statsRef, statsVisible] = useReveal();
  const [eventsRef, eventsVisible] = useReveal();
  const [destRef, destVisible] = useReveal();
  const [testimonialRef, testimonialVisible] = useReveal();
  const [aboutRef, aboutVisible] = useReveal();

  return (
    <div className="bg-[#FAF9F6]">
      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
          loop
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative h-full overflow-hidden">
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${activeSlide === index ? 'scale-110' : 'scale-100'}`}
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-[#0f0e17]/50" />
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center mt-12">
                  <div className="max-w-4xl mx-auto animate-fadeInUp px-4">
                    <span className="font-cursive text-5xl sm:text-7xl md:text-8xl text-white drop-shadow-md transform -rotate-3 mb-2 sm:mb-4 z-10 block text-center opacity-95">
                      {slide.cursiveTitle}
                    </span>
                    <h1 className="font-['Playfair_Display'] text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-none font-medium text-white tracking-[0.1em] sm:tracking-[0.15em] text-center uppercase mb-8 sm:mb-12 drop-shadow-lg -mt-2 sm:-mt-6">
                      {slide.mainTitle}
                    </h1>
                    <div className="flex justify-center mt-12 md:mt-20">
                      <Link
                        to="/booking"
                        className="btn-earthy px-16 py-6 rounded-full text-xl font-bold tracking-[0.25em] uppercase shadow-2xl transition-all hover:scale-105 active:scale-95"
                      >
                        BOOK NOW
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-20 mt-10 bg-[#FAF9F6]">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/events?type=${cat.name.toLowerCase().replace(' ', '-')}`}
                className="bg-[#F6F4F0] rounded-[2rem] px-10 py-5 text-center border border-gray-200 hover:border-[#C1A27B]/40 hover:bg-[#F0EBE3] transition-all duration-300 group cursor-pointer flex flex-col items-center flex-1 min-w-[150px] max-w-[200px]"
              >
                <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
                  <cat.icon className={`w-8 h-8 ${cat.color} opacity-80`} />
                </div>
                <p className="text-sm font-semibold text-[#667280] tracking-wide transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS ─── */}
      <section id="destinations" ref={destRef} className="py-24 bg-[#FAF9F6]">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 reveal ${destVisible ? 'visible' : ''}`}>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-[3.25rem] text-[#667280] uppercase tracking-[0.1em] mt-2 font-medium">
              Event Locations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {destinations.slice(0, 3).map((dest, i) => (
              <div
                key={dest.id}
                className={`bg-[#EBE5DA] p-1.5 pb-[3.5rem] rounded-[2.5rem] relative reveal shadow-sm ${destVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-[400px] lg:h-[480px] object-cover rounded-[2rem]"
                />
                
                {/* Overlapping Pill at the bottom center */}
                <div className="absolute left-0 right-0 -bottom-6 flex justify-center">
                  <Link
                    to={`/events?dest=${dest.dest}`}
                    className="bg-white text-[#C1A27B] hover:bg-[#C1A27B] hover:text-white font-bold tracking-[0.15em] text-sm py-3.5 px-10 rounded-full shadow-md transition-all text-center uppercase"
                  >
                    {dest.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-32 scale-95">
             <Link to="/events" className="btn-earthy px-10 py-4 font-bold rounded-full text-base tracking-widest uppercase">
              Start Planning Your Event &gt;&gt;
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ABOUT SECTION ─── */}
      <section id="about" ref={aboutRef} className="py-24 bg-white border-t border-[#EBE5DA]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`reveal ${aboutVisible ? 'visible' : ''}`}>
              <span className="text-[#C1A27B] text-sm tracking-widest uppercase mb-1 block font-semibold">Our Story</span>
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#667280] mb-6 uppercase tracking-widest font-medium leading-tight">
                Creating Memories<br/>Beyond Borders
              </h2>
              <p className="text-[#667280]/80 text-lg leading-relaxed mb-6">
                For over 15 years, Overseas Events has been transforming dreams into reality. We specialize in destination events that transcend ordinary gatherings—creating experiences that linger in memory long after the last dance.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/events" className="btn-earthy px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase shadow-sm">
                  Explore Gallery
                </Link>
              </div>
            </div>
            <div className={`reveal ${aboutVisible ? 'visible' : ''} relative`} style={{ transitionDelay: '200ms' }}>
              <div className="grid grid-cols-2 gap-4">
                 <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80"
                  alt="Event Ceremony"
                  className="h-[340px] w-full object-cover rounded-md shadow-sm"
                />
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80"
                  alt="Event Gala"
                  className="h-[340px] w-full object-cover rounded-md mt-16 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section ref={testimonialRef} className="py-24 bg-[#FAF9F6]">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 reveal ${testimonialVisible ? 'visible' : ''}`}>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-[3.25rem] text-[#667280] uppercase tracking-[0.1em] mt-2 font-medium">
              Client Testimonials
            </h2>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={24}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="pb-16"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="bg-white p-8 shadow-sm border-t-2 border-t-[#EBE5DA] border-x border-b border-gray-100 h-full flex flex-col justify-between rounded-b-md">
                   <div>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, index) => (
                          <Star key={index} className="w-4 h-4 fill-[#C1A27B] text-[#C1A27B]" />
                        ))}
                      </div>
                      <p className="text-[#667280]/80 text-[15px] leading-relaxed mb-6 italic">"{t.text}"</p>
                   </div>
                  <div>
                    <p className="text-[13px] font-bold tracking-widest text-[#667280] uppercase">{t.name}</p>
                    <p className="text-xs text-[#C1A27B] mt-1">{t.event}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
      
    </div>
  );
}
