'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Check, X, Users, CreditCard, Calendar, ArrowLeft, Loader2, Award } from 'lucide-react';
import { useAppSelector } from '@/store';
import api from '@/services/api';

interface Booking {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  creatorId: {
    _id: string;
    name: string;
    email: string;
  };
  packageName: string;
  eventType: string;
  price: number;
  date: string;
  timeSlot: string;
  location: string;
  status: string;
  totalAmount: number;
  advancePaid: number;
  escrowStatus: string;
}

export default function AdminDashboardPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    escrowHeld: 0,
    escrowRefunded: 0,
    escrowDisbursed: 0
  });

  const fetchAdminData = async () => {
    try {
      const { data } = await api.get('/admin/moderation');
      setBookings(data);

      // Calculate stats
      let held = 0;
      let refunded = 0;
      let disbursed = 0;

      data.forEach((b: Booking) => {
        if (b.escrowStatus === 'held') held += b.advancePaid;
        else if (b.escrowStatus === 'refunded') refunded += b.advancePaid;
        else if (b.escrowStatus === 'disbursed') disbursed += b.advancePaid;
      });

      setStats({
        totalBookings: data.length,
        escrowHeld: held,
        escrowRefunded: refunded,
        escrowDisbursed: disbursed
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  const handleResolveDispute = async (bookingId: string, resolution: 'refund' | 'disburse') => {
    setResolvingId(bookingId);
    try {
      const { data } = await api.post('/admin/moderation', {
        bookingId,
        resolution
      });
      if (data.success) {
        alert(`Dispute successfully resolved with: ${resolution.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-nira-dark font-heading">Access Denied</h2>
        <p className="text-xs text-nira-text-secondary mt-1 mb-4">You do not have administrative privileges to access the moderation desk.</p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-nira-dark text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray text-nira-dark pb-20">
      {/* Header Banner */}
      <div className="bg-nira-dark text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 10% 30%, rgba(239,68,68,0.2), transparent 55%)' }} />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 mb-3 uppercase tracking-widest">
              <ShieldCheck className="w-4.5 h-4.5" /> Platform Admin Desk
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl">Escrow & Booking Moderation</h1>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" /> User Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings Logged', value: stats.totalBookings, icon: Calendar, color: 'border-l-blue-500' },
            { label: 'Escrow Held (🔒 Locked)', value: `₹${stats.escrowHeld.toLocaleString('en-IN')}`, icon: CreditCard, color: 'border-l-nira-yellow' },
            { label: 'Escrow Released to Creators', value: `₹${stats.escrowDisbursed.toLocaleString('en-IN')}`, icon: Award, color: 'border-l-emerald-500' },
            { label: 'Escrow Refunded to Clients', value: `₹${stats.escrowRefunded.toLocaleString('en-IN')}`, icon: Users, color: 'border-l-red-500' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-150 border-l-4 shadow-sm flex items-center justify-between ${stat.color}`}>
                <div>
                  <p className="text-[10px] text-nira-text-secondary font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="font-heading font-black text-lg text-nira-dark mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-nira-text-secondary/20" />
              </div>
            );
          })}
        </div>

        {/* Dispute Queue / Bookings Table */}
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-heading font-black text-sm uppercase tracking-wider">Escrow Registry Queue</h2>
            <button onClick={fetchAdminData} className="text-xs font-bold text-nira-yellow hover:underline">
              Refresh Queue
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-nira-yellow mb-2" />
              <p className="text-xs text-nira-text-secondary">Retrieving registry queue data...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-nira-text-secondary">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-sm text-nira-dark uppercase tracking-wider">No disputes recorded</h3>
              <p className="text-xs mt-1">Escrow and booking history is currently clean.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-nira-gray/30 border-b border-gray-100 text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider">
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Client Detail</th>
                    <th className="p-4">Creator Detail</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Advance Paid</th>
                    <th className="p-4">Escrow Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-nira-gray/10 transition-colors">
                      <td className="p-4 font-bold text-nira-dark">
                        #{b._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{b.clientId?.name || 'Guest'}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.clientId?.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{b.creatorId?.name}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.creatorId?.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark uppercase text-[10px]">{b.eventType}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.packageName}</p>
                      </td>
                      <td className="p-4 font-black text-nira-dark">
                        ₹{b.advancePaid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          b.escrowStatus === 'held' ? 'bg-nira-yellow/20 text-nira-dark'
                          : b.escrowStatus === 'disbursed' ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {b.escrowStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {b.escrowStatus === 'held' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={resolvingId === b._id}
                              onClick={() => handleResolveDispute(b._id, 'disburse')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                            >
                              <Check className="w-3.5 h-3.5" /> Disburse
                            </button>
                            <button
                              disabled={resolvingId === b._id}
                              onClick={() => handleResolveDispute(b._id, 'refund')}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                            >
                              <X className="w-3.5 h-3.5" /> Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-nira-text-secondary font-semibold italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
