import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../store/slices/eventsSlice';
import {
  Search, X, MapPin,
  Loader2, Star
} from 'lucide-react';

/* ================= CATEGORY ================= */
const categoryMap = {
  weddings: 'Weddings',
  birthdays: 'Birthdays',
  milestone: 'Milestones',
  bussiness: 'Business & Office',
};

const categoryKeys = Object.keys(categoryMap);

/* ================= IMAGE MAP (PUBLIC FOLDER) ================= */
const getEventImage = (category) => {
  const map = {
    weddings: "/events/wedding.jpg",
    birthdays: "/events/cake.jpg",
    milestone: "/events/stage.jpg",
    bussiness: "/events/conference.jpg",
  };
  return map[category] || "/events/decor.jpg";
};

export default function EventsPage() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [filtered, setFiltered] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    let result = events.map(e => ({
      ...e,
      id: e._id,
      type: e.category,
      price: e.price ? `₹${Number(e.price).toLocaleString()}` : 'Free',
      date: e.date ? new Date(e.date).toLocaleDateString() : '',
      image: e.image || getEventImage(e.category),
      seatsLeft: Math.max(5, (e.totalTickets || 50) - 20),
      rating: 4.8,
      reviews: 120,
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

    setFiltered(result);
  }, [events, search, selectedType]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* HERO */}
      <div className="relative h-[70vh] flex items-center justify-center">
        <img
          src="/events/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <h1 className="relative text-white text-6xl font-bold">
          Explore <span className="text-[#C1A27B]">Events</span>
        </h1>
      </div>

      {/* SEARCH */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow">
          <Search />
          <input
            placeholder="Search events..."
            className="flex-1 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <X onClick={() => setSearch('')} className="cursor-pointer" />}
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setSelectedType('All')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'All'
                ? 'bg-[#C1A27B] text-white'
                : 'bg-gray-100'
            }`}
          >
            All
          </button>

          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-4 py-2 rounded-lg ${
                selectedType === key
                  ? 'bg-[#C1A27B] text-white'
                  : 'bg-gray-100'
              }`}
            >
              {categoryMap[key]}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#C1A27B]" size={40} />
        </div>
      )}

      {/* EVENTS GRID */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {filtered.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-2xl transition cursor-pointer group"
              onClick={() => setSelectedEvent(event)}
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={event.image}
                  onError={(e) => {
                    e.target.src = "/events/decor.jpg";
                  }}
                  className="h-60 w-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-3 left-3 bg-[#C1A27B] text-white px-3 py-1 rounded-full text-xs">
                  {event.type}
                </div>

                <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  {event.price}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-bold text-lg">{event.title}</h3>

                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14}/> {event.location}
                </p>

                <p className="text-sm text-gray-500">
                  {event.date}
                </p>

                {/* RATING */}
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Star size={14} className="text-yellow-400"/>
                  {event.rating} ({event.reviews})
                </div>

                {/* URGENCY */}
                <p className="text-xs text-red-500 mt-1">
                  {event.seatsLeft} seats left
                </p>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-xl p-6 relative">

            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3 right-3"
            >
              ✖
            </button>

            <img
              src={selectedEvent.image}
              className="h-60 w-full object-cover rounded-lg mb-4"
            />

            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
            <p className="text-gray-500">{selectedEvent.description}</p>

            <div className="flex justify-between mt-4">
              <span>{selectedEvent.date}</span>
              <span className="text-[#C1A27B] font-bold">{selectedEvent.price}</span>
            </div>

            <button className="w-full mt-5 bg-[#C1A27B] text-white py-3 rounded-xl">
              Book Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}