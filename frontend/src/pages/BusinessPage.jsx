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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-[#C1A27B]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#C1A27B]/10 flex flex-col h-full ring-1 ring-black/[0.02]"
    >
      <div className="relative h-60 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
            {event.category}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
          <Star className="w-3 h-3 fill-[#C1A27B] text-[#C1A27B]" />
          <span className="text-[10px] font-bold text-white tracking-widest">{event.rating}</span>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-[#C1A27B] mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{event.location}</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-xl md:text-2xl font-bold text-[#1a1c1b] mb-4 group-hover:text-[#C1A27B] transition-colors duration-400">
            {event.title}
          </h3>

        <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-3 font-medium opacity-80">
          {event.description}
        </p>

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

        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
          <div>
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
    <div className="relative w-full lg:w-72" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-black/[0.03] text-[#1a1c1b] transition-all hover:border-[#C1A27B]/30"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-[#C1A27B]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            {selected === 'All' ? 'Showing All Categories' : selected}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#C1A27B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 p-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-[100] max-h-80 overflow-y-auto no-scrollbar"
          >
            {businessCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelect(cat);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${
                  selected === cat 
                    ? 'bg-[#C1A27B]/10 text-[#C1A27B]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a1c1b]'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{cat}</span>
                {selected === cat && <Check className="w-4 h-4" />}
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
      {/* Hero Section - Lightened & Visible */}
      <section className="relative h-[65vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-[#050505]">
        <motion.div 
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="/images/business_hero.png" 
            alt="Business Venue" 
            className="w-full h-full object-cover"
          />
          {/* Subtle Overlay to ensure text legibility while keeping the image clear */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, tracking: '0px' }}
            animate={{ opacity: 1, tracking: '6px' }}
            transition={{ delay: 0.3, duration: 1 }}
            className="font-cursive text-[#C1A27B] text-3xl md:text-5xl mb-6 block drop-shadow-md"
          >
            Elysium Corporate
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="font-['Playfair_Display'] text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 uppercase tracking-tight drop-shadow-lg"
          >
            ELITE <span className="text-[#C1A27B]">SPACES</span>
          </motion.h1>
          <div className="w-16 h-[1px] bg-[#C1A27B] mx-auto mb-6" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="text-white text-[10px] md:text-xs max-w-2xl mx-auto font-bold tracking-[0.3em] mb-12 uppercase drop-shadow-sm opacity-90"
          >
            Redefining the architecture of corporate excellence & global diplomacy
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 pb-20 md:pb-32">
        {/* Floating Filter Bar - Responsive Dropdown Implementation */}
        <div className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-14">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 md:p-5 shadow-2xl border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between mb-16 md:mb-24">
            {/* Custom Dropdown */}
            <CategoryDropdown selected={selectedCategory} onSelect={setSelectedCategory} />

            {/* Search */}
            <div className="relative w-full md:w-[350px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#C1A27B] transition-colors" />
              <input
                type="text"
                placeholder="Search Distinguished Portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm text-[#1a1c1b] placeholder:text-gray-300 focus:bg-white transition-all outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="max-w-6xl mx-auto px-6 mb-12 md:mb-16 text-center md:text-left">
            <span className="text-[#C1A27B] font-black tracking-[0.3em] uppercase text-[9px] mb-4 block">Our Portfolio</span>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-black text-[#1a1c1b] mb-4">
                Available Venues
            </h2>
            <div className="w-16 h-1 bg-[#C1A27B] mb-6 mx-auto md:mx-0" />
        </div>

        {/* Grid */}
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
            <h3 className="font-['Playfair_Display'] text-2xl font-bold text-gray-300 mb-2">No matching results</h3>
            <p className="text-gray-300 font-bold uppercase tracking-widest text-[9px]">Please explore other curated categories.</p>
          </motion.div>
        )}
      </section>

      {/* Feature Section */}
      <section className="bg-white py-20 md:py-32 border-t border-gray-50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 md:mb-24">
                <span className="font-cursive text-[#C1A27B] text-4xl mb-4 block">The Excellence Protocol</span>
                <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#1a1c1b]">World-Class Infrastructure</h3>
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
