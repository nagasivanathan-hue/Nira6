 
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, ArrowLeft, CreditCard, Star, ChevronRight, Zap, PartyPopper, Loader2 } from 'lucide-react';
import { mockCreators, mockBookingPackages } from '@/lib/creatorMockData';
import api from '@/services/api';

function BookingContent() {
  const searchParams = useSearchParams();
  const creatorId = searchParams.get('creator');
  const selectedCreator = mockCreators.find(c => c.id === creatorId) || null;
  const [step, setStep] = useState(1);
  const [selectedCreatorState, setSelectedCreatorState] = useState(selectedCreator);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(searchParams.get('package'));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const pkg = mockBookingPackages.find(p => p.id === selectedPackage);
  const totalAmount = pkg?.price || 0;
  const advanceAmount = Math.round(totalAmount * 0.3);

  const handleCreateBooking = async () => {
    if (!selectedCreatorState || !selectedPackage) return;
    setBookingLoading(true);
    try {
      const payload = {
        creatorId: selectedCreatorState.userId || selectedCreatorState.id,
        packageName: pkg?.name,
        eventType: pkg?.eventType || 'portfolio',
        description: pkg?.description,
        price: totalAmount,
        date: selectedDate,
        timeSlot: selectedTime,
        location: location || 'Remote / Venue',
        totalAmount,
        advancePaid: advanceAmount,
        notes
      };

      const { data } = await api.post('/bookings', payload);
      if (data.success) {
        setBooked(true);
        window.dispatchEvent(new CustomEvent('nira_notification', {
          detail: {
            type: 'push',
            title: '📸 Booking Confirmed!',
            content: `Your shoot with ${selectedCreatorState?.name} on ${selectedDate} is confirmed! Advance of ₹${advanceAmount.toLocaleString('en-IN')} processed.`
          }
        }));
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error(error);
      alert(error.response?.data?.message || 'Failed to complete booking. Scheduling conflict may exist.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate calendar days
  const today = new Date();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return { date: d.toISOString().split('T')[0], day: d.getDate(), weekday: d.toLocaleDateString('en', { weekday: 'short' }), month: d.toLocaleDateString('en', { month: 'short' }), available: (d.getDate() % 5 !== 0), past: false };
  });

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

  if (booked) {
    return (
      <div className="min-h-screen bg-nira-gray flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center border border-gray-100 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="font-heading font-black text-2xl text-nira-dark mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-sm text-nira-text-secondary mb-6">Your shoot has been booked successfully. The creator will confirm within 24 hours.</p>
          <div className="bg-nira-gray rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Creator</span><span className="font-bold text-nira-dark">{selectedCreatorState?.name}</span></div>
            <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Package</span><span className="font-bold text-nira-dark">{pkg?.name}</span></div>
            <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Date</span><span className="font-bold text-nira-dark">{selectedDate}</span></div>
            <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Time</span><span className="font-bold text-nira-dark">{selectedTime}</span></div>
            <div className="flex justify-between text-xs border-t border-gray-200 pt-2 mt-2"><span className="text-nira-text-secondary">Advance Paid</span><span className="font-black text-emerald-600">₹{advanceAmount.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="flex gap-3">
            <Link href="/creators/bookings" className="flex-1 px-4 py-3 bg-nira-dark text-white font-bold text-xs rounded-xl text-center">View Bookings</Link>
            <Link href="/creators" className="flex-1 px-4 py-3 bg-nira-gray text-nira-dark font-bold text-xs rounded-xl text-center">Back to Hub</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/creators" className="flex items-center gap-1.5 text-xs font-bold text-nira-text-secondary hover:text-nira-dark mb-3"><ArrowLeft className="w-3.5 h-3.5" /> Back to Creator Hub</Link>
          <h1 className="font-heading font-black text-xl text-nira-dark flex items-center gap-2"><Calendar className="w-5 h-5 text-nira-yellow" /> Book a Shoot</h1>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {['Creator', 'Package', 'Schedule', 'Confirm'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${step > i + 1 ? 'bg-emerald-100 text-emerald-700' : step === i + 1 ? 'bg-nira-yellow text-nira-dark' : 'bg-nira-gray text-nira-text-secondary'}`}>
                  {step > i + 1 ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>} {s}
                </div>
                {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Creator */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-bold text-base text-nira-dark mb-4">Select a Creator</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {mockCreators.filter(c => c.availability !== 'offline').map(c => (
                  <button key={c.id} onClick={() => { setSelectedCreatorState(c); setStep(2); }}
                    className={`flex items-center gap-3 p-4 bg-white rounded-xl border text-left transition-all cursor-pointer ${selectedCreatorState?.id === c.id ? 'border-nira-yellow shadow-md' : 'border-gray-100 hover:border-nira-yellow/30'}`}>
                    <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1"><p className="font-bold text-xs text-nira-dark truncate">{c.name}</p>{c.verified && <CheckCircle className="w-3 h-3 text-nira-yellow" />}</div>
                      <p className="text-[10px] text-nira-text-secondary truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5"><span className="flex items-center gap-0.5 text-[10px] font-bold"><Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" />{c.rating}</span><span className="text-[10px] text-nira-text-secondary">₹{c.startingPrice.toLocaleString('en-IN')}+</span></div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${c.availability === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Package */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-bold text-base text-nira-dark mb-4">Choose a Package</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {mockBookingPackages.map(p => (
                  <button key={p.id} onClick={() => { setSelectedPackage(p.id); setStep(3); }}
                    className={`block text-left p-5 bg-white rounded-2xl border transition-all cursor-pointer ${selectedPackage === p.id ? 'border-nira-yellow shadow-lg' : 'border-gray-100 hover:border-nira-yellow/30'} ${p.popular ? 'relative' : ''}`}>
                    {p.popular && <span className="absolute -top-2 left-4 px-2 py-0.5 bg-nira-yellow text-nira-dark text-[9px] font-black rounded-full">Popular</span>}
                    <h3 className="font-bold text-sm text-nira-dark mb-1">{p.name}</h3>
                    <p className="text-[11px] text-nira-text-secondary mb-2 line-clamp-2">{p.description}</p>
                    <p className="font-heading font-black text-xl text-nira-dark">₹{p.price.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-nira-text-secondary mb-3">{p.duration}</p>
                    <ul className="space-y-1">{p.deliverables.slice(0, 3).map(d => <li key={d} className="text-[10px] text-nira-text-secondary flex items-center gap-1"><CheckCircle className="w-3 h-3 text-nira-yellow shrink-0" />{d}</li>)}</ul>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-nira-text-secondary hover:text-nira-dark cursor-pointer">← Back to creators</button>
            </motion.div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-bold text-base text-nira-dark mb-4">Pick Date & Time</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-xs text-nira-dark mb-3 uppercase tracking-wider">Select Date</h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.slice(0, 28).map(d => (
                      <button key={d.date} onClick={() => d.available && setSelectedDate(d.date)} disabled={!d.available}
                        className={`aspect-square rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedDate === d.date ? 'bg-nira-yellow text-nira-dark' : d.available ? 'bg-nira-gray text-nira-dark hover:bg-nira-yellow/20' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}>
                        {d.day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                    <h3 className="font-bold text-xs text-nira-dark mb-3 uppercase tracking-wider">Select Time</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map(t => (
                        <button key={t} onClick={() => setSelectedTime(t)} className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedTime === t ? 'bg-nira-dark text-white' : 'bg-nira-gray text-nira-dark hover:bg-nira-dark/5'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-xs text-nira-dark mb-2 uppercase tracking-wider">Shoot Location</h3>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter venue/location" className="w-full px-4 py-2.5 bg-nira-gray rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} className="w-full px-4 py-2.5 bg-nira-gray rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow mt-2 resize-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="text-xs font-bold text-nira-text-secondary hover:text-nira-dark cursor-pointer">← Back</button>
                <button onClick={() => selectedDate && selectedTime && setStep(4)} disabled={!selectedDate || !selectedTime} className="px-6 py-2.5 bg-nira-yellow text-nira-dark font-bold text-xs rounded-xl disabled:opacity-40 cursor-pointer hover:shadow-lg transition-all">Continue →</button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-heading font-bold text-base text-nira-dark mb-4">Review & Confirm</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-bold text-xs text-nira-dark mb-3 uppercase tracking-wider">Booking Summary</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Creator', value: selectedCreatorState?.name || '-' },
                        { label: 'Package', value: pkg?.name || '-' },
                        { label: 'Date', value: selectedDate },
                        { label: 'Time', value: selectedTime },
                        { label: 'Location', value: location || 'Not specified' },
                        { label: 'Duration', value: pkg?.duration || '-' },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between text-xs"><span className="text-nira-text-secondary">{r.label}</span><span className="font-bold text-nira-dark">{r.value}</span></div>
                      ))}
                    </div>
                  </div>
                  {notes && <div className="bg-white rounded-2xl p-5 border border-gray-100"><h3 className="font-bold text-xs text-nira-dark mb-2">Notes</h3><p className="text-xs text-nira-text-secondary">{notes}</p></div>}
                </div>
                <div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-28">
                    <h3 className="font-bold text-xs text-nira-dark mb-3 uppercase tracking-wider">Payment</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Package Total</span><span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-nira-text-secondary">Platform Fee</span><span className="font-bold">₹{Math.round(totalAmount * 0.05).toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between text-xs border-t border-gray-100 pt-2"><span className="font-bold text-nira-dark">Advance (30%)</span><span className="font-black text-nira-dark">₹{advanceAmount.toLocaleString('en-IN')}</span></div>
                      <p className="text-[9px] text-nira-text-secondary">Remaining ₹{(totalAmount - advanceAmount).toLocaleString('en-IN')} due after shoot</p>
                    </div>
                    <button onClick={handleCreateBooking} disabled={bookingLoading}
                      className="w-full px-4 py-3 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-nira-yellow/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Pay ₹{advanceAmount.toLocaleString('en-IN')} & Book
                    </button>
                    <p className="text-[9px] text-center text-nira-text-secondary mt-2 flex items-center justify-center gap-1"><Zap className="w-3 h-3" /> Secure escrow payment</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(3)} className="text-xs font-bold text-nira-text-secondary hover:text-nira-dark mt-4 cursor-pointer">← Back to schedule</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookPage() {
  return <Suspense fallback={<div className="min-h-screen bg-nira-gray flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-nira-yellow border-t-transparent rounded-full" /></div>}><BookingContent /></Suspense>;
}
