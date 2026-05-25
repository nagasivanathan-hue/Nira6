import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    companyName: 'NIRA6',
    tagline: 'EVERYTHING FOR A CREATOR IN ONE PLACE.',
    founders: [
      {
        name: 'N.SATHESHKUMAR',
        role: 'Co-Founder & COO',
        bio: 'Spearheading product development and operations for NIRA6, shaping the future of creator recommerce.'
      },
      {
        name: 'NAGASIVANATHAN.S.N',
        role: 'Co-Founder & Lead Architect',
        bio: 'Engineering high-performance software systems and AI matchmaker algorithms for the visual ecosystem.'
      }
    ],
    headquarters: 'Madurai, Tamil Nadu, India',
    foundedYear: 2026
  });
}
