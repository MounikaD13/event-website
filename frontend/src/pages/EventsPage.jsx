import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { eventsData, destinations } from '../data/events';
import { Search, SlidersHorizontal, X, MapPin, Grid3X3, List } from 'lucide-react';

const eventTypes = ['All', 'Wedding', 'Corporate', 'Party', 'Gala', 'Conference'];
const priceRanges = ['All', 'Under $5K', '$5K–$10K', '$10K–$20K', '$20K+'];

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedDest, setSelectedDest] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filtered, setFiltered] = useState(eventsData);

  useEffect(() => {
    const type = searchParams.get('type');
    const dest = searchParams.get('dest');
    if (type) setSelectedType(type.charAt(0).toUpperCase() + type.slice(1).toLowerCase());
    if (dest) setSelectedDest(dest);
  }, [searchParams]);

  useEffect(() => {
    let result = eventsData;
    if (search) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedType !== 'All') {
      result = result.filter((e) => e.type.toLowerCase() === selectedType.toLowerCase());
    }
    if (selectedDest !== 'All') {
      result = result.filter((e) => e.destination === selectedDest);
    }
    // Price filter
    if (selectedPrice !== 'All') {
      result = result.filter((e) => {
        const price = parseInt(e.price.replace(/[^0-9]/g, ''));
        if (selectedPrice === 'Under $5K') return price < 5000;
        if (selectedPrice === '$5K–$10K') return price >= 5000 && price <= 10000;
        if (selectedPrice === '$10K–$20K') return price > 10000 && price <= 20000;
        if (selectedPrice === '$20K+') return price > 20000;
        return true;
      });
    }
    setFiltered(result);
  }, [search, selectedType, selectedPrice, selectedDest]);

  const clearFilters = () => {
    setSearch('');
    setSelectedType('All');
    setSelectedPrice('All');
    setSelectedDest('All');
  };

  const hasFilters = search || selectedType !== 'All' || selectedPrice !== 'All' || selectedDest !== 'All';

  return (
    <div className="min-h-screen pt-20 bg-[#FAF9F6]">
      {/* Header */}
      <div className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/contact_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/80 to-[#FAF9F6]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <span className="text-[#A3B19B] text-xs uppercase tracking-[4px] font-semibold">Our Portfolio</span>
          <h1 className="font-['Playfair_Display'] text-5xl font-bold text-[#4A4F4D] mt-3 mb-4">
            Explore <span className="pastel-gradient">All Events</span>
          </h1>
          <p className="text-[#4A4F4D]/50 text-lg max-w-2xl mx-auto">
            Browse our curated collection of premium destination events across the world's most breathtaking locations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search & Filter Bar */}
        <div className="glass rounded-2xl border border-[#A3B19B]/15 p-4 md:p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3B19B]/60" />
              <input
                type="text"
                placeholder="Search events or destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm placeholder:text-[#4A4F4D]/30 focus:border-[#A3B19B] transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm focus:border-[#A3B19B] transition-all appearance-none"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#F2EFE9]">{t}</option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm focus:border-[#A3B19B] transition-all appearance-none"
              >
                {priceRanges.map((p) => (
                  <option key={p} value={p} className="bg-[#F2EFE9]">{p}</option>
                ))}
              </select>

              {/* Destination Filter */}
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="px-4 py-3 bg-[#FAF9F6]/60 border border-[#A3B19B]/20 rounded-xl text-[#4A4F4D] text-sm focus:border-[#A3B19B] transition-all appearance-none"
              >
                <option value="All" className="bg-[#F2EFE9]">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d.dest} value={d.dest} className="bg-[#F2EFE9]">{d.name}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 glass border border-[#A3B19B]/15 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#A3B19B] text-white' : 'text-[#4A4F4D]/60 hover:text-[#A3B19B]'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#A3B19B] text-white' : 'text-[#4A4F4D]/60 hover:text-[#A3B19B]'}`}
                >
                  <List className="w-4 h-4" />
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
          <p className="text-[#4A4F4D]/50 text-sm">
            Showing <span className="text-[#A3B19B] font-semibold">{filtered.length}</span> events
          </p>
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedType !== 'All' && (
                <span className="px-3 py-1 rounded-full text-xs bg-[#A3B19B]/15 text-[#A3B19B] border border-[#A3B19B]/20">
                  Type: {selectedType}
                </span>
              )}
              {selectedDest !== 'All' && (
                <span className="px-3 py-1 rounded-full text-xs bg-[#A3B19B]/15 text-[#A3B19B] border border-[#A3B19B]/20">
                  <MapPin className="w-3 h-3 inline mr-1" />{selectedDest}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Events Grid / List */}
        {filtered.length === 0 ? (
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
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
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
