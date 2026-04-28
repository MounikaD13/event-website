import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, ArrowRight, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const EventCard = memo(({ event }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);
  const [liked, setLiked] = useState(false);

  const handleBook = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please sign up to book an event', { id: 'auth-required' });
      navigate('/signup', { state: { from: '/booking', event } });
      return;
    }
    navigate('/booking', { state: { event } });
  };

  return (
    <article className="event-card h-full flex flex-col rounded-3xl overflow-hidden border-[1.5px] border-[#E8E1D5] bg-white shadow-[0_12px_28px_rgba(23,24,24,0.07)] hover:border-[#C1A27B]/55 group min-h-[29.5rem]">
      <div className="relative h-56 shrink-0 bg-[#EFE9DE] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/events_gallery_bg.png';
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.1em] uppercase bg-[#B79163] text-white">
            {event.badge || event.type}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center border-[1.5px] border-white/80 hover:border-[#C1A27B]/70 transition-colors"
          aria-label="Like event"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-[#736C62]'}`} />
        </button>

        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 border-[1.5px] border-white/20 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-[#D8B786] text-[#D8B786]" />
          <span className="text-xs text-white font-medium">{event.rating}</span>
          <span className="text-xs text-white/70">({event.reviews})</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#1E201F] mb-2 leading-snug clamp-2 min-h-[3.25rem] group-hover:text-[#B79163] transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-3 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#B79163]" />
          <span className="text-xs text-[#5F6766] clamp-1">{event.location}</span>
        </div>

        <p className="text-sm text-[#596160] clamp-3 leading-relaxed mb-4 min-h-[4.05rem]">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl bg-[#F6F2EA] border-[1.5px] border-[#E9E2D6] px-2.5 py-2 text-[#5F6766] min-w-0">
            <Calendar className="w-3.5 h-3.5 text-[#B79163]" />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-[#F6F2EA] border-[1.5px] border-[#E9E2D6] px-2.5 py-2 text-[#5F6766] min-w-0">
            <Users className="w-3.5 h-3.5 text-[#B79163]" />
            <span className="truncate">{event.capacity} guests</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t-[1.5px] border-[#ECE5DA] flex items-end justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-[#7A8280]">Starting at</span>
            <p className="text-xl font-semibold text-[#B79163] leading-none mt-1">{event.price}</p>
          </div>
          <button
            onClick={handleBook}
            className="btn-earthy h-10 px-4 rounded-full text-xs font-semibold tracking-[0.1em] uppercase inline-flex items-center gap-1.5"
          >
            Book now
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
});

export default EventCard;