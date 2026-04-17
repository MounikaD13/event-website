import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);

  const handleBook = () => {
    if (!isAuthenticated) {
      toast('Please sign up to book an event', { icon: '🔐' });
      navigate('/signup', { state: { from: '/booking', event: event } });
    } else {
      navigate('/booking', { state: { event } });
    }
  };

  return (
    <div className="event-card glass rounded-2xl overflow-hidden border border-[#A3B19B]/10 hover:border-[#A3B19B]/40 group cursor-pointer">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6]/80 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#A3B19B] text-white">
            {event.badge || event.type}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center border border-white/20 hover:border-[#A3B19B]/60 transition-all"
        >
          <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-[#A3B19B] text-[#A3B19B]" />
          <span className="text-xs text-[#4A4F4D] font-medium">{event.rating}</span>
          <span className="text-xs text-[#4A4F4D]/60">({event.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#4A4F4D] mb-1 group-hover:text-[#A3B19B] transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#A3B19B]" />
          <span className="text-xs text-[#4A4F4D]/60">{event.location}</span>
        </div>

        <p className="text-sm text-[#4A4F4D]/50 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4 text-xs text-[#4A4F4D]/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#A3B19B]/70" />
            {event.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#A3B19B]/70" />
            {event.capacity} guests
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-[#4A4F4D]/40">Starting from</span>
            <p className="text-lg font-bold pastel-gradient">{event.price}</p>
          </div>
          <button
            onClick={handleBook}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-pastel text-xs font-bold group/btn"
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
