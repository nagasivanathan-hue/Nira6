const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  const envConfig = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('No MONGODB_URI found in environment');
  process.exit(1);
}

// Inline Schemas to run standalone without Next.js compilation issues
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'completed' }
  }],
}, { timestamps: true });

const creatorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  rating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  experience: { type: Number, required: true },
  startingPrice: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  availability: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  verified: { type: Boolean, default: false },
  verificationLevel: { type: String, enum: ['none', 'id_verified', 'pro', 'elite'], default: 'none' },
  skills: [{ type: String }],
  styles: [{ type: String }],
  languages: [{ type: String }],
  gear: [{ type: String }],
  portfolio: [{ type: String }],
  trustScore: { type: Number, default: 80 }
}, { timestamps: true });

creatorProfileSchema.index({ coordinates: '2dsphere' });

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packageName: { type: String, required: true },
  eventType: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 02:00 PM"
  location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, required: true },
  advancePaid: { type: Number, required: true },
  escrowStatus: { type: String, enum: ['none', 'held', 'disbursed', 'refunded'], default: 'none' },
  paymentId: { type: String }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const reelSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  caption: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const CreatorProfile = mongoose.models.CreatorProfile || mongoose.model('CreatorProfile', creatorProfileSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Reel = mongoose.models.Reel || mongoose.model('Reel', reelSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected!');

    // 1. Clear Collections
    console.log('Clearing old data...');
    await User.deleteMany({ email: { $in: ['client@nira.com', 'creator@nira.com', 'admin@nira.com'] } });
    await CreatorProfile.deleteMany({});
    await Booking.deleteMany({});
    await Reel.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Cleared!');

    // 2. Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const client = await User.create({
      name: 'Rohan Sharma',
      email: 'client@nira.com',
      phone: '9876543210',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'user',
      walletBalance: 25000,
      walletTransactions: [
        {
          type: 'credit',
          amount: 25000,
          description: 'Initial wallet balance top-up',
          date: new Date(),
          status: 'completed'
        }
      ]
    });

    const creatorUser = await User.create({
      name: 'Arun Kumar',
      email: 'creator@nira.com',
      phone: '8765432109',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'user',
      walletBalance: 0
    });

    const adminUser = await User.create({
      name: 'Nira Admin Manager',
      email: 'admin@nira.com',
      phone: '7654321098',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      role: 'admin',
      walletBalance: 0
    });

    console.log('Users created!');

    // 3. Create Creator Profile
    console.log('Creating creator profiles...');
    const profile = await CreatorProfile.create({
      userId: creatorUser._id,
      category: 'photographer',
      title: 'Cinematic Fashion Photographer',
      bio: 'Award-winning portrait and editorial fashion photographer with over 6 years of experience in capturing moods and movements in outdoor settings.',
      location: 'Madurai, Tamil Nadu, India',
      coordinates: {
        type: 'Point',
        coordinates: [78.1198, 9.9252] // Longitude first: Madurai coordinates
      },
      rating: 4.9,
      reviewCount: 38,
      completedJobs: 84,
      experience: 6,
      startingPrice: 12000,
      hourlyRate: 2500,
      availability: 'available',
      verified: true,
      verificationLevel: 'elite',
      skills: ['Color Grading', 'Photoshop', 'Studio Lighting', 'Portrait Photography'],
      styles: ['Cinematic', 'Fashion', 'Dramatic', 'Minimalist'],
      languages: ['English', 'Tamil', 'Hindi'],
      gear: ['Sony A7R V', 'Sony 24-70mm f/2.8 GM II', 'Profoto B10X Pro'],
      portfolio: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600'
      ],
      trustScore: 98
    });

    console.log('Creator Profile created!');

    // 4. Create Bookings
    console.log('Creating sample bookings...');
    const booking = await Booking.create({
      clientId: client._id,
      creatorId: creatorUser._id,
      packageName: 'Premium Outdoor Session',
      eventType: 'fashion',
      price: 15000,
      date: '2026-06-15',
      timeSlot: '09:00 AM - 01:00 PM',
      location: 'Madurai Palace, Madurai',
      status: 'pending',
      totalAmount: 15000,
      advancePaid: 5000,
      escrowStatus: 'held',
      paymentId: 'pay_simulated_escrow_123'
    });

    console.log('Bookings created!');

    // 5. Create Reels
    console.log('Creating sample reels...');
    await Reel.create([
      {
        creatorId: creatorUser._id,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-in-urban-setting-39824-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        caption: 'Late night cyberpunk cinematic photoshoot. Editing workflow in Lightroom. #cyberpunk #cinematic #neon',
        likes: [client._id],
        comments: [
          {
            userId: client._id,
            text: 'Amazing lens flares! What focal length did you use?'
          }
        ],
        views: 1240,
        shares: 52,
        tags: ['cyberpunk', 'cinematic', 'neon']
      },
      {
        creatorId: creatorUser._id,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-camera-capturing-lens-flare-in-nature-41584-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400',
        caption: 'Catching golden hour flares in Madurai. Shot on RED V-Raptor. #goldenhour #cinematography',
        likes: [],
        comments: [],
        views: 980,
        shares: 15,
        tags: ['goldenhour', 'cinematography']
      }
    ]);

    console.log('Reels created!');

    // 6. Create Coupons
    console.log('Creating sample coupons...');
    await Coupon.create([
      {
        code: 'WELCOME100',
        discountType: 'flat',
        discountValue: 100,
        minPurchaseAmount: 500,
        expiryDate: new Date('2027-12-31'),
        active: true
      },
      {
        code: 'NIRA50',
        discountType: 'percentage',
        discountValue: 50,
        minPurchaseAmount: 1000,
        expiryDate: new Date('2027-12-31'),
        active: true
      }
    ]);

    console.log('Coupons created!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

seed();
