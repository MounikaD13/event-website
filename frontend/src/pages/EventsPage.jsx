import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../components/EventCard';
import { fetchEvents } from '../store/slices/eventsSlice';
import { destinations } from '../data/events';
import { Search, X, MapPin, Grid3X3, List, Loader2 } from 'lucide-react';

/* Category map: backend enum value → display label */
const categoryMap = {
  weddings: 'Weddings',
  birthdays: 'Birthdays',
  milestone: 'Milestones',
  bussiness: 'Business & Office',
};
const categoryKeys = Object.keys(categoryMap);
const categoryAliases = {
  wedding: 'weddings',
  weddings: 'weddings',
  birthday: 'birthdays',
  birthdays: 'birthdays',
  milestone: 'milestone',
  milestones: 'milestone',
  corporate: 'bussiness',
  business: 'bussiness',
  bussiness: 'bussiness',
  office: 'bussiness',
  party: 'birthdays',
  conference: 'bussiness',
  gala: 'milestone',
  retreat: 'bussiness',
};

const priceRanges = ['All', 'Under $1K', '$1K–$5K', '$5K–$10K', '$10K+'];

export default function EventsPage() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedDest, setSelectedDest] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    const type = searchParams.get('type');
    const dest = searchParams.get('dest');
    if (type) {
      const normalized = categoryAliases[type.toLowerCase()];
      const matched = normalized || categoryKeys.find((k) => k.toLowerCase() === type.toLowerCase());
      if (matched) setSelectedType(matched);
    }
    if (dest) setSelectedDest(dest);
  }, [searchParams]);

  useEffect(() => {
    let result = events.map(e => ({
      ...e,
      id: e._id,
      type: e.category,
      price: e.price ? `$${Number(e.price).toLocaleString()}` : '$0',
      rating: '4.9',
      reviews: '128',
      capacity: e.totalTickets,
      date: e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      image: e.image || '/images/events_gallery_bg.png',
    }));

    if (search) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedType !== 'All') {
      result = result.filter((e) => e.type === selectedType);
    }
    if (selectedDest !== 'All') {
      result = result.filter((e) => e.location.toLowerCase().includes(selectedDest.toLowerCase()));
    }
    
    if (selectedPrice !== 'All') {
      result = result.filter((e) => {
        const p = parseInt(e.price.replace(/[^0-9]/g, ''));
        if (selectedPrice === 'Under $1K') return p < 1000;
        if (selectedPrice === '$1K–$5K') return p >= 1000 && p <= 5000;
        if (selectedPrice === '$5K–$10K') return p > 5000 && p <= 10000;
        if (selectedPrice === '$10K+') return p > 10000;
        return true;
      });
    }
    setFiltered(result);
  }, [events, search, selectedType, selectedPrice, selectedDest]);

  const clearFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSelectedPrice('All');
    setSelectedDest('All');
  };

  const hasFilters = search || selectedType !== 'All' || selectedPrice !== 'All' || selectedDest !== 'All';

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-black pt-20 pb-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/images/events_gallery_bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 flex flex-col items-center justify-center text-center w-full">
          <span className="font-cursive text-[#C1A27B] text-4xl block mb-2">Our Portfolio</span>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl font-bold text-white mt-3 mb-6">
            Explore <span className="text-[#C1A27B]">All Events</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Browse our curated collection of premium destination events across the world's most breathtaking locations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 mt-8 md:mt-12 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-5 md:p-7 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events or destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-lg placeholder:text-gray-400 focus:border-[#C1A27B] focus:ring-1 focus:ring-[#C1A27B] focus:bg-white transition-all outline-none shadow-sm"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-lg focus:border-[#C1A27B] focus:ring-1 focus:ring-[#C1A27B] focus:bg-white transition-all appearance-none cursor-pointer shadow-sm min-w-[140px]"
              >
                <option value="All">All Types</option>
                {categoryKeys.map((key) => (
                  <option key={key} value={key}>{categoryMap[key]}</option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-lg focus:border-[#C1A27B] focus:ring-1 focus:ring-[#C1A27B] focus:bg-white transition-all appearance-none cursor-pointer shadow-sm min-w-[140px]"
              >
                {priceRanges.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Destination Filter */}
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black text-lg focus:border-[#C1A27B] focus:ring-1 focus:ring-[#C1A27B] focus:bg-white transition-all appearance-none cursor-pointer shadow-sm min-w-[140px]"
              >
                <option value="All">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d.dest} value={d.dest}>{d.name}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1.5 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#C1A27B] text-white' : 'text-gray-400 hover:text-[#C1A27B]'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#C1A27B] text-white' : 'text-gray-400 hover:text-[#C1A27B]'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-black/60 text-sm">
            Showing <span className="text-[#C1A27B] font-bold">{filtered.length}</span> events
          </p>
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedType !== 'All' && (
                <span className="px-3 py-1 rounded-full text-xs bg-[#C1A27B]/10 text-[#C1A27B] border border-[#C1A27B]/20">
                  Type: {categoryMap[selectedType] || selectedType}
                </span>
              )}
              {selectedDest !== 'All' && (
                <span className="px-3 py-1 rounded-full text-xs bg-[#C1A27B]/10 text-[#C1A27B] border border-[#C1A27B]/20">
                  <MapPin className="w-3 h-3 inline mr-1" />{selectedDest}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && events.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#C1A27B] animate-spin" />
          </div>
        )}

        {/* Events Grid / List */}
        {!loading && filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="font-['Playfair_Display'] text-2xl text-[#4A4F4D] mb-2">No Events Found</h3>
            <p className="text-[#4A4F4D]/50 mb-6">Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 rounded-full btn-pastel text-sm font-bold">
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 md:gap-8 md:gap-y-12'
                : 'flex flex-col gap-6'
            }
          >
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
