import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import RentalItem from '@/models/RentalItem';

const SEED_RENTALS = [
  { name: 'Sony A7S III', brand: 'Sony', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: 'The ultimate low-light full-frame mirrorless camera. 12.1MP sensor optimized for video with 4K 120fps, 15+ stops of dynamic range, and dual card slots.', dailyRate: 3500, hourlyRate: 500, weeklyRate: 21000, monthlyRate: 70000, securityDeposit: 25000, available: true, rating: 4.9, reviewCount: 45, location: 'Mumbai', owner: 'RentalHub', lensMount: 'E-mount', sensorType: 'Full Frame', videoSpecs: '4K', conditionScore: 95, shutterCount: 12400, insuranceAvailable: true, insuranceRate: 250, bestFor: ['Filmmaking', 'Weddings', 'YouTube'], specs: { Sensor: '12.1MP Full Frame BSI CMOS', Video: '4K 120fps / 1080p 240fps', ISO: '80-102400 (Expandable 40-409600)', AF: '759 Phase Detection', Stabilization: '5-axis IBIS', Weight: '699g' }, pickupLocations: ['Mumbai Central', 'Andheri West', 'Bandra'], reviews: [{ userName: 'Arjun', rating: 5, comment: 'Incredible low-light beast. Used for a wedding shoot and the footage was cinema-grade.', date: new Date() }] },
  { name: 'Canon EOS R5', brand: 'Canon', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: 'Canon\'s flagship mirrorless with 45MP full-frame sensor, 8K RAW video, and animal eye detection AF.', dailyRate: 4500, hourlyRate: 700, weeklyRate: 27000, monthlyRate: 90000, securityDeposit: 35000, available: true, rating: 4.8, reviewCount: 38, location: 'Delhi', owner: 'ProGear India', lensMount: 'RF', sensorType: 'Full Frame', videoSpecs: '8K', conditionScore: 92, shutterCount: 24000, insuranceAvailable: true, insuranceRate: 300, bestFor: ['Wildlife', 'Weddings', 'Commercial'], specs: { Sensor: '45MP Full Frame CMOS', Video: '8K 30fps RAW / 4K 120fps', ISO: '100-51200', AF: 'Dual Pixel CMOS AF II, 1053 zones', Stabilization: '8-stop IBIS', Weight: '738g' }, pickupLocations: ['Connaught Place', 'Nehru Place'], reviews: [] },
  { name: 'RED V-RAPTOR 8K', brand: 'RED', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: 'Cinema-grade 8K sensor with DSMC3 architecture. The ultimate tool for commercial and feature film production.', dailyRate: 25000, hourlyRate: 4000, weeklyRate: 150000, monthlyRate: 450000, securityDeposit: 200000, available: true, rating: 5.0, reviewCount: 12, location: 'Mumbai', owner: 'CineRental Pro', lensMount: 'PL', sensorType: 'Full Frame', videoSpecs: '8K', conditionScore: 98, insuranceAvailable: true, insuranceRate: 1500, bestFor: ['Filmmaking', 'Commercial'], specs: { Sensor: 'VV 40.96 Megapixel', Video: '8K 120fps REDCODE RAW', 'Dynamic Range': '17+ stops', 'Color Science': 'IPP2', Mount: 'PL / Canon RF', Weight: '1.8kg (body)' }, pickupLocations: ['Film City Goregaon', 'Bandra'], reviews: [] },
  { name: 'Blackmagic Pocket 6K G2', brand: 'Blackmagic', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: 'Super 35 cinema camera with 6K sensor, 13 stops dynamic range, and Blackmagic RAW recording.', dailyRate: 3000, hourlyRate: 450, weeklyRate: 18000, monthlyRate: 60000, securityDeposit: 20000, available: true, rating: 4.7, reviewCount: 31, location: 'Bangalore', owner: 'IndieFilm Gear', lensMount: 'EF', sensorType: 'Super 35', videoSpecs: '6K', conditionScore: 88, insuranceAvailable: true, insuranceRate: 200, bestFor: ['Filmmaking', 'YouTube', 'Travel'], specs: { Sensor: '6144x3456 Super 35', Video: '6K 50fps / 4K 60fps', 'Dynamic Range': '13 stops', Recording: 'Blackmagic RAW / ProRes', Screen: '5" HDR Touchscreen', Weight: '1.4kg' }, pickupLocations: ['Koramangala', 'Indiranagar'], reviews: [] },
  { name: 'DJI Inspire 3', brand: 'DJI', category: 'drones', image: '/assets/product-drone.png', images: ['/assets/product-drone.png'], description: 'Professional cinema drone with full-frame 8K camera, RTK positioning, and 28-minute flight time.', dailyRate: 15000, hourlyRate: 2500, weeklyRate: 90000, monthlyRate: 280000, securityDeposit: 100000, available: true, rating: 4.9, reviewCount: 18, location: 'Mumbai', owner: 'DroneRentals', lensMount: 'N/A', sensorType: 'Full Frame', videoSpecs: '8K', conditionScore: 96, insuranceAvailable: true, insuranceRate: 1000, bestFor: ['Filmmaking', 'Commercial', 'Weddings'], specs: { Camera: 'X9-8K Air (Full Frame)', Video: '8K CinemaDNG RAW', 'Flight Time': '28 min', Range: '15km O3+', Obstacle: 'Omnidirectional', Weight: '3.99kg' }, pickupLocations: ['Film City Goregaon'], reviews: [] },
  { name: 'DJI Mavic 3 Pro', brand: 'DJI', category: 'drones', image: '/assets/product-drone.png', images: ['/assets/product-drone.png'], description: 'Triple-camera drone with Hasselblad main, 43-min flight time, and omnidirectional obstacle sensing.', dailyRate: 5000, hourlyRate: 800, weeklyRate: 30000, monthlyRate: 100000, securityDeposit: 40000, available: true, rating: 4.8, reviewCount: 29, location: 'Delhi', owner: 'SkyView', lensMount: 'N/A', sensorType: '1-inch', videoSpecs: '5.2K', conditionScore: 91, insuranceAvailable: true, insuranceRate: 350, bestFor: ['Travel', 'YouTube', 'Weddings'], specs: { Camera: 'Hasselblad 4/3 CMOS 20MP', Video: '5.1K 50fps / 4K 60fps', 'Flight Time': '43 min', Range: '15km', Weight: '958g' }, pickupLocations: ['Connaught Place', 'Noida'], reviews: [] },
  { name: 'Canon RF 70-200mm f/2.8L', brand: 'Canon', category: 'lenses', image: '/assets/product-lens.png', images: ['/assets/product-lens.png'], description: 'The lightest 70-200 f/2.8 in its class. Nano USM with 5-stop IS, perfect for events and portraits.', dailyRate: 3500, hourlyRate: 500, weeklyRate: 21000, monthlyRate: 70000, securityDeposit: 30000, available: true, rating: 4.9, reviewCount: 42, location: 'Chennai', owner: 'CineLens', lensMount: 'RF', sensorType: 'Full Frame', videoSpecs: 'N/A', conditionScore: 94, insuranceAvailable: true, insuranceRate: 250, bestFor: ['Weddings', 'Wildlife', 'Commercial'], specs: { 'Focal Length': '70-200mm', Aperture: 'f/2.8', Stabilization: '5-stop IS', AF: 'Nano USM', 'Filter Size': '77mm', Weight: '1070g' }, pickupLocations: ['T. Nagar', 'Anna Nagar'], reviews: [] },
  { name: 'Sony 24-70mm f/2.8 GM II', brand: 'Sony', category: 'lenses', image: '/assets/product-lens.png', images: ['/assets/product-lens.png'], description: 'Sony\'s sharpest standard zoom. Lightweight, fast AF, and exceptional flare control.', dailyRate: 2500, hourlyRate: 400, weeklyRate: 15000, monthlyRate: 50000, securityDeposit: 20000, available: true, rating: 4.8, reviewCount: 55, location: 'Mumbai', owner: 'LensKraft', lensMount: 'E-mount', sensorType: 'Full Frame', videoSpecs: 'N/A', conditionScore: 96, insuranceAvailable: true, insuranceRate: 200, bestFor: ['Weddings', 'Travel', 'YouTube'], specs: { 'Focal Length': '24-70mm', Aperture: 'f/2.8', AF: 'XD Linear Motor (x4)', Elements: '15 elements in 10 groups', 'Filter Size': '82mm', Weight: '695g' }, pickupLocations: ['Andheri', 'Bandra'], reviews: [] },
  { name: 'Aputure 600d Pro', brand: 'Aputure', category: 'lighting', image: '/assets/product-lighting.png', images: ['/assets/product-lighting.png'], description: 'Daylight-balanced 600W COB LED. Bowens mount, wireless control, weather-resistant for outdoor shoots.', dailyRate: 2500, hourlyRate: 400, weeklyRate: 15000, monthlyRate: 45000, securityDeposit: 15000, available: false, rating: 4.7, reviewCount: 67, location: 'Bangalore', owner: 'LightRent', lensMount: 'N/A', sensorType: 'N/A', videoSpecs: 'N/A', conditionScore: 85, insuranceAvailable: true, insuranceRate: 180, bestFor: ['Commercial', 'Filmmaking', 'YouTube'], specs: { Power: '600W COB LED', 'Color Temp': '5600K Daylight', CRI: '96+', Mount: 'Bowens', Control: '2.4G / Bluetooth / DMX', Weight: '7.85kg' }, pickupLocations: ['Koramangala'], reviews: [] },
  { name: 'DJI Ronin 4D-8K', brand: 'DJI', category: 'gimbals', image: '/assets/product-gimbal.png', images: ['/assets/product-gimbal.png'], description: 'All-in-one cinema camera with built-in 4-axis gimbal, LiDAR focus, and wireless video transmission.', dailyRate: 8000, hourlyRate: 1200, weeklyRate: 48000, monthlyRate: 150000, securityDeposit: 60000, available: true, rating: 4.8, reviewCount: 15, location: 'Mumbai', owner: 'StabRentals', lensMount: 'L-mount', sensorType: 'Full Frame', videoSpecs: '8K', conditionScore: 93, insuranceAvailable: true, insuranceRate: 500, bestFor: ['Filmmaking', 'Commercial'], specs: { Camera: 'Full Frame 8K CMOS', Gimbal: '4-axis active stabilization', AF: 'LiDAR Range Finder', Transmission: 'O3 Pro Video', Recording: 'ProRes / H.265', Weight: '4.66kg' }, pickupLocations: ['Film City Goregaon', 'Andheri'], reviews: [] },
  { name: 'Sennheiser MKH 416', brand: 'Sennheiser', category: 'microphones', image: '/assets/product-microphone.png', images: ['/assets/product-microphone.png'], description: 'Industry-standard shotgun mic for broadcast and film. Legendary off-axis rejection and clarity.', dailyRate: 1500, hourlyRate: 250, weeklyRate: 9000, monthlyRate: 30000, securityDeposit: 10000, available: true, rating: 4.6, reviewCount: 54, location: 'Mumbai', owner: 'AudioRent', lensMount: 'N/A', sensorType: 'N/A', videoSpecs: 'N/A', conditionScore: 88, insuranceAvailable: true, insuranceRate: 100, bestFor: ['Filmmaking', 'YouTube', 'Commercial'], specs: { Type: 'Short Shotgun / Interference Tube', Pattern: 'Super-cardioid / Lobar', 'Frequency Response': '40Hz - 20kHz', Sensitivity: '25mV/Pa', 'Max SPL': '130dB', Weight: '175g' }, pickupLocations: ['Andheri', 'Bandra'], reviews: [] },
  { name: 'Fujifilm X-T5', brand: 'Fujifilm', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: '40MP APS-C sensor with 7-stop IBIS, 6.2K video, and 19 Film Simulation modes. Retro styling meets modern tech.', dailyRate: 2800, hourlyRate: 420, weeklyRate: 16800, monthlyRate: 56000, securityDeposit: 18000, available: true, rating: 4.7, reviewCount: 33, location: 'Hyderabad', owner: 'FujiRental', lensMount: 'X', sensorType: 'APS-C', videoSpecs: '6K', conditionScore: 90, insuranceAvailable: true, insuranceRate: 200, bestFor: ['Travel', 'YouTube', 'Wildlife'], specs: { Sensor: '40.2MP X-Trans CMOS 5 HR', Video: '6.2K 30fps / 4K 60fps', IBIS: '7 stops', 'Film Simulation': '19 modes', AF: '425 points', Weight: '557g' }, pickupLocations: ['Hitech City', 'Banjara Hills'], reviews: [] },
  { name: 'Nikon Z9', brand: 'Nikon', category: 'cameras', image: '/assets/product-camera.png', images: ['/assets/product-camera.png'], description: 'Nikon\'s flagship mirrorless with stacked 45.7MP sensor, 8K video, and zero blackout EVF at 120fps.', dailyRate: 5500, hourlyRate: 850, weeklyRate: 33000, monthlyRate: 110000, securityDeposit: 40000, available: true, rating: 4.9, reviewCount: 22, location: 'Delhi', owner: 'NikonPro', lensMount: 'Z', sensorType: 'Full Frame', videoSpecs: '8K', conditionScore: 97, shutterCount: 8200, insuranceAvailable: true, insuranceRate: 350, bestFor: ['Wildlife', 'Commercial', 'Weddings'], specs: { Sensor: '45.7MP Stacked CMOS', Video: '8K 60fps / 4K 120fps', AF: '493 points, 3D Tracking', EVF: '120fps Zero Blackout', FPS: '120fps RAW', Weight: '1340g' }, pickupLocations: ['Connaught Place', 'South Delhi'], reviews: [] },
  { name: 'ARRI Signature Prime 35mm T1.8', brand: 'ARRI', category: 'lenses', image: '/assets/product-lens.png', images: ['/assets/product-lens.png'], description: 'ARRI Signature Prime with silky bokeh and organic rendering. The gold standard for cinema.', dailyRate: 12000, hourlyRate: 2000, weeklyRate: 72000, monthlyRate: 220000, securityDeposit: 80000, available: true, rating: 5.0, reviewCount: 8, location: 'Mumbai', owner: 'CineRental Pro', lensMount: 'PL', sensorType: 'Full Frame', videoSpecs: 'N/A', conditionScore: 99, insuranceAvailable: true, insuranceRate: 800, bestFor: ['Filmmaking', 'Commercial'], specs: { 'Focal Length': '35mm', Aperture: 'T1.8', 'Image Circle': 'Large Format / Full Frame', Mount: 'LPL (PL adaptable)', 'Close Focus': '0.35m', Weight: '1.4kg' }, pickupLocations: ['Film City Goregaon'], reviews: [] },
  { name: 'Godox AD600 Pro', brand: 'Godox', category: 'lighting', image: '/assets/product-lighting.png', images: ['/assets/product-lighting.png'], description: 'Portable 600W strobe with TTL, HSS, and 0.01-1s recycle time. Perfect for location photography.', dailyRate: 1200, hourlyRate: 200, weeklyRate: 7200, monthlyRate: 24000, securityDeposit: 8000, available: true, rating: 4.5, reviewCount: 41, location: 'Chennai', owner: 'FlashRent', lensMount: 'N/A', sensorType: 'N/A', videoSpecs: 'N/A', conditionScore: 86, insuranceAvailable: true, insuranceRate: 100, bestFor: ['Weddings', 'Commercial', 'YouTube'], specs: { Power: '600Ws', 'Recycle Time': '0.01-0.9s', 'Color Temp': '5600K ±75K', TTL: 'Canon/Nikon/Sony', HSS: 'Up to 1/8000s', Weight: '2.98kg' }, pickupLocations: ['T. Nagar', 'Velachery'], reviews: [] },
];

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const lensMount = searchParams.get('lensMount');
    const sensorType = searchParams.get('sensorType');
    const videoSpecs = searchParams.get('videoSpecs');
    const bestFor = searchParams.get('bestFor');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const available = searchParams.get('available');
    const sort = searchParams.get('sort');
    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');

    // Auto-seed if empty
    const count = await RentalItem.countDocuments();
    if (count === 0) {
      await RentalItem.insertMany(SEED_RENTALS);
    }

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (brand) query.brand = { $in: brand.split(',') };
    if (lensMount) query.lensMount = lensMount;
    if (sensorType) query.sensorType = sensorType;
    if (videoSpecs) query.videoSpecs = videoSpecs;
    if (bestFor) query.bestFor = { $in: bestFor.split(',') };
    if (available === 'true') query.available = true;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    let dbQuery = RentalItem.find(query);

    if (sort === 'price_asc') dbQuery = dbQuery.sort({ dailyRate: 1 });
    else if (sort === 'price_desc') dbQuery = dbQuery.sort({ dailyRate: -1 });
    else if (sort === 'rating') dbQuery = dbQuery.sort({ rating: -1 });
    else dbQuery = dbQuery.sort({ createdAt: -1 });

    const rentals = await dbQuery.lean();

    const formatted = rentals.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      specs: r.specs instanceof Map ? Object.fromEntries(r.specs) : r.specs
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
