/* ═══════════════════════════════════════════════════════════
   NIRA6 — Mock Data
   Comprehensive mock data for all platform features
   ═══════════════════════════════════════════════════════════ */

import type { Product, RentalItem, CreatorService, Freelancer, Review, Testimonial, BlogPost, WalletTransaction } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Sony Alpha A7 III', brand: 'Sony', category: 'cameras',
    price: 89999, originalPrice: 149999, discount: 40, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Excellent', grade: 'A+',
    warranty: '6 months', rating: 4.8, reviewCount: 124, sellerName: 'CameraHub',
    sellerRating: 4.9, emiAvailable: true, inStock: true, featured: true, trending: true,
    createdAt: '2026-05-10', description: 'Full-frame mirrorless camera with 24.2MP sensor, 4K HDR video, and 693 phase-detection AF points. Perfect for professional photography and videography.',
    specs: { 'Sensor': '24.2MP Full Frame', 'Video': '4K HDR', 'ISO': '100-51200', 'AF Points': '693', 'Battery': '710 shots', 'Weight': '650g' },
  },
  {
    id: 'p2', name: 'Canon EOS R6 Mark II', brand: 'Canon', category: 'cameras',
    price: 112999, originalPrice: 175000, discount: 35, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Like New', grade: 'A+',
    warranty: '12 months', rating: 4.9, reviewCount: 89, sellerName: 'ProGear India',
    sellerRating: 4.8, emiAvailable: true, inStock: true, featured: true, trending: true,
    createdAt: '2026-05-08', description: 'Advanced full-frame mirrorless with 24.2MP CMOS sensor, up to 40fps continuous shooting, and 6K RAW video. A versatile powerhouse for creators.',
    specs: { 'Sensor': '24.2MP Full Frame', 'Video': '6K RAW', 'ISO': '100-102400', 'AF Points': '1053', 'FPS': '40fps', 'Weight': '670g' },
  },
  {
    id: 'p3', name: 'DJI Mavic 3 Pro', brand: 'DJI', category: 'drones',
    price: 145000, originalPrice: 195000, discount: 26, image: '/assets/product-drone.png',
    images: ['/assets/product-drone.png'], condition: 'Excellent', grade: 'A',
    warranty: '6 months', rating: 4.7, reviewCount: 56, sellerName: 'DroneZone',
    sellerRating: 4.6, emiAvailable: true, inStock: true, featured: true, trending: false,
    createdAt: '2026-05-05', description: 'Triple-camera drone with Hasselblad main camera, 43-min flight time, and omnidirectional obstacle sensing.',
    specs: { 'Camera': 'Hasselblad 20MP', 'Video': '5.1K', 'Flight Time': '43 min', 'Range': '15km', 'Weight': '958g' },
  },
  {
    id: 'p4', name: 'Canon RF 70-200mm f/2.8L', brand: 'Canon', category: 'lenses',
    price: 142000, originalPrice: 195000, discount: 27, image: '/assets/product-lens.png',
    images: ['/assets/product-lens.png'], condition: 'Excellent', grade: 'A+',
    warranty: '6 months', rating: 4.9, reviewCount: 42, sellerName: 'LensKraft',
    sellerRating: 5.0, emiAvailable: true, inStock: true, featured: false, trending: true,
    createdAt: '2026-05-12', description: 'Professional zoom lens with constant f/2.8 aperture, Nano USM motor, and image stabilization up to 5 stops.',
    specs: { 'Mount': 'Canon RF', 'Aperture': 'f/2.8', 'Focal Length': '70-200mm', 'IS': '5 stops', 'Weight': '1070g' },
  },
  {
    id: 'p5', name: 'Godox SL-200W II', brand: 'Godox', category: 'lighting',
    price: 18999, originalPrice: 28000, discount: 32, image: '/assets/product-lighting.png',
    images: ['/assets/product-lighting.png'], condition: 'Good', grade: 'B+',
    warranty: '3 months', rating: 4.5, reviewCount: 78, sellerName: 'LightWorks',
    sellerRating: 4.4, emiAvailable: false, inStock: true, featured: false, trending: true,
    createdAt: '2026-05-01', description: '200W LED continuous light with Bowens mount, silent fan mode, and wireless control via app.',
    specs: { 'Power': '200W', 'CRI': '97+', 'Color Temp': '5600K', 'Mount': 'Bowens', 'Control': 'App + Remote' },
  },
  {
    id: 'p6', name: 'DJI RS 3 Pro', brand: 'DJI', category: 'gimbals',
    price: 32999, originalPrice: 44900, discount: 27, image: '/assets/product-gimbal.png',
    images: ['/assets/product-gimbal.png'], condition: 'Like New', grade: 'A+',
    warranty: '6 months', rating: 4.7, reviewCount: 63, sellerName: 'StabilizerPro',
    sellerRating: 4.7, emiAvailable: true, inStock: true, featured: true, trending: false,
    createdAt: '2026-05-09', description: 'Professional 3-axis gimbal with 4.5kg payload, LiDAR focus, and automated axis locks.',
    specs: { 'Payload': '4.5kg', 'Battery': '12 hrs', 'Focus': 'LiDAR', 'Weight': '1.5kg', 'Axis Lock': 'Automated' },
  },
  {
    id: 'p7', name: 'Rode NTG5', brand: 'Rode', category: 'microphones',
    price: 34999, originalPrice: 45000, discount: 22, image: '/assets/product-microphone.png',
    images: ['/assets/product-microphone.png'], condition: 'Excellent', grade: 'A',
    warranty: '6 months', rating: 4.8, reviewCount: 35, sellerName: 'AudioCraft',
    sellerRating: 4.9, emiAvailable: false, inStock: true, featured: false, trending: true,
    createdAt: '2026-05-11', description: 'Broadcast-quality shotgun microphone with ultra-low noise and natural, transparent audio capture.',
    specs: { 'Pattern': 'Supercardioid', 'Freq Range': '20Hz-20kHz', 'Noise': '10dB', 'Phantom': '24/48V', 'Weight': '76g' },
  },
  {
    id: 'p8', name: 'Sony FX30', brand: 'Sony', category: 'cameras',
    price: 134000, originalPrice: 180000, discount: 26, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Good', grade: 'A',
    warranty: '6 months', rating: 4.6, reviewCount: 91, sellerName: 'CineGear',
    sellerRating: 4.5, emiAvailable: true, inStock: true, featured: true, trending: true,
    createdAt: '2026-05-07', description: 'Cinema Line camera with APS-C sensor, 4K 120fps, S-Cinetone color science, and advanced AF system.',
    specs: { 'Sensor': '26MP APS-C', 'Video': '4K 120fps', 'ISO': '100-32000', 'Color': 'S-Cinetone', 'Weight': '562g' },
  },
  {
    id: 'p9', name: 'Nikon Z6 III', brand: 'Nikon', category: 'cameras',
    price: 145000, originalPrice: 190000, discount: 24, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Like New', grade: 'A+',
    warranty: '12 months', rating: 4.8, reviewCount: 47, sellerName: 'NikonPro',
    sellerRating: 4.8, emiAvailable: true, inStock: true, featured: false, trending: true,
    createdAt: '2026-05-06', description: 'Full-frame mirrorless with partially stacked CMOS sensor, 6K RAW, and real-time subject detection.',
    specs: { 'Sensor': '24.5MP Full Frame', 'Video': '6K RAW', 'ISO': '100-64000', 'EVF': '5.76M dots', 'Weight': '760g' },
  },
  {
    id: 'p10', name: 'Sigma 35mm f/1.4 DG DN', brand: 'Sigma', category: 'lenses',
    price: 52000, originalPrice: 72000, discount: 28, image: '/assets/product-lens.png',
    images: ['/assets/product-lens.png'], condition: 'Excellent', grade: 'A',
    warranty: '6 months', rating: 4.7, reviewCount: 88, sellerName: 'OpticMaster',
    sellerRating: 4.6, emiAvailable: true, inStock: true, featured: false, trending: false,
    createdAt: '2026-05-03', description: 'Premium Art series prime lens with exceptional sharpness and beautiful bokeh.',
    specs: { 'Mount': 'Sony E / L-Mount', 'Aperture': 'f/1.4', 'Focal Length': '35mm', 'Weight': '645g', 'Elements': '15' },
  },
  {
    id: 'p11', name: 'GoPro HERO12 Black', brand: 'GoPro', category: 'cameras',
    price: 28999, originalPrice: 41500, discount: 30, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Good', grade: 'B+',
    warranty: '3 months', rating: 4.4, reviewCount: 156, sellerName: 'ActionCam',
    sellerRating: 4.3, emiAvailable: false, inStock: true, featured: false, trending: true,
    createdAt: '2026-05-02', description: 'Waterproof action camera with HyperSmooth 6.0, 5.3K video, and HDR photo.',
    specs: { 'Video': '5.3K 60fps', 'Stabilization': 'HyperSmooth 6.0', 'Waterproof': '10m', 'Battery': '1720mAh', 'Weight': '154g' },
  },
  {
    id: 'p12', name: 'Fujifilm X-T5', brand: 'Fujifilm', category: 'cameras',
    price: 119000, originalPrice: 160000, discount: 26, image: '/assets/product-camera.png',
    images: ['/assets/product-camera.png'], condition: 'Excellent', grade: 'A+',
    warranty: '6 months', rating: 4.8, reviewCount: 72, sellerName: 'FujiWorld',
    sellerRating: 4.9, emiAvailable: true, inStock: true, featured: true, trending: false,
    createdAt: '2026-05-04', description: '40.2MP APS-C mirrorless with classic design, in-body stabilization, and stunning color science.',
    specs: { 'Sensor': '40.2MP APS-C', 'Video': '6.2K', 'IBIS': '7 stops', 'Film Sim': '19 modes', 'Weight': '557g' },
  },
];

export const mockRentals: RentalItem[] = [
  { id: 'r1', name: 'Sony A7S III', brand: 'Sony', category: 'cameras', image: '/assets/product-camera.png', dailyRate: 3500, hourlyRate: 500, securityDeposit: 25000, available: true, rating: 4.9, reviewCount: 45, location: 'Mumbai', owner: 'RentalHub' },
  { id: 'r2', name: 'DJI Inspire 3', brand: 'DJI', category: 'drones', image: '/assets/product-drone.png', dailyRate: 8000, hourlyRate: 1200, securityDeposit: 50000, available: true, rating: 4.8, reviewCount: 23, location: 'Delhi', owner: 'DroneRentals' },
  { id: 'r3', name: 'Aputure 600d Pro', brand: 'Aputure', category: 'lighting', image: '/assets/product-lighting.png', dailyRate: 2500, hourlyRate: 400, securityDeposit: 15000, available: false, rating: 4.7, reviewCount: 67, location: 'Bangalore', owner: 'LightRent' },
  { id: 'r4', name: 'Canon CN-E 70-200mm T4.4', brand: 'Canon', category: 'lenses', image: '/assets/product-lens.png', dailyRate: 5000, hourlyRate: 800, securityDeposit: 35000, available: true, rating: 4.9, reviewCount: 31, location: 'Chennai', owner: 'CineLens' },
  { id: 'r5', name: 'DJI Ronin 4D', brand: 'DJI', category: 'gimbals', image: '/assets/product-gimbal.png', dailyRate: 6000, hourlyRate: 900, securityDeposit: 40000, available: true, rating: 4.8, reviewCount: 19, location: 'Hyderabad', owner: 'StabRentals' },
  { id: 'r6', name: 'Sennheiser MKH 416', brand: 'Sennheiser', category: 'microphones', image: '/assets/product-microphone.png', dailyRate: 1500, hourlyRate: 250, securityDeposit: 10000, available: true, rating: 4.6, reviewCount: 54, location: 'Mumbai', owner: 'AudioRent' },
];

const freelancersList: Freelancer[] = [
  { id: 'f1', name: 'Arjun Mehta', avatar: '', title: 'Senior Video Editor', rating: 4.9, completedJobs: 234, location: 'Mumbai', verified: true, level: 'Elite' },
  { id: 'f2', name: 'Priya Sharma', avatar: '', title: 'Professional Photographer', rating: 4.8, completedJobs: 178, location: 'Delhi', verified: true, level: 'Top Rated' },
  { id: 'f3', name: 'Rahul Verma', avatar: '', title: 'Drone Pilot & Filmmaker', rating: 4.7, completedJobs: 92, location: 'Bangalore', verified: true, level: 'Pro' },
  { id: 'f4', name: 'Sneha Patel', avatar: '', title: 'Photo Retoucher', rating: 4.9, completedJobs: 312, location: 'Hyderabad', verified: true, level: 'Elite' },
  { id: 'f5', name: 'Vikram Singh', avatar: '', title: 'Motion Graphics Artist', rating: 4.6, completedJobs: 145, location: 'Chennai', verified: true, level: 'Pro' },
  { id: 'f6', name: 'Ananya Krishnan', avatar: '', title: 'Thumbnail Designer', rating: 4.8, completedJobs: 456, location: 'Pune', verified: true, level: 'Top Rated' },
];

export const mockServices: CreatorService[] = [
  { id: 's1', title: 'Professional Video Editing for YouTube', category: 'Video Editing', freelancer: freelancersList[0], price: 5000, deliveryDays: 3, rating: 4.9, reviewCount: 178, image: '/assets/product-camera.png', description: 'High-quality video editing with color grading, transitions, and sound design for YouTube creators.', tags: ['YouTube', 'Color Grading', 'Premiere Pro'] },
  { id: 's2', title: 'Product Photography Session', category: 'Photography', freelancer: freelancersList[1], price: 8000, deliveryDays: 2, rating: 4.8, reviewCount: 92, image: '/assets/product-camera.png', description: 'Professional product photography with studio lighting setup and post-processing.', tags: ['Product', 'Studio', 'E-commerce'] },
  { id: 's3', title: 'Cinematic Drone Videography', category: 'Drone Piloting', freelancer: freelancersList[2], price: 15000, deliveryDays: 5, rating: 4.7, reviewCount: 56, image: '/assets/product-drone.png', description: 'Stunning aerial videography for real estate, events, and commercial projects.', tags: ['Aerial', 'Cinematic', '4K'] },
  { id: 's4', title: 'Advanced Photo Retouching', category: 'Photo Editing', freelancer: freelancersList[3], price: 2000, deliveryDays: 1, rating: 4.9, reviewCount: 234, image: '/assets/product-camera.png', description: 'Professional retouching including skin smoothing, color correction, and compositing.', tags: ['Retouching', 'Photoshop', 'Beauty'] },
  { id: 's5', title: 'Motion Graphics & VFX', category: 'Motion Graphics', freelancer: freelancersList[4], price: 12000, deliveryDays: 7, rating: 4.6, reviewCount: 67, image: '/assets/product-camera.png', description: 'Custom motion graphics, intro animations, and visual effects for videos.', tags: ['After Effects', '3D', 'Animation'] },
  { id: 's6', title: 'YouTube Thumbnail Design Pack', category: 'Thumbnail Design', freelancer: freelancersList[5], price: 1500, deliveryDays: 1, rating: 4.8, reviewCount: 345, image: '/assets/product-camera.png', description: 'Eye-catching YouTube thumbnail designs with high CTR optimization.', tags: ['YouTube', 'Thumbnails', 'Design'] },
];

export const mockTestimonials: Testimonial[] = [
  { id: 't1', name: 'Aditya Kapoor', avatar: '', role: 'YouTuber · 500K Subscribers', comment: 'NIRA6 helped me upgrade my entire setup at 40% less than new prices. The AI valuation was spot-on and the quality was incredible!', rating: 5 },
  { id: 't2', name: 'Meera Nair', avatar: '', role: 'Wedding Photographer', comment: 'I rent equipment from NIRA6 for all my shoots. The availability calendar and damage protection make it stress-free.', rating: 5 },
  { id: 't3', name: 'Rohan Desai', avatar: '', role: 'Indie Filmmaker', comment: 'Sold my old Canon setup and bought a Sony system through NIRA6. The entire process was seamless and I got a great deal.', rating: 4 },
  { id: 't4', name: 'Kavya Reddy', avatar: '', role: 'Content Creator', comment: 'Found an amazing video editor through NIRA6 services. My content quality jumped 10x and my audience loves it!', rating: 5 },
];

export const mockBlogPosts: BlogPost[] = [
  { id: 'b1', title: 'Best Cameras for YouTube in 2026', excerpt: 'A comprehensive guide to choosing the perfect camera for your YouTube channel, from budget to professional options.', image: '/assets/product-camera.png', author: 'NIRA6 Team', date: '2026-05-10', category: 'Guides', readTime: '8 min' },
  { id: 'b2', title: 'How to Price Your Used Camera Gear', excerpt: 'Learn the factors that determine used equipment value and how to get the best price when selling your gear.', image: '/assets/product-lens.png', author: 'Priya Singh', date: '2026-05-08', category: 'Selling Tips', readTime: '5 min' },
  { id: 'b3', title: 'Drone Laws in India: 2026 Update', excerpt: 'Everything you need to know about flying drones legally in India, from registration to no-fly zones.', image: '/assets/product-drone.png', author: 'Rahul Verma', date: '2026-05-05', category: 'News', readTime: '6 min' },
];

export const mockReviews: Review[] = [
  { id: 'rv1', userName: 'Amit K.', avatar: '', rating: 5, comment: 'Absolutely perfect condition! The camera looks brand new and works flawlessly. Shipping was fast too.', date: '2026-05-08', verified: true },
  { id: 'rv2', userName: 'Deepika R.', avatar: '', rating: 4, comment: 'Great value for money. Minor cosmetic scratches but everything works perfectly. Happy with the purchase!', date: '2026-05-05', verified: true },
  { id: 'rv3', userName: 'Suresh M.', avatar: '', rating: 5, comment: 'NIRA6 quality inspection is top-notch. The grade was accurate and the packaging was premium.', date: '2026-05-01', verified: true },
  { id: 'rv4', userName: 'Pooja S.', avatar: '', rating: 4, comment: 'Smooth transaction and the seller was very responsive. Would definitely buy from NIRA6 again.', date: '2026-04-28', verified: false },
];




export const mockTransactions: WalletTransaction[] = [
  { id: 'txn1', type: 'credit', amount: 45000, description: 'Sell: Canon EOS 80D', date: '2026-05-08', status: 'completed' },
  { id: 'txn2', type: 'debit', amount: 89999, description: 'Buy: Sony Alpha A7 III', date: '2026-05-10', status: 'completed' },
  { id: 'txn3', type: 'credit', amount: 500, description: 'Referral Cashback', date: '2026-05-11', status: 'completed' },
  { id: 'txn4', type: 'debit', amount: 7000, description: 'Rental: DJI Inspire 3', date: '2026-05-12', status: 'pending' },
];

export const mockBrandModels: Record<string, string[]> = {
  'Sony': ['Alpha A7 III', 'Alpha A7R V', 'Alpha A7S III', 'FX30', 'FX6', 'ZV-E1', 'A6700'],
  'Canon': ['EOS R6 Mark II', 'EOS R5', 'EOS R8', 'EOS R3', 'C70', 'C300 Mark III'],
  'Nikon': ['Z6 III', 'Z8', 'Z9', 'Z5', 'Zf', 'Z30'],
  'Fujifilm': ['X-T5', 'X-H2S', 'X-H2', 'GFX 100S', 'X-S20'],
  'DJI': ['Mavic 3 Pro', 'Air 3', 'Mini 4 Pro', 'Inspire 3', 'Avata 2'],
  'GoPro': ['HERO12 Black', 'HERO11 Black Mini', 'MAX'],
  'Sigma': ['35mm f/1.4 DG DN', '24-70mm f/2.8 DG DN', '150-600mm f/5-6.3'],
  'Tamron': ['28-75mm f/2.8 G2', '70-180mm f/2.8 G2', '17-28mm f/2.8'],
};
