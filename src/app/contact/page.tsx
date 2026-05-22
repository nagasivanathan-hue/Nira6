'use client';
import { useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare, Clock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' });
      
      // Dispatch simulated notification
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '📨 Message Sent!',
          content: 'Thank you for reaching out! Our Madurai studio team will reply within 24 hours.'
        }
      }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-nira-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nira-yellow/20 border border-nira-yellow/30 text-nira-dark text-[10px] font-black tracking-widest uppercase mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Studio Headquarters
          </div>
          <h1 className="font-heading font-black text-4xl text-nira-dark uppercase tracking-wide mb-4">Contact NIRA6 Studio</h1>
          <p className="text-nira-text-secondary text-sm md:text-base leading-relaxed">
            Need diagnostic inspection support, seller verification, or custom expert gear assistance? 
            Reach out to our creative team directly at our Madurai base.
          </p>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info & Google Maps */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-heading font-extrabold text-lg text-nira-dark uppercase tracking-wider mb-2">Studio Details</h2>
            
            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-10 h-10 bg-nira-dark text-nira-yellow rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-nira-dark uppercase tracking-wider mb-1">Email Us</h3>
                  <a href="mailto:nira6studio@gmail.com" className="text-xs text-nira-text-secondary hover:text-nira-yellow transition-colors block break-all font-bold">
                    nira6studio@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-10 h-10 bg-nira-dark text-nira-yellow rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-nira-dark uppercase tracking-wider mb-1">Our Base</h3>
                  <p className="text-xs text-nira-text-secondary font-bold">
                    Madurai, India
                  </p>
                </div>
              </div>

              <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-10 h-10 bg-nira-dark text-nira-yellow rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-nira-dark uppercase tracking-wider mb-1">Call Support</h3>
                  <a href="tel:+919876543210" className="text-xs text-nira-text-secondary hover:text-nira-yellow transition-colors block font-bold">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 hover:shadow-md transition-all flex items-start gap-4">
                <div className="w-10 h-10 bg-nira-dark text-nira-yellow rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-nira-dark uppercase tracking-wider mb-1">Studio Hours</h3>
                  <p className="text-xs text-nira-text-secondary font-bold">
                    Mon - Sat: 9 AM - 6 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Service */}
            <div className="bg-white border border-nira-gray-dark rounded-3xl p-4 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-nira-yellow" />
                  <span className="font-heading font-black text-xs text-nira-dark uppercase tracking-wider">Google Map Service</span>
                </div>
                <span className="text-[9px] bg-nira-success/10 text-nira-success px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">HQ Geolocation Verified</span>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-nira-gray/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15720.573217431782!2d78.1130985558488!3d9.92520067332711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b118d53f%3A0x34cdfb07b9094c63!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="NIRA6 Studio Madurai Headquarters Location"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-nira-gray-dark rounded-3xl p-8 shadow-sm">
              <h2 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-nira-yellow" /> Direct Message Portal
              </h2>
              <p className="text-nira-text-secondary text-xs mb-6">
                Fill in the verified inquiry slots below. Our AI CRM routing filters tickets to specialists.
              </p>

              {submitted ? (
                <div className="bg-nira-success/10 border border-nira-success/30 rounded-2xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-nira-success mx-auto mb-3" />
                  <h3 className="font-heading font-extrabold text-sm text-nira-dark uppercase tracking-wider">Message Sent Successfully!</h3>
                  <p className="text-nira-text-secondary text-xs mt-2 max-w-md mx-auto">
                    Your inquiry has been cataloged at our Madurai support desk. We have sent a copy to your email address and logged a dynamic live status push update.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-nira-dark text-white text-xs font-black uppercase rounded-xl hover:bg-nira-yellow hover:text-nira-dark transition-all tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-nira-dark uppercase tracking-wider mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-nira-gray/30 border border-nira-gray-dark rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-dark uppercase tracking-wider mb-1">Your Email *</label>
                      <input 
                        type="email" 
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-nira-gray/30 border border-nira-gray-dark rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-nira-dark uppercase tracking-wider mb-1">Inquiry Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-nira-gray/30 border border-nira-gray-dark rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Buy & Delivery Support">Buy & Delivery Support</option>
                      <option value="Seller Gear Inspections">Seller Gear Inspections</option>
                      <option value="Technical Repair Diagnostics">Technical Repair Diagnostics</option>
                      <option value="Partnership / Collaborations">Partnership / Collaborations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-nira-dark uppercase tracking-wider mb-1">Inquiry Details / Message *</label>
                    <textarea 
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your comprehensive support details here..."
                      className="w-full px-4 py-3 bg-nira-gray/30 border border-nira-gray-dark rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-nira-gray/40 border border-nira-gray-dark rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-nira-success shrink-0" />
                    <span className="text-[10px] text-nira-text-secondary leading-relaxed">
                      NIRA6 respects creator confidentiality. All contacts are routed through secure, encrypted SSL channels.
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-3.5 bg-nira-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-nira-yellow hover:text-nira-dark cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting Inquiries...' : 'Send Message'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
