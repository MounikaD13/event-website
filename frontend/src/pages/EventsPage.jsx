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
  business: "Business & Office",
};

const categoryKeys = Object.keys(categoryMap);
const fallbackImage = "/images/events/decor.jpg";



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
          image: e.images && e.images.length > 0 ? `${BASE_URL}${e.images[0]}` : fallbackImage,
          available: Math.max(total - booked, 0),
          rating: Number((4.6 + Math.random() * 0.35).toFixed(1)),
          reviews: 80 + Math.floor(Math.random() * 170),
          source: "backend",
        };
      }),
    [events]
  );

  const allEvents = mappedBackendEvents;

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

  const handleEnquiry = () => {
    if (!selectedEvent) return;
    navigate("/contact", {
      state: {
        subject: `Enquiry for ${selectedEvent.title}`,
        message: `I'm interested in the ${selectedEvent.title} event at ${selectedEvent.location}. Please provide more details.`
      },
    });
    setSelectedEvent(null);
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

//code for displaying events

    </div>
  );
}