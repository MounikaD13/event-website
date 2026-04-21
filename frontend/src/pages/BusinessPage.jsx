import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar, ArrowRight, Star, Briefcase, Building, Coffee, Monitor, Zap, GlassWater } from 'lucide-react';
import { businessCategories, businessEvents } from '../data/businessData';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BusinessCard = ({ event }) => {
  const navigate = useNavigate();
  
  const handleBook = () => {
    toast.success(`Interest in ${event.title} registered!`, {
      style: {
        background: '#1a1a2e',
        color: '#f8f5f0',
        border: '1px solid rgba(201, 168, 76, 0.3)',
      }
    });
    navigate('/booking', { state: { event } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-[#C1A27B]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#C1A27B]/10 flex flex-col h-full ring-1 ring-black/[0.02]"
    >
      {/* Image Section - More balanced height */}
      <div className="relative h-60 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
        
        {/* Category Badge - Smaller */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
            {event.category}
          </span>
        </div>

        {/* Rating - Smaller */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
          <Star className="w-3 h-3 fill-[#C1A27B] text-[#C1A27B]" />
          <span className="text-[10px] font-bold text-white tracking-widest">{event.rating}</span>
        </div>
      </div>

      {/* Content Section - Balanced internal spacing */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[#C1A27B] mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{event.location}</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-[#1a1c1b] mb-2 group-hover:text-[#C1A27B] transition-colors duration-400">
            {event.title}
          </h3>
        </div>

        <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-3 font-medium opacity-80">
          {event.description}
        </p>

        {/* Features - More compact */}
        <div className="flex flex-wrap gap-2 mb-8">
          {event.amenities.slice(0, 2).map((amenity, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-50 border border-transparent rounded-lg text-[9px] text-gray-500 font-bold uppercase tracking-tight">
              {amenity}
            </span>
          ))}
          {event.amenities.length > 2 && (
            <span className="px-2 py-1 bg-[#C1A27B]/5 rounded-lg text-[9px] text-[#C1A27B] font-bold">+{event.amenities.length - 2}</span>
          )}
        </div>

        {/* Footer info - Scaled down */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-gray-300 font-black mb-1">Capacity</span>
            <div className="flex items-center gap-2 text-[#1a1c1b]">
              <Users className="w-3.5 h-3.5 text-[#C1A27B]" />
              <span className="text-xs font-bold">{event.capacity.split(' - ')[0]} Guests</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[8px] uppercase tracking-widest text-gray-300 font-black mb-1 block">Starting From</span>
            <p className="text-lg font-['Playfair_Display'] font-bold text-[#1a1c1b]">{event.price}</p>
          </div>
        </div>

        <button
          onClick={handleBook}
          className="mt-8 w-full py-4 rounded-xl bg-[#1a1c1b] text-white font-bold text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#C1A27B] hover:shadow-lg shadow-black/5 group/btn"
        >
          <span>Learn More</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
        </button>
      </div>
    </motion.div>
  );
};

export default function BusinessPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(businessEvents);

  useEffect(() => {
    let result = businessEvents;
    if (selectedCategory !== 'All') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredEvents(result);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section - Scaled Down & Responsive */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-[#050505]">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/images/business_hero.png" 
            alt="Business Venue" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, tracking: '0px' }}
            animate={{ opacity: 1, tracking: '6px' }}
            transition={{ delay: 0.3, duration: 1 }}
            className="font-cursive text-[#C1A27B] text-3xl md:text-5xl mb-6 block"
          >
            Elysium Corporate
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="font-['Playfair_Display'] text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 uppercase tracking-tight"
          >
            ELITE <span className="text-[#C1A27B]">SPACES</span>
          </motion.h1>
          <div className="w-16 h-[1px] bg-[#C1A27B] mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="text-white/50 text-[10px] md:text-xs max-w-2xl mx-auto font-bold tracking-[0.3em] mb-12 uppercase"
          >
            Redefining the architecture of corporate excellence & global diplomacy
          </motion.p>
        </div>
      </section>

      {/* Main Content - Calibrated Spacing */}
      <section className="relative z-20 pb-20 md:pb-32">
        {/* Floating Filter Bar - Scaled Down */}
        <div className="max-w-6xl mx-auto px-6 -mt-12 md:-mt-16">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-xl border border-gray-50 flex flex-col lg:flex-row gap-6 items-center justify-between mb-16 md:mb-24">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
              {businessCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 md:px-8 md:py-3.5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-[#1a1c1b] text-white' 
                      : 'text-gray-300 hover:text-[#C1A27B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-[350px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#C1A27B] transition-colors" />
              <input
                type="text"
                placeholder="Search Venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 md:py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-sm text-[#1a1c1b] placeholder:text-gray-300 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-6xl mx-auto px-6 mb-12 md:mb-16 text-center md:text-left">
            <span className="text-[#C1A27B] font-black tracking-[0.3em] uppercase text-[9px] mb-4 block">Curated Selection</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-black text-[#1a1c1b] mb-4">
                The Portfolio
            </h2>
            <div className="w-16 h-1 bg-[#C1A27B] mb-6 mx-auto md:mx-0" />
            <p className="text-gray-300 font-bold tracking-widest text-[10px] uppercase">
                {filteredEvents.length} ELITE LISTINGS
            </p>
        </div>

        {/* Grid - Balanced Gaps */}
        <div className="max-w-6xl mx-auto px-6 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event) => (
                    <BusinessCard key={event.id} event={event} />
                    ))}
                </AnimatePresence>
            </div>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                <Briefcase className="w-6 h-6 text-gray-100" />
            </div>
            <h3 className="font-['Playfair_Display'] text-2xl font-bold text-gray-300 mb-2">No matching venues</h3>
            <p className="text-gray-300 font-bold uppercase tracking-widest text-[9px]">Adjust your search benchmarks.</p>
          </motion.div>
        )}
      </section>

      {/* Feature Section - Scaled Down */}
      <section className="bg-white py-20 md:py-32 border-t border-gray-50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 md:mb-24">
                <span className="font-cursive text-[#C1A27B] text-4xl mb-4 block">The Protocol</span>
                <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#1a1c1b]">Infrastructure Excellence</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                {[
                    { icon: Monitor, title: "Global Uplink", desc: "Redundant satellite and high-speed fiber." },
                    { icon: Coffee, title: "Private Lounges", desc: "Culinary experiences by world-renowned chefs." },
                    { icon: GlassWater, title: "Elite Concierge", desc: "Multilingual staff for every corporate need." },
                    { icon: Building, title: "Capital Network", desc: "Strategic presence in global finance centers." }
                ].map((feature, i) => (
                    <div key={i} className="text-center group">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-8 group-hover:bg-[#1a1c1b] transition-all duration-300 group-hover:scale-105">
                            <feature.icon className="w-6 h-6 text-[#C1A27B]" />
                        </div>
                        <h4 className="text-[#1a1c1b] font-['Playfair_Display'] text-xl font-bold mb-4">{feature.title}</h4>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed px-4 opacity-80">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
