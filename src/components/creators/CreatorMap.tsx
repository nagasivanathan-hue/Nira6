 
'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { Creator } from '@/types/creator';
import { CREATOR_CATEGORIES } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
const defaultIcon = L.divIcon({ className: '', iconSize: [0, 0] });
L.Marker.prototype.options.icon = defaultIcon;

function createCreatorIcon(category: string, availability: string) {
  const cat = CREATOR_CATEGORIES.find(c => c.id === category);
  const color = cat?.color || '#FFDA03';
  const border = availability === 'available' ? '#10B981' : availability === 'busy' ? '#F59E0B' : '#9CA3AF';
  return L.divIcon({
    className: 'creator-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid ${border};box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#111;cursor:pointer;position:relative"><span>${(cat?.name || '?')[0]}</span>${availability === 'available' ? '<span style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#10B981;border-radius:50%;border:2px solid white"></span>' : ''}</div>`,
  });
}

function MapBounds({ creators }: { creators: Creator[] }) {
  const map = useMap();
  useEffect(() => {
    if (creators.length > 0) {
      const bounds = L.latLngBounds(creators.map(c => [c.coordinates.lat, c.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [creators, map]);
  return null;
}

export default function CreatorMap({ creators }: { creators: Creator[] }) {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} className="w-full h-full z-0" style={{ minHeight: '400px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds creators={creators} />
      {creators.map(creator => (
        <Marker key={creator.id} position={[creator.coordinates.lat, creator.coordinates.lng]} icon={createCreatorIcon(creator.category, creator.availability)}>
          <Popup className="creator-popup" maxWidth={280}>
            <div className="p-1">
              <div className="flex items-center gap-2.5 mb-2">
                <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{creator.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{creator.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-2">
                <span className="font-bold text-amber-500">★ {creator.rating}</span>
                <span>•</span>
                <span>{creator.completedJobs} jobs</span>
                <span>•</span>
                <span className={creator.availability === 'available' ? 'text-emerald-600 font-bold' : creator.availability === 'busy' ? 'text-amber-600 font-bold' : 'text-gray-400'}>{creator.availability}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-gray-900">₹{creator.startingPrice.toLocaleString('en-IN')}+</span>
                <Link href={`/creators/${creator.id}`} className="px-3 py-1 bg-yellow-400 text-gray-900 font-bold text-[11px] rounded-lg hover:bg-yellow-500 transition-colors">
                  View Profile →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
