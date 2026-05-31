'use client';
import { useState, useCallback, useRef } from 'react';
import { Plus, Image as ImageIcon, UploadCloud, X, CheckCircle, Calculator, Info } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

const generateId = () => `prod-sell-${Date.now()}`;
const generateSku = () => `SKU-${Date.now().toString().slice(-6)}`;

interface ProductListingFormProps {
  onSuccess: (product: Product) => void;
  sellerName: string;
}

export default function ProductListingForm({ onSuccess, sellerName }: ProductListingFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Cameras',
    originalPrice: '',
    condition: 'Excellent',
    grade: 'A',
    description: '',
    stock: 1,
    sku: '',
  });

  // Dynamic pricing suggestions
  const parsedOriginal = parseFloat(formData.originalPrice);
  const isOriginalValid = !isNaN(parsedOriginal) && parsedOriginal > 0;
  
  // Pricing logic based on condition
  const pricingMultipliers: Record<string, number> = {
    'Mint / Like New': 0.85, // 15% drop
    'Excellent': 0.75,       // 25% drop
    'Good': 0.60,            // 40% drop
    'Needs Repair': 0.35     // 65% drop
  };
  
  const suggestedPrice = isOriginalValid ? Math.round(parsedOriginal * (pricingMultipliers[formData.condition] || 0.75)) : 0;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const simulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      // Simulate adding a placeholder image upon upload
      setImages(prev => [...prev, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60']);
      setUploading(false);
    }, 1200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !isOriginalValid) {
      alert('Please fill out all required fields (Name and Original Price).');
      return;
    }
    
    const finalImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=500&auto=format&fit=crop&q=60';
    
    const created: Product = {
      id: generateId(),
      name: formData.name,
      brand: formData.brand || 'Generic',
      category: formData.category,
      price: suggestedPrice, // Auto-applied CRO pricing
      originalPrice: parsedOriginal,
      discount: parsedOriginal - suggestedPrice,
      image: finalImage,
      images: images.length > 0 ? images : [finalImage],
      condition: formData.condition as 'Like New' | 'Excellent' | 'Good' | 'Fair',
      grade: formData.grade as 'A+' | 'A' | 'B+' | 'B' | 'C',
      warranty: '6 Months Seller Warranty',
      rating: 5.0,
      reviewCount: 0,
      sellerName: sellerName,
      sellerRating: 5.0,
      specs: { 'SKU': formData.sku || generateSku() },
      description: formData.description,
      emiAvailable: suggestedPrice > 10000,
      inStock: Number(formData.stock) > 0,
      featured: false,
      trending: true,
      createdAt: new Date().toISOString()
    };

    onSuccess(created);
    
    // Reset Form
    setFormData({
      name: '', brand: '', category: 'Cameras', originalPrice: '',
      condition: 'Excellent', grade: 'A', description: '', stock: 1, sku: ''
    });
    setImages([]);
  };

  return (
    <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 shadow-sm mb-6">
      <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark mb-4 pb-2 border-b border-nira-gray-dark flex items-center gap-1.5">
        <Plus className="w-4 h-4 text-nira-yellow" /> Fast-List New Gear
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* DRAG AND DROP ZONE */}
        <div>
          <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-2 block">High-Resolution Photos *</label>
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? 'border-nira-yellow bg-nira-yellow/5' : 'border-neutral-300 hover:border-nira-yellow/50 bg-neutral-50 hover:bg-neutral-100/50'
            }`}
          >
            <input aria-label="Input" title="Input" placeholder="Input" type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if(e.target.files?.length) simulateUpload(); }} multiple accept="image/*" />
            <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-nira-yellow text-nira-yellow' : 'text-neutral-400'}`} />
            <h4 className="font-heading font-black text-sm text-nira-dark">Drag & Drop Media Assets</h4>
            <p className="text-xs text-nira-text-secondary mt-1">Upload up to 5 clear photos of the gear. (Simulated upload)</p>
            
            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-nira-yellow font-bold text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-nira-yellow border-t-transparent animate-spin" /> Uploading...
              </div>
            )}
          </div>
          
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-xl border border-neutral-200 overflow-hidden shrink-0 group">
                  <Image src={img} alt="Preview" fill className="object-cover" unoptimized />
                  <button aria-label="Button" title="Button" type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-black uppercase text-center py-0.5">Cover</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1 block">Listing Title *</label>
            <input 
              name="name" type="text" required placeholder="Sony Alpha A7 IV Body Only"
              value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1 block">Brand</label>
            <input 
              name="brand" type="text" placeholder="Sony"
              value={formData.brand} onChange={handleChange}
              className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1 block">Category</label>
            <select aria-label="Select option" title="Select option"
              name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent cursor-pointer"
            >
              <option>Cameras</option>
              <option>Lenses</option>
              <option>Audio</option>
              <option>Lighting</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        {/* CONDITION GRADING TOGGLES */}
        <div>
          <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-2 block">Item Condition & Grade</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'Mint / Like New', grade: 'A+', desc: 'Flawless, open box' },
              { id: 'Excellent', grade: 'A', desc: 'Minor wear, perfect optics' },
              { id: 'Good', grade: 'B', desc: 'Visible wear, fully functional' },
              { id: 'Needs Repair', grade: 'C', desc: 'As-is for parts/repair' }
            ].map(cond => (
              <div 
                key={cond.id}
                onClick={() => setFormData({ ...formData, condition: cond.id, grade: cond.grade })}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${
                  formData.condition === cond.id 
                    ? 'border-nira-yellow bg-nira-yellow/10 shadow-sm' 
                    : 'border-nira-gray-dark hover:border-nira-yellow/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black uppercase ${formData.condition === cond.id ? 'text-nira-dark' : 'text-nira-text-secondary'}`}>
                    {cond.id}
                  </span>
                  {formData.condition === cond.id && <CheckCircle className="w-3.5 h-3.5 text-nira-yellow-dark" />}
                </div>
                <span className="text-[9px] text-nira-text-secondary block">{cond.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRICING AUTOMATION ENGINE */}
        <div className="p-4 bg-gradient-to-r from-neutral-50 to-white border border-neutral-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1 flex items-center gap-1 block">
              Original Retail Price (₹ INR) * <span title="What did you buy it for new?"><Info className="w-3 h-3" /></span>
            </label>
            <input 
              name="originalPrice" type="number" required placeholder="e.g. 199000"
              value={formData.originalPrice} onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-neutral-300 shadow-sm rounded-xl text-sm font-black text-nira-dark focus:outline-none focus:border-nira-yellow focus:ring-2 focus:ring-nira-yellow/20"
            />
            <p className="text-[9px] text-neutral-400 mt-1.5 leading-relaxed">
              Based on the <strong className="text-neutral-600">{formData.condition}</strong> condition, our NIRA6 marketplace algorithm suggests a highly competitive selling price to guarantee a fast sale.
            </p>
          </div>
          
          <div className="bg-nira-dark rounded-xl p-4 text-white relative overflow-hidden shadow-inner flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Calculator className="w-16 h-16" />
            </div>
            <span className="text-[9px] font-bold text-nira-yellow uppercase tracking-widest mb-1">AI Auto-Suggested Price</span>
            {isOriginalValid ? (
              <>
                <div className="flex items-end gap-3 mt-1">
                  <span className="font-heading font-black text-3xl">₹{suggestedPrice.toLocaleString()}</span>
                  <span className="text-xs text-white/50 line-through font-bold pb-1">₹{parsedOriginal.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-1 rounded inline-flex">
                  Selling {Math.round((1 - pricingMultipliers[formData.condition]) * 100)}% cheaper than retail
                </div>
              </>
            ) : (
              <span className="text-xs font-bold text-white/40 mt-1">Enter original price to calculate...</span>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <label className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1 block">Listing Description</label>
          <textarea 
            name="description" required placeholder="Describe any cosmetic scratches, included accessories (caps, hoods), shutter count, etc..."
            value={formData.description} onChange={handleChange}
            className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
            rows={3}
          />
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-nira-yellow/20"
        >
          Publish Listing Instantly
        </button>
      </form>
    </div>
  );
}
