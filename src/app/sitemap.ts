import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import RentalItem from '@/models/RentalItem';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.nira6.in';

  // Base landing urls
  const routes = ['', '/rent', '/creators', '/studio', '/about'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    await dbConnect();
    
    // Dynamic Creator URLs
    const creators = await CreatorProfile.find({}, '_id updatedAt').lean() as unknown as { _id: any; updatedAt?: Date }[];
    const creatorRoutes = creators.map((c) => ({
      url: `${baseUrl}/creators/${c._id.toString()}`,
      lastModified: new Date(c.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Dynamic Rental Gear URLs
    const gear = await RentalItem.find({}, '_id updatedAt').lean() as unknown as { _id: any; updatedAt?: Date }[];
    const gearRoutes = gear.map((g) => ({
      url: `${baseUrl}/rent/${g._id.toString()}`,
      lastModified: new Date(g.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...creatorRoutes, ...gearRoutes];
  } catch (err) {
    console.error('Sitemap dynamic collection query failed:', err);
    return routes;
  }
}
