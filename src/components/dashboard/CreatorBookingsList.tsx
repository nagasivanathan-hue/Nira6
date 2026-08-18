'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, X, Check } from 'lucide-react';
import api from '@/services/api';

export interface BookingItem {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  packageName: string;
  eventType: string;
  price: number;
  date: string;
  timeSlot: string;
  location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export default function CreatorBookingsList({ initialBookings }: { initialBookings: BookingItem[] }) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus as BookingItem['status'] } : b));
      
      // Emit simulated notification for the action
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: newStatus === 'confirmed' ? '✅ Booking Accepted' : '❌ Booking Declined',
          content: newStatus === 'confirmed' ? 'Client has been notified. Time to get ready!' : 'Client refunded and notified.'
        }
      }));
    } catch {
      alert('Failed to update booking status.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Requests
          </h2>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingBookings.length} New</span>
        </div>
        <div className="p-5">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-xs text-nira-text-secondary">No pending requests at the moment.</div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {pendingBookings.map(booking => (
                  <motion.div 
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-nira-gray rounded-xl gap-4 border border-nira-gray-dark"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                        <img src={booking.clientId?.avatar || '/assets/avatar-placeholder.png'} alt="Client" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-nira-dark">{booking.clientId?.name || 'Unknown Client'}</h3>
                        <p className="text-[10px] font-bold text-nira-text-secondary mt-0.5">{booking.eventType} • {booking.packageName}</p>
                        <div className="flex gap-2 mt-1.5 text-[9px] font-semibold text-neutral-500">
                          <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {new Date(booking.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {booking.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <div className="text-right mr-2 hidden sm:block">
                        <p className="font-black text-sm text-nira-dark">₹{booking.price}</p>
                      </div>
                      <button 
                        onClick={() => updateStatus(booking._id, 'cancelled')}
                        disabled={loadingId === booking._id}
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(booking._id, 'confirmed')}
                        disabled={loadingId === booking._id}
                        className="px-4 py-2 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Active Bookings
          </h2>
        </div>
        <div className="p-5">
          {activeBookings.length === 0 ? (
            <div className="text-center py-8 text-xs text-nira-text-secondary">No active bookings.</div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {activeBookings.map(booking => (
                  <motion.div 
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-50/50 rounded-xl gap-4 border border-emerald-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden shrink-0 mt-0.5">
                        <img src={booking.clientId?.avatar || '/assets/avatar-placeholder.png'} alt="Client" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-nira-dark">{booking.clientId?.name || 'Unknown Client'}</h3>
                        <p className="text-[10px] font-bold text-emerald-700 mt-0.5 uppercase tracking-wider">{booking.packageName}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px] font-medium text-emerald-800">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-600" /> {new Date(booking.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-600" /> {booking.timeSlot}</span>
                          <span className="flex items-center gap-1 col-span-2"><MapPin className="w-3 h-3 text-emerald-600" /> {booking.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                       <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 text-[9px] font-black uppercase tracking-wider rounded-lg">Confirmed</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
