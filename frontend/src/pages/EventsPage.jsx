import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../store/slices/eventsSlice";
import { Search, X, MapPin, Loader2, Star, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const categoryMap = {
  weddings: "Weddings",
  birthdays: "Birthdays",
  milestone: "Milestones",
  business: "Business & Office",
};

const categoryKeys = Object.keys(categoryMap);
const fallbackImage = "/images/events/decor.jpg";

export default function EventsPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { events, loading } = useSelector((state) => state.events);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [filtered, setFiltered] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    const dest = params.get("dest");
    setSelectedType(type && categoryMap[type] ? type : "All");
    setSelectedDestination(dest || "");
  }, [location.search]);

  const mappedBackendEvents = useMemo(
    () =>
      (events || []).map((e) => {
        const allImages = e.images && e.images.length > 0
          ? e.images.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`)
          : [fallbackImage, fallbackImage, fallbackImage];

        return {
          ...e,
          id: e._id,
          type: e.category,
          price: e.price ? `₹${Number(e.price).toLocaleString()}` : "Free",
          date: e.date ? new Date(e.date).toLocaleDateString() : "",
          image: allImages[0],
          allImages: allImages.slice(0, 3), // Ensure we have 3 images for the carousel if requested
          rating: Number((4.6 + Math.random() * 0.35).toFixed(1)),
          reviews: 80 + Math.floor(Math.random() * 170),
        };
      }),
    [events]
  );

  useEffect(() => {
    let result = [...mappedBackendEvents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q));
    }
    if (selectedType !== "All") result = result.filter((e) => e.type === selectedType);
    if (selectedDestination) {
      const d = selectedDestination.toLowerCase();
      result = result.filter((e) => e.location?.toLowerCase().includes(d) || e.title?.toLowerCase().includes(d));
    }
    setFiltered(result);
  }, [mappedBackendEvents, search, selectedType, selectedDestination]);

  const topStats = useMemo(
    () => [
      { label: "Live Listings", value: String(mappedBackendEvents.length).padStart(2, "0") },
      { label: "Avg Rating", value: (mappedBackendEvents.reduce((a, e) => a + (e.rating || 0), 0) / (mappedBackendEvents.length || 1)).toFixed(1) },
      // { label: "Destinations", value: String(new Set(mappedBackendEvents.map((e) => e.location)).size).padStart(2, "0") },
      // { label: "Seats Available", value: (mappedBackendEvents.reduce((a, e) => a + (e.totalTickets - (e.booked || 0)), 0)).toLocaleString() },
    ],
    [mappedBackendEvents]
  );

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      {/* Hero Section */}
      <section className="relative h-[78vh] min-h-[640px] overflow-hidden flex items-center">
        <img src="/images/events/outdoor.jpg" alt="events hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#151722]/90 via-[#1a1d2d]/75 to-black/55" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full mt-16">
          <div className="max-w-3xl">
            <p className="text-[#C29B5F] uppercase tracking-[0.28em] text-xs font-semibold mb-2 inline-flex items-center gap-2">
              <Sparkles size={14} /> Premium Event Discovery Platform
            </p>
            <h1 className="font-['Playfair_Display'] text-white text-3xl md:text-5xl leading-tight font-bold mb-6">
              Plan Event Today,Celebrate it Tomorrow!
              <span className="block text-[#C29B5F]">Feel Extraordinary</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              High-converting, visually premium event experiences - curated for weddings, celebrations, milestones, and executive gatherings.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 mb-10 md:mb-0 ">
            {topStats.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="mt-10 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-3xl border border-[#E7DDCF] shadow-[0_26px_50px_rgba(34,37,49,0.11)] p-5 md:p-6">
          {/* <div className="flex items-center gap-3 bg-[#FBF8F3] rounded-2xl px-4 py-3 border border-[#E7DDCF]">
            <Search className="text-[#7B8292]" />
            <input placeholder="Search by event title or destination..." className="flex-1 outline-none bg-transparent text-[#222531]" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <X onClick={() => setSearch("")} className="cursor-pointer text-[#7B8292]" />}
          </div> */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType("All")}
              className={`px-4 py-2 rounded-full text-sm border transition ${selectedType === "All" ? "bg-[#C29B5F] text-white border-[#C29B5F]" : "bg-white border-[#E7DDCF] text-[#667280] hover:border-[#C29B5F]/45"}`}
            >
              All Events
            </button>
            {categoryKeys.map((key) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-4 py-2 rounded-full text-sm border transition ${selectedType === key ? "bg-[#C29B5F] text-white border-[#C29B5F]" : "bg-white border-[#E7DDCF] text-[#667280] hover:border-[#C29B5F]/45"}`}
              >
                {categoryMap[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alternating Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#C29B5F] animate-spin mb-4" />
            <p className="text-[#667280]">Loading curated events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7DDCF]">
            <Sparkles className="w-12 h-12 text-[#E7DDCF] mx-auto mb-4" />
            <p className="text-xl font-['Playfair_Display'] text-[#222531]">No events matching your criteria</p>
            <p className="text-[#667280] mt-2">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="space-y-32">
            {filtered.map((event, index) => (
              <div
                key={event.id}
                className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${index % 2 === 0 ? "" : "md:flex-row-reverse"
                  }`}
              >
                {/* Image Section - Carousel of 3 images */}
                <div className="w-full md:w-1/2 group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] shadow-2xl">
                    <Swiper
                      modules={[Autoplay, Pagination, EffectFade]}
                      effect="fade"
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      pagination={{ clickable: true }}
                      loop={true}
                      className="w-full h-full"
                    >
                      {event.allImages.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img
                            src={img}
                            alt={`${event.title} ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-100 "
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors z-10" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2">
                  <div className="max-w-lg">
                    <p className="text-[#C29B5F] text-xs font-bold tracking-[0.2em] uppercase mb-4">
                      {categoryMap[event.category] || event.category}
                    </p>
                    <h2 className="font-['Playfair_Display'] text-3xl md:text-5xl font-bold text-[#1f2322] mb-6 leading-tight">
                      {event.title}
                    </h2>
                    <p className="text-[#667280] text-lg leading-relaxed mb-10">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-6 mb-10">
                      {/* <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#C29B5F]" />
                        <span className="text-sm font-medium text-[#222531]">{event.location}</span>
                      </div> */}
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-[#C29B5F] fill-[#C29B5F]" />
                        <span className="text-sm font-medium text-[#222531]">{event.rating} ({event.reviews} reviews)</span>
                      </div>
                    </div>

                    <Link
                      to={`/services?eventId=${event.id}`}
                      className="inline-flex items-center gap-3 text-white px-8 py-4 bg-[#C29B5F] rounded-full font-bold tracking-widest uppercase text-sm hover:bg-[#D4AD72] transition-all group"
                    >
                      View Insights
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
