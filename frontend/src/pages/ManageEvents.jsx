import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Users, Upload, RefreshCw, Image as ImageIcon, X, CheckCircle, PlusCircle } from 'lucide-react';
import { fetchEvents, deleteEvent } from '../store/slices/eventsSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'weddings', label: 'Weddings' },
  { value: 'birthdays', label: 'Birthdays' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'business', label: 'Business & Office' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'weddings',
  price: '',
  totalTickets: '',
  imageFiles: [],
  existingImages: [],
  deletedImages: [],
};

/* Custom toast-based confirm — returns a Promise<boolean> */
const toastConfirm = (message) =>
  new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-[#1f2322]">{message}</span>
          <div className="flex gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="flex-1 bg-red-500 text-white border-none rounded-lg py-1.5 px-3 font-bold cursor-pointer text-[0.82rem]"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="flex-1 bg-gray-100 text-gray-700 border-none rounded-lg py-1.5 px-3 font-bold cursor-pointer text-[0.82rem]"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { padding: '1rem', maxWidth: '320px' } }
    );
  });

// Memoized table row — only re-renders when its own event or deletingId changes
const EventRow = memo(({ event, idx, deletingId, onEdit, onDelete, onNavigateServices }) => (
  <tr
    key={event._id}
    className="border-b border-[#F0EAE0] transition-colors hover:bg-[#FFF8F0] odd:bg-white even:bg-[#FDFAF6]"
  >
    <td className="p-3.5 px-5">
      <span className="font-bold text-[#1f2322] text-sm block max-w-[180px] truncate">{event.title}</span>
    </td>
    <td className="p-3.5 px-5">
      <span className="bg-[#C1A27B]/10 text-[#C1A27B] rounded-md py-1 px-2.5 text-[0.75rem] font-bold capitalize whitespace-nowrap">{event.category}</span>
    </td>
    <td className="p-3.5 px-5">
      <span className="text-[#C1A27B] font-bold text-[0.95rem]">₹ {event.price?.toLocaleString('en-IN')}</span>
    </td>
    <td className="p-3.5 px-5">
      <span className="flex items-center gap-1.5 text-[#1f2322] font-semibold text-[0.85rem]">
        <Users size={14} className="text-[#C1A27B]" />{event.totalTickets}
      </span>
    </td>
    <td className="p-3.5 px-5 min-w-[160px]">
      {event.images?.length > 0 ? (
        <div className="flex gap-1">
          {event.images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="" loading="lazy" decoding="async" className="w-[34px] h-[34px] rounded-md object-cover border-2 border-[#EFE8DC]" />
          ))}
          {event.images.length > 3 && <div className="w-[34px] h-[34px] rounded-md bg-[#F0EAE0] flex items-center justify-center text-[0.7rem] font-bold text-[#667280]">+{event.images.length - 3}</div>}
        </div>
      ) : <span className="text-gray-300">—</span>}
    </td>
    <td className="p-3.5 pl-7">
      <div className="flex gap-2">
        <button 
          onClick={() => onEdit(event)} 
          title="Edit Event" 
          className="bg-[#C1A27B]/10 text-[#C1A27B] border-none rounded-lg p-2 flex items-center justify-center cursor-pointer transition-colors hover:bg-[#C1A27B]/20"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => onNavigateServices(event._id)}
          title="Manage Services for this Event"
          className="bg-[#667280]/10 text-[#667280] border-none rounded-lg p-2 flex items-center justify-center cursor-pointer transition-colors hover:bg-[#667280]/20"
        ><PlusCircle size={15} /></button>
        <button 
          onClick={() => onDelete(event._id)} 
          title="Delete Event" 
          disabled={deletingId === event._id} 
          className="bg-red-500/10 text-red-500 border-none rounded-lg p-2 flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed"
        >
          {deletingId === event._id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </td>
  </tr>
));


const ManageEvents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, loading } = useSelector((state) => state.events);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { dispatch(fetchEvents()); }, [dispatch]);

  // Cleanup blob URLs only on unmount (not on every preview change)
  const imagePreviewsRef = useRef(imagePreviews);
  imagePreviewsRef.current = imagePreviews;
  useEffect(() => {
    return () => { imagePreviewsRef.current.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, []);

  const scrollToForm = useCallback(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), []);

  const handleEdit = useCallback((event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'weddings',
      price: event.price || '',
      totalTickets: event.totalTickets || '',
      imageFiles: [],
      existingImages: event.images || [],
      deletedImages: [],
    });
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    scrollToForm();
  }, [scrollToForm]);

  const handleCancelEdit = useCallback(() => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleChange = useCallback((e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })), []);

  const handleImageChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const allowed = ['image/webp', 'image/png'];
    const files = Array.from(e.target.files).filter((f) => {
      if (!allowed.includes(f.type)) {
        toast.error(`"${f.name}" rejected — only WebP & PNG are allowed.`);
        return false;
      }
      return true;
    });
    if (files.length === 0) return;
    setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  }, []);

  const removeNewImage = useCallback((index) => {
    setForm((prev) => {
      const updated = [...prev.imageFiles];
      updated.splice(index, 1);
      return { ...prev, imageFiles: updated };
    });
    setImagePreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const removeExistingImage = useCallback((imgUrl) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img !== imgUrl),
      deletedImages: [...prev.deletedImages, imgUrl],
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('price', form.price);
    fd.append('totalTickets', form.totalTickets);
    form.imageFiles.forEach((file) => fd.append('images', file));
    if (editingEvent && form.deletedImages.length > 0) {
      form.deletedImages.forEach((url) => fd.append('deletedImages', url));
    }

    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, fd);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/events', fd);
        toast.success('Event created successfully!');
      }
      dispatch(fetchEvents());
      handleCancelEdit();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const confirmed = await toastConfirm('Delete this event? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await dispatch(deleteEvent(id)).unwrap();
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }, [dispatch]);

  const handleNavigateServices = useCallback((eventId) => {
    navigate(`/admin/services?eventId=${eventId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FAF9F6]">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#C1A27B] mb-1">
            Manage Events
          </h1>
          <p className="text-[#667280] text-sm">Create, edit and manage your luxury event experiences.</p>
        </div>

        {/* ── FORM CARD ── */}
        <div ref={formRef} className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm mb-10 overflow-hidden">

          {/* Header */}
          <div className="p-5 px-7 border-b border-[#EFE8DC] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C1A27B]/10 flex items-center justify-center">
                <PlusCircle size={18} className="text-[#C1A27B]" />
              </div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1f2322] m-0">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
            </div>
            {editingEvent && (
              <button 
                onClick={handleCancelEdit} 
                className="flex items-center gap-1.5 bg-transparent border border-[#E8E1D5] rounded-lg py-1.5 px-3.5 text-[#667280] cursor-pointer text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7">

            {/* Row 1: Title | Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Event Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Royal Venetian Masquerade" 
                  className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B]" 
                />
              </div>
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Category *</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B]"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Price | Tickets | Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Estimated Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667280] font-semibold pointer-events-none text-sm">₹</span>
                  <input 
                    type="number" 
                    name="price" 
                    value={form.price} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    placeholder="50000" 
                    className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 pl-7 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Total Capacity *</label>
                <input 
                  type="number" 
                  name="totalTickets" 
                  value={form.totalTickets} 
                  onChange={handleChange} 
                  required 
                  min="1" 
                  placeholder="500" 
                  className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B]" 
                />
              </div>
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Event Images</label>
                <input ref={fileInputRef} type="file" multiple accept=".webp,.png,image/webp,image/png" onChange={handleImageChange} id="imgInput" className="hidden" />
                <label 
                  htmlFor="imgInput" 
                  className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#667280] outline-none transition-colors focus:border-[#C1A27B] flex items-center justify-center gap-2 cursor-pointer m-0"
                >
                  <Upload size={15} className="text-[#C1A27B]" />
                  Choose Images
                  {(form.imageFiles.length + form.existingImages.length) > 0 && (
                    <span className="bg-[#C1A27B] text-white rounded-full text-[0.7rem] py-0.5 px-2 font-bold">
                      {form.imageFiles.length + form.existingImages.length}
                    </span>
                  )}
                </label>
                <p className="text-[0.68rem] text-[#9B8E7E] mt-1.5 italic">Accepted: WebP, PNG</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Description *</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                required 
                rows={3} 
                placeholder="Describe the atmosphere and specific offerings..." 
                className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B] resize-vertical min-h-[80px] leading-relaxed" 
              />
            </div>

            {/* Image Previews */}
            {(form.existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="mb-5">
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Selected Images ({form.existingImages.length + imagePreviews.length})</label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {form.existingImages.map((url, i) => (
                    <div key={`ex-${i}`} className="relative w-[70px] h-[70px]">
                      <img src={url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-lg border-2 border-[#E8E1D5]" />
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(url)} 
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white border-none rounded-full w-4.5 h-4.5 flex items-center justify-center cursor-pointer p-0 z-10"
                      >
                        <X size={10} />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-[#667280] text-white text-[0.58rem] font-bold text-center py-0.5 uppercase rounded-b-[6px]">Saved</span>
                    </div>
                  ))}
                  {imagePreviews.map((p, i) => (
                    <div key={`nw-${i}`} className="relative w-[70px] h-[70px]">
                      <img src={p.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-lg border-2 border-[#C1A27B]" />
                      <button 
                        type="button" 
                        onClick={() => removeNewImage(i)} 
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white border-none rounded-full w-4.5 h-4.5 flex items-center justify-center cursor-pointer p-0 z-10"
                      >
                        <X size={10} />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-[#C1A27B] text-white text-[0.58rem] font-bold text-center py-0.5 uppercase rounded-b-[6px]">New</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              disabled={submitting} 
              className={`border-none rounded-xl py-3 px-8 font-bold text-sm cursor-pointer flex items-center gap-2 transition-colors ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1f2322] text-white hover:bg-[#C1A27B]'}`}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {submitting ? 'Please wait...' : editingEvent ? 'Update Event' : 'Add Event'}
            </button>
          </form>
        </div>

        {/* ── EVENTS HISTORY TABLE ── */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm overflow-hidden">
          <div className="p-4 px-7 border-b border-[#EFE8DC] flex items-center gap-3">
            <h2 className="font-['Playfair_Display'] text-[1.1rem] font-bold text-[#1f2322] m-0">Events History</h2>
            <span className="bg-[#C1A27B]/15 text-[#C1A27B] rounded-full text-[0.72rem] font-bold py-0.5 px-2.5">{events.length}</span>
          </div>

          <div className="overflow-auto max-h-[450px]">
            {loading && events.length === 0 ? (
              <div className="flex justify-center p-16">
                <RefreshCw size={28} className="text-[#C1A27B] animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center p-16 text-[#667280]">
                <ImageIcon size={36} className="opacity-20 mb-4 inline-block" />
                <p className="font-semibold">No events yet. Create your first event above.</p>
              </div>
            ) : (
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#1f2322]">
                    {['Event', 'Category', 'Estimated Price', 'Capacity', 'Images', 'Actions'].map((h) => (
                      <th key={h} className="p-3.5 px-5 text-left text-white text-[0.72rem] font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <EventRow
                      key={event._id}
                      event={event}
                      idx={idx}
                      deletingId={deletingId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onNavigateServices={handleNavigateServices}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ManageEvents;