import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, MessageSquare, Calendar, Search,
  ChevronDown, ChevronUp, Send, Trash2, Mail, ShieldCheck,
  Filter, Activity, CheckCircle, Clock, XCircle, Info,
  Briefcase, Bell, Zap, MapPin, Banknote, Wrench, Phone, Heart, Layers,
  StickyNote, PlusCircle, Tag, FileText, Star, AlertTriangle
} from 'lucide-react';
import {
  fetchAllUserData, updateInquiryStatus, replyToChat, deleteUser,
  fetchAllContacts, updateContactStatus, deleteContact
} from '../store/slices/adminSlice';
import toast from 'react-hot-toast';
import { createSocket } from '../utils/socket';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  accent: '#C1A27B',
  gold: '#C1A27B',
  goldDeep: '#A98960',
  textMuted: '#667280',
  textDark: '#2F3742',
  borderSoft: '#E8E1D5',
  surface: '#FBF8F3',
};

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'Checked':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Confirmed':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'Rejected':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return <Clock className="w-4 h-4" />;
    case 'Checked':
      return <Info className="w-4 h-4" />;
    case 'Confirmed':
      return <CheckCircle className="w-4 h-4" />;
    case 'Rejected':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const getActivityTypeMeta = (type) => {
  if (type === 'User Inquiry') {
    return {
      icon: Users,
      badgeClass: 'bg-emerald-500/10 text-emerald-600',
      panelClass: 'bg-emerald-500/10 text-emerald-600',
    };
  }

  if (type === 'Live Chat') {
    return {
      icon: MessageSquare,
      badgeClass: 'bg-sky-500/10 text-sky-600',
      panelClass: 'bg-sky-500/10 text-sky-600',
    };
  }

  return {
    icon: Mail,
    badgeClass: 'bg-amber-500/10 text-amber-600',
    panelClass: 'bg-amber-500/10 text-amber-600',
  };
};

const premiumCardClass =
  'rounded-[2rem] border border-[#E8E1D5] bg-white shadow-[0_18px_50px_rgba(34,37,49,0.06)]';
<<<<<<< HEAD
=======

const RequirementItem = ({ icon: Icon, label, value, subValue }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#C1A27B]/5 transition-colors group">
    <div className="h-9 w-9 rounded-lg bg-white border border-[#E8E1D5] flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#C1A27B]/30 transition-colors">
      <Icon className="h-4 w-4 text-[#C1A27B]" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-[#667280] uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-[#2F3742] truncate mt-0.5">{value}</p>
      {subValue && <p className="text-[9px] text-[#C1A27B] font-medium mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// ── Admin Notes Panel ──────────────────────────────────────────────────────────
const NOTE_TAGS = ['Follow-up', 'Priority', 'VIP', 'Caution', 'Confirmed', 'Pending Call'];
const NOTE_TAG_COLORS = {
  'Follow-up': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  'Priority': 'bg-red-500/10 text-red-600 border-red-500/20',
  'VIP': 'bg-[#C1A27B]/10 text-[#A98960] border-[#C1A27B]/20',
  'Caution': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Confirmed': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Pending Call': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const AdminNotesPanel = ({ itemId }) => {
  const storageKey = `admin_notes_${itemId}`;
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Follow-up');
  const [rating, setRating] = useState(3);

  const saveNotes = (updated) => {
    setNotes(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: `${Date.now()}`,
      text: noteText.trim(),
      tag: selectedTag,
      rating,
      createdAt: new Date().toISOString(),
    };
    saveNotes([newNote, ...notes]);
    setNoteText('');
  };

  const deleteNote = (id) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <h4 className="font-serif text-xl font-bold text-[#2F3742] border-b border-[#E8E1D5] pb-4 flex items-center gap-3">
        <StickyNote className="text-[#C1A27B]" /> Admin Notes & Tags
      </h4>

      {/* Composer */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-5 shadow-sm space-y-4">
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add an internal note about this client or inquiry…"
          className="w-full bg-[#FBF8F3] border border-[#E8E1D5] rounded-2xl p-4 text-sm text-[#2F3742] resize-none focus:border-[#C1A27B] focus:ring-4 focus:ring-[#C1A27B]/10 outline-none transition-all placeholder:text-[#667280]/50"
        />

        {/* Tag selector */}
        <div className="flex flex-wrap gap-2">
          {NOTE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                selectedTag === tag
                  ? NOTE_TAG_COLORS[tag] + ' shadow-sm'
                  : 'bg-white border-[#E8E1D5] text-[#667280] hover:border-[#C1A27B] hover:text-[#C1A27B]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Priority</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-colors ${star <= rating ? 'text-[#C1A27B]' : 'text-[#E8E1D5]'}`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={addNote}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C1A27B] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#A98960] transition-colors shadow-md shadow-[#C1A27B]/20"
        >
          <PlusCircle className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#667280]/30">
            <FileText size={40} className="mb-2" />
            <p className="text-xs uppercase tracking-widest">No notes yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {notes.map((note) => (
              <Motion.div
                key={note.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-sm flex gap-4 group"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${NOTE_TAG_COLORS[note.tag]}`}>
                      {note.tag}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 fill-current ${s <= note.rating ? 'text-[#C1A27B]' : 'text-[#E8E1D5]'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#2F3742] leading-relaxed">{note.text}</p>
                  <p className="text-[9px] text-[#667280] uppercase tracking-widest">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#667280] hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </Motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { users, contacts } = useSelector((state) => state.admin);

  const safeUsers = users || [];
  const safeContacts = contacts || [];

  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [realtimeActivities, setRealtimeActivities] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchAllUserData({ search: searchTerm }));
    dispatch(fetchAllContacts());
  }, [dispatch, searchTerm]);
  useEffect(() => {
    const refreshAdminData = () => {
      dispatch(fetchAllUserData({ search: searchTermRef.current }));
      dispatch(fetchAllContacts());
    };

    const pushRealtimeActivity = (activity) => {
      setRealtimeActivities((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          isRealtime: true,
          date: new Date(activity.timestamp || new Date()),
          status: activity.status || 'Pending',
          ...activity,
        },
        ...prev,
      ].slice(0, 10));
    };

    const socket = createSocket();

    socket.on('connect', () => {
      socket.emit('join_admin_room');
    });

    socket.on('dashboard:inquiry-created', (data) => {
      pushRealtimeActivity({
        type: 'User Inquiry',
        name: data.userName,
        email: data.userEmail,
        event: data.inquiry?.eventType || 'New inquiry',
        status: data.inquiry?.status || 'Pending',
        timestamp: data.timestamp,
      });
      toast.success(`New inquiry from ${data.userName}`);
      refreshAdminData();
    });

    socket.on('dashboard:inquiry-cancelled', (data) => {
      pushRealtimeActivity({
        type: 'User Inquiry',
        name: data.userName,
        email: data.userEmail,
        event: data.inquiry?.eventType || 'Inquiry cancelled',
        status: 'Rejected',
        timestamp: data.timestamp,
      });
      toast.success(`${data.userName} cancelled an inquiry`);
      refreshAdminData();
    });

    socket.on('dashboard:inquiry-updated', (data) => {
      pushRealtimeActivity({
        type: 'User Inquiry',
        name: data.userName,
        event: data.inquiry?.eventType || 'Inquiry updated',
        status: data.inquiry?.status || 'Checked',
        timestamp: data.timestamp,
      });
      refreshAdminData();
    });

    socket.on('dashboard:chat-message', (data) => {
      pushRealtimeActivity({
        type: 'Live Chat',
        name: data.userName,
        event: data.chat?.message || 'New chat message',
        status: 'Checked',
        timestamp: data.timestamp,
      });
      refreshAdminData();
    });

    socket.on('dashboard:booking-created', refreshAdminData);
    socket.on('dashboard:user-deleted', refreshAdminData);

    socket.on('contact:created', (data) => {
      pushRealtimeActivity({
        type: 'Guest Inquiry',
        name: data.contact?.fullName,
        email: data.contact?.email,
        event: 'General Inquiry',
        status: data.contact?.status || 'Pending',
        timestamp: data.timestamp,
      });
      toast.success(`New guest inquiry from ${data.contact?.fullName || 'Guest'}`);
      refreshAdminData();
    });

    socket.on('contact:updated', refreshAdminData);
    socket.on('contact:deleted', refreshAdminData);

    return () => {
      socket.off('dashboard:inquiry-created');
      socket.off('dashboard:inquiry-cancelled');
      socket.off('dashboard:inquiry-updated');
      socket.off('dashboard:chat-message');
      socket.off('dashboard:booking-created');
      socket.off('dashboard:user-deleted');
      socket.off('contact:created');
      socket.off('contact:updated');
      socket.off('contact:deleted');
      socket.disconnect();
    };
  }, [dispatch]);

  const recentActivity = (() => {
    const activities = [];

    safeUsers.forEach((user) => {
      (user.inquiries || []).forEach((inq) => {
        activities.push({
          id: inq._id,
          type: 'User Inquiry',
          name: user.name,
          email: user.email,
          event: inq.eventType,
          date: new Date(inq.createdAt || new Date()),
          status: inq.status || 'Pending',
        });
      });
    });

    safeContacts.forEach((contact) => {
      activities.push({
        id: contact._id,
        type: 'Guest Inquiry',
        name: contact.fullName,
        email: contact.email,
        event: 'General Inquiry',
        date: new Date(contact.createdAt || new Date()),
        status: contact.status || 'Pending',
      });
    });

    activities.sort((a, b) => b.date - a.date);
    return [...realtimeActivities, ...activities].slice(0, 5);
  })();
  const handleUserStatusUpdate = async (userId, inquiryId, newStatus) => {
    try {
      await dispatch(updateInquiryStatus({ userId, inquiryId, newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err || 'Failed to update status');
    }
  };

  const handleContactStatusUpdate = async (id, newStatus) => {
    try {
      await dispatch(updateContactStatus({ id, status: newStatus })).unwrap();
      toast.success(`Guest inquiry marked as ${newStatus}`);
    } catch (err) {
      toast.error(err || 'Failed to update guest inquiry');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err || 'Failed to delete user');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this guest inquiry?')) return;
    try {
      await dispatch(deleteContact(id)).unwrap();
      toast.success('Inquiry deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete inquiry');
    }
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const filteredUsers = filterStatus
    ? safeUsers.filter((user) =>
<<<<<<< HEAD
      (user.inquiries || []).some((inq) => inq.status === filterStatus)
    )
=======
        (user.inquiries || []).some((inq) => inq.status === filterStatus)
      )
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
    : safeUsers;

  const filteredContacts = safeContacts.filter((contact) => {
    const matchesSearch =
      contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? contact.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const items = activeTab === 'clients' ? filteredUsers : filteredContacts;
  return (
    <div className="min-h-screen bg-[#FBF8F3] pt-24 sm:pt-28 lg:pt-40 pb-12 sm:pb-16 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-12">
<<<<<<< HEAD
=======

>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
        {/* ================= HEADER ================= */}
        <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col gap-6 sm:gap-8 xl:flex-row xl:items-end xl:justify-between">
          {/* LEFT CONTENT */}
          <Motion.div {...cardMotion} className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-[#C1A27B]/10 p-2">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-[#C1A27B]" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C1A27B]">
                Executive Console
              </span>
            </div>
            <h1 className="font-serif font-bold tracking-tight text-[#2F3742] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              Management <span className="text-[#C1A27B]">Hub</span>
            </h1>
            <p className="max-w-full sm:max-w-xl text-sm sm:text-base lg:text-lg font-medium text-[#667280]">
              Real-time synchronization for your event ecosystem. Monitor, respond, and grow.
            </p>
          </Motion.div>

          {/* ================= STATS ================= */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 w-full xl:w-auto"
          >
            {[
              { label: 'Total Clients', value: safeUsers.length, icon: Users },
              { label: 'Guest Leads', value: safeContacts.length, icon: MessageSquare },
            ].map((stat) => (
              <div key={stat.label} className={`${premiumCardClass} w-full sm:min-w-[160px] lg:min-w-[180px] p-4 sm:p-5 lg:p-6 transition-all group`}>
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <div className="rounded-lg sm:rounded-xl p-2 bg-[#C1A27B]/10 text-[#C1A27B] group-hover:scale-110 transition-transform">
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-gray-200" />
                </div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#667280]">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2F3742] font-serif">{stat.value}</p>
              </div>
            ))}
          </Motion.div>
        </div>

        {/* ================= REALTIME PANEL ================= */}
        <Motion.div {...cardMotion} className={`${premiumCardClass} mb-8 sm:mb-10 lg:mb-12 p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl font-bold text-[#2F3742] font-serif">
              <Activity className="h-5 w-5 text-emerald-600" />
              Real-Time Pulse
            </h2>
<<<<<<< HEAD
            <button onClick={() => setIsLogsOpen(!isLogsOpen)} className="text-[10px] sm:text-xs font-bold text-[#C1A27B] flex items-center gap-1 sm:gap-2 hover:text-[#A98960] transition-colors">
=======
            <button
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="text-[10px] sm:text-xs font-bold text-[#C1A27B] flex items-center gap-1 sm:gap-2 hover:text-[#A98960] transition-colors"
            >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
              {isLogsOpen ? 'HIDE LOGS' : 'VIEW LOGS'}
              <ChevronDown className={`h-4 w-4 transition-transform ${isLogsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {isLogsOpen && (
<<<<<<< HEAD
              <Motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
=======
              <Motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 border-t border-[#E8E1D5] pt-6">
                  {[...realtimeActivities, ...recentActivity].map((log, i) => (
                    <div key={log.id || i} className="flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-[#FBF8F3] p-3 sm:p-4">
                      <div className="rounded-lg p-2 bg-[#C1A27B]/10 text-[#C1A27B]">
                        {log.type === 'Live Chat' ? <MessageSquare className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2F3742]">{log.name}</p>
                        <p className="truncate text-[10px] text-[#667280] uppercase tracking-wider">{log.event}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#C1A27B]">
                        {new Date(log.date || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-row gap-4 sm:gap-6 overflow-x-auto pb-4 hide-scrollbar">
            {recentActivity.map((act, index) => {
              const meta = getActivityTypeMeta(act.type);
              const ActivityIcon = meta.icon;
              return (
<<<<<<< HEAD
                <Motion.div key={act.id || index} className={`min-w-[280px] sm:min-w-[320px] rounded-2xl border p-4 sm:p-6 transition-all ${act.isRealtime ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#E8E1D5] bg-white'}`}>
=======
                <Motion.div
                  key={act.id || index}
                  className={`min-w-[280px] sm:min-w-[320px] rounded-2xl border p-4 sm:p-6 transition-all ${
                    act.isRealtime ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#E8E1D5] bg-white'
                  }`}
                >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2 ${meta.panelClass}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">{act.type}</p>
                        <p className="text-xs font-medium text-[#2F3742]">
                          {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
<<<<<<< HEAD
                    {act.isRealtime && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white animate-pulse">LIVE</span>}
=======
                    {act.isRealtime && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white animate-pulse">
                        LIVE
                      </span>
                    )}
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                  </div>
                  <p className="font-serif text-lg font-bold text-[#2F3742] truncate">{act.name}</p>
                  <p className="text-sm text-[#667280] truncate mb-3">{act.event}</p>
                  <div className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase ${getStatusColor(act.status)}`}>
                    {getStatusIcon(act.status)} {act.status}
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>

        {/* ================= FILTER + TABS ================= */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-2xl border border-[#E8E1D5] bg-white p-1.5 shadow-sm">
            {['clients', 'guests'].map((tab) => (
<<<<<<< HEAD
              <button key={tab} onClick={() => { setActiveTab(tab); setExpandedItem(null); }}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all
                  ${activeTab === tab ? 'bg-[#C1A27B] text-white shadow-md' : 'text-[#667280] hover:text-[#C1A27B]'}`}>
=======
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setExpandedItem(null); }}
                className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all
                  ${activeTab === tab ? 'bg-[#C1A27B] text-white shadow-md' : 'text-[#667280] hover:text-[#C1A27B]'}`}
              >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                {tab === 'clients' ? 'Registered Clients' : 'Guest Inquiries'}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative w-full sm:w-[240px] lg:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667280]" />
<<<<<<< HEAD
              <input type="text" placeholder="Search database..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-white py-3 sm:py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10" />
            </div>
            <div className="relative w-full sm:w-[180px] lg:w-[220px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667280]" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none cursor-pointer rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-white py-3 sm:py-3.5 pl-12 pr-10 text-sm font-bold shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10">
=======
              <input
                type="text"
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-white py-3 sm:py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10"
              />
            </div>
            <div className="relative w-full sm:w-[180px] lg:w-[220px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667280]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none cursor-pointer rounded-xl sm:rounded-2xl border border-[#E8E1D5] bg-white py-3 sm:py-3.5 pl-12 pr-10 text-sm font-bold shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10"
              >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Checked">Checked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667280] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ================= DATA AREA ================= */}
        <div className={premiumCardClass}>
<<<<<<< HEAD
=======

>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
          {/* MOBILE VIEW (CARDS) */}
          <div className="block lg:hidden divide-y divide-[#E8E1D5]/50">
            <AnimatePresence>
              {items.map((item) => (
                <Fragment key={item._id}>
<<<<<<< HEAD
                  <Motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 sm:p-6 space-y-4">
=======
                  <Motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-6 space-y-4"
                  >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0" onClick={() => toggleExpand(item._id)}>
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-serif font-bold text-lg border-2 border-white shadow-md ${activeTab === 'clients' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#C1A27B]/10 text-[#C1A27B]'}`}>
                          {(item.name || item.fullName)?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-[#2F3742] truncate">{item.name || item.fullName}</p>
                          <p className="text-xs text-[#667280] truncate">{item.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
<<<<<<< HEAD
                        <button onClick={() => activeTab === 'clients' ? handleDeleteUser(item._id) : handleDeleteContact(item._id)} className="p-2 text-[#667280] hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => toggleExpand(item._id)} className={`p-2 rounded-lg border transition-all ${expandedItem === item._id ? 'bg-[#C1A27B] text-white' : 'bg-white text-[#667280]'}`}>
=======
                        <button
                          onClick={() => activeTab === 'clients' ? handleDeleteUser(item._id) : handleDeleteContact(item._id)}
                          className="p-2 text-[#667280] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleExpand(item._id)}
                          className={`p-2 rounded-lg border transition-all ${expandedItem === item._id ? 'bg-[#C1A27B] text-white' : 'bg-white text-[#667280]'}`}
                        >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                          {expandedItem === item._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
<<<<<<< HEAD
                    <AnimatePresence>
                      {expandedItem === item._id && (
                        <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-[#E8E1D5]/50 pt-4 overflow-hidden">
                          {/* Expanded Content for Mobile */}
=======

                    <AnimatePresence>
                      {expandedItem === item._id && (
                        <Motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-[#E8E1D5]/50 pt-4 overflow-hidden"
                        >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#667280]">
                              <span>Volume</span>
                              <span className="text-[#2F3742]">{(activeTab === 'clients' ? item.inquiries?.length : 1) || 0} Inquiries</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#667280]">
                              <span>Status</span>
                              <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 ${getStatusColor(activeTab === 'clients' ? 'Checked' : item.status || 'Pending')}`}>
                                {activeTab === 'clients' ? 'Active Account' : item.status || 'Pending'}
                              </div>
                            </div>
<<<<<<< HEAD
                            {/* Actions / Chat Link */}
                            <div className="bg-[#FBF8F3] rounded-xl p-3 text-xs italic text-[#2F3742] border border-[#E8E1D5]">
                              {activeTab === 'clients' ? 'Open desktop to access full communication terminal.' : (item.message || 'No message provided.')}
=======
                            <div className="bg-[#FBF8F3] rounded-xl p-3 text-xs italic text-[#2F3742] border border-[#E8E1D5]">
                              {activeTab === 'clients'
                                ? 'Open desktop to access full details & notes.'
                                : (item.message || 'No message provided.')}
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                            </div>
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </Motion.div>
                </Fragment>
              ))}
            </AnimatePresence>
          </div>

          {/* DESKTOP VIEW (TABLE) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8E1D5] bg-[#C1A27B]/5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#667280]">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6">Activity Volume</th>
                  <th className="px-8 py-6">Engagement</th>
                  <th className="px-8 py-6 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]/50">
                <AnimatePresence>
                  {items.map((item) => (
                    <Fragment key={item._id}>
<<<<<<< HEAD
                      <Motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`group cursor-pointer transition-colors hover:bg-[#C1A27B]/5 ${expandedItem === item._id ? 'bg-[#C1A27B]/10' : ''}`}>
=======
                      <Motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`group cursor-pointer transition-colors hover:bg-[#C1A27B]/5 ${expandedItem === item._id ? 'bg-[#C1A27B]/10' : ''}`}
                      >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                        <td className="px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          <div className="flex items-center gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white font-serif text-xl font-bold shadow-lg transition-transform group-hover:scale-110 ${activeTab === 'clients' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#C1A27B]/10 text-[#C1A27B]'}`}>
                              {(item.name || item.fullName)?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-serif text-lg font-bold text-[#2F3742] truncate">{item.name || item.fullName}</p>
                              <p className="text-xs font-medium text-[#667280] truncate">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Inquiries</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-[#E8E1D5] overflow-hidden">
<<<<<<< HEAD
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(((activeTab === 'clients' ? item.inquiries?.length : 1) || 0) * 20, 100)}%` }} />
=======
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-1000"
                                  style={{ width: `${Math.min(((activeTab === 'clients' ? item.inquiries?.length : 1) || 0) * 20, 100)}%` }}
                                />
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                              </div>
                              <span className="text-sm font-bold text-[#2F3742]">{(activeTab === 'clients' ? item.inquiries?.length : 1) || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          {activeTab === 'clients' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Status</span>
                              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                                <CheckCircle size={14} /> Registered
                              </div>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase ${getStatusColor(item.status || 'Pending')}`}>
                              {getStatusIcon(item.status || 'Pending')} {item.status || 'Pending'}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
<<<<<<< HEAD
                            <button onClick={(e) => { e.stopPropagation(); activeTab === 'clients' ? handleDeleteUser(item._id) : handleDeleteContact(item._id); }} className="p-3 text-[#667280] hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
                              <Trash2 size={20} />
                            </button>
                            <button onClick={() => toggleExpand(item._id)} className={`p-3 rounded-xl border transition-all ${expandedItem === item._id ? 'border-[#C1A27B] bg-[#C1A27B] text-white shadow-lg' : 'border-[#E8E1D5] bg-white text-[#667280] hover:border-[#C1A27B] hover:text-[#C1A27B]'}`}>
=======
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                activeTab === 'clients' ? handleDeleteUser(item._id) : handleDeleteContact(item._id);
                              }}
                              className="p-3 text-[#667280] hover:text-red-500 transition-all rounded-xl hover:bg-red-50"
                            >
                              <Trash2 size={20} />
                            </button>
                            <button
                              onClick={() => toggleExpand(item._id)}
                              className={`p-3 rounded-xl border transition-all ${
                                expandedItem === item._id
                                  ? 'border-[#C1A27B] bg-[#C1A27B] text-white shadow-lg'
                                  : 'border-[#E8E1D5] bg-white text-[#667280] hover:border-[#C1A27B] hover:text-[#C1A27B]'
                              }`}
                            >
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                              {expandedItem === item._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                        </td>
                      </Motion.tr>

                      <AnimatePresence>
                        {expandedItem === item._id && (
                          <tr>
                            <td colSpan="4" className="border-b border-[#E8E1D5]/50 p-0">
<<<<<<< HEAD
                              <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-[#C1A27B]/5">
                                <div className="p-8 lg:p-12">
                                  {/* Original Detail View logic - merged here */}
                                  <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
                                    {/* Left: Inquiries */}
=======
                              <Motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-[#C1A27B]/5"
                              >
                                <div className="p-8 lg:p-12">
                                  <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">

                                    {/* ── LEFT: Details & Specifications ── */}
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                                    <div className="space-y-8">
                                      <h4 className="font-serif text-xl font-bold text-[#2F3742] border-b border-[#E8E1D5] pb-4 flex items-center gap-3">
                                        <Calendar className="text-[#C1A27B]" /> Details & Specifications
                                      </h4>
                                      <div className="space-y-6">
                                        {(activeTab === 'clients' ? item.inquiries : [item]).map((inq, idx) => (
<<<<<<< HEAD
                                          <div key={inq._id || idx} className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                              <div>
                                                <h5 className="font-serif text-lg font-bold text-[#2F3742]">{inq.eventType || 'General inquiry'}</h5>
                                                <p className="text-xs text-[#667280]">{inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : 'No date set'}</p>
                                              </div>
                                              <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inq.status || 'Pending')}`}>
                                                {inq.status || 'Pending'}
                                              </div>
                                            </div>
                                            <p className="text-sm italic text-[#2F3742] mb-6">"{inq.message}"</p>
                                            <div className="flex flex-wrap gap-2">
                                              {['Pending', 'Checked', 'Confirmed', 'Rejected'].map((status) => (
                                                <button key={status} onClick={() => activeTab === 'clients' ? handleUserStatusUpdate(item._id, inq._id, status) : handleContactStatusUpdate(item._id, status)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${inq.status === status ? 'bg-[#C1A27B] text-white shadow-md' : 'bg-white border border-[#E8E1D5] text-[#667280] hover:border-[#C1A27B]'}`}>
                                                  {status}
                                                </button>
                                              ))}
                                            </div>
=======
                                          <div key={inq._id || idx} className="bg-white rounded-[2rem] border border-[#E8E1D5] p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-6">
                                              <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-[#C1A27B]/10 flex items-center justify-center">
                                                  <Heart className="text-[#C1A27B] h-6 w-6" />
                                                </div>
                                                <div>
                                                  <h5 className="font-serif text-xl font-bold text-[#2F3742] leading-tight">
                                                    {inq.eventType || (activeTab === 'guests' ? 'Guest Inquiry' : 'General Inquiry')}
                                                  </h5>
                                                  <p className="text-xs font-bold text-[#C1A27B] uppercase tracking-widest mt-1">
                                                    {inq.createdAt
                                                      ? `Received ${new Date(inq.createdAt).toLocaleDateString()}`
                                                      : 'New Lead'}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border ${getStatusColor(inq.status || 'Pending')}`}>
                                                {inq.status || 'Pending'}
                                              </div>
                                            </div>

                                            {activeTab === 'clients' ? (
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                                                <div className="space-y-4">
                                                  <h6 className="text-[10px] font-bold text-[#667280] uppercase tracking-[0.2em] mb-4">Event Logistics</h6>
                                                  <div className="grid grid-cols-1 gap-3">
                                                    <RequirementItem
                                                      icon={Calendar}
                                                      label="Date"
                                                      value={inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : 'TBD'}
                                                      subValue={inq.isFlexibleDate ? 'Flexible (+/- 7 days)' : 'Fixed Date'}
                                                    />
                                                    <RequirementItem icon={Users} label="Guests" value={inq.guestCount || 'Not specified'} />
                                                    <RequirementItem icon={MapPin} label="Location" value={inq.location || 'Consultation Required'} />
                                                  </div>
                                                </div>
                                                <div className="space-y-4">
                                                  <h6 className="text-[10px] font-bold text-[#667280] uppercase tracking-[0.2em] mb-4">Financials & Reach</h6>
                                                  <div className="grid grid-cols-1 gap-3">
                                                    <RequirementItem icon={Banknote} label="Budget" value={inq.budgetRange || 'Pending Discussion'} />
                                                    <RequirementItem icon={Phone} label="Contact" value={inq.phone || item.mobileNumber || 'Use Email'} />
                                                    <RequirementItem icon={Zap} label="Source" value={inq.referredBy || 'Direct Request'} />
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="mb-8">
                                                <div className="bg-[#FBF8F3] rounded-2xl p-5 border border-[#E8E1D5]/50">
                                                  <div className="flex items-center gap-3 mb-3">
                                                    <Info className="h-4 w-4 text-[#C1A27B]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Guest Identification</span>
                                                  </div>
                                                  <p className="text-sm font-medium text-[#2F3742]">{item.fullName} ({item.email})</p>
                                                </div>
                                              </div>
                                            )}

                                            <div className="space-y-3">
                                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#667280] uppercase tracking-[0.2em]">
                                                <Layers className="h-3 w-3" /> Requirements & Vision
                                              </div>
                                              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-inner">
                                                <p className="text-sm leading-relaxed text-[#2F3742] italic">
                                                  "{inq.message || 'No specific message provided.'}"
                                                </p>
                                              </div>
                                            </div>

                                            {/* Status Buttons */}
                                            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-[#E8E1D5]/50">
                                              {['Pending', 'Checked', 'Confirmed', 'Rejected'].map((status) => (
                                                <button
                                                  key={status}
                                                  onClick={() =>
                                                    activeTab === 'clients'
                                                      ? handleUserStatusUpdate(item._id, inq._id, status)
                                                      : handleContactStatusUpdate(item._id, status)
                                                  }
                                                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    (activeTab === 'clients' ? inq.status : item.status) === status
                                                      ? 'bg-[#C1A27B] text-white shadow-lg shadow-[#C1A27B]/20'
                                                      : 'bg-white border border-[#E8E1D5] text-[#667280] hover:border-[#C1A27B] hover:text-[#C1A27B]'
                                                  }`}
                                                >
                                                  {status}
                                                </button>
                                              ))}
                                            </div>
>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                                          </div>
                                        ))}
                                      </div>
                                    </div>
<<<<<<< HEAD
                                    {/* Right: Terminal */}
                                    <div className="space-y-8">
                                      <h4 className="font-serif text-xl font-bold text-[#2F3742] border-b border-[#E8E1D5] pb-4 flex items-center gap-3">
                                        <MessageSquare className="text-[#C1A27B]" /> Communication Terminal
                                      </h4>
                                      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 h-[400px] flex flex-col shadow-sm">
                                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                                          {activeTab === 'clients' ? (
                                            (item.chats || []).length > 0 ? (
                                              item.chats.map((chat, idx) => (
                                                <div key={idx} className={`flex ${chat.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${chat.sender === 'Admin' ? 'bg-[#C1A27B] text-white rounded-tr-none' : 'bg-[#FBF8F3] text-[#2F3742] rounded-tl-none border border-[#E8E1D5]'}`}>
                                                    <p className="font-medium">{chat.message}</p>
                                                    <span className="text-[9px] block mt-1 opacity-60 uppercase font-bold">{chat.sender}</span>
                                                  </div>
                                                </div>
                                              ))
                                            ) : (
                                              <div className="h-full flex flex-col items-center justify-center text-[#667280]/30 italic">
                                                <MessageSquare size={48} className="mb-2" />
                                                <p className="text-xs uppercase tracking-widest">No chat history</p>
                                              </div>
                                            )
                                          ) : (
                                            <div className="space-y-4">
                                              <p className="text-sm font-medium text-[#2F3742]">Reply to guest via email integration:</p>
                                              <textarea rows="6" value={adminResponseText[item._id] || ''} onChange={(e) => setAdminResponseText(prev => ({ ...prev, [item._id]: e.target.value }))} placeholder="Compose response..." className="w-full bg-[#FBF8F3] border border-[#E8E1D5] rounded-2xl p-4 text-sm focus:border-[#C1A27B] outline-none" />
                                            </div>
                                          )}
                                        </div>
                                        {activeTab === 'clients' && (
                                          <div className="flex gap-2 p-2 bg-[#FBF8F3] rounded-2xl border border-[#E8E1D5]">
                                            <input type="text" value={replyText[item._id] || ''} onChange={(e) => setReplyText(prev => ({ ...prev, [item._id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleReply(item._id)} placeholder="Type message..." className="flex-1 bg-transparent px-4 text-sm outline-none" />
                                            <button onClick={() => handleReply(item._id)} className="bg-[#C1A27B] text-white p-3 rounded-xl hover:brightness-110 transition-all">
                                              <Send size={18} />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
=======

                                    {/* ── RIGHT: Admin Notes Panel ── */}
                                    <AdminNotesPanel itemId={item._id} />

>>>>>>> 2b5c3761c73631523e733b7d95c869205cc9c391
                                  </div>
                                </div>
                              </Motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed right-0 top-0 -z-10 h-1/2 w-1/3 bg-gradient-to-bl from-[#C1A27B]/5 to-transparent opacity-50 blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 h-1/2 w-1/3 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-50 blur-3xl" />
    </div>
  );
}