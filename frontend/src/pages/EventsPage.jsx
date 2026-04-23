import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../store/slices/eventsSlice";
import { Search, X, MapPin, Loader2, Star, Calendar, Users, Sparkles, Compass } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

const categoryMap = {
  weddings: "Weddings",
  birthdays: "Birthdays",
  milestone: "Milestones",
  bussiness: "Business & Office",
};

const categoryKeys = Object.keys(categoryMap);
const fallbackImage = "/images/events/decor.jpg";

const dummyEvents = [
  { id: "d-1", title: "Royal Garden Wedding Soiree", category: "weddings", location: "Udaipur, India", price: 9800, totalTickets: 220, booked: 78, image: "/images/events/wedding.jpg", description: "Palace-inspired floral wedding with live Sufi set and sunset lakeside vows.", date: "2026-06-12" },
  { id: "d-2", title: "Skyline Birthday Luxe Night", category: "birthdays", location: "Mumbai, India", price: 3900, totalTickets: 150, booked: 54, image: "/images/hero_birthday_party.png", description: "Rooftop birthday with curated chef stations, cocktail lab, and themed dance floor.", date: "2026-07-20" },
  { id: "d-3", title: "Founder Milestone Summit", category: "milestone", location: "Bengaluru, India", price: 5400, totalTickets: 300, booked: 125, image: "/images/events/conference.jpg", description: "Investor-grade milestone celebration with keynote stage production and media lounge.", date: "2026-08-10" },
  { id: "d-4", title: "Global Strategy Leadership Meet", category: "bussiness", location: "Dubai, UAE", price: 7500, totalTickets: 260, booked: 103, image: "/images/event_dubai_gala.jpg", description: "Board-level strategy meet with bilingual hosts, high-end AV, and premium banquet.", date: "2026-09-02" },
  { id: "d-5", title: "Mehendi Carnival Experience", category: "weddings", location: "Jaipur, India", price: 4600, totalTickets: 200, booked: 89, image: "/images/events/mehendi.jpg", description: "Vibrant pre-wedding mehendi with folk artists, decor zones, and custom dessert bar.", date: "2026-10-05" },
  { id: "d-6", title: "Elite Stage & Sound Showcase", category: "milestone", location: "Hyderabad, India", price: 6300, totalTickets: 240, booked: 92, image: "/images/events/stage.jpg", description: "Product milestone reveal event with immersive stage mapping and gala networking.", date: "2026-10-26" },
  { id: "d-7", title: "Destination Beach Celebration", category: "birthdays", location: "Goa, India", price: 5100, totalTickets: 170, booked: 62, image: "/images/event_beach_wedding.jpg", description: "Luxury beach celebration with wave-side brunch, private performers, and afterparty.", date: "2026-11-14" },
  { id: "d-8", title: "Executive Innovation Conference", category: "bussiness", location: "Singapore", price: 8800, totalTickets: 500, booked: 215, image: "/images/event_tokyo_conf.jpg", description: "Enterprise SaaS conference format with multi-track sessions and curated CX lounges.", date: "2026-12-01" },
];

export default function EventsPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { events, loading, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [filtered, setFiltered] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
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
        const booked = e.booked || 0;
        const total = e.totalTickets || 0;
        return {
          ...e,
          id: e._id,
          type: e.category,
          price: e.price ? `₹${Number(e.price).toLocaleString()}` : "Free",
          date: e.date ? new Date(e.date).toLocaleDateString() : "",
          image: e.image ? `${BASE_URL}${e.image}` : fallbackImage,
          available: Math.max(total - booked, 0),
          rating: Number((4.6 + Math.random() * 0.35).toFixed(1)),
          reviews: 80 + Math.floor(Math.random() * 170),
          source: "backend",
        };
      }),
    [events]
  );

  const mappedDummyEvents = useMemo(
    () =>
      dummyEvents.map((e) => ({
        ...e,
        type: e.category,
        price: `₹${Number(e.price).toLocaleString()}`,
        date: new Date(e.date).toLocaleDateString(),
        available: Math.max(e.totalTickets - e.booked, 0),
        rating: Number((4.7 + Math.random() * 0.25).toFixed(1)),
        reviews: 90 + Math.floor(Math.random() * 250),
        source: "dummy",
      })),
    []
  );

  const allEvents = mappedBackendEvents.length > 0 ? mappedBackendEvents : mappedDummyEvents;

  useEffect(() => {
    let result = [...allEvents];
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
  }, [allEvents, search, selectedType, selectedDestination]);

  const topStats = useMemo(
    () => [
      { label: "Live Listings", value: String(allEvents.length).padStart(2, "0") },
      { label: "Avg Rating", value: (allEvents.reduce((a, e) => a + (e.rating || 0), 0) / (allEvents.length || 1)).toFixed(1) },
      { label: "Destinations", value: String(new Set(allEvents.map((e) => e.location)).size).padStart(2, "0") },
      { label: "Seats Available", value: allEvents.reduce((a, e) => a + (e.available || 0), 0).toLocaleString() },
    ],
    [allEvents]
  );

  const handleBooking = () => {
    if (!selectedEvent || ticketCount < 1) return;
    if (ticketCount > selectedEvent.available) {
      toast.error("Not enough seats available");
      return;
    }
    if (!user) {
      toast("Please sign in to continue booking", { id: "signin-required" });
      navigate("/signin");
      return;
    }
    navigate("/booking", {
      state: {
        event: {
          ...selectedEvent,
          capacity: selectedEvent.totalTickets || selectedEvent.available + (selectedEvent.booked || 0),
        },
      },
    });
    setSelectedEvent(null);
    setTicketCount(1);
  };

  const noResults = useMemo(() => !loading && filtered.length === 0, [loading, filtered.length]);

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <section className="relative h-[78vh] min-h-[640px] overflow-hidden flex items-center">
        <img src="/images/events/outdoor.jpg" alt="events hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#151722]/90 via-[#1a1d2d]/75 to-black/55" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full mt-16">
          <div className="max-w-3xl">
            <p className="text-[#C29B5F] uppercase tracking-[0.28em] text-xs font-semibold mb-5 inline-flex items-center gap-2">
              <Sparkles size={14} /> Premium Event Discovery Platform
            </p>
            <h1 className="font-['Playfair_Display'] text-white text-5xl md:text-7xl leading-tight font-bold mb-6">
              Discover Events That
              <span className="block text-[#C29B5F]">Feel Extraordinary</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              High-converting, visually premium event experiences - curated for weddings, celebrations, milestones, and executive gatherings.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {topStats.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="-mt-10 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-3xl border border-[#E7DDCF] shadow-[0_26px_50px_rgba(34,37,49,0.11)] p-5 md:p-6">
          <div className="flex items-center gap-3 bg-[#FBF8F3] rounded-2xl px-4 py-3 border border-[#E7DDCF]">
            <Search className="text-[#7B8292]" />
            <input placeholder="Search by event title or destination..." className="flex-1 outline-none bg-transparent text-[#222531]" value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <X onClick={() => setSearch("")} className="cursor-pointer text-[#7B8292]" />}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
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

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#C29B5F]" size={40} />
        </div>
      )}

      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {filtered.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E7DDCF] hover:shadow-[0_22px_44px_rgba(34,37,49,0.14)] transition cursor-pointer group"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="relative h-72">
                <img src={event.image} alt={event.title} onError={(e) => (e.currentTarget.src = fallbackImage)} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-white/20 text-white backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.1em]">
                  {event.type}
                </div>
                <div className="absolute top-3 right-3 bg-[#222531]/75 text-white px-3 py-1 rounded-full text-xs">{event.price}</div>
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-black/30 border border-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-xs">
                  <Star size={13} className="text-[#E8C57C] fill-[#E8C57C]" /> {event.rating} ({event.reviews})
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-['Playfair_Display'] text-2xl text-[#222531] font-semibold clamp-2 leading-tight">{event.title}</h3>
                <p className="text-sm text-[#667280] mt-2 clamp-2 leading-relaxed">{event.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#667280] bg-[#FBF8F3] border border-[#E7DDCF] rounded-full px-3 py-1"><MapPin size={13} />{event.location}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#667280] bg-[#FBF8F3] border border-[#E7DDCF] rounded-full px-3 py-1"><Calendar size={13} />{event.date}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#7F4E75] bg-[#FAF3F8] border border-[#F0DDEC] rounded-full px-3 py-1"><Users size={13} />{event.available} seats left</span>
                </div>
                {event.source === "dummy" && (
                  <div className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[#2C7A6C] bg-[#EAF7F3] border border-[#C8E7DE] inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                    <Compass size={12} /> curated showcase event
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {noResults && (
        <div className="max-w-2xl mx-auto px-4 pb-20">
          <div className="rounded-3xl border border-dashed border-[#DCCDB5] bg-white/80 p-10 text-center">
            <h3 className="font-['Playfair_Display'] text-3xl text-[#4A4F4D] mb-2">No matching events</h3>
            <p className="text-sm text-[#667280] mb-6">Try another keyword or reset filters to see the full premium catalog.</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedType("All");
                navigate("/events");
              }}
              className="btn-earthy px-7 py-3 rounded-full text-xs tracking-[0.15em] uppercase font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative border border-[#EDE5D8]">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-3 right-3 text-[#667280]">✖</button>
            <img src={selectedEvent.image} alt={selectedEvent.title} onError={(e) => (e.currentTarget.src = fallbackImage)} className="h-72 w-full object-cover rounded-xl mb-5" />
            <h2 className="font-['Playfair_Display'] text-3xl text-[#222531] font-semibold">{selectedEvent.title}</h2>
            <p className="text-[#667280] mt-2">{selectedEvent.description}</p>
            <div className="flex justify-between mt-4 text-sm text-[#667280]">
              <span className="inline-flex items-center gap-1.5"><Calendar size={14} />{selectedEvent.date}</span>
              <span className="text-[#C29B5F] font-bold">{selectedEvent.price}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm mb-1 inline-flex items-center gap-1.5"><Users size={14} />Available Seats: {selectedEvent.available}</p>
              <input type="number" min="1" max={selectedEvent.available} value={ticketCount} onChange={(e) => setTicketCount(Number(e.target.value))} className="border border-[#E7DDCF] p-2.5 w-full rounded-lg" />
            </div>
            <button onClick={handleBooking} className="w-full mt-5 btn-earthy py-3 rounded-xl font-semibold tracking-wide">
              {user ? "Continue Booking" : "Sign In to Book"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}