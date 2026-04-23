import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Trash2, Users, Upload, RefreshCw, Image as ImageIcon, X, CheckCircle, PlusCircle } from 'lucide-react';
import { fetchEvents, deleteEvent } from '../store/slices/eventsSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'weddings', label: 'Weddings' },
  { value: 'birthdays', label: 'Birthdays' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'bussiness', label: 'Business & Office' },
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontWeight: '600', color: '#1f2322' }}>{message}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              style={{
                flex: 1, background: '#ef4444', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '0.4rem 0.8rem', fontWeight: '700',
                cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              style={{
                flex: 1, background: '#f3f4f6', color: '#374151', border: 'none',
                borderRadius: '8px', padding: '0.4rem 0.8rem', fontWeight: '700',
                cursor: 'pointer', fontSize: '0.82rem',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, style: { padding: '1rem', maxWidth: '320px' } }
    );
  });

const ManageEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { dispatch(fetchEvents()); }, [dispatch]);

  useEffect(() => {
    return () => { imagePreviews.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, [imagePreviews]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleEdit = (event) => {
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
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so same files can be re-selected if removed
    e.target.value = '';
  };

  const removeNewImage = (index) => {
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
  };

  const removeExistingImage = (imgUrl) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img !== imgUrl),
      deletedImages: [...prev.deletedImages, imgUrl],
    }));
  };

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

  const handleDelete = async (id) => {
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
  };

  return (
    <div className="min-h-screen pt-28 pb-16" style={{ background: '#FAF9F6' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '700', color: '#C1A27B', marginBottom: '0.25rem' }}>
            Manage Events
          </h1>
          <p style={{ color: '#667280', fontSize: '0.9rem' }}>Create, edit and manage your luxury event experiences.</p>
        </div>

        {/* ── FORM CARD ── */}
        <div ref={formRef} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E8E1D5', boxShadow: '0 2px 16px rgba(193,162,123,0.08)', marginBottom: '2.5rem', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #EFE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(193,162,123,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={18} color="#C1A27B" />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: '700', color: '#1f2322', margin: 0 }}>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
            </div>
            {editingEvent && (
              <button onClick={handleCancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid #E8E1D5', borderRadius: '8px', padding: '0.4rem 0.85rem', color: '#667280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                <X size={14} /> Cancel
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>

            {/* Row 1: Title | Category */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={lbl}>Event Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Royal Venetian Masquerade" style={inp} onFocus={(e) => e.target.style.borderColor='#C1A27B'} onBlur={(e) => e.target.style.borderColor='#E8E1D5'} />
              </div>
              <div>
                <label style={lbl}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={inp} onFocus={(e) => e.target.style.borderColor='#C1A27B'} onBlur={(e) => e.target.style.borderColor='#E8E1D5'}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Price | Tickets | Images */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={lbl}>Estimated Price (₹) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#667280', fontWeight: '600', pointerEvents: 'none' }}>₹</span>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="50000" style={{ ...inp, paddingLeft: '1.8rem' }} onFocus={(e) => e.target.style.borderColor='#C1A27B'} onBlur={(e) => e.target.style.borderColor='#E8E1D5'} />
                </div>
              </div>
              <div>
                <label style={lbl}>Total Capacity *</label>
                <input type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} required min="1" placeholder="500" style={inp} onFocus={(e) => e.target.style.borderColor='#C1A27B'} onBlur={(e) => e.target.style.borderColor='#E8E1D5'} />
              </div>
              <div>
                <label style={lbl}>Event Images</label>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} id="imgInput" style={{ display: 'none' }} />
                <label htmlFor="imgInput" style={{ ...inp, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', justifyContent: 'center', color: '#667280', margin: 0 }}>
                  <Upload size={15} color="#C1A27B" />
                  Choose Images
                  {(form.imageFiles.length + form.existingImages.length) > 0 && (
                    <span style={{ background: '#C1A27B', color: '#fff', borderRadius: '999px', fontSize: '0.7rem', padding: '0.1rem 0.5rem', fontWeight: '700' }}>
                      {form.imageFiles.length + form.existingImages.length}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the atmosphere and specific offerings..." style={{ ...inp, resize: 'vertical', minHeight: '80px', lineHeight: '1.5' }} onFocus={(e) => e.target.style.borderColor='#C1A27B'} onBlur={(e) => e.target.style.borderColor='#E8E1D5'} />
            </div>

            {/* Image Previews */}
            {(form.existingImages.length > 0 || imagePreviews.length > 0) && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Selected Images ({form.existingImages.length + imagePreviews.length})</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.5rem' }}>
                  {form.existingImages.map((url, i) => (
                    <div key={`ex-${i}`} style={{ position: 'relative', width: '70px', height: '70px' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #E8E1D5' }} />
                      <button type="button" onClick={() => removeExistingImage(url)} style={rmBtn}><X size={10} /></button>
                      <span style={badge('#667280')}>Saved</span>
                    </div>
                  ))}
                  {imagePreviews.map((p, i) => (
                    <div key={`nw-${i}`} style={{ position: 'relative', width: '70px', height: '70px' }}>
                      <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #C1A27B' }} />
                      <button type="button" onClick={() => removeNewImage(i)} style={rmBtn}><X size={10} /></button>
                      <span style={badge('#C1A27B')}>New</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitting} style={{ background: submitting ? '#aaa' : '#1f2322', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.7rem 2rem', fontWeight: '700', fontSize: '0.9rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
              onMouseOver={(e) => { if (!submitting) e.currentTarget.style.background = '#C1A27B'; }}
              onMouseOut={(e) => { if (!submitting) e.currentTarget.style.background = '#1f2322'; }}
            >
              {submitting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
              {submitting ? 'Please wait...' : editingEvent ? 'Update Event' : 'Add Event'}
            </button>
          </form>
        </div>

        {/* ── EVENTS HISTORY TABLE ── */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E8E1D5', boxShadow: '0 2px 16px rgba(193,162,123,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '1.1rem 1.75rem', borderBottom: '1px solid #EFE8DC', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: '700', color: '#1f2322', margin: 0 }}>Events History</h2>
            <span style={{ background: 'rgba(193,162,123,0.15)', color: '#C1A27B', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.6rem' }}>{events.length}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading && events.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <RefreshCw size={28} color="#C1A27B" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#667280' }}>
                <ImageIcon size={36} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ fontWeight: '600' }}>No events yet. Create your first event above.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#1f2322' }}>
                    {['Event', 'Category', 'Estimated Price', 'Capacity', 'Images', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#fff', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={event._id} style={{ background: idx % 2 === 0 ? '#fff' : '#FDFAF6', borderBottom: '1px solid #F0EAE0' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FFF8F0'}
                      onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FDFAF6'}
                    >
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{ fontWeight: '700', color: '#1f2322', fontSize: '0.9rem', display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{ background: 'rgba(193,162,123,0.12)', color: '#C1A27B', borderRadius: '6px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{event.category}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{ color: '#C1A27B', fontWeight: '700', fontSize: '0.95rem' }}>₹ {event.price?.toLocaleString('en-IN')}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1f2322', fontWeight: '600', fontSize: '0.85rem' }}>
                          <Users size={14} color="#C1A27B" />{event.totalTickets}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        {event.images?.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {event.images.slice(0, 3).map((img, i) => (
                              <img key={i} src={img} alt="" style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #EFE8DC' }} />
                            ))}
                            {event.images.length > 3 && <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#F0EAE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#667280' }}>+{event.images.length - 3}</div>}
                          </div>
                        ) : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(event)} title="Edit" style={actBtn('#C1A27B', 'rgba(193,162,123,0.1)')}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(193,162,123,0.22)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(193,162,123,0.1)'}
                          ><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(event._id)} title="Delete" disabled={deletingId === event._id} style={actBtn('#ef4444', 'rgba(239,68,68,0.08)')}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          >
                            {deletingId === event._id ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
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

const lbl = { display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#667280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' };
const inp = { width: '100%', background: '#FAF9F6', border: '1px solid #E8E1D5', borderRadius: '10px', padding: '0.6rem 0.9rem', fontSize: '0.88rem', color: '#1f2322', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const rmBtn = { position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 1 };
const badge = (bg) => ({ position: 'absolute', bottom: 0, left: 0, right: 0, background: bg, color: '#fff', fontSize: '0.58rem', fontWeight: '700', textAlign: 'center', padding: '0.1rem 0', textTransform: 'uppercase', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' });
const actBtn = (color, bg) => ({ background: bg, color, border: 'none', borderRadius: '8px', padding: '0.45rem 0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' });

export default ManageEvents;