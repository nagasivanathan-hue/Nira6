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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'customer' | 'seller' | 'admin';
  walletBalance: number;
  verified: boolean;
}

export interface RentalItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  dailyRate: number;
  hourlyRate: number;
  securityDeposit: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  owner: string;
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
  user: string | User;
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'razorpay' | 'cod' | 'emi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
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
