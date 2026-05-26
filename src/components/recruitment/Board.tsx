'use client';
import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Compass } from 'lucide-react';

interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  roleNeeded: string;
  location: string;
  budget: string;
  projectType: string;
}

export default function RecruitmentBoard() {
  const [requests] = useState<ProjectRequest[]>([
    {
      id: 'req-1',
      title: 'Cinematographer for Indie Feature Film',
      description: 'Seeking a DP in Madurai to operate RED/ARRI gear. Cinematic style inspired by chiaroscuro lighting.',
      roleNeeded: 'Director of Photography',
      location: 'Madurai, TN',
      budget: '₹5,000/day + Gear Coverage',
      projectType: 'Indie Film'
    },
    {
      id: 'req-2',
      title: 'YouTube Reels Fast Cuts Editor',
      description: 'Retention-optimized timeline manager needed for high-bitrate visual portfolios.',
      roleNeeded: 'Video Editor',
      location: 'Remote',
      budget: 'Collaboration / Revenue Share',
      projectType: 'Short-Form Content'
    }
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
          <Briefcase className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h2 className="font-heading font-black text-2xl text-white uppercase tracking-wider">Project Board</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Find film crews, directors, and sound designers near you.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {requests.map((item) => (
          <div key={item.id} className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 hover:border-amber-400/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-amber-400/10 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                {item.roleNeeded}
              </span>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                {item.projectType}
              </span>
            </div>

            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors mb-2">
              {item.title}
            </h3>
            <p className="text-neutral-400 text-xs mb-6 leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-4 border-t border-neutral-900 pt-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neutral-500" />
                {item.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-neutral-500" />
                {item.budget}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
