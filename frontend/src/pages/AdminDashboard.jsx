import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, MessageSquare, Calendar, Search,
  ChevronDown, ChevronUp, Send, Trash2, Mail, ShieldCheck,
  Filter, Activity, CheckCircle, Clock, XCircle, Info,
  Briefcase, Bell, Zap
} from 'lucide-react';
import {
  fetchAllUserData, updateInquiryStatus, replyToChat, deleteUser,
  fetchAllContacts, updateContactStatus, deleteContact
} from '../store/slices/adminSlice';
import toast from 'react-hot-toast';
import { createSocket } from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  accent: '#C1A27B', // Lite Medium Gold
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

const premiumCardClass = 'rounded-[2rem] border border-[#E8E1D5] bg-white shadow-[0_18px_50px_rgba(34,37,49,0.06)]';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { users, contacts, loading } = useSelector((state) => state.admin);

  const safeUsers = users || [];
  const safeContacts = contacts || [];

  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [adminResponseText, setAdminResponseText] = useState({});
  const [filterStatus, setFilterStatus] = useState('');
  const [realtimeActivities, setRealtimeActivities] = useState([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false); // Added for Full Logs
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
      const response = adminResponseText[id] || '';
      await dispatch(updateContactStatus({ id, status: newStatus, adminResponse: response })).unwrap();
      toast.success(`Guest inquiry marked as ${newStatus}`);
    } catch (err) {
      toast.error(err || 'Failed to update guest inquiry');
    }
  };

  const handleReply = async (userId) => {
    if (!replyText[userId]?.trim()) return;
    try {
      await dispatch(replyToChat({ userId, message: replyText[userId] })).unwrap();
      setReplyText((prev) => ({ ...prev, [userId]: '' }));
      toast.success('Reply sent successfully');
    } catch (err) {
      toast.error(err || 'Failed to send reply');
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
    ? safeUsers.filter((user) => (user.inquiries || []).some((inq) => inq.status === filterStatus))
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
    <div className="min-h-screen bg-[#FBF8F3] pt-32 pb-16 lg:pt-40">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-12">
        <div className="mb-12 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <motion.div {...cardMotion} className="space-y-2">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-[#C1A27B]/10 p-2">
                <ShieldCheck className="h-5 w-5 text-[#C1A27B]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C1A27B]">
                Executive Console
              </span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[#2F3742] sm:text-5xl lg:text-6xl">
              Management <span className="text-[#C1A27B]">Hub</span>
            </h1>
            <p className="max-w-xl text-base font-medium text-[#667280] lg:text-lg">
              Real-time synchronization for your event ecosystem. Monitor, respond, and grow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 sm:flex sm:items-center"
          >
            {[
              { label: 'Total Clients', value: safeUsers.length, icon: Users, panel: 'emerald' },
              { label: 'Guest Leads', value: safeContacts.length, icon: MessageSquare, panel: 'gold' },
            ].map((stat) => (
              <div key={stat.label} className={`${premiumCardClass} min-w-[180px] p-6 group`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl p-2 ${stat.panel === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#C1A27B]/10 text-[#C1A27B]'} transition-transform group-hover:scale-110`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <Zap className="h-4 w-4 text-gray-200" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#667280]">{stat.label}</p>
                <p className="font-serif text-3xl font-bold text-[#2F3742]">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          {...cardMotion}
          transition={{ delay: 0.2 }}
          className={`${premiumCardClass} relative mb-12 overflow-hidden border-[#C1A27B]/10 p-8`}
        >
          <div className="absolute right-0 top-0 p-8 opacity-5">
            <Activity className="h-32 w-32 text-[#C1A27B]" />
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-6 w-6 text-emerald-600" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#2F3742]">Real-Time Pulse</h2>
            </div>
            <button
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="flex items-center gap-2 text-xs font-bold text-[#C1A27B] transition-colors hover:text-[#A98960]"
            >
              {isLogsOpen ? 'HIDE LOGS' : 'VIEW FULL LOGS'} <ChevronDown className={`h-4 w-4 transition-transform ${isLogsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {isLogsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 overflow-hidden border-t border-[#E8E1D5] pt-8"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...realtimeActivities, ...recentActivity].map((log, i) => (
                    <div key={log.id || i} className="flex items-center gap-4 rounded-2xl border border-[#E8E1D5] bg-[#FBF8F3] p-4">
                      <div className={`rounded-xl p-2 ${getActivityTypeMeta(log.type).panelClass}`}>
                        {log.type === 'Live Chat' ? <MessageSquare className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="truncate text-sm font-bold text-[#2F3742]">{log.name}</p>
                        <p className="truncate text-xs text-[#667280]">{log.event || log.type}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#C1A27B]">{new Date(log.date || log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-4">
            <AnimatePresence mode="popLayout">
              {recentActivity.map((act, index) => {
                const meta = getActivityTypeMeta(act.type);
                const ActivityIcon = meta.icon;

                return (
                  <motion.div
                    key={act.id || index}
                    layout
                    initial={{ opacity: 0, scale: 0.9, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`relative min-w-[320px] overflow-hidden rounded-[1.75rem] border p-6 shadow-xl ${act.isRealtime
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-[#E8E1D5] bg-white'
                      }`}
                  >
                    {act.isRealtime && (
                      <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-500 px-3 py-1 text-[10px] font-bold tracking-widest text-white">
                        LIVE
                      </div>
                    )}
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`rounded-xl p-2 ${meta.panelClass}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">{act.type}</p>
                        <p className="text-xs font-medium text-[#2F3742]">
                          {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="mb-1 truncate font-serif text-lg font-bold text-[#222531]">{act.name}</p>
                    <p className="mb-4 truncate text-sm text-[#667280]">{act.event}</p>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase ${getStatusColor(act.status)}`}>
                      {getStatusIcon(act.status)} {act.status}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="w-full rounded-2xl border border-[#E8E1D5] bg-white p-1.5 shadow-sm lg:w-auto flex flex-col sm:flex-row">
            {['clients', 'guests'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedItem(null);
                }}
                className={`flex-1 sm:flex-none rounded-xl px-6 lg:px-8 py-3 text-[10px] sm:text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab
                  ? 'bg-[#C1A27B] text-white shadow-lg'
                  : 'text-[#667280] hover:text-[#C1A27B]'
                  }`}
              >
                {tab === 'clients' ? 'Registered Clients' : 'Guest Inquiries'}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            <div className="group relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667280] transition-colors group-focus-within:text-[#C1A27B]" />
              <input
                type="text"
                placeholder="Search database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#E8E1D5] bg-white py-3.5 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10 sm:w-72"
              />
            </div>
            <div className="group relative">
              <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667280] transition-colors group-focus-within:text-[#C1A27B]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-[#E8E1D5] bg-white py-3.5 pl-12 pr-10 text-sm font-bold shadow-sm transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10 sm:w-56"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Checked">Checked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667280]" />
            </div>
          </div>
        </div>

        <div className={premiumCardClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8E1D5] bg-[#C1A27B]/5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#667280]">
                  <th className="px-4 sm:px-8 py-6">Identity</th>
                  <th className="hidden md:table-cell px-8 py-6">Activity Volume</th>
                  <th className="px-4 sm:px-8 py-6">Engagement</th>
                  <th className="px-4 sm:px-8 py-6 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]/50">
                <AnimatePresence>
                  {items.map((item) => (
                    <Fragment key={item._id}>
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`group cursor-pointer transition-colors hover:bg-[#C1A27B]/5 ${expandedItem === item._id ? 'bg-[#C1A27B]/10' : ''
                          }`}
                      >
                        <td className="px-4 sm:px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border-2 border-white font-serif text-base sm:text-xl font-bold shadow-lg transition-transform group-hover:scale-110 ${activeTab === 'clients'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-[#C1A27B]/10 text-[#C1A27B]'
                              }`}>
                              {(item.name || item.fullName)?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 truncate font-serif text-base sm:text-lg font-bold text-[#2F3742]">
                                {item.name || item.fullName}
                                {item.isVerified && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-[#667280]">
                                <Mail className="h-3.5 w-3.5 shrink-0" /> {item.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Inquiries</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#E8E1D5]">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-1000"
                                  style={{
                                    width: `${Math.min((((activeTab === 'clients' ? item.inquiries?.length : 1) || 0) * 20), 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-[#2F3742]">
                                {(activeTab === 'clients' ? item.inquiries?.length : 1) || 0}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-6" onClick={() => toggleExpand(item._id)}>
                          {activeTab === 'clients' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#667280]">Bookings</span>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-[#C1A27B]" />
                                <span className="text-sm font-bold text-[#2F3742]">{item.bookings?.length || 0}</span>
                              </div>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 rounded-xl border px-2 sm:px-3 py-1.5 text-[8px] sm:text-[10px] font-bold uppercase ${getStatusColor(item.status || 'Pending')}`}>
                              {getStatusIcon(item.status || 'Pending')} <span className="hidden xs:inline">{item.status || 'Pending'}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeTab === 'clients') {
                                  handleDeleteUser(item._id);
                                } else {
                                  handleDeleteContact(item._id);
                                }
                              }}
                              className="rounded-xl sm:rounded-2xl p-2 sm:p-3 text-[#667280] transition-all hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => toggleExpand(item._id)}
                              className={`rounded-xl sm:rounded-2xl border p-2 sm:p-3 transition-all ${expandedItem === item._id
                                ? 'border-[#C1A27B] bg-[#C1A27B] text-white shadow-lg'
                                : 'border-[#E8E1D5] bg-white text-[#667280] hover:border-[#C1A27B] hover:text-[#C1A27B]'
                                }`}
                            >
                              {expandedItem === item._id ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {expandedItem === item._id && (
                          <tr>
                            <td colSpan="4" className="border-b border-[#E8E1D5]/50 p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-[#C1A27B]/5"
                              >
                                <div className="p-4 sm:p-8 lg:p-12">
                                  <div className="grid grid-cols-1 gap-8 lg:gap-12 xl:grid-cols-2">
                                    <div className="space-y-8">
                                      <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
                                        <h4 className="flex items-center gap-3 font-serif text-lg font-bold text-[#2F3742]">
                                          <Calendar className="h-5 w-5 text-[#C1A27B]" />
                                          {activeTab === 'clients' ? 'Event Inquiry Portfolio' : 'Lead Specifications'}
                                        </h4>
                                        <span className="rounded-full border border-[#E8E1D5] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#667280]">
                                          {activeTab === 'clients' ? `${item.inquiries?.length || 0} Records` : 'Guest Lead'}
                                        </span>
                                      </div>

                                      <div className="space-y-6">
                                        {(activeTab === 'clients' ? item.inquiries : [item]).map((inq, idx) => (
                                          <motion.div
                                            key={inq._id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative rounded-[1.75rem] border border-[#E8E1D5] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                                          >
                                            <div className="mb-6 flex items-start justify-between">
                                              <div>
                                                <h5 className="mb-1 font-serif text-xl font-bold text-[#2F3742]">
                                                  {inq.eventType || 'General Inquiry'}
                                                </h5>
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#667280]">
                                                  {inq.eventDate && (
                                                    <span className="flex items-center gap-1.5">
                                                      <Calendar className="h-3.5 w-3.5 text-[#C1A27B]" />
                                                      {new Date(inq.eventDate).toLocaleDateString()}
                                                    </span>
                                                  )}
                                                  {inq.guestCount && (
                                                    <span className="flex items-center gap-1.5">
                                                      <Users className="h-3.5 w-3.5 text-[#C1A27B]" />
                                                      {inq.guestCount} Guests
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm ${getStatusColor(inq.status || 'Pending')}`}>
                                                {getStatusIcon(inq.status || 'Pending')} {inq.status || 'Pending'}
                                              </div>
                                            </div>

                                            <div className="relative mb-8 rounded-2xl border border-[#C1A27B]/5 bg-[#FBF8F3] p-4 sm:p-6">
                                              <div className="absolute -left-3 -top-3 text-[#C1A27B]/20">
                                                <MessageSquare className="h-8 w-8 fill-current" />
                                              </div>
                                              <p className="italic leading-relaxed text-[#2F3742]">"{inq.message}"</p>
                                            </div>

                                            <div className="space-y-4">
                                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#667280]">
                                                Administrative Intervention
                                              </p>
                                              <div className="flex flex-wrap gap-2">
                                                {['Pending', 'Checked', 'Confirmed', 'Rejected'].map((status) => (
                                                  <button
                                                    key={status}
                                                    onClick={() => {
                                                      if (activeTab === 'clients') {
                                                        handleUserStatusUpdate(item._id, inq._id, status);
                                                      } else {
                                                        handleContactStatusUpdate(item._id, status);
                                                      }
                                                    }}
                                                    className={`flex-1 sm:flex-none rounded-xl border px-3 sm:px-5 py-2.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${inq.status === status
                                                      ? 'scale-105 border-[#C1A27B] bg-[#C1A27B] text-white shadow-lg'
                                                      : 'border-[#E8E1D5] bg-white text-[#667280] hover:border-[#C1A27B] hover:bg-[#C1A27B]/5 hover:text-[#C1A27B]'
                                                      }`}
                                                  >
                                                    {status}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex h-full flex-col space-y-8">
                                      <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
                                        <h4 className="flex items-center gap-3 font-serif text-lg font-bold text-[#2F3742]">
                                          <MessageSquare className="h-5 w-5 text-[#C1A27B]" />
                                          Communication Terminal
                                        </h4>
                                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Encrypted
                                        </span>
                                      </div>

                                      <div className="min-h-[300px] sm:min-h-[400px] max-h-[600px] flex-grow space-y-6 overflow-y-auto rounded-[1.75rem] border border-[#E8E1D5] bg-white p-4 sm:p-8 shadow-inner">
                                        {activeTab === 'clients' ? (
                                          (item.chats || []).length > 0 ? (
                                            item.chats.map((chat, idx) => (
                                              <div key={idx} className={`flex ${chat.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-3xl p-5 text-sm ${chat.sender === 'Admin'
                                                  ? 'rounded-tr-none bg-[#C1A27B] text-white shadow-xl shadow-[#C1A27B]/10'
                                                  : 'rounded-tl-none border border-[#E8E1D5] bg-[#FBF8F3] text-[#2F3742]'
                                                  }`}>
                                                  <div className="mb-2 flex items-center justify-between gap-4">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${chat.sender === 'Admin' ? 'text-[#FBF8F3]' : 'text-[#C1A27B]'
                                                      }`}>
                                                      {chat.sender === 'Admin' ? 'EXECUTIVE SUPPORT' : item.name}
                                                    </span>
                                                    <Clock className="h-3 w-3 opacity-40" />
                                                  </div>
                                                  <p className="font-medium leading-relaxed">{chat.message}</p>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="flex h-full flex-col items-center justify-center text-[#667280]/30">
                                              <MessageSquare className="mb-4 h-16 w-16" />
                                              <p className="text-xs font-bold uppercase tracking-[0.3em]">No Communication History</p>
                                            </div>
                                          )
                                        ) : (
                                          <div className="space-y-6">
                                            <div className="rounded-2xl border border-[#C1A27B]/10 bg-[#C1A27B]/5 p-6">
                                              <h6 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#C1A27B]">
                                                Email Integration
                                              </h6>
                                              <p className="mb-4 text-sm font-medium text-[#2F3742]">
                                                You can send an automated email response along with the status update for guest inquiries.
                                              </p>
                                              <textarea
                                                placeholder="Compose a bespoke response for this lead..."
                                                rows="6"
                                                value={adminResponseText[item._id] || ''}
                                                onChange={(e) => setAdminResponseText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                                className="w-full resize-none rounded-2xl border border-[#E8E1D5] bg-white p-5 text-sm font-medium shadow-inner transition-all focus:border-[#C1A27B] focus:outline-none focus:ring-4 focus:ring-[#C1A27B]/10"
                                              />
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl border border-[#E8E1D5] bg-white p-4 text-xs font-bold text-[#667280]">
                                              <Bell className="h-4 w-4 text-[#C1A27B]" />
                                              The guest will receive a premium styled notification.
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {activeTab === 'clients' && (
                                        <div className="flex gap-4 rounded-[1.75rem] border border-[#E8E1D5] bg-white p-3 shadow-lg transition-all focus-within:border-[#C1A27B] focus-within:ring-4 focus-within:ring-[#C1A27B]/10">
                                          <input
                                            type="text"
                                            value={replyText[item._id] || ''}
                                            onChange={(e) => setReplyText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                handleReply(item._id);
                                              }
                                            }}
                                            placeholder="Secure terminal message..."
                                            className="flex-grow border-none bg-transparent px-6 text-sm font-medium outline-none"
                                          />
                                          <button
                                            onClick={() => handleReply(item._id)}
                                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#C1A27B] px-6 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 hover:brightness-110"
                                          >
                                            SEND <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
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

      <div className="fixed right-0 top-0 -z-10 h-1/2 w-1/3 bg-gradient-to-bl from-[#C1A27B]/5 to-transparent opacity-50 blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 h-1/2 w-1/3 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-50 blur-3xl" />
    </div>
  );
}