import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Users, ArrowRight, Star, Briefcase,
  Building, Coffee, Monitor, GlassWater, ChevronDown, Check,
} from 'lucide-react';
import { businessCategories, businessEvents } from '../data/businessData';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/*
  VISUAL HIERARCHY SYSTEM — applied consistently everywhere:

  TIER 1 · Display / Hero title     → text-[clamp(4rem,12vw,9rem)] or text-5xl–7xl  · Playfair · font-black · tight tracking
  TIER 2 · Section / Card title     → text-2xl–4xl                                  · Playfair · font-black
  TIER 3 · Sub-heading / Card title → text-lg–xl                                    · Playfair · font-black
  TIER 4 · Body copy                → text-sm                                        · font-medium · text-gray-400 · leading-relaxed
  TIER 5 · Metadata / Labels        → text-xs–[10px]                                 · font-black · uppercase · tracking-[0.2em+]
  TIER 6 · Micro-labels / badges    → text-[9px]                                     · font-black · uppercase · tracking-[0.22em+]

  SPACING RHYTHM: 2 → 3 → 4 → 5 → 6 → 8 → 10 → 12 → 16 → 20 → 24 → 32
  Rule: the bigger the text, the more space around it.
*/

/* ─── BUSINESS CARD ─────────────────────────────────────────────────────── */
const BusinessCard = ({ event, index, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    if (!isAuthenticated) {
      toast('Please sign in to reserve this venue', { id: 'signin-business' });
      navigate('/signin');
      return;
    }
    toast.success(`Interest in ${event.title} registered!`, {
      style: { background: '#1a1c1b', color: '#f8f5f0', border: '1px solid rgba(193,162,123,0.3)' },
    });
    navigate('/booking', { state: { event } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C1A27B]/25 transition-all duration-500 shadow-sm hover:shadow-[0_24px_56px_rgba(193,162,123,0.09)] flex flex-col h-full"
    >
      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        {/* TIER 6 — Category badge (smallest label) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.22em] bg-white/12 backdrop-blur-md border border-white/18 text-white">
            {event.category}
          </span>
        </div>

        {/* TIER 5 — Price (secondary prominence on image) */}
        <div className="absolute top-3 right-3 text-right">
          <span className="block text-[8px] uppercase tracking-[0.18em] text-white/45 font-black leading-none mb-0.5">From</span>
          <p className="text-base font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {event.price}
          </p>
        </div>

        {/* TIER 6 — Rating (tertiary metadata) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/28 backdrop-blur-md rounded-full border border-white/10">
          <Star className="w-2.5 h-2.5 fill-[#C1A27B] text-[#C1A27B]" />
          <span className="text-[9px] font-black text-white tracking-widest">{event.rating}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 md:p-6 flex-1 flex flex-col">

        {/* TIER 6 — Location micro-label */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-px bg-[#C1A27B]/35" />
          <MapPin className="w-2.5 h-2.5 text-[#C1A27B]" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C1A27B]">{event.location}</span>
        </div>

        {/* TIER 3 — Card title (main identity of the card) */}
        <h3
          className="text-xl font-black text-[#1a1c1b] leading-snug mb-2 group-hover:text-[#C1A27B] transition-colors duration-400"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {event.title}
        </h3>

        {/* TIER 4 — Body description (muted, italic, supporting) */}
        <p className="text-[13px] font-medium text-gray-400 leading-relaxed line-clamp-2 italic mb-4">
          "{event.description}"
        </p>

        {/* TIER 6 — Amenity chips (decorative metadata) */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {event.amenities.slice(0, 2).map((amenity, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-[#FAF9F6] border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-tight text-gray-400">
              {amenity}
            </span>
          ))}
          {event.amenities.length > 2 && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black text-[#C1A27B] bg-[#C1A27B]/8">
              +{event.amenities.length - 2} more
            </span>
          )}
        </div>

        {/* FOOTER — capacity + CTA */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-3">

          {/* TIER 5 — Capacity metadata */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C1A27B]/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-[#C1A27B]" />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-[0.18em] text-gray-300 font-black leading-none mb-0.5">Capacity</span>
              {/* TIER 5 — Number value: slightly larger than label */}
              <span className="text-sm font-black text-[#1a1c1b] leading-none">{event.capacity} Persons</span>
            </div>
          </div>

          {/* Primary action button */}
          <button
            onClick={handleBook}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a1c1b] text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#C1A27B] transition-all duration-400 group/btn shadow-sm hover:shadow-[0_8px_20px_rgba(193,162,123,0.28)]"
          >
            Reserve
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Hover-reveal full-width CTA strip */}
      <div className="h-0 group-hover:h-11 overflow-hidden transition-all duration-500 ease-in-out flex-shrink-0">
        <button
          onClick={handleBook}
          className="w-full h-11 bg-[#C1A27B] text-white text-[9px] font-black uppercase tracking-[0.28em] flex items-center justify-center gap-2 hover:bg-[#a8895f] transition-colors duration-300"
        >
          Reserve This Venue <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── CATEGORY DROPDOWN ─────────────────────────────────────────────────── */
const CategoryDropdown = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative w-full sm:w-60" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
          isOpen ? 'border-[#C1A27B]/50 bg-white ring-2 ring-[#C1A27B]/10 shadow-sm' : 'bg-gray-50 border-gray-200 hover:border-[#C1A27B]/30'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Briefcase className="w-3.5 h-3.5 text-[#C1A27B]" />
          {/* TIER 6 — Dropdown label */}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1c1b]">
            {selected === 'All' ? 'All Portfolios' : selected}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#C1A27B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.11)] z-[100] max-h-72 overflow-y-auto"
          >
            {businessCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { onSelect(cat); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  selected === cat ? 'bg-[#1a1c1b] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a1c1b]'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">{cat}</span>
                {selected === cat && <Check className="w-3 h-3 text-[#C1A27B]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── PAGE ─────────────────────────────────────────────────────────────── */
export default function BusinessPage() {
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState(businessEvents);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    let result = businessEvents;
    if (selectedCategory !== 'All') result = result.filter(e => e.category === selectedCategory);
    if (searchQuery) result = result.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(result);
  }, [selectedCategory, searchQuery]);

  const hasFilters = selectedCategory !== 'All' || searchQuery;
  const clearAll = () => { setSelectedCategory('All'); setSearchQuery(''); };

  const features = [
    { icon: Monitor,    title: 'Global Uplink',       desc: 'Redundant satellite and hybrid-cloud fiber networking.' },
    { icon: Coffee,     title: 'Private Culinary',    desc: 'Michelin-caliber menus tailored for high-stakes dining.' },
    { icon: GlassWater, title: 'White-Glove Support', desc: 'Multilingual staff trained in international protocol.' },
    { icon: Building,   title: 'Strategic Centers',   desc: 'Presence in global financial and tech epicenters.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* ══════════════════════════════════════
          HERO
          Hierarchy: eyebrow → display title → rule → subline
      ══════════════════════════════════════ */}
      <section className="relative h-[82vh] min-h-[540px] flex items-center justify-center overflow-hidden bg-[#050505]">

        <motion.div
          initial={{ scale: 1.07, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img src="/images/business_hero.png" alt="Business Venue" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25" />
        </motion.div>

        {/* Corner brackets */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#C1A27B]/30 hidden md:block" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#C1A27B]/30 hidden md:block" />
        <div className="absolute bottom-20 left-8 w-12 h-12 border-b-2 border-l-2 border-[#C1A27B]/30 hidden md:block" />
        <div className="absolute bottom-20 right-8 w-12 h-12 border-b-2 border-r-2 border-[#C1A27B]/30 hidden md:block" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">

          {/* TIER 6 — Eyebrow: tiniest text, gold, extreme tracking — sets context */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-[#C1A27B]/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C1A27B]">
              Elysium Corporate Elite
            </span>
            <div className="h-px w-8 bg-[#C1A27B]/50" />
          </motion.div>

          {/* TIER 1 — Display title: maximum size, maximum visual weight */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-black text-white uppercase leading-[0.92] tracking-tighter mb-7"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(3.5rem, 11vw, 9rem)',
            }}
          >
            The <span className="text-[#C1A27B]">Stages</span>
          </motion.h1>

          {/* Gold rule — visual pause between title and supporting copy */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.95, duration: 0.7, ease: 'easeOut' }}
            className="w-16 h-[1.5px] bg-[#C1A27B] mb-6 origin-center"
          />

          {/* TIER 6 — Sub-copy: small, uppercase, very muted — supporting only */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="text-[11px] md:text-xs font-black uppercase tracking-[0.45em] text-white/50 max-w-xs leading-relaxed"
          >
            Global epicenters for extraordinary decision making
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FILTER BAR — floats over hero boundary
      ══════════════════════════════════════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 -mt-7">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_16px_48px_rgba(0,0,0,0.08)] p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            <CategoryDropdown selected={selectedCategory} onSelect={setSelectedCategory} />

            {/* Divider */}
            <div className="hidden sm:block w-px h-7 bg-gray-100 self-center" />

            {/* Search */}
            <div className={`relative flex-1 flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3 transition-all duration-200 ${isSearchFocused ? 'border-[#C1A27B]/50 ring-2 ring-[#C1A27B]/10 bg-white' : 'border-gray-200'}`}>
              <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${isSearchFocused ? 'text-[#C1A27B]' : 'text-gray-300'}`} />
              <input
                type="text"
                placeholder="Search distinguished spaces…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 bg-transparent text-sm font-semibold text-[#1a1c1b] placeholder:text-gray-300 placeholder:font-medium outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-400 text-xs leading-none">
                  ✕
                </button>
              )}
            </div>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-400 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-red-100 transition-colors flex-shrink-0 whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SaaS KPI row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Enterprise Venues', value: '140+' },
            { label: 'Avg Setup SLA', value: '4.2 hrs' },
            { label: 'Uptime Ready AV', value: '99.9%' },
            { label: 'Dedicated Managers', value: '24/7' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[#E7DDCF] bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>{kpi.value}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#667280] mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION HEADER
          Hierarchy: TIER 6 label → TIER 2 title → TIER 6 count
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">

        {/* TIER 6 — Section category label */}
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C1A27B] mb-3">
          Elite Benchmarks
        </p>

        {/* TIER 2 — Section title: bold, large, clear focal point */}
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1c1b] leading-tight tracking-tight mb-5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Curated Selection
        </h2>

        {/* TIER 6 — Result count: smallest, most muted */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-10 bg-gray-200" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
            {filteredEvents.length} prestige {filteredEvents.length === 1 ? 'option' : 'options'}
          </p>
          <div className="h-px w-10 bg-gray-200" />
        </div>
      </div>

      {/* ══════════════════════════════════════
          EVENTS GRID
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-32">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {filteredEvents.map((event, i) => (
                <BusinessCard key={event.id} event={event} index={i} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-[#C1A27B]/8 border border-[#C1A27B]/15 flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-[#C1A27B]/40" />
              </div>

              {/* TIER 3 — Empty state title */}
              <h3
                className="text-2xl font-black text-gray-700 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Portfolio Empty
              </h3>

              {/* TIER 4 — Empty state body */}
              <p className="text-sm font-medium text-gray-400 mb-3 leading-relaxed">
                No venues match your current filters.
              </p>

              {/* TIER 6 — Hint label */}
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8">
                Adjust your search to explore more
              </p>

              <button
                onClick={clearAll}
                className="px-6 py-3 rounded-xl bg-[#1a1c1b] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#C1A27B] transition-colors duration-300 shadow-md hover:shadow-[0_8px_24px_rgba(193,162,123,0.28)]"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════
          FEATURE SECTION
          Hierarchy: cursive eyebrow → TIER 2 section title → TIER 4 descriptor → feature grid
          Each card: icon → TIER 5 title → TIER 4 body
      ══════════════════════════════════════ */}
      <section className="bg-white border-t border-gray-100 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <div className="text-center mb-16 md:mb-20">

            {/* DECORATIVE — Cursive eyebrow (aesthetic, not informational) */}
            <span
              className="block text-[#C1A27B] mb-3 leading-none"
              style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}
            >
              The Standard of Protocol
            </span>

            {/* TIER 2 — Section title */}
            <h3
              className="text-4xl md:text-5xl font-black text-[#1a1c1b] tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Technical Infrastructure
            </h3>

            {/* TIER 4 — Supporting body text: medium, muted, relaxed */}
            <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
              Every venue meets an exacting standard across four core pillars.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group text-center"
              >
                {/* Icon block */}
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="w-full h-full rounded-2xl bg-[#FAF9F6] border border-gray-100 flex items-center justify-center group-hover:bg-[#1a1c1b] group-hover:border-[#1a1c1b] transition-all duration-500 shadow-sm">
                    <Icon className="w-7 h-7 text-[#C1A27B]" />
                  </div>
                  {/* Accent dot */}
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C1A27B]/25 group-hover:bg-[#C1A27B] transition-colors duration-500" />
                </div>

                {/* TIER 5 — Feature title: clear, bold, medium size */}
                <h4
                  className="text-base font-black text-[#1a1c1b] mb-2 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {title}
                </h4>

                {/* TIER 4 — Feature body: small, muted, readable */}
                <p className="text-xs font-medium text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}