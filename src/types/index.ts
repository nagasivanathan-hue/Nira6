/* ═══════════════════════════════════════════════════════════
   NIRA6 — TypeScript Type Definitions
   ═══════════════════════════════════════════════════════════ */

export interface Product {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images: string[];
  condition: 'Excellent' | 'Good' | 'Fair' | 'Like New';
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  warranty: string;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerRating: number;
  specs: Record<string, string>;
  description: string;
  emiAvailable: boolean;
  inStock: boolean;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  secondaryImage?: string;
  colors?: { name: string; hex: string; inStock: boolean }[];
  affiliateUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  configMetadata?: Record<string, unknown>;
}

/* ═══════════════════════════════════════════════════════════
   Forge Your Ideas (FYI) — 3D Printing Types
   ═══════════════════════════════════════════════════════════ */

export interface ForgeProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  printTimeMinutes: number;
  weightGrams: number;
  dimensions: string;
  defaultMaterial: string;
  availableMaterials: string[];
  availableColors: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForgePrinter {
  id: string;
  name: string;
  model: string;
  buildVolumeX: number;
  buildVolumeY: number;
  buildVolumeZ: number;
  nozzleDiameter: number;
  maxPrintSpeed: number;
  hourlyCost: number;
  status: 'IDLE' | 'PRINTING' | 'MAINTENANCE' | 'OFFLINE';
  currentOrderNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForgeFilament {
  id: string;
  material: string;
  color: string;
  colorHex: string;
  pricePerKg: number;
  stockGrams: number;
  lowStockThresholdGrams: number;
  density: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForgePriceBreakdown {
  materialCost: number;
  printingCost: number;
  finishingCost: number;
  packagingCost: number;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface ForgeCustomOrder {
  id: string;
  userId: string;
  orderId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  volumeCm3?: number;
  surfaceAreaCm2?: number;
  boundingBoxX?: number;
  boundingBoxY?: number;
  boundingBoxZ?: number;
  material: string;
  color: string;
  layerHeight: number;
  infill: number;
  finishing: string;
  quantity: number;
  estimatedPrice: number;
  priceBreakdown: ForgePriceBreakdown;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'QUEUED' | 'PRINTING' | 'POST_PROCESSING' | 'COMPLETED' | 'SHIPPED' | 'CANCELLED';
  printerId?: string;
  failureReason?: string;
  reprintCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForgeDesignRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  referenceImages: string[];
  dimensions?: string;
  quantity: number;
  targetMaterial?: string;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'QUOTE_GENERATED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  quotedPrice?: number;
  designerNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ForgeSavedConfig {
  id: string;
  userId: string;
  name: string;
  fileName: string;
  fileUrl: string;
  configJson: Record<string, unknown>;
  estimatedPrice: number;
  createdAt?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin' | 'super_admin' | 'order_manager' | 'support_agent' | 'customer';
  walletBalance: number;
  verified: boolean;
  adminApprovedByOwner?: boolean;
}

export interface RentalItem {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  dailyRate: number;
  hourlyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit: number;
  available: boolean;
  bookedDates?: { start: string; end: string }[];
  pickupLocations?: string[];
  lensMount?: string;
  sensorType?: string;
  videoSpecs?: string;
  conditionScore?: number;
  shutterCount?: number;
  insuranceAvailable?: boolean;
  insuranceRate?: number;
  bestFor?: string[];
  specs?: Record<string, string>;
  rating: number;
  reviewCount: number;
  location: string;
  owner: string;
  reviews?: RentalReview[];
}

export interface RentalReview {
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RentalBooking {
  rentalItemId: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  deposit: number;
  insurance: boolean;
  insuranceCost: number;
  totalCost: number;
  pickupLocation: string;
}

export interface CreatorService {
  id: string;
  title: string;
  category: string;
  freelancer: Freelancer;
  price: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
}

export interface Freelancer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  completedJobs: number;
  location: string;
  verified: boolean;
  level: 'Rising' | 'Pro' | 'Top Rated' | 'Elite';
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Order {
  _id: string;
  orderId?: string;
  invoiceNumber?: string;
  user: string | User;
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderStatus: 'pending' | 'placed' | 'payment_verified' | 'confirmed' | 'processing' | 'packed' | 'ready_for_dispatch' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'refund_initiated' | 'refund_completed' | 'refunded';
  paymentMethod: 'razorpay' | 'cod' | 'emi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  guestEmail?: string;
  guestPhone?: string;
  trackingNumber?: string;
  courierPartner?: string;
  trackingUpdates?: {
    status: string;
    description: string;
    location: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface RepairRequest {
  id: string;
  device: string;
  issue: string;
  status: 'Submitted' | 'Pickup Scheduled' | 'Under Repair' | 'Completed';
  estimate: number;
  date: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  comment: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  image: string;
  color: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export type SellStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SellFormData {
  brand: string;
  model: string;
  condition: Record<string, string>;
  estimatedPrice: number;
  offerAccepted: boolean;
  pickupDate: string;
  pickupTime: string;
  address: string;
}
