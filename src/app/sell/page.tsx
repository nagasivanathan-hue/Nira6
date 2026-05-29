'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRANDS, SELL_STEPS } from '@/lib/constants';
import { mockBrandModels } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import { Check, ChevronRight, Building2, Smartphone, ClipboardCheck, IndianRupee, CheckCircle, Calendar, PartyPopper, ArrowLeft } from 'lucide-react';
import type { SellStep } from '@/types';

const iconMap: Record<string, React.ElementType> = { Building2, Smartphone, ClipboardCheck, IndianRupee, CheckCircle, Calendar, PartyPopper };

const conditionQuestions = [
  { id: 'cosmetic', label: 'Cosmetic Condition', options: ['Flawless', 'Minor Scratches', 'Visible Wear', 'Heavy Wear'] },
  { id: 'screen', label: 'Screen / Body', options: ['Perfect', 'Light Scratches', 'Cracked', 'Damaged'] },
  { id: 'lens', label: 'Lens / Sensor Condition', options: ['Crystal Clear', 'Minor Dust', 'Scratched', 'Damaged'] },
  { id: 'battery', label: 'Battery Health', options: ['Excellent (90%+)', 'Good (70-90%)', 'Fair (50-70%)', 'Poor (<50%)'] },
  { id: 'functionality', label: 'Overall Functionality', options: ['100% Working', 'Minor Issues', 'Some Features Broken', 'Not Working'] },
  { id: 'accessories', label: 'Original Accessories', options: ['All Included', 'Most Included', 'Few Included', 'None'] },
];

export default function SellPage() {
  const [step, setStep] = useState<SellStep>(1);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [modelSearch, setModelSearch] = useState('');
  const [orderId, setOrderId] = useState('');

  const models = brand ? (mockBrandModels[brand] || []).filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase())) : [];
  const conditionScore = Object.values(conditions).filter((v) => v.includes('Flawless') || v.includes('Perfect') || v.includes('Crystal') || v.includes('Excellent') || v.includes('100%') || v.includes('All')).length;
  const basePrice = brand === 'Sony' ? 85000 : brand === 'Canon' ? 78000 : brand === 'DJI' ? 120000 : 65000;
  const estimatedPrice = Math.round(basePrice * (0.4 + conditionScore * 0.1));

  const canNext = (step === 1 && brand) || (step === 2 && model) || (step === 3 && Object.keys(conditions).length >= 4) || step === 4 || step === 5 || step === 6;

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl lg:text-4xl mb-2">Sell Your Gear</h1>
          <p className="text-nira-text-secondary">Get the best price with our AI-powered valuation</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 mb-10 overflow-x-auto scrollbar-hide">
          {SELL_STEPS.map((s, i) => {
            const Icon = iconMap[s.icon] || Check;
            const isActive = step === s.step;
            const isDone = step > s.step;
            return (
              <div key={s.step} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'bg-nira-yellow text-nira-dark' : isDone ? 'bg-nira-success/10 text-nira-success' : 'bg-white text-nira-text-secondary'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {i < SELL_STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-nira-text-secondary mx-1 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
            {/* Step 1: Brand */}
            {step === 1 && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-6">Select Your Brand</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BRANDS.map((b) => (
                    <button key={b.id} onClick={() => setBrand(b.name)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${brand === b.name ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/50'}`}>
                      <div className="w-12 h-12 bg-nira-dark rounded-xl flex items-center justify-center text-white font-heading font-bold">{b.name.charAt(0)}</div>
                      <span className="font-medium text-sm">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Model */}
            {step === 2 && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-6">Choose Your Model</h2>
                <input type="text" placeholder="Search models..." value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} className="w-full px-4 py-3 bg-nira-gray rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {models.map((m) => (
                    <button key={m} onClick={() => setModel(m)} className={`p-4 rounded-xl border-2 text-left transition-all ${model === m ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/50'}`}>
                      <span className="font-medium">{brand} {m}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Condition */}
            {step === 3 && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-6">Condition Assessment</h2>
                <div className="space-y-5">
                  {conditionQuestions.map((q) => (
                    <div key={q.id}>
                      <label className="text-sm font-medium mb-2 block">{q.label}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <button key={opt} onClick={() => setConditions({ ...conditions, [q.id]: opt })} className={`px-3 py-2 rounded-lg border text-sm transition-all ${conditions[q.id] === opt ? 'border-nira-yellow bg-nira-yellow/10 font-medium' : 'border-nira-gray-dark hover:border-nira-yellow/50'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Price */}
            {step === 4 && (
              <div className="text-center py-8">
                <h2 className="font-heading font-semibold text-xl mb-2">Your Estimated Value</h2>
                <p className="text-nira-text-secondary mb-8">{brand} {model}</p>
                <div className="inline-flex flex-col items-center p-8 bg-gradient-to-br from-nira-yellow/10 to-nira-yellow/5 rounded-3xl border border-nira-yellow/20 mb-6">
                  <span className="text-sm text-nira-text-secondary mb-1">Estimated Price</span>
                  <span className="font-heading font-black text-5xl text-nira-dark">{formatPrice(estimatedPrice)}</span>
                  <span className="text-sm text-nira-success mt-2">Best market value • AI-powered</span>
                </div>
                <p className="text-sm text-nira-text-secondary">Based on current market trends and condition assessment</p>
              </div>
            )}

            {/* Step 5: Accept */}
            {step === 5 && (
              <div className="text-center py-8">
                <h2 className="font-heading font-semibold text-xl mb-6">Accept Your Offer?</h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => setStep(6)} className="px-8 py-3 bg-nira-success text-white font-semibold rounded-xl hover:bg-nira-success/90 transition-colors">Accept {formatPrice(estimatedPrice)}</button>
                  <button className="px-8 py-3 border border-nira-dark text-nira-dark font-semibold rounded-xl hover:bg-nira-gray transition-colors">Negotiate</button>
                  <button className="px-8 py-3 border border-nira-gray-dark text-nira-text-secondary font-semibold rounded-xl hover:bg-nira-gray transition-colors">Save for Later</button>
                </div>
              </div>
            )}

            {/* Step 6: Pickup */}
            {step === 6 && (
              <div>
                <h2 className="font-heading font-semibold text-xl mb-6">Schedule Pickup</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Date</label>
                    <input aria-label="Input" title="Input" placeholder="Input" type="date" className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Slot</label>
                    <select aria-label="Select option" title="Select option" className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow">
                      <option>10:00 AM - 12:00 PM</option>
                      <option>12:00 PM - 2:00 PM</option>
                      <option>2:00 PM - 4:00 PM</option>
                      <option>4:00 PM - 6:00 PM</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Pickup Address</label>
                    <textarea className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" rows={3} placeholder="Enter your full address..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Confirmation */}
            {step === 7 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-nira-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-nira-success" />
                </div>
                <h2 className="font-heading font-semibold text-2xl mb-2">Pickup Scheduled!</h2>
                <p className="text-nira-text-secondary mb-6">Your order has been confirmed</p>
                <div className="inline-block p-6 bg-nira-gray rounded-2xl text-left">
                  <p className="text-sm"><span className="font-medium">Order ID:</span> {orderId}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Item:</span> {brand} {model}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Value:</span> {formatPrice(estimatedPrice)}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Status:</span> <span className="text-nira-success">Pickup Scheduled</span></p>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 7 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-nira-gray-dark">
                <button onClick={() => setStep(Math.max(1, step - 1) as SellStep)} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-nira-gray-dark hover:bg-nira-gray transition-colors disabled:opacity-30">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => {
                  if (step === 6) {
                    setOrderId(`NIRA-${Date.now().toString().slice(-6)}`);
                  }
                  setStep(Math.min(7, step + 1) as SellStep);
                }} disabled={!canNext} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-nira-yellow text-nira-dark hover:bg-nira-yellow-dark transition-colors disabled:opacity-30">
                  {step === 6 ? 'Confirm Pickup' : 'Continue'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
