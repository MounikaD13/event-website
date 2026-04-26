import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Heart, ArrowRight } from 'lucide-react';

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
    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);
  return [ref, visible];
}

export default function AboutPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [storyRef, storyVisible] = useReveal();
  const [valuesRef, valuesVisible] = useReveal();
  const [teamRef, teamVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();

  useEffect(() => {
    setHeroVisible(true);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out ${heroVisible ? 'scale-105' : 'scale-100'}`}
          style={{ backgroundImage: "url('/images/about_ceremony.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
        
        <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 md:pt-32 transition-all duration-1000 transform ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <span className="text-[#C1A27B] text-sm uppercase tracking-[0.3em] font-bold block mb-4">
            Discover Our Origins
          </span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl text-white font-medium mb-6 drop-shadow-lg leading-tight">
            Crafting Timeless <br/><span className="italic text-[#C1A27B]">Legacies</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            From humble beginnings to national recognition, Elysium is built on a singular promise: turning your grandest visions into breathtaking reality.
          </p>
        </div>
      </section>

      {/* 2. THE STORY */}
      <section ref={storyRef} className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className={`transition-all duration-1000 delay-100 ${storyVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold block mb-3">Our Inspiration</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#2C2828] font-medium mb-8 leading-tight">
              A Decade of<br/>Unforgettable Magic
            </h2>
            
            <div className="space-y-6 text-[#667280] text-[15px] leading-relaxed font-light">
              <p>
                The Elysium concept was born out of a desire to eliminate the boundaries of traditional event planning. Our founders recognized that true luxury lies not just in opulence, but in the seamless, stress-free curation of once-in-a-lifetime moments.
              </p>
              <p>
                What started as a boutique agency catering to intimate beach weddings has blossomed into a premier national event concierge. Today, we orchestrate multi-day galas, royal palace weddings, and elite corporate retreats across 25+ iconic Indian destinations.
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-[#EBE5DA] grid grid-cols-2 gap-8">
              <div>
                <p className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#C1A27B] mb-2">12+</p>
                <p className="text-xs uppercase tracking-widest text-[#8B7355] font-bold">Years of Excellence</p>
              </div>
              <div>
                <p className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#C1A27B] mb-2">850</p>
                <p className="text-xs uppercase tracking-widest text-[#8B7355] font-bold">Events Delivered</p>
              </div>
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${storyVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-[#EBE5DA] shadow-2xl h-[400px] md:h-[600px]">
              <img src="/images/hero_indian_wedding.png" alt="Elysium Event" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-['Playfair_Display'] text-xl md:text-2xl italic">"Perfection is not an act, but a habit."</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE PHILOSOPHY */}
      <section ref={valuesRef} className="py-24 bg-white border-y border-[#EBE5DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-1000 ${valuesVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold block mb-3">Our Philosophy</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#2C2828] font-medium">The Pillars of Elysium</h2>
            <div className="w-16 h-1 bg-[#C1A27B] mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'National Access', desc: 'From the royal palaces of Rajasthan to the pristine beaches of Goa, our network unlocks the most exclusive Indian venues.' },
              { icon: Sparkles, title: 'Uncompromising Detail', desc: 'We obsess over the minutiae—from bespoke floral arrangements to Michelin-star catering.' },
              { icon: Heart, title: 'Personalized Touch', desc: 'Your story is unique. Our dedicated concierges ensure your event reflects your individual essence.' }
            ].map((val, i) => (
              <div 
                key={val.title}
                className={`bg-[#FAF9F6] p-8 md:p-10 rounded-[2rem] border border-[#EBE5DA] group hover:border-[#C1A27B]/50 transition-all duration-700 ${valuesVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-white border border-[#EBE5DA] shadow-sm flex items-center justify-center mb-6 group-hover:bg-[#C1A27B] group-hover:border-[#C1A27B] transition-colors duration-500">
                  <val.icon className="w-7 h-7 text-[#C1A27B] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="font-['Playfair_Display'] text-2xl font-semibold text-[#2C2828] mb-4">{val.title}</h3>
                <p className="text-[#667280] font-light leading-relaxed text-sm md:text-[15px]">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MEET THE TEAM */}
      <section ref={teamRef} className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-1000 ${teamVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <span className="text-[#C1A27B] text-xs uppercase tracking-[4px] font-semibold block mb-3">The Visionaries</span>
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#2C2828] font-medium">Meet the Leadership</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {[
            { name: 'Emma Richards', role: 'Founder & Creative Director', img: '/images/avatar_emma.jpg', desc: 'Former luxury hospitality executive with a passion for avant-garde design.' },
            { name: 'Priya Sharma', role: 'Head of National Operations', img: '/images/avatar_priya.jpg', desc: 'Logistics mastermind ensuring flawless execution across the Indian subcontinent.' }
          ].map((member, i) => (
            <div 
              key={member.name}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-6 md:p-8 rounded-[2rem] border border-[#EBE5DA] shadow-sm hover:shadow-xl transition-all duration-700 ${teamVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <img src={member.img} alt={member.name} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shadow-md border-4 border-[#FAF9F6] shrink-0" />
              <div className="text-center sm:text-left">
                <h4 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-[#2C2828]">{member.name}</h4>
                <p className="text-[#C1A27B] text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 mb-3">{member.role}</p>
                <p className="text-[#667280] text-sm md:text-[15px] font-light leading-relaxed">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <section ref={ctaRef} className="py-24 bg-[#2C2828] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/contact_bg.jpg')] opacity-10 bg-cover bg-center" />
        <div className={`max-w-3xl mx-auto px-4 text-center relative z-10 transition-all duration-1000 ${ctaVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <Globe className="w-12 h-12 text-[#C1A27B] mx-auto mb-6 opacity-80" />
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white font-medium mb-6 leading-tight">
            Ready to Begin Your <br/>Next Chapter?
          </h2>
          <p className="text-white/60 text-base md:text-lg mb-10 font-light px-4">
            Create an account to unlock our exclusive venue portfolio and start collaborating with our expert concierges.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-3 bg-[#C1A27B] text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold tracking-[0.2em] uppercase text-xs md:text-sm shadow-[0_20px_40px_rgba(193,162,123,0.3)] hover:bg-white hover:text-[#2C2828] hover:scale-105 transition-all duration-500">
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
