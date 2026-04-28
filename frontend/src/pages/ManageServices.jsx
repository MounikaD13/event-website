import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Edit2, Trash2, Upload, RefreshCw, X, CheckCircle, PlusCircle, Settings, Calendar } from 'lucide-react';
import { fetchEvents } from '../store/slices/eventsSlice';
import { fetchServicesByEvent, deleteService, clearServices } from '../store/slices/servicesSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  eventId: '',
  title: '',
  description: '',
  imageFiles: [],
  existingImages: [],
  deletedImages: [],
};

const CATEGORY_COLORS = {
  weddings: { bg: 'bg-pink-500/10', text: 'text-pink-600', label: 'Weddings' },
  birthdays: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Birthdays' },
  milestone: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', label: 'Milestones' },
  business: { bg: 'bg-teal-500/10', text: 'text-teal-600', label: 'Business & Office' },
};

const CATEGORY_ORDER = ['weddings', 'birthdays', 'milestone', 'business'];
const DEFAULT_CAT = { bg: 'bg-[#C1A27B]/10', text: 'text-[#C1A27B]', label: '' };

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

// Memoized table row — only re-renders when its own service or deletingId changes
const ServiceRow = memo(({ service, idx, deletingId, onEdit, onDelete }) => (
  <tr className="border-b border-[#F0EAE0] transition-colors hover:bg-[#FFF8F0] odd:bg-white even:bg-[#FDFAF6]">
    <td className="p-3.5 px-5">
      <span className="font-bold text-[#1f2322] text-sm block max-w-[200px] truncate">{service.title}</span>
    </td>
    <td className="p-3.5 px-5">
      <span className="text-[#667280] text-[0.85rem] block max-w-[300px] truncate">{service.description}</span>
    </td>
    <td className="p-3.5 px-5 min-w-[160px]">
      {service.images?.length > 0 ? (
        <div className="flex gap-1">
          {service.images.slice(0, 3).map((img, i) => (
            <img key={i} src={img} alt="" loading="lazy" decoding="async" className="w-[34px] h-[34px] rounded-md object-cover border-2 border-[#EFE8DC]" />
          ))}
          {service.images.length > 3 && (
            <div className="w-[34px] h-[34px] rounded-md bg-[#F0EAE0] flex items-center justify-center text-[0.7rem] font-bold text-[#667280]">+{service.images.length - 3}</div>
          )}
        </div>
      ) : <span className="text-gray-300">—</span>}
    </td>
    <td className="p-3.5 pr-7">
      <div className="flex gap-2">
        <button onClick={() => onEdit(service)} title="Edit" className="bg-[#C1A27B]/10 text-[#C1A27B] border-none rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-colors hover:bg-[#C1A27B]/22">
          <Edit2 size={15} />
        </button>
        <button onClick={() => onDelete(service._id)} title="Delete" disabled={deletingId === service._id} className="bg-red-500/10 text-red-500 border-none rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/18 disabled:cursor-not-allowed">
          {deletingId === service._id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </td>
  </tr>
));

const ManageServices = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { events, loading: eventsLoading } = useSelector((state) => state.events);
  const { services, loading: servicesLoading } = useSelector((state) => state.services);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Auto-select event from URL query param (e.g. ?eventId=xxx)
  useEffect(() => {
    const paramId = searchParams.get('eventId');
    if (paramId) {
      setSelectedEventId(paramId);
      setForm((prev) => ({ ...prev, eventId: paramId }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchServicesByEvent(selectedEventId));
    } else {
      dispatch(clearServices());
    }
    handleCancelEdit();
  }, [selectedEventId, dispatch]);

  // Cleanup blob URLs only on unmount (not on every preview change)
  const imagePreviewsRef = useRef(imagePreviews);
  imagePreviewsRef.current = imagePreviews;
  useEffect(() => {
    return () => { imagePreviewsRef.current.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, []);

  // Memoize grouped events for the dropdown to avoid recomputing on every render
  const groupedEvents = useMemo(() =>
    CATEGORY_ORDER.map((cat) => {
      const catEvents = events.filter((ev) => ev.category === cat);
      if (catEvents.length === 0) return null;
      const c = CATEGORY_COLORS[cat] || DEFAULT_CAT;
      return { cat, catEvents, colors: c };
    }).filter(Boolean),
    [events]
  );

  const scrollToForm = useCallback(
    () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    []
  );

  const handleEdit = useCallback((service) => {
    setEditingService(service);
    setForm({
      eventId: service.eventId || '',
      title: service.title || '',
      description: service.description || '',
      imageFiles: [],
      existingImages: service.images || [],
      deletedImages: [],
    });
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    scrollToForm();
  }, [scrollToForm]);

  const handleCancelEdit = useCallback(() => {
    setEditingService(null);
    setForm((prev) => ({ ...EMPTY_FORM, eventId: prev.eventId }));
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleChange = useCallback(
    (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleEventFilterChange = useCallback((value) => {
    setSelectedEventId(value);
    setForm((prev) => ({ ...prev, eventId: value }));
  }, []);

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
    if (!form.eventId) {
      toast.error('Please select an event for this service.');
      return;
    }
    setSubmitting(true);

    const fd = new FormData();
    fd.append('eventId', form.eventId);
    fd.append('title', form.title);
    fd.append('description', form.description);
    form.imageFiles.forEach((file) => fd.append('images', file));
    if (editingService && form.deletedImages.length > 0) {
      form.deletedImages.forEach((url) => fd.append('deletedImages', url));
    }

    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, fd);
        toast.success('Service updated successfully!');
      } else {
        await api.post('/services', fd);
        toast.success('Service created successfully!');
      }
      if (selectedEventId) {
        dispatch(fetchServicesByEvent(selectedEventId));
      }
      handleCancelEdit();
    } catch (err) {
      console.error("Axios Error in Add Service:", err);
      let msg = 'Operation failed';
      if (err.response) {
        msg = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        msg = 'Network error: Backend server may be unreachable or crashed.';
      } else {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const confirmed = await toastConfirm('Delete this service? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await dispatch(deleteService(id)).unwrap();
      toast.success('Service deleted successfully');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }, [dispatch]);

  // Find selected event for display
  const selectedEvent = useMemo(
    () => events.find((e) => e._id === selectedEventId),
    [events, selectedEventId]
  );

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FAF9F6]">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#C1A27B] mb-1">Manage Services</h1>
          <p className="text-[#667280] text-sm">Create, edit and manage specific services for your events.</p>
        </div>

        {/* Event Filter */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm p-6 mb-8">
          <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-2">Select Event to Manage Services</label>
          {eventsLoading ? (
            <div className="flex items-center gap-2 text-[#667280] text-sm">
              <RefreshCw size={14} className="animate-spin" /> Loading events...
            </div>
          ) : (
            <div ref={dropdownRef} className="relative">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((o) => !o)}
                className={`w-full flex items-center justify-between gap-3 bg-[#FAF9F6] border-1.5 rounded-xl p-3 px-4 cursor-pointer transition-all outline-none ${isDropdownOpen ? 'border-[#C1A27B] ring-3 ring-[#C1A27B]/15' : 'border-[#E8E1D5]'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar size={16} className="text-[#C1A27B] flex-shrink-0" />
                  {selectedEvent ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-[#1f2322] text-sm truncate">{selectedEvent.title}</span>
                      <span className="bg-[#C1A27B]/12 text-[#C1A27B] rounded-md px-2 py-0.5 text-[0.68rem] font-bold capitalize flex-shrink-0">{selectedEvent.category}</span>
                    </span>
                  ) : (
                    <span className="text-[#9B8E7E] text-sm truncate">— Choose an Event to manage its services —</span>
                  )}
                </div>
                <RefreshCw size={14} className={`text-[#C1A27B] flex-shrink-0 transition-transform duration-250 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border-1.5 border-[#E8E1D5] rounded-2xl shadow-xl overflow-hidden max-h-[340px] overflow-y-auto">
                  {/* Placeholder option */}
                  <button
                    type="button"
                    onClick={() => { handleEventFilterChange(''); setIsDropdownOpen(false); }}
                    className={`w-full text-left p-3 px-4 border-none border-b border-[#F0EAE0] cursor-pointer text-[#9B8E7E] text-[0.82rem] italic transition-colors ${!selectedEventId ? 'bg-[#C1A27B]/8' : 'bg-transparent'}`}
                  >— Choose an Event —</button>

                  {/* Group by category */}
                  {groupedEvents.map(({ cat, catEvents, colors: c }) => (
                    <div key={cat}>
                      {/* Category Header */}
                      <div className={`p-2 px-4 flex items-center gap-2 border-b border-[#F0EAE0] ${c.bg}`}>
                        <span className={`text-[0.65rem] font-extrabold uppercase tracking-widest ${c.text}`}>{c.label}</span>
                        <span className={`text-[0.6rem] rounded-full px-1.5 font-bold ${c.bg} ${c.text}`}>{catEvents.length}</span>
                      </div>
                      {/* Events in category */}
                      {catEvents.map((ev) => (
                        <button
                          key={ev._id}
                          type="button"
                          onClick={() => { handleEventFilterChange(ev._id); setIsDropdownOpen(false); }}
                          className={`w-full text-left p-2.5 px-4 pl-6 border-none border-b border-[#F7F3EE] cursor-pointer flex items-center justify-between gap-3 transition-colors hover:bg-[#C1A27B]/7 ${selectedEventId === ev._id ? 'bg-[#C1A27B]/10' : 'bg-transparent'}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {selectedEventId === ev._id && <CheckCircle size={13} className="text-[#C1A27B] flex-shrink-0" />}
                            <span className={`text-[0.88rem] truncate ${selectedEventId === ev._id ? 'font-bold' : 'font-medium text-[#1f2322]'}`}>{ev.title}</span>
                          </div>
                          {ev.images?.length > 0 && (
                            <span className="text-[0.65rem] text-[#9B8E7E] flex-shrink-0">{ev.images.length} img{ev.images.length !== 1 ? 's' : ''}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FORM CARD ── */}
        <div
          ref={formRef}
          className={`bg-white rounded-2xl border border-[#E8E1D5] shadow-sm mb-10 overflow-hidden transition-opacity duration-300 ${!selectedEventId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Header */}
          <div className="p-5 px-7 border-b border-[#EFE8DC] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C1A27B]/12 flex items-center justify-center">
                <PlusCircle size={18} className="text-[#C1A27B]" />
              </div>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1f2322] m-0">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
            </div>
            {editingService && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Service Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Gourmet Catering" 
                  className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-2.5 px-3.5 text-sm text-[#1f2322] outline-none transition-colors focus:border-[#C1A27B]" 
                />
              </div>
              <div>
                <label className="block text-[0.72rem] font-bold text-[#667280] uppercase tracking-wider mb-1.5">Service Images</label>
                <input ref={fileInputRef} type="file" multiple accept=".webp,.png,image/webp,image/png" onChange={handleImageChange} id="svcImgInput" className="hidden" />
                <label 
                  htmlFor="svcImgInput" 
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
                placeholder="Describe the specific service..." 
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
              disabled={submitting || !selectedEventId} 
              className={`border-none rounded-xl py-3 px-8 font-bold text-sm cursor-pointer flex items-center gap-2 transition-colors ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1f2322] text-white hover:bg-[#C1A27B]'}`}
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {submitting ? 'Please wait...' : editingService ? 'Update Service' : 'Add Service'}
            </button>
          </form>
        </div>

        {/* ── SERVICES HISTORY TABLE ── */}
        {selectedEventId && (
          <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm overflow-hidden">
            <div className="p-4 px-7 border-b border-[#EFE8DC] flex items-center gap-3">
              <h2 className="font-['Playfair_Display'] text-[1.1rem] font-bold text-[#1f2322] m-0">Services for Selected Event</h2>
              <span className="bg-[#C1A27B]/15 text-[#C1A27B] rounded-full text-[0.72rem] font-bold py-0.5 px-2.5">{services.length}</span>
            </div>

            <div className="overflow-auto max-h-[450px]">
              {servicesLoading ? (
                <div className="flex justify-center p-16">
                  <RefreshCw size={28} className="text-[#C1A27B] animate-spin" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center p-16 text-[#667280]">
                  <Settings size={36} className="opacity-20 mb-4 inline-block" />
                  <p className="font-semibold">No services yet for this event. Create your first service above.</p>
                </div>
              ) : (
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#1f2322]">
                      {['Service', 'Description', 'Images', 'Actions'].map((h) => (
                        <th key={h} className="p-3.5 px-5 text-left text-white text-[0.72rem] font-bold tracking-widest uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, idx) => (
                      <ServiceRow
                        key={service._id}
                        service={service}
                        idx={idx}
                        deletingId={deletingId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServices;