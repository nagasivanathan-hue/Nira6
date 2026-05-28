/* ═══════════════════════════════════════════════════════════
   NIRA6 — Application Constants
   ═══════════════════════════════════════════════════════════ */

export const BRAND_NAME = 'NIRA6';
export const TAGLINE = 'EVERYTHING FOR A CREATOR IN ONE PLACE.';
export const SUB_TAGLINE = 'Buy. Sell. Rent. Repair. Create.';

export const NAV_LINKS = [
  { label: 'Creator Studio', href: '/studio' },
  { label: 'Creator Services', href: '/services' },
  { label: 'Buy Gear', href: '/buy' },
  { label: 'Rent Gear', href: '/rent' },
  { label: 'Sell Gear', href: '/sell' },
  { label: 'Creator Hub', href: '/creators' },
  { label: 'About Us', href: '/about' },
] as const;

export const CREATOR_CATEGORIES = [
  { id: 'photographer', name: 'Photographer', icon: 'Camera', color: '#FFDA03' },
  { id: 'videographer', name: 'Videographer', icon: 'Film', color: '#FF6B35' },
  { id: 'editor', name: 'Editor', icon: 'Wand2', color: '#A855F7' },
  { id: 'drone_operator', name: 'Drone Operator', icon: 'Plane', color: '#3B82F6' },
  { id: 'model', name: 'Model', icon: 'User', color: '#EC4899' },
  { id: 'studio', name: 'Studio', icon: 'Building2', color: '#10B981' },
  { id: 'makeup_artist', name: 'Makeup Artist', icon: 'Sparkles', color: '#F59E0B' },
  { id: 'anchor', name: 'Anchor/Host', icon: 'Mic', color: '#06B6D4' },
  { id: 'decorator', name: 'Decorator', icon: 'Palette', color: '#EF4444' },
] as const;

export const EVENT_TYPES = [
  { id: 'wedding', name: 'Wedding', icon: 'Heart', color: '#EC4899' },
  { id: 'product_shoot', name: 'Product Shoot', icon: 'Package', color: '#FFDA03' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', color: '#A855F7' },
  { id: 'real_estate', name: 'Real Estate', icon: 'Building', color: '#3B82F6' },
  { id: 'birthday', name: 'Birthday', icon: 'Cake', color: '#F59E0B' },
  { id: 'commercial', name: 'Commercial', icon: 'Megaphone', color: '#10B981' },
  { id: 'music_video', name: 'Music Video', icon: 'Music', color: '#FF6B35' },
  { id: 'corporate', name: 'Corporate', icon: 'Briefcase', color: '#6366F1' },
  { id: 'pre_wedding', name: 'Pre-Wedding', icon: 'Camera', color: '#EC4899' },
  { id: 'maternity', name: 'Maternity', icon: 'Baby', color: '#F472B6' },
  { id: 'portfolio', name: 'Portfolio', icon: 'Image', color: '#8B5CF6' },
] as const;

export const CREATOR_HUB_SECTIONS = [
  { id: 'discover', name: 'Discover Creators', href: '/creators/discover', icon: 'MapPin', desc: 'Find nearby creators on a live map' },
  { id: 'book', name: 'Book a Shoot', href: '/creators/book', icon: 'Calendar', desc: 'Instant booking for photo & video shoots' },
  { id: 'gear-rental', name: 'Rent Gear', href: '/creators/gear-rental', icon: 'Camera', desc: 'Peer-to-peer camera & gear rentals' },
  { id: 'marketplace', name: 'Used Gear Market', href: '/creators/marketplace', icon: 'ShoppingBag', desc: 'Buy & sell pre-owned equipment' },
  { id: 'reels', name: 'Creator Reels', href: '/creators/reels', icon: 'Play', desc: 'Short-form creator content feed' },
  { id: 'projects', name: 'Collaborate', href: '/creators/projects', icon: 'Users', desc: 'Team up on creative projects' },
  { id: 'events', name: 'Event Hiring', href: '/creators/events', icon: 'PartyPopper', desc: 'Hire teams for weddings & events' },
  { id: 'drones', name: 'Drone Pilots', href: '/creators/drones', icon: 'Plane', desc: 'Certified aerial photography pilots' },
  { id: 'editors', name: 'Hire Editors', href: '/creators/editors', icon: 'Wand2', desc: 'Photo & video editing services' },
  { id: 'quote', name: 'AI Quotation', href: '/creators/quote', icon: 'Calculator', desc: 'Instant AI-powered pricing estimates' },
  { id: 'ai-match', name: 'AI Match', href: '/creators/ai-match', icon: 'Sparkles', desc: 'AI finds your perfect creator match' },
] as const;

export const CATEGORIES = [
  { id: 'cameras', name: 'Cameras', icon: 'Camera', count: 324, color: '#FFDA03' },
  { id: 'lenses', name: 'Lenses', icon: 'Aperture', count: 218, color: '#FF6B35' },
  { id: 'microphones', name: 'Microphones', icon: 'Mic', count: 156, color: '#4ECDC4' },
  { id: 'gimbals', name: 'Gimbals', icon: 'Move3D', count: 89, color: '#A855F7' },
  { id: 'drones', name: 'Drones', icon: 'Plane', count: 67, color: '#3B82F6' },
  { id: 'lighting', name: 'Lighting', icon: 'Lightbulb', count: 198, color: '#F59E0B' },
  { id: 'accessories', name: 'Accessories', icon: 'Package', count: 412, color: '#10B981' },
  { id: 'editing', name: 'Editing Services', icon: 'Wand2', count: 94, color: '#EC4899' },
  { id: 'video-editors', name: 'Video Editors', icon: 'Film', count: 73, color: '#8B5CF6' },
  { id: 'photo-editors', name: 'Photo Editors', icon: 'ImagePlus', count: 61, color: '#06B6D4' },
  { id: 'studio', name: 'Studio Gear', icon: 'Building2', count: 142, color: '#EF4444' },
] as const;

export const BRANDS = [
  { id: 'sony', name: 'Sony' },
  { id: 'canon', name: 'Canon' },
  { id: 'nikon', name: 'Nikon' },
  { id: 'fujifilm', name: 'Fujifilm' },
  { id: 'dji', name: 'DJI' },
  { id: 'gopro', name: 'GoPro' },
  { id: 'sigma', name: 'Sigma' },
  { id: 'tamron', name: 'Tamron' },
  { id: 'ulanzi', name: 'ULANZI' },
  { id: 'digitek', name: 'Digitek' },
  { id: 'neewer', name: 'Neewer' },
  { id: 'hiffin', name: 'Hiffin' },
] as const;

export const CONDITION_GRADES = {
  'A+': { label: 'Like New', color: '#10B981', colorClass: 'bg-emerald-500', description: 'Pristine condition, no visible wear' },
  'A': { label: 'Excellent', color: '#22C55E', colorClass: 'bg-green-500', description: 'Minimal wear, fully functional' },
  'B+': { label: 'Very Good', color: '#84CC16', colorClass: 'bg-lime-500', description: 'Light wear, all features working' },
  'B': { label: 'Good', color: '#F59E0B', colorClass: 'bg-amber-500', description: 'Moderate wear, fully operational' },
  'C': { label: 'Fair', color: '#EF4444', colorClass: 'bg-red-500', description: 'Visible wear, but functional' },
} as const;

export const SERVICE_CATEGORIES = [
  'Video Editing',
  'Photo Editing',
  'Photography',
  'Videography',
  'Thumbnail Design',
  'Drone Piloting',
  'Color Grading',
  'Motion Graphics',
] as const;

export const SELL_STEPS = [
  { step: 1, title: 'Select Brand', icon: 'Building2' },
  { step: 2, title: 'Choose Model', icon: 'Smartphone' },
  { step: 3, title: 'Condition', icon: 'ClipboardCheck' },
  { step: 4, title: 'Get Price', icon: 'IndianRupee' },
  { step: 5, title: 'Accept Offer', icon: 'CheckCircle' },
  { step: 6, title: 'Schedule Pickup', icon: 'Calendar' },
  { step: 7, title: 'Confirmation', icon: 'PartyPopper' },
] as const;
