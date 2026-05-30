import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import User from '@/models/User';
import Service from '@/models/Service';
import Booking from '@/models/Booking';
import CreatorBookingsList from '@/components/dashboard/CreatorBookingsList';
import BarterInbox from '@/components/dashboard/BarterInbox';
import CreatorsGarage from '@/components/dashboard/CreatorsGarage';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { 
  BarChart3, Calendar, MessageSquare, DollarSign, 
  Settings, Briefcase, Plus, Bell, Star, ArrowRightLeft, Camera
} from 'lucide-react';
import Link from 'next/link';

async function getCreatorData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('nira_token')?.value || (await headers()).get('authorization')?.split(' ')[1];
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    await dbConnect();
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'creator') return null;

    const profile = await CreatorProfile.findOne({ userId: user._id });
    const services = await Service.find({ creatorId: profile?._id });
    
    // Fetch all bookings for this creator
    const bookingsRaw = await Booking.find({ creatorId: user._id })
      .populate('clientId', 'name email avatar')
      .sort({ date: -1 })
      .lean();
    
    // Serialize for Client Component
    const bookings = JSON.parse(JSON.stringify(bookingsRaw));

    return { user, profile, services, bookings };
  } catch {
    return null;
  }
}

export default async function CreatorDashboard() {
  const data = await getCreatorData();
  
  if (!data) {
    redirect('/auth/login');
  }

  const { user, profile, services, bookings } = data;
  const activeBookingsCount = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'in_progress').length;

  if (!profile) {
    redirect('/auth/creator/onboarding');
  }

  return (
    <div className="min-h-screen bg-nira-gray py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-nira-gray-dark">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-nira-dark overflow-hidden relative">
              <img src={user.avatar || '/assets/avatar-placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-black text-nira-dark uppercase tracking-wide">
                Welcome, {profile.businessName || user.name}
              </h1>
              <p className="text-sm text-nira-text-secondary font-medium">
                {profile.title} • {profile.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/creators/${profile._id}`} className="px-5 py-2.5 bg-nira-gray text-nira-dark font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all">
              View Public Profile
            </Link>
            <button aria-label="Button" title="Button" className="w-10 h-10 rounded-xl bg-nira-gray flex items-center justify-center text-nira-dark hover:bg-neutral-200 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-nira-gray-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
              <p className="text-xs font-bold text-nira-text-secondary uppercase">Total Earnings</p>
            </div>
            <p className="text-2xl font-black text-nira-dark">₹{user.walletBalance.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-nira-gray-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
              <p className="text-xs font-bold text-nira-text-secondary uppercase">Active Bookings</p>
            </div>
            <p className="text-2xl font-black text-nira-dark">{activeBookingsCount}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-nira-gray-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg"><Star className="w-5 h-5 text-amber-600" /></div>
              <p className="text-xs font-bold text-nira-text-secondary uppercase">Average Rating</p>
            </div>
            <p className="text-2xl font-black text-nira-dark">{profile.rating}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-nira-gray-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg"><Briefcase className="w-5 h-5 text-purple-600" /></div>
              <p className="text-xs font-bold text-nira-text-secondary uppercase">Completed Jobs</p>
            </div>
            <p className="text-2xl font-black text-nira-dark">{profile.completedJobs}</p>
          </div>
        </div>

        {/* Creator Bookings Management */}
        <CreatorBookingsList initialBookings={bookings} />

        {/* Barter Trade Inbox */}
        <BarterInbox />

        {/* Creator's Garage — Personal Gear Inventory */}
        <CreatorsGarage />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Services */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-nira-yellow" /> Active Service Listings
              </h2>
              <button className="text-xs font-bold text-nira-yellow hover:text-amber-500 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add New
              </button>
            </div>
            <div className="p-5">
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-nira-text-secondary">No services listed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service._id.toString()} className="flex items-center justify-between p-4 bg-nira-gray rounded-xl">
                      <div>
                        <h3 className="font-bold text-nira-dark text-sm">{service.title}</h3>
                        <p className="text-xs text-nira-text-secondary mt-1">{service.category} • {service.pricingType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-nira-dark">₹{service.price}</p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Messages */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark p-5">
              <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-nira-gray rounded-xl hover:bg-nira-yellow/20 transition-all text-nira-dark">
                  <BarChart3 className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Analytics</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-nira-gray rounded-xl hover:bg-nira-yellow/20 transition-all text-nira-dark">
                  <MessageSquare className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Messages</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-nira-gray rounded-xl hover:bg-nira-yellow/20 transition-all text-nira-dark">
                  <Calendar className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Calendar</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-nira-gray rounded-xl hover:bg-nira-yellow/20 transition-all text-nira-dark">
                  <Settings className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-bold uppercase">Settings</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-nira-yellow" /> Recent Messages
                </h2>
              </div>
              <div className="p-5 text-center">
                <p className="text-xs text-nira-text-secondary">Your inbox is empty.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
