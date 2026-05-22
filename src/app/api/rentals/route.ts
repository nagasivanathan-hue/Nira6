import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import RentalItem from '@/models/RentalItem';

const INITIAL_RENTALS = [
  { name: 'Sony A7S III', brand: 'Sony', category: 'cameras', image: '/assets/product-camera.png', dailyRate: 3500, hourlyRate: 500, securityDeposit: 25000, available: true, rating: 4.9, reviewCount: 45, location: 'Mumbai', owner: 'RentalHub' },
  { name: 'DJI Inspire 3', brand: 'DJI', category: 'drones', image: '/assets/product-drone.png', dailyRate: 8000, hourlyRate: 1200, securityDeposit: 50000, available: true, rating: 4.8, reviewCount: 23, location: 'Delhi', owner: 'DroneRentals' },
  { name: 'Aputure 600d Pro', brand: 'Aputure', category: 'lighting', image: '/assets/product-lighting.png', dailyRate: 2500, hourlyRate: 400, securityDeposit: 15000, available: false, rating: 4.7, reviewCount: 67, location: 'Bangalore', owner: 'LightRent' },
  { name: 'Canon CN-E 70-200mm T4.4', brand: 'Canon', category: 'lenses', image: '/assets/product-lens.png', dailyRate: 5000, hourlyRate: 800, securityDeposit: 35000, available: true, rating: 4.9, reviewCount: 31, location: 'Chennai', owner: 'CineLens' },
  { name: 'DJI Ronin 4D', brand: 'DJI', category: 'gimbals', image: '/assets/product-gimbal.png', dailyRate: 6000, hourlyRate: 900, securityDeposit: 40000, available: true, rating: 4.8, reviewCount: 19, location: 'Hyderabad', owner: 'StabRentals' },
  { name: 'Sennheiser MKH 416', brand: 'Sennheiser', category: 'microphones', image: '/assets/product-microphone.png', dailyRate: 1500, hourlyRate: 250, securityDeposit: 10000, available: true, rating: 4.6, reviewCount: 54, location: 'Mumbai', owner: 'AudioRent' }
];

export async function GET() {
  try {
    await dbConnect();
    
    let rentals = await RentalItem.find({}).lean();
    
    // Auto-seed if collection is empty
    if (rentals.length === 0) {
      await RentalItem.insertMany(INITIAL_RENTALS);
      rentals = await RentalItem.find({}).lean();
    }
    
    // Normalize IDs to keep compatibility with client mocks
    const formattedRentals = rentals.map((r: any) => ({
      ...r,
      id: r._id.toString()
    }));
    
    return NextResponse.json(formattedRentals);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
