import { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, MessageSquare, Calendar, Search,
  ChevronDown, ChevronUp, Send, Trash2, Mail, ShieldCheck,
  Filter, X
} from 'lucide-react';
import { fetchAllUserData, updateInquiryStatus, replyToChat, deleteUser } from '../store/slices/adminSlice';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const safeUsers = users || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchAllUserData({ search: searchTerm, status: filterStatus }));
  }, [dispatch, searchTerm, filterStatus]);

  const handleStatusUpdate = async (userId, inquiryId, newStatus) => {
    try {
      await dispatch(updateInquiryStatus({ userId, inquiryId, newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err || 'Failed to update status');
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

  const toggleExpand = (id) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  return (
    <div className="pt-32 lg:pt-40 pb-16 min-h-screen bg-[#FAF9F6] text-[#1f2322]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#C1A27B] mb-2">Management Console</h1>
            <p className="text-[#667280]">Oversee inquiries, coordinate bookings, and communicate with clients.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-[#E8E1D5] flex items-center gap-3">
              <Users className="w-5 h-5 text-[#C1A27B]" />
              <div>
                <p className="text-[10px] text-[#667280] uppercase tracking-widest leading-none mb-1">Total Users</p>
                <p className="text-lg font-bold leading-none">{safeUsers.length}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-[#E8E1D5] flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#C1A27B]" />
              <div>
                <p className="text-[10px] text-[#667280] uppercase tracking-widest leading-none mb-1">New Inquiries</p>
                <p className="text-lg font-bold leading-none">
                  {safeUsers.reduce((acc, u) => acc + (u.inquiries || []).filter(i => i.status === 'New').length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-xl border border-[#E8E1D5]">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667280]" />
            <input
              type="text"
              placeholder="Search by client name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#C1A27B] transition-colors text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667280]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E1D5] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#C1A27B] transition-colors text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C1A27B] hover:text-[#AA8960] transition-colors"
          >
            <X className="w-4 h-4" /> Reset Filters
          </button>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F7F3EC] text-[#667280] text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-6 py-4">Client Detail</th>
                <th className="px-6 py-4">Inquiries</th>
                <th className="px-6 py-4">Bookings</th>
                <th className="px-6 py-4">Recent Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DC]">
              {safeUsers.map((user) => (
                <Fragment key={user._id}>
                  <tr className={`hover:bg-white/5 transition-all duration-200 cursor-pointer ${expandedUser === user._id ? 'bg-[#C9A84C]/5' : ''}`}>
                    <td className="px-6 py-6" onClick={() => toggleExpand(user._id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C1A27B]/10 border border-[#C1A27B]/20 flex items-center justify-center text-[#C1A27B] font-serif font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-[#1f2322] flex items-center gap-2">
                            {user.name || 'Unknown User'}
                            {user.isVerified && <ShieldCheck className="w-3 h-3 text-[#C1A27B]" />}
                          </div>
                          <div className="text-xs text-[#667280] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6" onClick={() => toggleExpand(user._id)}>
                      <span className="bg-[#FAF9F6] px-2 py-1 rounded text-xs border border-[#E8E1D5]">
                        {(user.inquiries || []).length} Requests
                      </span>
                    </td>
                    <td className="px-6 py-6" onClick={() => toggleExpand(user._id)}>
                      <span className="bg-[#C1A27B]/10 text-[#C1A27B] px-2 py-1 rounded text-xs border border-[#C1A27B]/20">
                        {(user.bookings || []).length} Booked
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm text-[#667280]" onClick={() => toggleExpand(user._id)}>
                      {(user.chats || []).length > 0 ? (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#C1A27B]" />
                          <span>Last seen Dec 24</span>
                        </div>
                      ) : 'No recent chat'}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 px-1">
                        <button
                          onClick={() => toggleExpand(user._id)}
                          className="p-2 text-[#667280] hover:text-[#1f2322] transition-colors"
                        >
                          {expandedUser === user._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-[#667280] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Content */}
                  {expandedUser === user._id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 bg-[#F7F3EC] border-t border-[#E8E1D5] animate-in slide-in-from-top duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          {/* Inquiries & Bookings */}
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#C1A27B] mb-6 flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Inquiry Management
                            </h4>
                            <div className="space-y-6">
                              {user.inquiries.length > 0 ? user.inquiries.map((inq) => (
                                <div key={inq._id} className="bg-white p-5 rounded-xl border border-[#E8E1D5] flex flex-col gap-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-serif font-bold text-lg text-[#1f2322]">{inq.eventType}</p>
                                      <p className="text-xs text-[#667280]">{new Date(inq.eventDate).toLocaleDateString()} • {inq.guestCount} Guests</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inq.status === 'New' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        inq.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                      }`}>
                                      {inq.status}
                                    </div>
                                  </div>
                                  <p className="text-sm text-[#667280] italic">"{inq.message}"</p>
                                  <div className="flex items-center gap-3 pt-2">
                                    <button
                                      onClick={() => handleStatusUpdate(user._id, inq._id, 'Confirmed')}
                                      className="text-[10px] font-bold uppercase px-3 py-2 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-all"
                                    >
                                      Approve & Notify
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(user._id, inq._id, 'Completed')}
                                      className="text-[10px] font-bold uppercase px-3 py-2 bg-gray-500/10 text-gray-400 rounded hover:bg-gray-500/20 transition-all"
                                    >
                                      Mark Completed
                                    </button>
                                  </div>
                                </div>
                              )) : <p className="text-sm text-gray-500 italic">No inquiries found for this client.</p>}
                            </div>
                          </div>

                          {/* Chat Section */}
                          <div className="flex flex-col h-[500px]">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#C1A27B] mb-6 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Direct Communication
                            </h4>
                            <div className="flex-grow bg-white rounded-xl border border-[#E8E1D5] p-4 overflow-y-auto mb-4 space-y-4">
                              {(user.chats || []).length > 0 ? user.chats.map((chat, idx) => (
                                <div key={idx} className={`flex ${chat.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${chat.sender === 'Admin'
                                      ? 'bg-[#C1A27B] text-white rounded-tr-none shadow-lg'
                                      : 'bg-[#FAF9F6] text-[#1f2322] border border-[#E8E1D5] rounded-tl-none'
                                    }`}>
                                    <p className="font-bold text-[10px] uppercase tracking-tighter mb-1 opacity-70">
                                      {chat.sender === 'Admin' ? 'Elysium Support' : user.name || 'Unknown User'}
                                    </p>
                                    {chat.message}
                                  </div>
                                </div>
                              )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                  <MessageSquare className="w-12 h-12 mb-4" />
                                  <p className="text-xs uppercase tracking-widest font-bold">No message history</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 p-2 bg-white rounded-xl border border-[#E8E1D5] focus-within:border-[#C1A27B] transition-all">
                              <input
                                type="text"
                                value={replyText[user._id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [user._id]: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleReply(user._id)}
                                placeholder="Type your reply to this client..."
                                className="flex-grow bg-transparent border-none focus:ring-0 text-sm px-2 outline-none"
                              />
                              <button
                                onClick={() => handleReply(user._id)}
                                className="bg-[#C1A27B] text-white p-2 rounded-lg hover:bg-[#AA8960] transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>

          {safeUsers.length === 0 && !loading && (
            <div className="p-20 text-center">
              <Users className="w-16 h-16 text-[#C1A27B]/35 mx-auto mb-4" />
              <p className="font-serif text-xl font-bold italic text-[#667280]">No matching clients found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;