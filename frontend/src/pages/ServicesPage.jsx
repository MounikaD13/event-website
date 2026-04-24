import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchServicesByEvent } from "../store/slices/servicesSlice";
import { ArrowLeft, Sparkles, Loader2, Image as ImageIcon, MapPin, Calendar, Users, Star } from "lucide-react";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

export default function ServicesPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { services, loading } = useSelector((state) => state.services);
  const { events } = useSelector((state) => state.events);

  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId");

  const event = events.find((e) => e._id === eventId);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchServicesByEvent(eventId));
    }
  }, [dispatch, eventId]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-[#C29B5F] font-semibold hover:gap-3 transition-all mb-12"
        >
          <ArrowLeft size={18} /> Back to Events
        </Link>

        {/* Header Section */}
        <div className="mb-20">
          {event && (
            <div className="mb-6 flex flex-wrap gap-4">
              <span className="px-4 py-1.5 rounded-full bg-[#C29B5F]/10 text-[#C29B5F] text-[10px] font-bold tracking-widest uppercase border border-[#C29B5F]/20">
                {event.category}
              </span>
            </div>
          )}
          <h1 className="font-['Playfair_Display'] text-center text-2xl md:text-5xl text-[#1f2322] font-bold mb-6 leading-tight">
            {event ? `${event.title} Services` : "Event Services"}
          </h1>
          <p className="text-[#667280] text-lg leading-relaxed text-center">
            Discover our curated range of professional services designed to make your {event?.category || "event"} truly exceptional.
            We believe that {event?.category || "event"} are experiences that create unforgettable moments,
            bond friends and family, and transport guests to paradise even if it’s
            for a few hours. <span className="hidden md:block">We know that no two {event?.category || "event"} are alike, nor should they
              be. We impart contemporary yet traditional styles to any type of {event?.category || "event"}
              including lavish outdoor ceremonies, elegant indoor events, breathtaking
              destination {event?.category || "event"}, to even the smallest backyard affairs.
              We understand that love is in the details and that they should be
              planned with the utmost care. We are driven to bring
              your personal style and flare to your event.</span>
          </p>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#C29B5F] animate-spin mb-4" />
            <p className="text-[#667280]">Fetching event services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E7DDCF] p-20 text-center shadow-sm">
            <Sparkles className="w-12 h-12 text-[#E7DDCF] mx-auto mb-6" />
            <h2 className="font-['Playfair_Display'] text-2xl text-[#1f2322] font-bold mb-4">No services listed yet</h2>
            <p className="text-[#667280]">We're currently curating the best services for this event. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service) => (
              <div
                key={service._id}
                className="group bg-white rounded-xl overflow-hidden border border-[#E7DDCF] shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col"
              >
                {/* Service Image */}
                <div className="relative h-64 overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0].startsWith('http') ? service.images[0] : `${BASE_URL}${service.images[0]}`}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FBF8F3] flex items-center justify-center">
                      <ImageIcon className="text-[#E7DDCF]" size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Service Details */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#1f2322] mb-4 group-hover:text-[#C29B5F] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[#667280] text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="pt-6 border-t border-[#E7DDCF] flex items-center justify-between mt-auto">
                    <button className="text-[#1f2322] text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:text-[#C29B5F] transition-colors">
                      For more details contact us<Sparkles size={14} className="text-[#C29B5F]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-24 bg-[#c19b5f59] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full bg-[#C29B5F] blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full bg-[#C29B5F] blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-['Playfair_Display'] text-xl md:text-4xl font-bold mb-8">
              Interested in this event?
            </h2>
            <p className="text-lg mb-12">
              Our team of experts is ready to help you plan every detail to perfection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/contact"
                className="px-10 py-4 bg-[#C29B5F] text-white rounded-full font-bold tracking-widest uppercase text-xs hover:bg-white hover:text-[#1f2322] transition-all"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
