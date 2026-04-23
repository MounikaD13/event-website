// import { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import {
//   Calendar, MessageSquare, Clock, CheckCircle,
//   Send, MapPin, Package, RefreshCw, Zap,
//   ShieldCheck, Star, Compass, ArrowRight,
//   XCircle, LayoutGrid
// } from 'lucide-react';
// import { fetchDashboardData, submitChat, cancelInquiry } from '../store/slices/userAccountSlice';
// import toast from 'react-hot-toast';
// import { createSocket } from '../utils/socket';
// import { motion, AnimatePresence } from 'framer-motion';

// /* ─── Helpers ────────────────────────────────────────────────────── */
// const statusStyle = (s) =>
//   ({
//     Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     Checked:   'bg-amber-50  text-amber-700  border-amber-200',
//     Rejected:  'bg-red-50    text-red-500    border-red-200',
//   }[s] ?? 'bg-orange-50 text-orange-600 border-orange-200');

// const fmt = (d) =>
//   new Date(d).toLocaleDateString(undefined, {
//     month: 'short', day: 'numeric', year: 'numeric',
//   });

// /* ─── Stat Card ──────────────────────────────────────────────────── */
// const StatCard = ({ label, value, Icon, color, bg, sub, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 16 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.4, ease: 'easeOut' }}
//     className="bg-white rounded-2xl border border-[#E7DDCF] p-5 xl:p-6
//                hover:shadow-lg hover:border-[#C29B5F]/40 transition-all duration-200 group"
//   >
//     <div className="flex items-start justify-between mb-4">
//       <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center
//                        group-hover:scale-105 transition-transform`}>
//         <Icon className={`w-5 h-5 ${color}`} />
//       </div>
//       <span className="text-[9px] font-bold text-[#636A78]/50 uppercase tracking-[0.25em] mt-1">
//         {sub}
//       </span>
//     </div>
//     <p className="text-3xl sm:text-4xl font-serif font-bold text-[#3F4A50] leading-none mb-1">
//       {value}
//     </p>
//     <p className="text-[10px] font-bold text-[#636A78] uppercase tracking-[0.2em]">{label}</p>
//   </motion.div>
// );

// /* ─── Booking Card ───────────────────────────────────────────────── */
// const BookingCard = ({ book, idx }) => (
//   <motion.div
//     layout
//     initial={{ opacity: 0, y: 12 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay: idx * 0.07 }}
//     className="bg-white rounded-2xl border-2 border-emerald-100 p-5 sm:p-6
//                hover:shadow-lg hover:border-emerald-200 transition-all duration-200 group"
//   >
//     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//       <div className="flex items-center gap-4 min-w-0">
//         <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100
//                         flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
//           <CheckCircle className="w-5 h-5 text-emerald-600" />
//         </div>
//         <div className="min-w-0">
//           <h3 className="text-base font-serif font-bold text-[#3F4A50] truncate">
//             {book.eventType}
//           </h3>
//           <div className="flex flex-wrap items-center gap-3 mt-1">
//             <span className="flex items-center gap-1.5 text-xs text-[#636A78]">
//               <Calendar className="w-3.5 h-3.5 text-[#C29B5F] shrink-0" />
//               {fmt(book.eventDate)}
//             </span>
//             {book.venue && (
//               <span className="flex items-center gap-1.5 text-xs text-[#636A78]">
//                 <MapPin className="w-3.5 h-3.5 text-[#C29B5F] shrink-0" />
//                 {book.venue}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="flex items-center gap-3 shrink-0">
//         <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-full
//                          text-[10px] font-bold uppercase tracking-wider shadow-sm">
//           Confirmed
//         </span>
//         <span className="hidden sm:block text-[10px] text-[#636A78]/40 font-mono">
//           EL‑BK‑{idx + 100}
//         </span>
//       </div>
//     </div>
//   </motion.div>
// );

// /* ─── Inquiry Card ───────────────────────────────────────────────── */
// const InquiryCard = ({ inq, onCancel }) => (
//   <motion.div
//     layout
//     initial={{ opacity: 0, y: 12 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="bg-white rounded-2xl border border-[#E7DDCF] p-5 sm:p-6
//                hover:border-[#C29B5F]/40 hover:shadow-md transition-all duration-200 group"
//   >
//     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//       <div className="flex items-center gap-4 min-w-0">
//         <div className="w-11 h-11 shrink-0 rounded-xl bg-[#FBF8F3] border border-[#E7DDCF]
//                         flex items-center justify-center group-hover:scale-105 transition-transform">
//           <RefreshCw className="w-4 h-4 text-[#C29B5F]" />
//         </div>
//         <div className="min-w-0">
//           <h3 className="text-base font-serif font-bold text-[#3F4A50] truncate">
//             {inq.eventType}
//           </h3>
//           <p className="flex items-center gap-1.5 text-xs text-[#636A78] mt-0.5">
//             <Clock className="w-3 h-3 shrink-0" />
//             {fmt(inq.createdAt)}
//           </p>
//         </div>
//       </div>
//       <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px]
//                         font-bold uppercase tracking-wider border ${statusStyle(inq.status)}`}>
//         {inq.status || 'Pending'}
//       </span>
//     </div>

//     <blockquote className="bg-[#FBF8F3] border border-[#E7DDCF]/70 rounded-xl
//                            px-4 py-3 text-sm text-[#3F4A50] italic leading-relaxed">
//       "{inq.message}"
//     </blockquote>

//     {inq.status === 'Pending' && (
//       <div className="mt-4 flex justify-end">
//         <button
//           onClick={() => onCancel(inq._id)}
//           className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
//                      text-[#636A78]/50 hover:text-red-500 transition-colors group/btn"
//         >
//           <XCircle className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-200" />
//           Withdraw Inquiry
//         </button>
//       </div>
//     )}
//   </motion.div>
// );

// /* ─── Chat Bubble ────────────────────────────────────────────────── */
// const ChatBubble = ({ chat, idx }) => {
//   const isUser = chat.sender === 'User';
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: idx * 0.03 }}
//       className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
//     >
//       <div
//         className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
//           ${isUser
//             ? 'bg-[#C29B5F] text-white rounded-tr-sm'
//             : 'bg-white text-[#3F4A50] border border-[#E7DDCF] rounded-tl-sm'
//           }`}
//       >
//         <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5 opacity-60">
//           {isUser ? 'You' : 'Executive Support'}
//         </p>
//         <p>{chat.message}</p>
//       </div>
//     </motion.div>
//   );
// };

// /* ─── Main Dashboard ─────────────────────────────────────────────── */
// const UserDashboard = () => {
//   const dispatch              = useDispatch();
//   const { dashboard }         = useSelector((s) => s.userAccount);
//   const { user }              = useSelector((s) => s.auth);
//   const [chatMsg, setChatMsg] = useState('');
//   const chatEnd               = useRef(null);

//   const inquiries = dashboard?.inquiries ?? [];
//   const bookings  = dashboard?.bookings  ?? [];
//   const chats     = dashboard?.chats     ?? [];

//   useEffect(() => { dispatch(fetchDashboardData()); }, [dispatch]);

//   useEffect(() => {
//     chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chats.length]);

//   useEffect(() => {
//     const socket = createSocket();
//     socket.on('connect', () => user?._id && socket.emit('join_room', user._id));

//     const refresh = () => dispatch(fetchDashboardData());
//     const onMsg   = (d) => {
//       refresh();
//       if (d.sender === 'Admin')
//         toast('New message from Executive Support', {
//           icon: '💬',
//           style: { borderRadius: '12px', background: '#3F4A50', color: '#fff' },
//         });
//     };

//     socket.on('receive_message',           onMsg);
//     socket.on('dashboard:inquiry-updated', refresh);
//     socket.on('dashboard:booking-created', refresh);

//     return () => {
//       socket.off('receive_message',           onMsg);
//       socket.off('dashboard:inquiry-updated', refresh);
//       socket.off('dashboard:booking-created', refresh);
//       socket.disconnect();
//     };
//   }, [dispatch, user?._id]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!chatMsg.trim()) return;
//     try {
//       await dispatch(submitChat(chatMsg)).unwrap();
//       setChatMsg('');
//     } catch (err) {
//       toast.error(err || 'Failed to send message');
//     }
//   };

//   const handleCancel = async (id) => {
//     if (!window.confirm('Withdraw this inquiry?')) return;
//     try {
//       await dispatch(cancelInquiry(id)).unwrap();
//       toast.success('Inquiry withdrawn');
//     } catch (err) {
//       toast.error(err || 'Failed to withdraw');
//     }
//   };

//   const hasContent = inquiries.length > 0 || bookings.length > 0;
//   const firstName  = user?.name?.split(' ')[0] || 'Guest';

//   return (
//     <div className="min-h-screen bg-[#FBF8F3] pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20">

//       {/* Ambient gradients */}
//       <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
//         <div className="absolute -top-32 right-0 w-[600px] h-[600px]
//                         bg-[#C29B5F]/8 rounded-full blur-[140px]" />
//         <div className="absolute bottom-0 -left-32 w-[500px] h-[500px]
//                         bg-[#2C7A6C]/6 rounded-full blur-[120px]" />
//       </div>

//       <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 space-y-10 sm:space-y-12">

//         {/* ── SECTION 1 · Header ──────────────────────────────────── */}
//         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

//           {/* Greeting */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="space-y-4 max-w-xl"
//           >
//             <div className="flex flex-wrap items-center gap-3">
//               <span className="inline-flex items-center px-3 py-1 bg-[#3F4A50] text-[#C29B5F]
//                                rounded-full text-[10px] font-bold tracking-[0.25em] uppercase
//                                border border-white/10">
//                 Executive Portal
//               </span>
//               <span className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full
//                                border border-[#E7DDCF] shadow-sm">
//                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
//                 <span className="text-[9px] font-bold uppercase tracking-widest text-[#636A78]">
//                   Live · Connected
//                 </span>
//               </span>
//             </div>

//             <div>
//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold
//                              text-[#3F4A50] tracking-tight leading-[1.1]">
//                 Bonjour,{' '}
//                 <span className="text-transparent bg-clip-text
//                                  bg-gradient-to-r from-[#C29B5F] to-[#A97F3D]">
//                   {firstName}
//                 </span>
//               </h1>
//               <p className="mt-2 text-[#636A78] text-base sm:text-lg font-medium leading-relaxed">
//                 Your bespoke event portfolio is synchronised. Monitor your milestones in real‑time.
//               </p>
//             </div>
//           </motion.div>

//           {/* Identity card */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.45, delay: 0.1 }}
//             className="flex items-center gap-5 bg-white px-6 py-5 rounded-2xl
//                        border border-[#E7DDCF] shadow-lg shadow-black/4 relative overflow-hidden
//                        w-full sm:w-auto"
//           >
//             <div aria-hidden className="absolute top-2 right-3 opacity-[0.04] pointer-events-none">
//               <ShieldCheck className="w-20 h-20 rotate-12" />
//             </div>
//             <div className="text-right">
//               <p className="text-[9px] text-[#636A78] uppercase tracking-[0.3em] font-bold mb-1">
//                 Member Identity
//               </p>
//               <h4 className="text-sm font-serif font-bold text-[#3F4A50] tracking-tight">
//                 ELITE TIER STATUS
//               </h4>
//               <div className="flex items-center justify-end gap-0.5 mt-1 text-[#C29B5F]">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="w-2.5 h-2.5 fill-current" />
//                 ))}
//               </div>
//             </div>
//             <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C29B5F] to-[#A97F3D]
//                             flex items-center justify-center shadow-lg shrink-0">
//               <span className="text-xl font-serif font-bold text-white uppercase">
//                 {user?.name?.charAt(0) || 'U'}
//               </span>
//             </div>
//           </motion.div>
//         </div>

//         {/* ── SECTION 2 · Stats ───────────────────────────────────── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
//           {[
//             { label: 'Confirmed', value: bookings.length,  Icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Event Ready', delay: 0    },
//             { label: 'Inquiries', value: inquiries.length, Icon: Calendar,      color: 'text-[#C29B5F]',   bg: 'bg-amber-50',  sub: 'Awaiting',    delay: 0.07 },
//             { label: 'Support',   value: chats.length,     Icon: MessageSquare, color: 'text-[#3F4A50]',   bg: 'bg-slate-100', sub: 'Direct Line', delay: 0.14 },
//             { label: 'Uptime',    value: '100%',           Icon: Zap,           color: 'text-amber-500',   bg: 'bg-amber-50',  sub: 'Live Sync',   delay: 0.21 },
//           ].map((s) => <StatCard key={s.label} {...s} />)}
//         </div>

//         {/* ── SECTION 3 · Core Content ────────────────────────────── */}
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10">

//           {/* Portfolio — 8 cols */}
//           <div className="xl:col-span-8 flex flex-col gap-6">

//             {/* Section heading */}
//             <div className="flex items-center gap-4">
//               <LayoutGrid className="w-5 h-5 text-[#C29B5F] shrink-0" />
//               <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3F4A50] tracking-tight shrink-0">
//                 Event Portfolio
//               </h2>
//               <div className="h-px flex-grow bg-gradient-to-r from-[#E7DDCF] to-transparent" />
//               <Link
//                 to="/events"
//                 className="group flex items-center gap-1.5 text-[10px] font-bold
//                            text-[#C29B5F] uppercase tracking-widest
//                            hover:text-[#3F4A50] transition-colors shrink-0"
//               >
//                 New Request
//                 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//               </Link>
//             </div>


//             {/* Cards */}
//             <AnimatePresence mode="popLayout">
//               {hasContent ? (
//                 <div className="flex flex-col gap-4">
//                   {bookings.map((book, i)  => (
//                     <BookingCard key={`bk-${i}`} book={book} idx={i} />
//                   ))}
//                   {inquiries.map((inq) => (
//                     <InquiryCard key={inq._id} inq={inq} onCancel={handleCancel} />
//                   ))}
//                 </div>
//               ) : (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed
//                              border-[#E7DDCF] flex flex-col items-center justify-center
//                              text-center px-8 py-16 sm:py-24 gap-6"
//                 >
//                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center
//                                   border border-[#E7DDCF] shadow-lg rotate-6">
//                     <Compass className="w-8 h-8 text-[#C29B5F]/40" />
//                   </div>
//                   <div className="max-w-sm space-y-2">
//                     <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3F4A50]">
//                       A Blank Canvas
//                     </h3>
//                     <p className="text-[#636A78] text-sm sm:text-base leading-relaxed">
//                       Your portfolio is awaiting its first masterpiece. Let's collaborate to bring
//                       your vision to life.
//                     </p>
//                   </div>
//                   <Link
//                     to="/events"
//                     className="inline-flex items-center gap-3 bg-[#3F4A50] text-white
//                                px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase
//                                tracking-widest shadow-lg hover:bg-[#C29B5F]
//                                hover:scale-[1.02] active:scale-95 transition-all duration-200"
//                   >
//                     Initialise Inquiry <ArrowRight className="w-4 h-4" />
//                   </Link>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Chat Terminal — 4 cols */}
//           <div className="xl:col-span-4">
//             <div className="bg-white rounded-2xl border border-[#E7DDCF] shadow-xl
//                             flex flex-col overflow-hidden
//                             h-[520px] sm:h-[580px] xl:h-full xl:min-h-[520px]">

//               {/* Header */}
//               <div className="px-6 py-5 bg-[#3F4A50] text-white shrink-0">
//                 <div className="flex items-center gap-4">
//                   <div className="relative shrink-0">
//                     <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20
//                                     flex items-center justify-center font-serif font-bold
//                                     text-[#C29B5F] text-sm">
//                       EP
//                     </div>
//                     <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500
//                                      border-2 border-[#3F4A50] rounded-full" />
//                   </div>
//                   <div>
//                     <h4 className="font-serif font-bold text-base tracking-tight">
//                       Executive Planner
//                     </h4>
//                     <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
//                       Secure Live Channel
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Messages */}
//               <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#FBF8F3]/50
//                               scrollbar-thin scrollbar-thumb-[#E7DDCF] scrollbar-track-transparent">
//                 {chats.length > 0
//                   ? chats.map((c, i) => <ChatBubble key={i} chat={c} idx={i} />)
//                   : (
//                     <div className="h-full flex flex-col items-center justify-center
//                                     text-center px-8 gap-3 opacity-30">
//                       <MessageSquare className="w-10 h-10 text-[#C29B5F]" />
//                       <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#3F4A50]">
//                         No messages yet
//                       </p>
//                     </div>
//                   )}
//                 <div ref={chatEnd} />
//               </div>

//               {/* Input */}
//               <div className="px-5 py-4 bg-white border-t border-[#E7DDCF] shrink-0">
//                 <form onSubmit={handleSend} className="flex items-center gap-3">
//                   <input
//                     type="text"
//                     placeholder="Brief your planner…"
//                     value={chatMsg}
//                     onChange={(e) => setChatMsg(e.target.value)}
//                     className="flex-1 min-w-0 bg-[#FBF8F3] border border-[#E7DDCF] rounded-xl
//                                px-4 py-2.5 text-sm text-[#3F4A50] placeholder-[#636A78]/40
//                                focus:outline-none focus:border-[#C29B5F]
//                                focus:ring-2 focus:ring-[#C29B5F]/15 transition-all"
//                   />
//                   <button
//                     type="submit"
//                     className="shrink-0 w-10 h-10 bg-[#3F4A50] text-white rounded-xl
//                                flex items-center justify-center shadow-md
//                                hover:bg-[#C29B5F] active:scale-95 transition-all duration-200"
//                   >
//                     <Send className="w-4 h-4" />
//                   </button>
//                 </form>
//                 <p className="mt-2 text-center text-[8px] font-bold text-[#636A78]/30
//                               uppercase tracking-[0.3em]">
//                   Encrypted Session Active
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── SECTION 4 · Bottom Banner ────────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10"
//         >
//           {/* Hero image — 8 cols */}
//           <div className="xl:col-span-8">
//             <div className="relative rounded-2xl overflow-hidden border border-[#E7DDCF]
//                             shadow-xl group min-h-[280px] sm:min-h-[320px]">
//               <img
//                 src="/images/about_gala.jpg"
//                 alt="Elite Event"
//                 className="w-full h-full object-cover absolute inset-0
//                            transition-transform duration-[2000ms] group-hover:scale-105"
//               />
//               <div className="absolute inset-0 bg-gradient-to-r
//                               from-[#3F4A50]/90 via-[#3F4A50]/50 to-transparent" />
//               <div className="relative z-10 flex flex-col justify-center
//                               h-full px-8 sm:px-12 py-10">
//                 <div className="max-w-md space-y-4">
//                   <div className="flex items-center gap-2 text-[#C29B5F]">
//                     <Star className="w-4 h-4 fill-current" />
//                     <span className="text-[9px] font-bold uppercase tracking-[0.4em]">
//                       Global Standards
//                     </span>
//                   </div>
//                   <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold
//                                  text-white leading-tight">
//                     Beyond{' '}
//                     <span className="text-[#C29B5F]">Expectation.</span>
//                     <br />Within Reach.
//                   </h3>
//                   <p className="text-white/70 text-sm sm:text-base leading-relaxed">
//                     Our curators select only the world's most breathtaking venues for your review.
//                     Every detail is a testament to your legacy.
//                   </p>
//                   <Link
//                     to="/events"
//                     className="inline-flex items-center gap-2 text-white text-xs font-bold
//                                uppercase tracking-widest hover:text-[#C29B5F]
//                                transition-colors group/link"
//                   >
//                     Review Exclusive Venues
//                     <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Perks — 4 cols */}
//           <div className="xl:col-span-4">
//             <div className="bg-[#3F4A50] rounded-2xl p-7 sm:p-8 text-white
//                             flex flex-col justify-between h-full relative overflow-hidden
//                             shadow-xl shadow-black/10 min-h-[280px]">
//               <div aria-hidden
//                    className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
//                 <LayoutGrid className="w-28 h-28" />
//               </div>

//               <div className="relative z-10">
//                 <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C29B5F]
//                                mb-6 pb-4 border-b border-white/10">
//                   Exclusive Privileges
//                 </h4>
//                 <div className="space-y-3">
//                   {[
//                     { name: 'Priority Venue Scouting', Icon: Compass,     sub: 'Global Network'    },
//                     { name: 'Concierge Support 24/7',  Icon: ShieldCheck,  sub: 'Instant Access'   },
//                     { name: 'Curated Vendor Access',   Icon: Package,      sub: 'Bespoke Selection' },
//                   ].map((p) => (
//                     <div
//                       key={p.name}
//                       className="flex items-center gap-4 p-4 rounded-xl bg-white/5
//                                  border border-white/10 hover:bg-white/10 transition-colors"
//                     >
//                       <div className="p-2.5 bg-[#C29B5F]/15 rounded-lg text-[#C29B5F] shrink-0">
//                         <p.Icon className="w-4 h-4" />
//                       </div>
//                       <div className="min-w-0">
//                         <span className="block text-sm font-bold tracking-tight truncate">
//                           {p.name}
//                         </span>
//                         <span className="block text-[9px] uppercase tracking-widest
//                                          text-white/40 mt-0.5">
//                           {p.sub}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <p className="relative z-10 mt-8 pt-5 border-t border-white/10
//                             text-[11px] text-white/30 italic text-center leading-relaxed">
//                 "Excellence is not an act, but a habit."
//               </p>
//             </div>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Calendar, MessageSquare, Clock, CheckCircle,
  Send, MapPin, Package, RefreshCw, Zap,
  ShieldCheck, Star, Compass, ArrowRight,
  XCircle, LayoutGrid
} from 'lucide-react';
import { fetchDashboardData, submitChat, cancelInquiry } from '../store/slices/userAccountSlice';
import toast from 'react-hot-toast';
import { createSocket } from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Helpers ────────────────────────────────────────────────────── */
const statusStyle = (s) =>
({
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Checked: 'bg-amber-50  text-amber-700  border-amber-200',
  Rejected: 'bg-red-50    text-red-500    border-red-200',
}[s] ?? 'bg-orange-50 text-orange-600 border-orange-200');

const fmt = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

/* ─── Stat Card ──────────────────────────────────────────────────── */
const StatCard = ({ label, value, Icon, color, bg, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className="bg-white rounded-2xl border border-[#E7DDCF] p-5 xl:p-6
               hover:shadow-lg hover:border-[#C29B5F]/40 transition-all duration-200 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center
                       group-hover:scale-105 transition-transform`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-[9px] font-bold text-[#636A78]/50 uppercase tracking-[0.25em] mt-1">
        {sub}
      </span>
    </div>
    <p className="text-3xl sm:text-4xl font-serif font-bold text-[#3F4A50] leading-none mb-1">
      {value}
    </p>
    <p className="text-[10px] font-bold text-[#636A78] uppercase tracking-[0.2em]">{label}</p>
  </motion.div>
);

/* ─── Booking Card ───────────────────────────────────────────────── */
const BookingCard = ({ book, idx }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.07 }}
    className="bg-white rounded-2xl border-2 border-emerald-100 p-5 sm:p-6
               hover:shadow-lg hover:border-emerald-200 transition-all duration-200 group"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100
                        flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-serif font-bold text-[#3F4A50] truncate">
            {book.eventType}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-[#636A78]">
              <Calendar className="w-3.5 h-3.5 text-[#C29B5F] shrink-0" />
              {fmt(book.eventDate)}
            </span>
            {book.venue && (
              <span className="flex items-center gap-1.5 text-xs text-[#636A78]">
                <MapPin className="w-3.5 h-3.5 text-[#C29B5F] shrink-0" />
                {book.venue}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="px-3 py-1.5 bg-emerald-600 text-white rounded-full
                         text-[10px] font-bold uppercase tracking-wider shadow-sm">
          Confirmed
        </span>
        <span className="hidden sm:block text-[10px] text-[#636A78]/40 font-mono">
          EL‑BK‑{idx + 100}
        </span>
      </div>
    </div>
  </motion.div>
);

/* ─── Inquiry Card ───────────────────────────────────────────────── */
const InquiryCard = ({ inq, onCancel }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-[#E7DDCF] p-5 sm:p-6
               hover:border-[#C29B5F]/40 hover:shadow-md transition-all duration-200 group"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-[#FBF8F3] border border-[#E7DDCF]
                        flex items-center justify-center group-hover:scale-105 transition-transform">
          <RefreshCw className="w-4 h-4 text-[#C29B5F]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-serif font-bold text-[#3F4A50] truncate">
            {inq.eventType}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-[#636A78] mt-0.5">
            <Clock className="w-3 h-3 shrink-0" />
            {fmt(inq.createdAt)}
          </p>
        </div>
      </div>
      <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-[10px]
                        font-bold uppercase tracking-wider border ${statusStyle(inq.status)}`}>
        {inq.status || 'Pending'}
      </span>
    </div>

    <blockquote className="bg-[#FBF8F3] border border-[#E7DDCF]/70 rounded-xl
                           px-4 py-3 text-sm text-[#3F4A50] italic leading-relaxed">
      "{inq.message}"
    </blockquote>

    {inq.status === 'Pending' && (
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onCancel(inq._id)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                     text-[#636A78]/50 hover:text-red-500 transition-colors group/btn"
        >
          <XCircle className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-200" />
          Withdraw Inquiry
        </button>
      </div>
    )}
  </motion.div>
);

/* ─── Chat Bubble ────────────────────────────────────────────────── */
const ChatBubble = ({ chat, idx }) => {
  const isUser = chat.sender === 'User';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser
            ? 'bg-[#C29B5F] text-white rounded-tr-sm'
            : 'bg-white text-[#3F4A50] border border-[#E7DDCF] rounded-tl-sm'
          }`}
      >
        <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5 opacity-60">
          {isUser ? 'You' : 'Executive Support'}
        </p>
        <p>{chat.message}</p>
      </div>
    </motion.div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────────────── */
const UserDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard } = useSelector((s) => s.userAccount);
  const { user } = useSelector((s) => s.auth);
  const [chatMsg, setChatMsg] = useState('');
  const chatEnd = useRef(null);

  const inquiries = dashboard?.inquiries ?? [];
  const bookings = dashboard?.bookings ?? [];
  const chats = dashboard?.chats ?? [];

  useEffect(() => { dispatch(fetchDashboardData()); }, [dispatch]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats.length]);

  useEffect(() => {
    const socket = createSocket();
    socket.on('connect', () => user?._id && socket.emit('join_room', user._id));

    const refresh = () => dispatch(fetchDashboardData());
    const onMsg = (d) => {
      refresh();
      if (d.sender === 'Admin')
        toast('New message from Executive Support', {
          icon: '💬',
          style: { borderRadius: '12px', background: '#3F4A50', color: '#fff' },
        });
    };

    socket.on('receive_message', onMsg);
    socket.on('dashboard:inquiry-updated', refresh);
    socket.on('dashboard:booking-created', refresh);

    return () => {
      socket.off('receive_message', onMsg);
      socket.off('dashboard:inquiry-updated', refresh);
      socket.off('dashboard:booking-created', refresh);
      socket.disconnect();
    };
  }, [dispatch, user?._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    try {
      await dispatch(submitChat(chatMsg)).unwrap();
      setChatMsg('');
    } catch (err) {
      toast.error(err || 'Failed to send message');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Withdraw this inquiry?')) return;
    try {
      await dispatch(cancelInquiry(id)).unwrap();
      toast.success('Inquiry withdrawn');
    } catch (err) {
      toast.error(err || 'Failed to withdraw');
    }
  };

  const hasContent = inquiries.length > 0 || bookings.length > 0;
  const firstName = user?.name?.split(' ')[0] || 'Guest';

  return (
    <div className="min-h-screen bg-[#FBF8F3] pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20">

      {/* Ambient gradients */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-0 w-[600px] h-[600px]
                        bg-[#C29B5F]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px]
                        bg-[#2C7A6C]/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 space-y-10 sm:space-y-12">

        {/* ── SECTION 1 · Header ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 max-w-xl"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 bg-[#3F4A50] text-[#C29B5F]
                               rounded-full text-[10px] font-bold tracking-[0.25em] uppercase
                               border border-white/10">
                Executive Portal
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full
                               border border-[#E7DDCF] shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#636A78]">
                  Live · Connected
                </span>
              </span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold
                             text-[#3F4A50] tracking-tight leading-[1.1]">
                Bonjour,{' '}
                <span className="text-transparent bg-clip-text
                                 bg-gradient-to-r from-[#C29B5F] to-[#A97F3D]">
                  {firstName}
                </span>
              </h1>
              <p className="mt-2 text-[#636A78] text-base sm:text-lg font-medium leading-relaxed">
                Your bespoke event portfolio is synchronised. Monitor your milestones in real‑time.
              </p>
            </div>
          </motion.div>

          {/* Identity card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex items-center gap-5 bg-white px-6 py-5 rounded-2xl
                       border border-[#E7DDCF] shadow-lg shadow-black/4 relative overflow-hidden
                       w-full sm:w-auto"
          >
            <div aria-hidden className="absolute top-2 right-3 opacity-[0.04] pointer-events-none">
              <ShieldCheck className="w-20 h-20 rotate-12" />
            </div>
            <div className="text-right">
              <p className="text-[9px] text-[#636A78] uppercase tracking-[0.3em] font-bold mb-1">
                Member Identity
              </p>
              <h4 className="text-sm font-serif font-bold text-[#3F4A50] tracking-tight">
                ELITE TIER STATUS
              </h4>
              <div className="flex items-center justify-end gap-0.5 mt-1 text-[#C29B5F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C29B5F] to-[#A97F3D]
                            flex items-center justify-center shadow-lg shrink-0">
              <span className="text-xl font-serif font-bold text-white uppercase">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── SECTION 2 · Stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Confirmed', value: bookings.length, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Event Ready', delay: 0 },
            { label: 'Inquiries', value: inquiries.length, Icon: Calendar, color: 'text-[#C29B5F]', bg: 'bg-amber-50', sub: 'Awaiting', delay: 0.07 },
            { label: 'Support', value: chats.length, Icon: MessageSquare, color: 'text-[#3F4A50]', bg: 'bg-slate-100', sub: 'Direct Line', delay: 0.14 },
            { label: 'Uptime', value: '100%', Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', sub: 'Live Sync', delay: 0.21 },
          ].map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── SECTION 3 · Core Content ────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10">

          {/* Portfolio — 8 cols */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Section heading */}
            <div className="flex items-center gap-4">
              <LayoutGrid className="w-5 h-5 text-[#C29B5F] shrink-0" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3F4A50] tracking-tight shrink-0">
                Event Portfolio
              </h2>
              <div className="h-px flex-grow bg-gradient-to-r from-[#E7DDCF] to-transparent" />
              <Link
                to="/events"
                className="group flex items-center gap-1.5 text-[10px] font-bold
                           text-[#C29B5F] uppercase tracking-widest
                           hover:text-[#3F4A50] transition-colors shrink-0"
              >
                New Request
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Cards */}
            <AnimatePresence mode="popLayout">
              {hasContent ? (
                <div className="flex flex-col gap-4">
                  {bookings.map((book, i) => (
                    <BookingCard key={`bk-${i}`} book={book} idx={i} />
                  ))}
                  {inquiries.map((inq) => (
                    <InquiryCard key={inq._id} inq={inq} onCancel={handleCancel} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed
                             border-[#E7DDCF] flex flex-col items-center justify-center
                             text-center px-8 py-16 sm:py-24 gap-6"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center
                                  border border-[#E7DDCF] shadow-lg rotate-6">
                    <Compass className="w-8 h-8 text-[#C29B5F]/40" />
                  </div>
                  <div className="max-w-sm space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3F4A50]">
                      A Blank Canvas
                    </h3>
                    <p className="text-[#636A78] text-sm sm:text-base leading-relaxed">
                      Your portfolio is awaiting its first masterpiece. Let's collaborate to bring
                      your vision to life.
                    </p>
                  </div>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-3 bg-[#3F4A50] text-white
                               px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase
                               tracking-widest shadow-lg hover:bg-[#C29B5F]
                               hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    Initialise Inquiry <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Terminal — 4 cols */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-2xl border border-[#E7DDCF] shadow-xl
                            flex flex-col overflow-hidden
                            h-[520px] sm:h-[580px] xl:h-full xl:min-h-[520px]">

              {/* Header */}
              <div className="px-6 py-5 bg-[#3F4A50] text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20
                                    flex items-center justify-center font-serif font-bold
                                    text-[#C29B5F] text-sm">
                      EP
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500
                                     border-2 border-[#3F4A50] rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base tracking-tight">
                      Executive Planner
                    </h4>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                      Secure Live Channel
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#FBF8F3]/50
                              scrollbar-thin scrollbar-thumb-[#E7DDCF] scrollbar-track-transparent">
                {chats.length > 0
                  ? chats.map((c, i) => <ChatBubble key={i} chat={c} idx={i} />)
                  : (
                    <div className="h-full flex flex-col items-center justify-center
                                    text-center px-8 gap-3 opacity-30">
                      <MessageSquare className="w-10 h-10 text-[#C29B5F]" />
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#3F4A50]">
                        No messages yet
                      </p>
                    </div>
                  )}
                <div ref={chatEnd} />
              </div>

              {/* Input */}
              <div className="px-5 py-4 bg-white border-t border-[#E7DDCF] shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Brief your planner…"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    className="flex-1 min-w-0 bg-[#FBF8F3] border border-[#E7DDCF] rounded-xl
                               px-4 py-2.5 text-sm text-[#3F4A50] placeholder-[#636A78]/40
                               focus:outline-none focus:border-[#C29B5F]
                               focus:ring-2 focus:ring-[#C29B5F]/15 transition-all"
                  />
                  <button
                    type="submit"
                    className="shrink-0 w-10 h-10 bg-[#3F4A50] text-white rounded-xl
                               flex items-center justify-center shadow-md
                               hover:bg-[#C29B5F] active:scale-95 transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="mt-2 text-center text-[8px] font-bold text-[#636A78]/30
                              uppercase tracking-[0.3em]">
                  Encrypted Session Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4 · Bottom Banner ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10"
        >
          {/* Hero image — 8 cols */}
          <div className="xl:col-span-8">
            <div className="relative rounded-2xl overflow-hidden border border-[#E7DDCF]
                            shadow-xl group min-h-[280px] sm:min-h-[320px]">
              <img
                src="/images/about_gala.jpg"
                alt="Elite Event"
                className="w-full h-full object-cover absolute inset-0
                           transition-transform duration-[2000ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r
                              from-[#3F4A50]/90 via-[#3F4A50]/50 to-transparent" />
              <div className="relative z-10 flex flex-col justify-center
                              h-full px-8 sm:px-12 py-10">
                <div className="max-w-md space-y-4">
                  <div className="flex items-center gap-2 text-[#C29B5F]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">
                      Global Standards
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold
                                 text-white leading-tight">
                    Beyond{' '}
                    <span className="text-[#C29B5F]">Expectation.</span>
                    <br />Within Reach.
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                    Our curators select only the world's most breathtaking venues for your review.
                    Every detail is a testament to your legacy.
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 text-white text-xs font-bold
                               uppercase tracking-widest hover:text-[#C29B5F]
                               transition-colors group/link"
                  >
                    Review Exclusive Venues
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Perks — 4 cols */}
          <div className="xl:col-span-4">
            <div className="bg-[#3F4A50] rounded-2xl p-7 sm:p-8 text-white
                            flex flex-col justify-between h-full relative overflow-hidden
                            shadow-xl shadow-black/10 min-h-[280px]">
              <div aria-hidden
                className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                <LayoutGrid className="w-28 h-28" />
              </div>

              <div className="relative z-10">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C29B5F]
                               mb-6 pb-4 border-b border-white/10">
                  Exclusive Privileges
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Priority Venue Scouting', Icon: Compass, sub: 'Global Network' },
                    { name: 'Concierge Support 24/7', Icon: ShieldCheck, sub: 'Instant Access' },
                    { name: 'Curated Vendor Access', Icon: Package, sub: 'Bespoke Selection' },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5
                                 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="p-2.5 bg-[#C29B5F]/15 rounded-lg text-[#C29B5F] shrink-0">
                        <p.Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold tracking-tight truncate">
                          {p.name}
                        </span>
                        <span className="block text-[9px] uppercase tracking-widest
                                         text-white/40 mt-0.5">
                          {p.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="relative z-10 mt-8 pt-5 border-t border-white/10
                            text-[11px] text-white/30 italic text-center leading-relaxed">
                "Excellence is not an act, but a habit."
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default UserDashboard;