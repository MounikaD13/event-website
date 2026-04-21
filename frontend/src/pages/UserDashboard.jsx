import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, MessageSquare, Clock, CheckCircle, 
  Send, User, MapPin, Package, AlertCircle,
  ChevronRight, RefreshCw
} from 'lucide-react';
import { fetchDashboardData, submitChat, cancelInquiry } from '../store/slices/userAccountSlice';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector((state) => state.userAccount);
  const { user } = useSelector((state) => state.auth);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dashboard.chats]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      await dispatch(submitChat(chatMessage)).unwrap();
      setChatMessage('');
    } catch (err) {
      toast.error(err || 'Failed to send message');
    }
  };

  const handleCancelInquiry = async (id) => {
    if (window.confirm('Are you sure you want to cancel this inquiry?')) {
      try {
        await dispatch(cancelInquiry(id)).unwrap();
        toast.success('Inquiry cancelled');
      } catch (err) {
        toast.error(err || 'Failed to cancel');
      }
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#0f0e17] text-[#f8f5f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#C9A84C] mb-2 tracking-tight">
              Welcome back, <span className="text-white">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 font-light tracking-wide">Track your event plans and communicate with your dream team.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Account Status</p>
              <p className="text-sm font-bold text-[#C9A84C]">PREMIUM MEMBER</p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/30 flex items-center justify-center bg-[#1a1a2e]">
              <User className="w-6 h-6 text-[#C9A84C]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Inquiries */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <Package className="w-6 h-6 text-[#C9A84C] mb-4" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.bookings.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Confirmed Bookings</p>
                </div>
              </div>
              <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <Clock className="w-6 h-6 text-blue-400 mb-4" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.inquiries.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Active Inquiries</p>
                </div>
              </div>
              <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                <MessageSquare className="w-6 h-6 text-green-400 mb-4" />
                <div>
                  <p className="text-2xl font-bold">{dashboard.chats.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Messages Exchanged</p>
                </div>
              </div>
            </div>

            {/* Inquiries Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-[#C9A84C] flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Your Event Inquiries
                </h2>
              </div>
              
              <div className="space-y-4">
                {dashboard.inquiries.length > 0 ? dashboard.inquiries.map((inq) => (
                  <div key={inq._id} className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-[#C9A84C]/30">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#C9A84C]" />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-lg">{inq.eventType}</h3>
                            <p className="text-sm text-gray-500 italic">Planned for {new Date(inq.eventDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            inq.status === 'Confirmed' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-[#C9A84C]/30 text-[#C9A84C] bg-[#C9A84C]/5'
                          }`}>
                            {inq.status || 'Under Review'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-t border-b border-white/5">
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Guest Count</p>
                          <p className="text-sm font-medium">{inq.guestCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Budget Range</p>
                          <p className="text-sm font-medium">{inq.budgetRange || 'Flexible'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-sm font-medium flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-[#C9A84C]" /> {inq.location || 'Consulting'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Flexibility</p>
                          <p className="text-sm font-medium">{inq.isFlexibleDate ? '± 7 Days' : 'Fixed Date'}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-sm text-gray-400 flex-1 truncate italic">"{inq.message}"</p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleCancelInquiry(inq._id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-all"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-[#1a1a2e] rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <h3 className="text-lg font-serif font-bold text-gray-400 mb-2">No active inquiries</h3>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto mb-6">You haven't requested any event consultations yet.</p>
                    <button className="bg-[#C9A84C] text-[#0f0e17] px-6 py-2 rounded font-bold uppercase text-xs tracking-widest">Explore Destinations</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Chat & Profile Quick-links */}
          <div className="space-y-8">
            
            {/* Concierge Chat */}
            <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
              <div className="p-6 bg-gradient-to-b from-[#C9A84C]/10 to-transparent border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C] flex items-center justify-center font-bold text-[#0f0e17]">
                      OP
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#1a1a2e] rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-white">Elysium Concierge</h4>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow p-6 overflow-y-auto space-y-4">
                {dashboard.chats.length > 0 ? dashboard.chats.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      chat.sender === 'User' 
                        ? 'bg-[#C9A84C] text-[#0f0e17] rounded-tr-none' 
                        : 'bg-[#0f0e17] text-[#f8f5f0] border border-white/10 rounded-tl-none'
                    }`}>
                      <p className="text-[9px] font-bold uppercase opacity-60 mb-1">{chat.sender === 'User' ? 'You' : 'Management'}</p>
                      {chat.message}
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <MessageSquare className="w-12 h-12 mb-4" />
                    <p className="text-xs uppercase tracking-widest font-bold">Start a conversation with your planner</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#0f0e17]/50 border-t border-white/5">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about your event..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-grow bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button 
                    type="submit"
                    className="bg-[#C9A84C] text-[#0f0e17] p-2 rounded-lg hover:bg-[#B69640] transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Links */}
            <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#C9A84C] mb-6">Expert Services</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <span className="text-sm font-light">Custom Itinerary Plan</span>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#C9A84C] transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <span className="text-sm font-light">Request Venue Scouting</span>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#C9A84C] transition-colors" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <span className="text-sm font-light">Vendor Matching</span>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-[#C9A84C] transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
