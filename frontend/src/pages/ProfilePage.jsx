import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Shield, Camera, Save, RefreshCw, UserCheck } from 'lucide-react';
import { updateProfile } from '../store/slices/authSlice';
import { fetchDashboardData } from '../store/slices/userAccountSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { dashboard } = useSelector((state) => state.userAccount);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    gender: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  // Fetch dashboard data for bookings count
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
        gender: user.gender || '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({
        name: form.name,
        mobileNumber: form.mobileNumber,
        address: form.address,
        gender: form.gender,
      })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#0f0e17] text-[#f8f5f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#C9A84C] mb-2">Member Profile</h1>
            <p className="text-gray-400">Manage your account details and preferences.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#C9A84C]/10 px-4 py-2 rounded-full border border-[#C9A84C]/20">
            <Shield className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Verified Member</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Photo */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-white/5 text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-[#C9A84C]/30 flex items-center justify-center bg-[#0f0e17] overflow-hidden">
                  <User className="w-16 h-16 text-gray-700" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[#C9A84C] text-[#0f0e17] rounded-full hover:bg-[#B69640] transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-serif font-bold mb-1">{user?.name}</h2>
              <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">Valued Member</p>
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 italic">Member Since</span>
                  <span className="font-medium">{memberSince}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 italic">Total Bookings</span>
                  <span className="font-medium">{dashboard?.bookings?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 italic">Active Inquiries</span>
                  <span className="font-medium">{dashboard?.inquiries?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-[#1a1a2e] p-8 rounded-2xl border border-white/5 shadow-xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <UserCheck className="w-3 h-3 text-[#C9A84C]" /> Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="text" 
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-[#C9A84C]" /> Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                      type="email" 
                      name="email"
                      value={form.email}
                      disabled
                      className="w-full bg-[#0f0e17]/50 border border-white/5 rounded-lg pl-12 pr-4 py-3 opacity-60 cursor-not-allowed"
                      placeholder="email@example.com"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-600 italic">* Email cannot be changed for security reasons.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#C9A84C]" /> Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input 
                        type="tel" 
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        className="w-full bg-[#0f0e17] border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      Gender Identity
                    </label>
                    <select 
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    >
                      <option value="">Select Identity</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#C9A84C]" /> Primary Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-600" />
                    <textarea 
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-[#0f0e17] border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                      placeholder="Enter your mailing address..."
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-grow md:flex-none md:min-w-[180px] bg-[#C9A84C] hover:bg-[#B69640] text-[#0f0e17] font-bold uppercase tracking-widest py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={handleReset}
                    className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    Reset Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
