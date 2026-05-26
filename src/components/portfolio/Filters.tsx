'use client';
import { useState } from 'react';
import { Sliders, Sunset, Wind } from 'lucide-react';

interface FilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export default function CinematicFilters({ onFilterChange }: FilterProps) {
  const [aperture, setAperture] = useState('');
  const [focalLength, setFocalLength] = useState('');
  const [lighting, setLighting] = useState('');

  const handleApply = () => {
    onFilterChange({
      aperture,
      focalLength,
      lighting,
    });
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 max-w-md w-full">
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-900 pb-4">
        <Sliders className="w-5 h-5 text-amber-400" />
        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Cinematic Lens Grid</h4>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Aperture Target</label>
          <div className="grid grid-cols-4 gap-2">
            {['f/1.2', 'f/1.4', 'f/1.8', 'f/2.8'].map((f) => (
              <button
                key={f}
                onClick={() => setAperture(aperture === f ? '' : f)}
                className={`py-2 text-xs rounded-xl font-bold border ${
                  aperture === f ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-white border-neutral-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Focal Specs</label>
          <div className="grid grid-cols-4 gap-2">
            {['35mm', '50mm', '85mm', '135mm'].map((f) => (
              <button
                key={f}
                onClick={() => setFocalLength(focalLength === f ? '' : f)}
                className={`py-2 text-xs rounded-xl font-bold border ${
                  focalLength === f ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-white border-neutral-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-2">Lighting & Environment</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'golden-hour', label: 'Golden Hour', icon: Sunset },
              { id: 'chiaroscuro', label: 'Chiaroscuro', icon: Wind }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setLighting(lighting === item.id ? '' : item.id)}
                  className={`py-2.5 px-3 text-xs rounded-xl font-bold border flex items-center justify-center gap-2 ${
                    lighting === item.id ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-white border-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        className="w-full mt-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
      >
        Lock Lens Metrics
      </button>
    </div>
  );
}
