'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Truck, Clock, Search, CheckCircle } from 'lucide-react';

const repairCategories = ['Camera Body', 'Lens', 'Drone', 'Gimbal', 'Lighting', 'Audio Equipment'];
const commonIssues: Record<string, string[]> = {
  'Camera Body': ['Shutter Malfunction', 'Sensor Cleaning', 'LCD Screen Cracked', 'Autofocus Issues', 'Battery Not Charging'],
  'Lens': ['Focus Ring Stuck', 'Aperture Blades', 'Element Scratched', 'IS/VR Motor', 'Mount Damage'],
  'Drone': ['Gimbal Calibration', 'Motor Replacement', 'GPS Issues', 'Camera Damage', 'Battery Issue'],
  'Gimbal': ['Motor Failure', 'Calibration', 'Axis Lock Broken', 'Connectivity Issues'],
  'Lighting': ['LED Panel Dead Pixels', 'Fan Noise', 'Power Supply', 'Mount Broken'],
  'Audio Equipment': ['Static/Noise', 'Connector Damage', 'Phantom Power', 'Capsule Damage'],
};

export default function RepairPage() {
  const [category, setCategory] = useState('');
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');

  if (submitted) {
    return (
      <div className="min-h-screen bg-nira-gray flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-nira-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-nira-success" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2">Request Submitted!</h2>
          <p className="text-nira-text-secondary mb-4">Our technician will review your request and contact you within 24 hours.</p>
          <p className="text-sm bg-nira-gray rounded-xl p-3">Request ID: <span className="font-mono font-bold">{requestId}</span></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl lg:text-4xl mb-2">Repair Services</h1>
          <p className="text-nira-text-secondary">Professional diagnostics and repair by certified technicians</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {[
            { icon: Search, label: 'Free Diagnostics' },
            { icon: Truck, label: 'Free Pickup' },
            { icon: Clock, label: '48hr Turnaround' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-2.5 sm:p-4 bg-white rounded-xl text-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-nira-yellow" />
              <span className="text-[10px] sm:text-sm font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
          <h2 className="font-heading font-semibold text-xl mb-6">Submit Repair Request</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Device Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {repairCategories.map((cat) => (
                  <button key={cat} onClick={() => { setCategory(cat); setIssue(''); }} className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${category === cat ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {category && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="text-sm font-medium mb-2 block">What&apos;s the issue?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(commonIssues[category] || []).map((iss) => (
                    <button key={iss} onClick={() => setIssue(iss)} className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${issue === iss ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/50'}`}>
                      {iss}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Brand & Model</label>
              <input type="text" placeholder="e.g., Sony A7 III, Canon RF 70-200mm" className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Details</label>
              <textarea rows={3} placeholder="Describe the issue in detail..." className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <input type="text" placeholder="Full name" className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 bg-nira-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
              </div>
            </div>
            <button onClick={() => {
              setRequestId(`RPR-${Date.now().toString().slice(-6)}`);
              setSubmitted(true);
            }} className="w-full py-3.5 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors flex items-center justify-center gap-2">
              <Wrench className="w-5 h-5" /> Submit Repair Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
