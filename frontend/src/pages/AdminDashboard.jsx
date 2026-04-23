import { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, MessageSquare, Calendar, Search, 
  ChevronDown, ChevronUp, Send, Trash2, Mail, ShieldCheck,
  Filter, X, Activity, CheckCircle, Clock, XCircle, Info,
  Briefcase
} from 'lucide-react';
import { 
  fetchAllUserData, updateInquiryStatus, replyToChat, deleteUser,
  fetchAllContacts, updateContactStatus, deleteContact 
} from '../store/slices/adminSlice';
import toast from 'react-hot-toast';
import { createSocket } from '../utils/socket';

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'Checked': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'Confirmed': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'Rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending': return <Clock className="w-4 h-4" />;
    case 'Checked': return <Info className="w-4 h-4" />;
    case 'Confirmed': return <CheckCircle className="w-4 h-4" />;
    case 'Rejected': return <XCircle className="w-4 h-4" />;
    default: return null;
  }
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, contacts, loading } = useSelector((state) => state.admin);
  
  const safeUsers = users || [];
  const safeContacts = contacts || [];

  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'guests'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [adminResponseText, setAdminResponseText] = useState({});
  const [filterStatus, setFilterStatus] = useState('');
  const [realtimeActivities, setRealtimeActivities] = useState([]);

  useEffect(() => {
    const socket = createSocket();
    const refreshAdminData = () => {
      dispatch(fetchAllUserData({ search: searchTerm }));
      dispatch(fetchAllContacts());
    };

    const pushRealtimeActivity = (activity) => {
      setRealtimeActivities((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: new Date(activity.timestamp || new Date()),
          status: activity.status || 'Pending',
          isRealtime: true,
          ...activity,
        },
        ...prev,
      ].slice(0, 10));
    };

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
    socket.on('dashboard:user-deleted', refreshAdminData);
    socket.on('dashboard:booking-created', refreshAdminData);

    return () => {
      socket.off('dashboard:inquiry-created');
      socket.off('dashboard:inquiry-cancelled');
      socket.off('dashboard:inquiry-updated');
      socket.off('dashboard:chat-message');
      socket.off('contact:created');
      socket.off('contact:updated');
      socket.off('contact:deleted');
      socket.off('dashboard:user-deleted');
      socket.off('dashboard:booking-created');
      socket.disconnect();
    };
  }, [dispatch, searchTerm]);

  useEffect(() => {
    dispatch(fetchAllUserData({ search: searchTerm }));
    dispatch(fetchAllContacts());
  }, [dispatch, searchTerm]);

  // Derived state: Recent Activity
  const recentActivity = (() => {
    let activities = [];
    
    // Extract user inquiries
    safeUsers.forEach(u => {
      (u.inquiries || []).forEach(inq => {
        activities.push({
          id: inq._id,
          type: 'User Inquiry',
          name: u.name,
          email: u.email,
          event: inq.eventType,
          date: new Date(inq.createdAt || new Date()),
          status: inq.status || 'Pending'
        });
      });
    });

    // Extract guest contacts
    safeContacts.forEach(c => {
      activities.push({
        id: c._id,
        type: 'Guest Inquiry',
        name: c.fullName,
        email: c.email,
        event: 'General Inquiry',
        date: new Date(c.createdAt || new Date()),
        status: c.status || 'Pending'
      });
    });

    // Sort by date descending
    activities.sort((a, b) => b.date - a.date);
    
    // Merge real-time socket events at the top and slice to top 5
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
      setReplyText({ ...replyText, [userId]: '' });
      toast.success('Reply sent successfully');
    } catch (err) {
      toast.error(err || 'Failed to send reply');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? All their data will be permanently removed.')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error(err || 'Failed to delete user');
      }
    }
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Delete this guest inquiry?')) {
      try {
        await dispatch(deleteContact(id)).unwrap();
        toast.success('Inquiry deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete inquiry');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Filtering users based on status (since API search handles text search)
  const filteredUsers = filterStatus ? safeUsers.filter(u => 
    (u.inquiries || []).some(inq => inq.status === filterStatus)
  ) : safeUsers;

  const filteredContacts = safeContacts.filter(c => {
    const matchesSearch = c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? c.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-32 lg:pt-40 pb-16 min-h-screen bg-[#FAF9F6] text-[#1f2322] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#C1A27B] mb-3 tracking-tight">Management Console</h1>
            <p className="text-[#667280] text-lg max-w-xl">Oversee inquiries, coordinate bookings, and communicate seamlessly with clients.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#E8E1D5] shadow-sm flex items-center gap-4 transition-transform hover:scale-105 duration-300">
              <div className="p-2 bg-[#C1A27B]/10 rounded-xl text-[#C1A27B]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-[#667280] uppercase tracking-widest font-bold mb-1">Total Users</p>
                <p className="text-2xl font-serif font-bold text-[#1f2322] leading-none">{safeUsers.length}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#E8E1D5] shadow-sm flex items-center gap-4 transition-transform hover:scale-105 duration-300">
              <div className="p-2 bg-[#C1A27B]/10 rounded-xl text-[#C1A27B]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-[#667280] uppercase tracking-widest font-bold mb-1">Guest Inquiries</p>
                <p className="text-2xl font-serif font-bold text-[#1f2322] leading-none">{safeContacts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Recent Activity Feed */}
        <div className="mb-10 bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-[#C1A27B]" />
            <h2 className="text-lg font-serif font-bold">Real-Time Recent Activity</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {recentActivity.length > 0 ? recentActivity.map((act, i) => (
              <div key={i} className={`min-w-[280px] border rounded-2xl p-4 flex-shrink-0 animate-in slide-in-from-right duration-500 ${act.isRealtime ? 'bg-indigo-50/50 border-indigo-200' : 'bg-[#FAF9F6] border-[#E8E1D5]'}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${act.type === 'User Inquiry' ? 'bg-indigo-500/10 text-indigo-600' : act.type === 'Guest Inquiry' ? 'bg-orange-500/10 text-orange-600' : 'bg-green-500/10 text-green-600'}`}>
                    {act.type}
                  </span>
                  <div className="text-xs text-[#667280] flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1 font-medium text-[#1f2322]">
                      <Clock className="w-3 h-3 text-[#C1A27B]" />
                      {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider">{act.date.toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="font-bold text-[#1f2322] truncate">{act.name}</p>
                <p className="text-xs text-[#667280] truncate mb-3">{act.event}</p>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(act.status)}`}>
                  {getStatusIcon(act.status)} {act.status}
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#667280] italic px-2">No recent activity detected.</p>
            )}
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex p-1 bg-[#E8E1D5]/50 rounded-xl inline-flex w-full lg:w-auto">
            <button 
              onClick={() => { setActiveTab('clients'); setExpandedItem(null); }}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'clients' ? 'bg-white shadow-sm text-[#C1A27B]' : 'text-[#667280] hover:text-[#1f2322]'}`}
            >
              Registered Clients
            </button>
            <button 
              onClick={() => { setActiveTab('guests'); setExpandedItem(null); }}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'guests' ? 'bg-white shadow-sm text-[#C1A27B]' : 'text-[#667280] hover:text-[#1f2322]'}`}
            >
              Guest Inquiries
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667280]" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-white border border-[#E8E1D5] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1A27B]/50 transition-all text-sm shadow-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667280]" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-48 bg-white border border-[#E8E1D5] rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C1A27B]/50 transition-all text-sm appearance-none shadow-sm font-medium"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Checked">Checked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-sm">
          
          {/* ----- REGISTERED CLIENTS TAB ----- */}
          {activeTab === 'clients' && (
            <table className="w-full text-left">
              <thead className="bg-[#FAF9F6] text-[#667280] text-[10px] uppercase tracking-[0.2em] font-bold border-b border-[#E8E1D5]">
                <tr>
                  <th className="px-6 py-5">Client Profile</th>
                  <th className="px-6 py-5">Inquiries</th>
                  <th className="px-6 py-5">Bookings</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <Fragment key={user._id}>
                    <tr className={`hover:bg-[#FAF9F6]/50 transition-colors duration-200 cursor-pointer ${expandedItem === user._id ? 'bg-[#FAF9F6]' : ''}`}>
                      <td className="px-6 py-5" onClick={() => toggleExpand(user._id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C1A27B]/20 to-[#C1A27B]/5 border border-[#C1A27B]/20 flex items-center justify-center text-[#C1A27B] font-serif font-bold text-lg shadow-sm">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#1f2322] flex items-center gap-2 text-lg">
                              {user.name || 'Unknown User'}
                              {user.isVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="text-sm text-[#667280] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5" onClick={() => toggleExpand(user._id)}>
                        <div className="inline-flex items-center gap-2 bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-[#E8E1D5] shadow-sm">
                          <MessageSquare className="w-4 h-4 text-[#C1A27B]" />
                          <span className="text-sm font-bold">{(user.inquiries || []).length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5" onClick={() => toggleExpand(user._id)}>
                        <div className="inline-flex items-center gap-2 bg-[#C1A27B]/10 px-3 py-1.5 rounded-lg border border-[#C1A27B]/20 shadow-sm text-[#C1A27B]">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm font-bold">{(user.bookings || []).length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user._id); }} className="p-2 text-[#667280] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => toggleExpand(user._id)} className="p-2 text-[#667280] hover:text-[#1f2322] bg-[#FAF9F6] rounded-xl border border-[#E8E1D5] hover:border-[#C1A27B] transition-all">
                            {expandedItem === user._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Content for Clients */}
                    {expandedItem === user._id && (
                      <tr>
                        <td colSpan="4" className="p-0 border-b border-[#E8E1D5]">
                          <div className="bg-[#FAF9F6] px-8 py-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              
                              {/* Inquiries List */}
                              <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1f2322] mb-5 flex items-center gap-2 border-b border-[#E8E1D5] pb-2">
                                  <Calendar className="w-4 h-4 text-[#C1A27B]" /> Event Inquiries
                                </h4>
                                <div className="space-y-4">
                                  {user.inquiries.length > 0 ? user.inquiries.map((inq) => (
                                    <div key={inq._id} className="bg-white p-5 rounded-2xl border border-[#E8E1D5] shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <p className="font-serif font-bold text-lg text-[#1f2322] leading-tight">{inq.eventType}</p>
                                          <p className="text-xs text-[#667280] mt-1">{new Date(inq.eventDate).toLocaleDateString()} • {inq.guestCount} Guests</p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusColor(inq.status || 'Pending')}`}>
                                          {getStatusIcon(inq.status || 'Pending')} {inq.status || 'Pending'}
                                        </div>
                                      </div>
                                      <p className="text-sm text-[#667280] italic bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E1D5] mb-4">
                                        "{inq.message}"
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {['Pending', 'Checked', 'Confirmed', 'Rejected'].map(status => (
                                          <button 
                                            key={status}
                                            onClick={() => handleUserStatusUpdate(user._id, inq._id, status)}
                                            className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all ${
                                              inq.status === status 
                                              ? 'bg-[#1f2322] text-white border-[#1f2322]' 
                                              : 'bg-white text-[#667280] border-[#E8E1D5] hover:border-[#C1A27B] hover:text-[#C1A27B]'
                                            }`}
                                          >
                                            Mark {status}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )) : <p className="text-sm text-gray-500 italic p-4 bg-white rounded-xl border border-[#E8E1D5]">No inquiries found.</p>}
                                </div>
                              </div>

                              {/* Chat Section */}
                              <div className="flex flex-col h-[500px]">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1f2322] mb-5 flex items-center gap-2 border-b border-[#E8E1D5] pb-2">
                                  <MessageSquare className="w-4 h-4 text-[#C1A27B]" /> Direct Support
                                </h4>
                                <div className="flex-grow bg-white rounded-2xl border border-[#E8E1D5] p-5 overflow-y-auto mb-4 space-y-4 shadow-inner">
                                  {(user.chats || []).length > 0 ? user.chats.map((chat, idx) => (
                                    <div key={idx} className={`flex ${chat.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                                        chat.sender === 'Admin' 
                                          ? 'bg-gradient-to-r from-[#C1A27B] to-[#AA8960] text-white rounded-tr-sm shadow-md' 
                                          : 'bg-[#FAF9F6] text-[#1f2322] border border-[#E8E1D5] rounded-tl-sm shadow-sm'
                                      }`}>
                                        <p className={`font-bold text-[10px] uppercase tracking-wider mb-1 ${chat.sender === 'Admin' ? 'text-white/80' : 'text-[#C1A27B]'}`}>
                                          {chat.sender === 'Admin' ? 'Elysium Support' : user.name}
                                        </p>
                                        <p className="leading-relaxed">{chat.message}</p>
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                                      <MessageSquare className="w-12 h-12 mb-3 text-[#C1A27B]" />
                                      <p className="text-xs uppercase tracking-widest font-bold">No message history</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 p-2 bg-white rounded-2xl border border-[#E8E1D5] focus-within:border-[#C1A27B] focus-within:ring-2 focus-within:ring-[#C1A27B]/20 transition-all shadow-sm">
                                  <input 
                                    type="text"
                                    value={replyText[user._id] || ''}
                                    onChange={(e) => setReplyText({ ...replyText, [user._id]: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply(user._id)}
                                    placeholder="Type your reply to this client..."
                                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm px-3 outline-none"
                                  />
                                  <button 
                                    onClick={() => handleReply(user._id)}
                                    className="bg-[#1f2322] text-white p-2.5 rounded-xl hover:bg-[#C1A27B] transition-colors shadow-md"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )) : (
                  <tr>
                    <td colSpan="4">
                      <div className="p-20 text-center">
                        <Users className="w-16 h-16 text-[#C1A27B]/30 mx-auto mb-4" />
                        <p className="font-serif text-xl font-bold text-[#667280]">No matching clients found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* ----- GUEST INQUIRIES TAB ----- */}
          {activeTab === 'guests' && (
            <table className="w-full text-left">
              <thead className="bg-[#FAF9F6] text-[#667280] text-[10px] uppercase tracking-[0.2em] font-bold border-b border-[#E8E1D5]">
                <tr>
                  <th className="px-6 py-5">Guest Detail</th>
                  <th className="px-6 py-5">Date Received</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DC]">
                {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                  <Fragment key={contact._id}>
                    <tr className={`hover:bg-[#FAF9F6]/50 transition-colors duration-200 cursor-pointer ${expandedItem === contact._id ? 'bg-[#FAF9F6]' : ''}`}>
                      <td className="px-6 py-5" onClick={() => toggleExpand(contact._id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-600 font-serif font-bold text-lg shadow-sm">
                            {contact.fullName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#1f2322] text-lg">
                              {contact.fullName}
                            </div>
                            <div className="text-sm text-[#667280] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5" /> {contact.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5" onClick={() => toggleExpand(contact._id)}>
                        <span className="text-sm text-[#667280] font-medium">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-5" onClick={() => toggleExpand(contact._id)}>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(contact.status || 'Pending')}`}>
                          {getStatusIcon(contact.status || 'Pending')} {contact.status || 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact._id); }} className="p-2 text-[#667280] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => toggleExpand(contact._id)} className="p-2 text-[#667280] hover:text-[#1f2322] bg-[#FAF9F6] rounded-xl border border-[#E8E1D5] hover:border-[#C1A27B] transition-all">
                            {expandedItem === contact._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Content for Guests */}
                    {expandedItem === contact._id && (
                      <tr>
                        <td colSpan="4" className="p-0 border-b border-[#E8E1D5]">
                          <div className="bg-[#FAF9F6] px-8 py-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              
                              {/* Inquiry Message */}
                              <div className="lg:col-span-2">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1f2322] mb-5 flex items-center gap-2 border-b border-[#E8E1D5] pb-2">
                                  <Info className="w-4 h-4 text-orange-500" /> Inquiry Details
                                </h4>
                                <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
                                  <p className="text-[#1f2322] leading-relaxed whitespace-pre-wrap font-medium">
                                    "{contact.message}"
                                  </p>
                                </div>
                              </div>

                              {/* Status Update & Admin Response */}
                              <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1f2322] mb-5 flex items-center gap-2 border-b border-[#E8E1D5] pb-2">
                                  <Activity className="w-4 h-4 text-[#C1A27B]" /> Update Status
                                </h4>
                                <div className="bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#667280] mb-2 block">Optional Response Email</label>
                                    <textarea 
                                      placeholder="Type a message to send in the status update email..."
                                      rows="3"
                                      value={adminResponseText[contact._id] || ''}
                                      onChange={(e) => setAdminResponseText({...adminResponseText, [contact._id]: e.target.value})}
                                      className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#C1A27B]/50 transition-all text-sm resize-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {['Pending', 'Checked', 'Confirmed', 'Rejected'].map(status => (
                                      <button 
                                        key={status}
                                        onClick={() => handleContactStatusUpdate(contact._id, status)}
                                        className={`text-xs font-bold uppercase py-2 rounded-lg border transition-all ${
                                          contact.status === status 
                                          ? 'bg-[#1f2322] text-white border-[#1f2322] shadow-md' 
                                          : 'bg-white text-[#667280] border-[#E8E1D5] hover:border-[#C1A27B] hover:text-[#C1A27B]'
                                        }`}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )) : (
                  <tr>
                    <td colSpan="4">
                      <div className="p-20 text-center">
                        <MessageSquare className="w-16 h-16 text-[#C1A27B]/30 mx-auto mb-4" />
                        <p className="font-serif text-xl font-bold text-[#667280]">No guest inquiries found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
