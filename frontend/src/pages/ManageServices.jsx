import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Trash2, Upload, RefreshCw, Image as ImageIcon, X, CheckCircle, PlusCircle, Settings } from 'lucide-react';
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

const ManageServices = () => {
  const dispatch = useDispatch();
  const { events, loading: eventsLoading } = useSelector((state) => state.events);
  const { services, loading: servicesLoading } = useSelector((state) => state.services);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchServicesByEvent(selectedEventId));
    } else {
      dispatch(clearServices());
    }
    handleCancelEdit();
  }, [selectedEventId, dispatch]);

  useEffect(() => {
    return () => { imagePreviews.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, [imagePreviews]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      eventId: service.eventId || selectedEventId,
      title: service.title || '',
      description: service.description || '',
      imageFiles: [],
      existingImages: service.images || [],
      deletedImages: [],
    });
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    scrollToForm();
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setForm({ ...EMPTY_FORM, eventId: selectedEventId });
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEventFilterChange = (e) => {
    setSelectedEventId(e.target.value);
    setForm((prev) => ({ ...prev, eventId: e.target.value }));
  };

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
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
      console.dir(err);
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

  const handleDelete = async (id) => {
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
  };

  return (
    <div className="min-h-screen pt-28 pb-16" style={{ background: '#FAF9F6' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '700', color: '#C1A27B', marginBottom: '0.25rem' }}>
            Manage Services
          </h1>
          <p style={{ color: '#667280', fontSize: '0.9rem' }}>Create, edit and manage specific services for your events.</p>
        </div>

        {/* Event Filter */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E8E1D5', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 16px rgba(193,162,123,0.08)' }}>
          <label style={lbl}>Select Event to Manage Services</label>
          {eventsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#667280', fontSize: '0.9rem' }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading events...
            </div>
          ) : (
            <select value={selectedEventId} onChange={handleEventFilterChange} style={inp} onFocus={(e) => e.target.style.borderColor = '#C1A27B'} onBlur={(e) => e.target.style.borderColor = '#E8E1D5'}>
              <option value="">-- Choose an Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>{ev.title} ({ev.category})</option>
              ))}
            </select>
          )}
        </div>

        {/* ── FORM CARD ── */}
        <div ref={formRef} style={{ opacity: selectedEventId ? 1 : 0.5, pointerEvents: selectedEventId ? 'auto' : 'none', background: '#fff', borderRadius: '16px', border: '1px solid #E8E1D5', boxShadow: '0 2px 16px rgba(193,162,123,0.08)', marginBottom: '2.5rem', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          {/* Header */}
          <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #EFE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(193,162,123,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={18} color="#C1A27B" />
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: '700', color: '#1f2322', margin: 0 }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
            </div>
            {editingService && (
              <button onClick={handleCancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid #E8E1D5', borderRadius: '8px', padding: '0.4rem 0.85rem', color: '#667280', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                <X size={14} /> Cancel
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={lbl}>Service Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Gourmet Catering" style={inp} onFocus={(e) => e.target.style.borderColor = '#C1A27B'} onBlur={(e) => e.target.style.borderColor = '#E8E1D5'} />
              </div>
              <div>
                <label style={lbl}>Service Images</label>
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
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the specific service..." style={{ ...inp, resize: 'vertical', minHeight: '80px', lineHeight: '1.5' }} onFocus={(e) => e.target.style.borderColor = '#C1A27B'} onBlur={(e) => e.target.style.borderColor = '#E8E1D5'} />
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
            <button type="submit" disabled={submitting || !selectedEventId} style={{ background: submitting || !selectedEventId ? '#aaa' : '#1f2322', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.7rem 2rem', fontWeight: '700', fontSize: '0.9rem', cursor: submitting || !selectedEventId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
              onMouseOver={(e) => { if (!submitting && selectedEventId) e.currentTarget.style.background = '#C1A27B'; }}
              onMouseOut={(e) => { if (!submitting && selectedEventId) e.currentTarget.style.background = '#1f2322'; }}
            >
              {submitting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
              {submitting ? 'Please wait...' : editingService ? 'Update Service' : 'Add Service'}
            </button>
          </form>
        </div>

        {/* ── SERVICES HISTORY TABLE ── */}
        {selectedEventId && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E8E1D5', boxShadow: '0 2px 16px rgba(193,162,123,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '1.1rem 1.75rem', borderBottom: '1px solid #EFE8DC', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: '700', color: '#1f2322', margin: 0 }}>Services for Selected Event</h2>
              <span style={{ background: 'rgba(193,162,123,0.15)', color: '#C1A27B', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.6rem' }}>{services.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {servicesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                  <RefreshCw size={28} color="#C1A27B" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : services.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#667280' }}>
                  <Settings size={36} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                  <p style={{ fontWeight: '600' }}>No services yet for this event. Create your first service above.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#1f2322' }}>
                      {['Service', 'Description', 'Images', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', color: '#fff', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, idx) => (
                      <tr key={service._id} style={{ background: idx % 2 === 0 ? '#fff' : '#FDFAF6', borderBottom: '1px solid #F0EAE0' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FFF8F0'}
                        onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FDFAF6'}
                      >
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span style={{ fontWeight: '700', color: '#1f2322', fontSize: '0.9rem', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.title}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span style={{ color: '#667280', fontSize: '0.85rem', display: 'block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.description}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          {service.images?.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {service.images.slice(0, 3).map((img, i) => (
                                <img key={i} src={img} alt="" style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #EFE8DC' }} />
                              ))}
                              {service.images.length > 3 && <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#F0EAE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#667280' }}>+{service.images.length - 3}</div>}
                            </div>
                          ) : <span style={{ color: '#ccc' }}>—</span>}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(service)} title="Edit" style={actBtn('#C1A27B', 'rgba(193,162,123,0.1)')}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(193,162,123,0.22)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(193,162,123,0.1)'}
                            ><Edit2 size={15} /></button>
                            <button onClick={() => handleDelete(service._id)} title="Delete" disabled={deletingId === service._id} style={actBtn('#ef4444', 'rgba(239,68,68,0.08)')}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                            >
                              {deletingId === service._id ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
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
        )}
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

export default ManageServices;