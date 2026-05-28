'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, UploadCloud, User, MapPin, Briefcase, Camera, FileCheck, Calendar } from 'lucide-react';
import Image from 'next/image';

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Service', icon: Camera },
  { id: 4, title: 'Portfolio', icon: UploadCloud },
  { id: 5, title: 'Verification', icon: FileCheck },
  { id: 6, title: 'Final Setup', icon: Calendar }
];

export default function CreatorOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    profilePhoto: '',
    primaryServiceCategory: 'videographer',
    secondarySkills: '',
    yearsOfExperience: 1,
    bio: '',
    languages: 'English',
    city: '',
    state: '',
    country: 'India',
    serviceTitle: '',
    startingPrice: '',
    pricingType: 'Per Project',
    serviceDescription: '',
    deliveryTime: 3,
    availableForTravel: true,
    portfolioUrls: [] as string[],
    instagram: '',
    youtube: '',
    website: '',
    behance: '',
    govtIdUrl: '',
    selfieUrl: '',
    businessName: '',
    gstNumber: '',
    teamSize: 1,
    serviceRadius: 50,
    acceptTerms: false
  });

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(c => c + 1);
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulate Cloudinary Upload
    setLoading(true);
    setTimeout(() => {
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1612345678/${field}_mock.jpg`;
      if (field === 'portfolioUrls') {
        setFormData(prev => ({ ...prev, portfolioUrls: [...prev.portfolioUrls, mockUrl] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: mockUrl }));
      }
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('nira_token');
      const res = await fetch('/api/creators/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          secondarySkills: formData.secondarySkills.split(',').map(s => s.trim()),
          languages: formData.languages.split(',').map(s => s.trim())
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Onboarding failed');
      }

      router.push('/dashboard/creator');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nira-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-black text-nira-dark uppercase tracking-wider">Creator Onboarding</h2>
          <p className="mt-2 text-sm text-nira-text-secondary">Join the premium network of creative professionals</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-nira-gray-dark -z-10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-nira-yellow transition-all duration-500 ease-in-out" 
                style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
              />
            </div>
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-nira-gray px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? 'border-nira-yellow bg-nira-yellow text-nira-dark shadow-[0_0_15px_rgba(255,218,3,0.4)]' : 
                    isCompleted ? 'border-nira-yellow bg-nira-yellow/20 text-nira-yellow' : 'border-nira-gray-dark bg-white text-nira-text-secondary'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${isActive ? 'text-nira-dark' : 'text-nira-text-secondary'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={currentStep === 6 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="bg-white rounded-3xl p-8 shadow-sm border border-nira-gray-dark min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* STEP 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Basic Information</h3>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Full Name</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow focus:ring-0 text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow focus:ring-0 text-sm" placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Profile Photo (Simulated Cloudinary)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'profilePhoto')} className="w-full text-sm" />
                    {formData.profilePhoto && <p className="text-xs text-green-600 mt-2">Uploaded successfully!</p>}
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Professional Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Primary Category</label>
                      <select value={formData.primaryServiceCategory} onChange={e => setFormData({...formData, primaryServiceCategory: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm">
                        <option value="photographer">Photographer</option>
                        <option value="videographer">Videographer</option>
                        <option value="editor">Video Editor</option>
                        <option value="drone_operator">Drone Operator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Years of Experience</label>
                      <input type="number" required min="0" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Bio / About You</label>
                    <textarea required rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm resize-none" placeholder="Tell clients about your creative journey..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">City</label>
                      <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">State</label>
                      <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Country</label>
                      <input type="text" required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Service Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Primary Service Listing</h3>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Service Title</label>
                    <input type="text" required value={formData.serviceTitle} onChange={e => setFormData({...formData, serviceTitle: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" placeholder="e.g. Cinematic Wedding Videography" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Starting Price (₹)</label>
                      <input type="number" required min="0" value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Pricing Type</label>
                      <select value={formData.pricingType} onChange={e => setFormData({...formData, pricingType: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm">
                        <option>Hourly</option>
                        <option>Per Project</option>
                        <option>Per Day</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Service Description</label>
                    <textarea required rows={4} value={formData.serviceDescription} onChange={e => setFormData({...formData, serviceDescription: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm resize-none" />
                  </div>
                </div>
              )}

              {/* STEP 4: Portfolio */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Portfolio & Socials</h3>
                  <div>
                    <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Upload Portfolio Media (Drag & Drop)</label>
                    <div className="border-2 border-dashed border-nira-gray-dark hover:border-nira-yellow rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative">
                      <input type="file" multiple accept="image/*,video/*" onChange={(e) => handleUpload(e, 'portfolioUrls')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <UploadCloud className="w-10 h-10 text-nira-text-secondary mb-3" />
                      <p className="text-sm font-bold text-nira-dark">Click or drag media here</p>
                      <p className="text-xs text-nira-text-secondary mt-1">Supports JPG, PNG, MP4 up to 50MB</p>
                    </div>
                    {formData.portfolioUrls.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto">
                        {formData.portfolioUrls.map((url, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg bg-nira-gray overflow-hidden relative shrink-0">
                            <Image src={url} alt="portfolio" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Instagram (Optional)</label>
                      <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" placeholder="instagram.com/" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">YouTube (Optional)</label>
                      <input type="text" value={formData.youtube} onChange={e => setFormData({...formData, youtube: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" placeholder="youtube.com/" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Verification */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Verification & KYC</h3>
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs flex gap-3">
                    <FileCheck className="w-5 h-5 shrink-0" />
                    <p>To maintain platform trust, we require government ID verification. Your data is encrypted and stored securely.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Upload Govt ID</label>
                      <input type="file" required onChange={(e) => handleUpload(e, 'govtIdUrl')} className="w-full text-sm" />
                      {formData.govtIdUrl && <p className="text-xs text-green-600 mt-2">ID Uploaded</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Take a Selfie</label>
                      <input type="file" required accept="image/*" capture="user" onChange={(e) => handleUpload(e, 'selfieUrl')} className="w-full text-sm" />
                      {formData.selfieUrl && <p className="text-xs text-green-600 mt-2">Selfie Uploaded</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Business Name (Optional)</label>
                      <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">GST Number (Optional)</label>
                      <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Final Setup */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-heading font-bold text-nira-dark">Final Setup</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Service Radius (KM)</label>
                      <input type="number" required min="1" value={formData.serviceRadius} onChange={e => setFormData({...formData, serviceRadius: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-nira-text-secondary uppercase mb-2">Team Size</label>
                      <input type="number" required min="1" value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-nira-gray border-transparent focus:border-nira-yellow text-sm" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-8">
                    <input type="checkbox" id="terms" required checked={formData.acceptTerms} onChange={e => setFormData({...formData, acceptTerms: e.target.checked})} className="mt-1 w-4 h-4 rounded text-nira-yellow focus:ring-nira-yellow" />
                    <label htmlFor="terms" className="text-sm text-nira-text-secondary leading-relaxed">
                      I agree to NIRA6's Creator Terms of Service, Payment Policy, and Cancellation Rules. I confirm that all submitted portfolio media is originally created by me or my team.
                    </label>
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto pt-8 flex items-center justify-between border-t border-nira-gray-dark">
            <button 
              type="button" 
              onClick={handlePrev} 
              disabled={currentStep === 1 || loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${currentStep === 1 ? 'opacity-0' : 'bg-nira-gray text-nira-text-secondary hover:bg-neutral-200'}`}
            >
              Back
            </button>
            <button 
              type={currentStep === 6 ? 'submit' : 'button'} 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-nira-yellow hover:bg-amber-400 text-nira-dark flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Processing...' : currentStep === 6 ? 'Complete Onboarding' : 'Next Step'}
              {!loading && currentStep < 6 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
