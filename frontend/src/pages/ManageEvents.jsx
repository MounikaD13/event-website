import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Edit2, Trash2, Calendar, MapPin, 
  Clock, DollarSign, Users, X, Save,
  AlertCircle, LayoutGrid, List, RefreshCw
} from 'lucide-react';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../store/slices/eventsSlice';
import toast from 'react-hot-toast';

const AVAILABLE_IMAGES = [
  '/images/event_beach_wedding.jpg',
  '/images/event_dubai_gala.jpg',
  '/images/event_maldives_retreat.jpg',
  '/images/event_paris_dinner.jpg',
  '/images/event_tokyo_conf.jpg',
  '/images/event_tuscany_wedding.jpg',
  '/images/hero_birthday_party.png',
  '/images/hero_corporate_aesthetic.png',
  '/images/hero_event_aesthetic.png',
  '/images/hero_indian_wedding.png',
  '/images/hero_wedding_aesthetic.png',
  '/images/events_gallery_bg.png',
];

const ManageEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'weddings',
    price: '',
    totalTickets: '',
    image: AVAILABLE_IMAGES[0],
  });

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        description: event.description,
        date: event.date.split('T')[0],
        time: event.time,
        location: event.location,
        category: event.category,
        price: event.price,
        totalTickets: event.totalTickets,
        image: event.image || AVAILABLE_IMAGES[0],
      });
    } else {
      setEditingEvent(null);
      setForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'weddings',
        price: '',
        totalTickets: '',
        image: AVAILABLE_IMAGES[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await dispatch(updateEvent({ id: editingEvent._id, eventData: form })).unwrap();
        toast.success('Event updated successfully');
      } else {
        await dispatch(createEvent(form)).unwrap();
        toast.success('Event created successfully');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await dispatch(deleteEvent(id)).unwrap();
        toast.success('Event deleted successfully');
      } catch (err) {
        toast.error(err || 'Delete failed');
      }
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#0f0e17] text-[#f8f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#C9A84C] mb-2">Manage Events</h1>
            <p className="text-gray-400">Create and curate your selection of luxury experiences.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#C9A84C] hover:bg-[#B69640] text-[#0f0e17] font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#C9A84C]/10"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#1a1a2e] p-4 rounded-xl border border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f0e17] border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-[#C9A84C] text-[#0f0e17]' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-[#C9A84C] text-[#0f0e17]' : 'text-gray-500 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events Data Area */}
        {loading && events.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 text-[#C9A84C] animate-spin" />
          </div>
        ) : filteredEvents.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div key={event._id} className="group bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5 hover:border-[#C9A84C]/30 transition-all duration-300">
                  <div className="h-48 bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-[#C9A84C] text-[#0f0e17] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest z-10">
                      {event.category}
                    </div>
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Calendar className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold mb-4 group-hover:text-[#C9A84C] transition-colors">{event.title}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-[#C9A84C]" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4 text-[#C9A84C]" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(event)}
                          className="p-2 text-gray-400 hover:text-[#C9A84C] transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                        {event.totalTickets} Tickets Left
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-left">
                <thead className="bg-[#0f0e17] text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-serif font-bold text-[#f8f5f0]">{event.title}</div>
                        <div className="text-[10px] text-[#C9A84C] uppercase tracking-widest">{event.category}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{event.time}</div>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-400">{event.location}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleOpenModal(event)}
                            className="bg-[#C9A84C]/10 p-2 rounded hover:bg-[#C9A84C]/20 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-[#C9A84C]" />
                          </button>
                          <button 
                            onClick={() => handleDelete(event._id)}
                            className="bg-red-500/10 p-2 rounded hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-[#1a1a2e] border border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-serif font-bold mb-2">No Events Found</h3>
            <p className="text-gray-500 text-sm max-w-xs">Try adjusting your search or create a new event to get started.</p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div 
              className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></div>
            <div className="relative bg-[#1a1a2e] w-full max-w-2xl rounded-2xl border border-[#C9A84C]/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-[#C9A84C]">
                  {editingEvent ? 'Edit Luxury Experience' : 'New Luxury Experience'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Event Title</label>
                  <input 
                    type="text" name="title" value={form.title} onChange={handleChange} required
                    className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    placeholder="e.g. Royal Venetian Masquerade"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                    Event Cover Image
                    <span className="text-[10px] text-[#C9A84C] font-normal tracking-normal lowercase italic">Scroll to select...</span>
                  </label>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'thin', scrollbarColor: '#C9A84C #0f0e17' }}>
                    {AVAILABLE_IMAGES.map((img) => (
                      <div 
                        key={img}
                        onClick={() => setForm({ ...form, image: img })}
                        className={`flex-shrink-0 w-[140px] h-[90px] rounded-lg overflow-hidden cursor-pointer snap-start transition-all border-2 ${form.image === img ? 'border-[#C9A84C] opacity-100 scale-105 shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      >
                        <img src={img} alt="Template" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input 
                      type="date" name="date" value={form.date} onChange={handleChange} required
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Time (EST)
                    </label>
                    <input 
                      type="text" name="time" value={form.time} onChange={handleChange} required
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="e.g. 19:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Location
                    </label>
                    <input 
                      type="text" name="location" value={form.location} onChange={handleChange} required
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="e.g. Grand Canal, Venice"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      name="category" value={form.category} onChange={handleChange}
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    >
                      <option value="weddings">Weddings</option>
                      <option value="birthdays">Birthdays</option>
                      <option value="milestone">Milestones</option>
                      <option value="bussiness">Business & Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Entry Fee (USD)
                    </label>
                    <input 
                      type="number" name="price" value={form.price} onChange={handleChange}
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="0 for free"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Users className="w-3 h-3" /> Total Capacity
                    </label>
                    <input 
                      type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} required
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="e.g. 500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Description</label>
                  <textarea 
                    name="description" value={form.description} onChange={handleChange} required
                    rows={4}
                    className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                    placeholder="Describe the atmosphere, exclusivity and specific offerings of this event..."
                  ></textarea>
                </div>
              </form>

              <div className="p-6 border-t border-white/5 bg-[#1a1a2e] flex items-center justify-end gap-4">
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#C9A84C] hover:bg-[#B69640] text-[#0f0e17] font-bold uppercase tracking-[0.2em] py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingEvent ? 'Update' : 'Create'} Experience
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
