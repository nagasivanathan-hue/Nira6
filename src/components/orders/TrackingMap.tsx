'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  originCity: string;
  destinationCity: string;
  currentLocationCity: string;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462]
};

function getCityCoords(city: string): [number, number] {
  const normalized = city.trim().toLowerCase();
  if (CITY_COORDINATES[normalized]) return CITY_COORDINATES[normalized];
  
  // Fuzzy match
  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }
  
  // Default to a central point or Chennai/Mumbai
  return CITY_COORDINATES.chennai;
}

export default function TrackingMap({ originCity, destinationCity, currentLocationCity }: TrackingMapProps) {
  const origin = getCityCoords(originCity || 'mumbai');
  const destination = getCityCoords(destinationCity || 'chennai');
  const current = getCityCoords(currentLocationCity || originCity || 'mumbai');

  useEffect(() => {
    // Delete leaflet default icon handler variables to prevent SSR leaks
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  // Custom DivIcons to avoid image loading path issues in webpack
  const originIcon = L.divIcon({
    className: 'custom-icon-origin',
    html: `<div style="width: 20px; height: 20px; background-color: #1a1a1a; border: 3px solid #fbc02d; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><div style="width: 6px; height: 6px; background-color: #fff; border-radius: 50%;"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const currentIcon = L.divIcon({
    className: 'custom-icon-current',
    html: `<div style="width: 24px; height: 24px; background-color: #fbc02d; border: 3px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(251,192,45,0.6); animation: pulse 1.5s infinite;"><div style="width: 8px; height: 8px; background-color: #1a1a1a; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const destIcon = L.divIcon({
    className: 'custom-icon-dest',
    html: `<div style="width: 20px; height: 20px; background-color: #d32f2f; border: 3px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><div style="width: 6px; height: 6px; background-color: #fff; border-radius: 50%;"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const path = [origin, current, destination];

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-nira-gray-dark shadow-inner relative z-0">
      <MapContainer 
        center={current} 
        zoom={5} 
        scrollWheelZoom={false} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Origin warehouse marker */}
        <Marker position={origin} icon={originIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-neutral-900">Origin Warehouse Depot</p>
              <p className="text-neutral-500 mt-0.5">Location: {originCity}</p>
            </div>
          </Popup>
        </Marker>

        {/* Current status checkpoint marker */}
        <Marker position={current} icon={currentIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-neutral-900">Package Current Location</p>
              <p className="text-neutral-500 mt-0.5">Checkpoint: {currentLocationCity}</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination address marker */}
        <Marker position={destination} icon={destIcon}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-neutral-900">Shipping Destination</p>
              <p className="text-neutral-500 mt-0.5">Destination: {destinationCity}</p>
            </div>
          </Popup>
        </Marker>

        {/* Path routing line */}
        <Polyline 
          positions={path} 
          pathOptions={{ color: '#fbc02d', weight: 4, dashArray: '8, 8', lineCap: 'round' }} 
        />
      </MapContainer>
    </div>
  );
}
