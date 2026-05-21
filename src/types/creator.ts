/* ═══════════════════════════════════════════════════════════
   NIRA6 — Creator Ecosystem Type Definitions
   ═══════════════════════════════════════════════════════════ */

export type CreatorCategory =
  | 'photographer'
  | 'videographer'
  | 'editor'
  | 'drone_operator'
  | 'model'
  | 'studio'
  | 'makeup_artist'
  | 'anchor'
  | 'decorator';

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export type VerificationLevel = 'none' | 'basic' | 'id_verified' | 'pro' | 'elite';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type EditingStyle =
  | 'cinematic'
  | 'moody'
  | 'bright_airy'
  | 'vintage'
  | 'minimal'
  | 'dramatic'
  | 'documentary'
  | 'editorial'
  | 'fine_art'
  | 'dark_moody';

export type EventType =
  | 'wedding'
  | 'product_shoot'
  | 'fashion'
  | 'real_estate'
  | 'birthday'
  | 'commercial'
  | 'music_video'
  | 'corporate'
  | 'pre_wedding'
  | 'maternity'
  | 'portfolio';

export interface Creator {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  coverImage: string;
  category: CreatorCategory;
  title: string;
  bio: string;
  location: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  completedJobs: number;
  startingPrice: number;
  hourlyRate: number;
  availability: AvailabilityStatus;
  verified: boolean;
  verificationLevel: VerificationLevel;
  trustScore: number;
  portfolio: string[];
  skills: string[];
  styles: EditingStyle[];
  gear: string[];
  languages: string[];
  experience: number; // years
  responseTime: string;
  featured: boolean;
  tags: string[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

export interface BookingPackage {
  id: string;
  name: string;
  eventType: EventType;
  description: string;
  price: number;
  duration: string;
  deliverables: string[];
  includes: string[];
  popular?: boolean;
}

export interface Booking {
  id: string;
  creator: Creator;
  clientName: string;
  clientEmail: string;
  package: BookingPackage;
  date: string;
  time: string;
  endDate?: string;
  location: string;
  status: BookingStatus;
  totalAmount: number;
  advancePaid: number;
  notes: string;
  createdAt: string;
}

export interface GearListing {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  images: string[];
  dailyRate: number;
  hourlyRate: number;
  weeklyRate: number;
  securityDeposit: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  coordinates: { lat: number; lng: number };
  owner: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  condition: string;
  description: string;
  specs: Record<string, string>;
  deliveryAvailable: boolean;
  pickupOnly: boolean;
  damageProtection: boolean;
}

export interface SecondHandListing {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  originalPrice: number;
  marketValue: number;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  conditionScore: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalSales: number;
    verified: boolean;
  };
  description: string;
  specs: Record<string, string>;
  purchaseDate: string;
  shutterCount?: number;
  usageHours?: number;
  accessories: string[];
  warranty: string;
  negotiable: boolean;
  escrowSupported: boolean;
  location: string;
  createdAt: string;
}

export interface CreatorReel {
  id: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    category: CreatorCategory;
  };
  thumbnail: string;
  videoUrl: string;
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  duration: string;
  createdAt: string;
  trending: boolean;
  type: 'bts' | 'edit' | 'cinematic' | 'before_after' | 'highlight' | 'tutorial';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  creator: { id: string; name: string; avatar: string };
  members: ProjectMember[];
  tasks: ProjectTask[];
  files: ProjectFile[];
  status: 'planning' | 'active' | 'review' | 'completed';
  deadline: string;
  createdAt: string;
  progress: number;
  category: EventType;
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar: string;
  role: CreatorCategory | 'client';
  joinedAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  assignee: ProjectMember;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  description: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface DroneOperator extends Creator {
  droneTypes: string[];
  certifications: string[];
  maxFlightAltitude: string;
  flightHours: number;
  complianceDetails: string;
  areaPermissions: string[];
  aerialPortfolio: string[];
}

export interface EditorProfile extends Creator {
  software: string[];
  editingStyles: EditingStyle[];
  turnaroundTime: string;
  maxRevisions: number;
  sampleEdits: { before: string; after: string }[];
  fileFormats: string[];
  specialties: string[];
}

export interface AIQuotation {
  id: string;
  eventType: EventType;
  duration: string;
  location: string;
  teamSize: number;
  equipmentList: string[];
  editingIncluded: boolean;
  lineItems: QuotationLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  validUntil: string;
  suggestions: string[];
}

export interface QuotationLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'system';
}

export interface EventPackage {
  id: string;
  eventType: EventType;
  name: string;
  description: string;
  startingPrice: number;
  maxPrice: number;
  duration: string;
  teamSize: string;
  deliverables: string[];
  includes: string[];
  popular: boolean;
  image: string;
}

export interface CreatorReview {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  eventType: EventType;
  verified: boolean;
  images: string[];
}
