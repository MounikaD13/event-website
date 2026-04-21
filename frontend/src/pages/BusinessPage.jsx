import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar, ArrowRight, Star, Briefcase, Building, Coffee, Monitor, Zap, GlassWater, ChevronDown, Check } from 'lucide-react';
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100/60 hover:border-[#C1A27B]/40 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(193,162,123,0.12)] flex flex-col h-full ring-1 ring-black/[0.01]"
    >
      {/* Image Section - Refined Proportions */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
        
        {/* Category Badge - More elegant */}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl">
            {event.category}
          </span>
        </div>

        {/* Rating - More elegant */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-1.5 bg-black/20 backdrop-blur-xl rounded-full border border-white/10">
          <Star className="w-3.5 h-3.5 fill-[#C1A27B] text-[#C1A27B]" />
          <span className="text-[10px] font-black text-white tracking-widest">{event.rating}</span>
        </div>
      </div>

      {/* Content Section - Massive Breathing Room */}
      <div className="p-10 md:p-11 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 text-[#C1A27B] mb-3">
            <div className="w-8 h-[1px] bg-[#C1A27B]/30" />
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">{event.location}</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#1a1c1b] mb-3 group-hover:text-[#C1A27B] transition-colors duration-500 leading-tight">
            {event.title}
          </h3>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80 italic">
          "{event.description}"
        </p>

        {/* Features - Better spacing */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {event.amenities.slice(0, 2).map((amenity, idx) => (
            <span key={idx} className="px-4 py-1.5 bg-[#FAF9F6] border border-gray-100 rounded-xl text-[10px] text-gray-500 font-bold uppercase tracking-tight shadow-sm">
              {amenity}
            </span>
          ))}
          {event.amenities.length > 2 && (
            <span className="px-3 py-1.5 bg-[#C1A27B]/5 rounded-xl text-[10px] text-[#C1A27B] font-bold shadow-sm">+{event.amenities.length - 2} More</span>
          )}
        </div>

        {/* Footer info - Robust spacing and hierarchy */}
        <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-300 font-black mb-2">Max Capacity</span>
            <div className="flex items-center gap-2.5 text-[#1a1c1b]">
              <div className="p-1.5 bg-[#C1A27B]/10 rounded-lg">
                <Users className="w-4 h-4 text-[#C1A27B]" />
              </div>
              <span className="text-sm font-bold tracking-tight">{event.capacity} Persons</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-300 font-black mb-2 block">Starting rate</span>
            <p className="text-2xl font-['Playfair_Display'] font-black text-[#1a1c1b] tracking-tight">{event.price}</p>
          </div>
        </div>

        {/* Button - More substantial */}
        <button
          onClick={handleBook}
          className="mt-10 w-full py-5 rounded-[1.5rem] bg-[#1a1c1b] text-white font-black text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all duration-500 hover:bg-[#C1A27B] hover:shadow-[0_20px_40px_rgba(193,162,123,0.3)] group/btn"
        >
          <span>Reserve Venue</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
        </button>
      </div>
    </motion.div>
  );
};

const CategoryDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full lg:w-80" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-8 py-5 bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] text-[#1a1c1b] transition-all hover:border-[#C1A27B]/30"
      >
        <div className="flex items-center gap-4">
          <Briefcase className="w-4 h-4 text-[#C1A27B]" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
            {selected === 'All' ? 'Our Portfolios' : selected}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#C1A27B] transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-4 p-3 bg-white rounded-[2rem] border border-gray-50 shadow-[0_50px_100px_rgba(0,0,0,0.15)] z-[100] max-h-96 overflow-y-auto no-scrollbar"
          >
            {businessCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelect(cat);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
                  selected === cat 
                    ? 'bg-[#1a1c1b] text-white shadow-lg shadow-black/10' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#1a1c1b]'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat}</span>
                {selected === cat && <Check className="w-4 h-4 text-[#C1A27B]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#050505]">
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
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, tracking: '0px' }}
            animate={{ opacity: 1, tracking: '8px' }}
            transition={{ delay: 0.3, duration: 1.5 }}
            className="font-cursive text-[#C1A27B] text-4xl md:text-6xl mb-8 block drop-shadow-2xl"
          >
            Elysium Corporate Elite
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-['Playfair_Display'] text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 uppercase tracking-tighter drop-shadow-2xl leading-none"
          >
            THE <span className="text-[#C1A27B]">STAGES</span>
          </motion.h1>
          <div className="w-24 h-[1px] bg-[#C1A27B] mx-auto mb-8 shadow-xl" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-white text-[10px] md:text-xs max-w-2xl mx-auto font-black tracking-[0.5em] mb-16 uppercase drop-shadow-xl"
          >
            Global epicenters for extraordinary decision making
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 pb-32 md:pb-48">
        {/* Floating Filter Bar */}
        <div className="max-w-7xl mx-auto px-6 -mt-12 md:-mt-16">
          <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-5 md:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-gray-50 flex flex-col xl:flex-row gap-8 items-center justify-between mb-24 md:mb-32">
            <CategoryDropdown selected={selectedCategory} onSelect={setSelectedCategory} />

            <div className="relative w-full xl:w-[450px] group">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-200 group-focus-within:text-[#C1A27B] transition-colors" />
              <input
                type="text"
                placeholder="Search Distinguished Spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-20 pr-10 py-5 bg-[#FBFBFA] border border-transparent rounded-[2.5rem] text-sm text-[#1a1c1b] placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-[#C1A27B]/10 transition-all outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-24 text-center">
            <span className="text-[#C1A27B] font-black tracking-[0.6em] uppercase text-[10px] mb-6 block">Elite Benchmarks</span>
            <h2 className="font-['Playfair_Display'] text-5xl md:text-7xl font-black text-[#1a1c1b] mb-8 leading-tight">
                Curated Selection
            </h2>
            <div className="flex items-center gap-6 justify-center">
                <div className="w-12 h-[1px] bg-gray-200" />
                <p className="text-gray-300 font-bold tracking-[0.2em] text-[10px] uppercase">
                    {filteredEvents.length} Prestige Options
                </p>
                <div className="w-12 h-[1px] bg-gray-200" />
            </div>
        </div>

        {/* Grid - Respectful Spacing */}
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
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
            className="text-center py-48"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-dashed border-gray-200">
                <Briefcase className="w-8 h-8 text-gray-100" />
            </div>
            <h3 className="font-['Playfair_Display'] text-4xl font-bold text-gray-200 mb-4">Portfolio Empty</h3>
            <p className="text-gray-300 font-black uppercase tracking-[0.5em] text-[10px]">Adjust your strategic Search.</p>
          </motion.div>
        )}
      </section>

      {/* Feature Section */}
      <section className="bg-white py-32 md:py-48 border-t border-gray-50">
        <div className="max-w-[85rem] mx-auto px-6">
            <div className="text-center mb-24 md:mb-32">
                <span className="font-cursive text-[#C1A27B] text-5xl mb-6 block">The Standard of Protocol</span>
                <h3 className="font-['Playfair_Display'] text-5xl md:text-6xl font-black text-[#1a1c1b] tracking-tight">Technical Infrastructure</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-20 md:gap-12">
                {[
                    { icon: Monitor, title: "Global Uplink", desc: "Redundant satellite and hybrid-cloud fiber networking." },
                    { icon: Coffee, title: "Private Culinary", desc: "Michelin-caliber menus tailored for high-stakes dining." },
                    { icon: GlassWater, title: "White-Glove Support", desc: "Multilingual staff trained in international protocol." },
                    { icon: Building, title: "Strategic Centers", desc: "Presence in global financial and tech epicenters." }
                ].map((feature, i) => (
                    <div key={i} className="text-center group">
                        <div className="w-24 h-24 rounded-[3.5rem] bg-[#F9F8F6] flex items-center justify-center mx-auto mb-10 group-hover:bg-[#1a1c1b] transition-all duration-700 shadow-sm group-hover:scale-105 group-hover:rotate-6">
                            <feature.icon className="w-10 h-10 text-[#C1A27B]" />
                        </div>
                        <h4 className="text-[#1a1c1b] font-['Playfair_Display'] text-2xl font-bold mb-6">{feature.title}</h4>
                        <p className="text-gray-400 text-xs font-bold leading-relaxed px-6 opacity-70 uppercase tracking-widest">
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
