/* ═══════════════════════════════════════════════════════════
   NIRA6 — Application Constants
   ═══════════════════════════════════════════════════════════ */

export const BRAND_NAME = 'NIRA6';
export const TAGLINE = 'EVERYTHING FOR A CREATOR IN ONE PLACE.';
export const SUB_TAGLINE = 'Buy. Sell. Rent. Repair. Create.';

export const NAV_LINKS = [
  { label: 'Buy', href: '/buy' },
  { label: 'Sell', href: '/sell' },
  { label: 'Rent', href: '/rent' },
  { label: 'Services', href: '/services' },
  { label: 'Repair', href: '/repair' },
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
] as const;

export const CONDITION_GRADES = {
  'A+': { label: 'Like New', color: '#10B981', description: 'Pristine condition, no visible wear' },
  'A': { label: 'Excellent', color: '#22C55E', description: 'Minimal wear, fully functional' },
  'B+': { label: 'Very Good', color: '#84CC16', description: 'Light wear, all features working' },
  'B': { label: 'Good', color: '#F59E0B', description: 'Moderate wear, fully operational' },
  'C': { label: 'Fair', color: '#EF4444', description: 'Visible wear, but functional' },
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
