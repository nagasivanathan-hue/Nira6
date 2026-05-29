import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — RV Bot API  (/api/studio/concierge)
   POST: Accepts a scene prompt + optional image URL,
         returns recommended manual camera settings.
   ═══════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string = body.prompt || '';
    const imageUrl: string = body.imageUrl || '';

    if (!prompt.trim() && !imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Provide a scene description prompt or reference image URL.' },
        { status: 400 }
      );
    }

    const lower = prompt.toLowerCase();
    
    let result = {
      name: 'Standard Portrait',
      description: 'A balanced setup for standard photography with a slightly shallow depth of field for subject isolation.',
      settings: {
        iso: '100 - 200',
        shutter: '1/200s',
        aperture: 'f/1.8 - f/2.8',
        whiteBalance: 'Auto (AWB) or 5200K',
        focus: 'Continuous AF (Eye Tracking)',
      }
    };

    if (lower.includes('star trail') || lower.includes('astro') || lower.includes('night sky')) {
      result = {
        name: 'Astrophotography & Star Trails',
        description: 'Long exposure setup to capture starlight without trailing, or extremely long for trails. Use a sturdy tripod and a wide-angle lens.',
        settings: {
          iso: '800 - 3200',
          shutter: '20s - 30s',
          aperture: 'f/1.4 - f/2.8 (Wide Open)',
          whiteBalance: '3800K - 4200K (Cool)',
          focus: 'Manual (Infinity ∞)',
        }
      };
    } else if (lower.includes('slow shutter') || lower.includes('waterfall') || lower.includes('light trail')) {
      result = {
        name: 'Slow Shutter / Motion Blur',
        description: 'Ideal for silky waterfalls or car light trails at night. Requires a tripod and possibly an ND filter during the day.',
        settings: {
          iso: '100 (Lowest possible)',
          shutter: '1/4s - 5s',
          aperture: 'f/8 - f/16',
          whiteBalance: 'Auto (AWB)',
          focus: 'Single AF or Manual',
        }
      };
    } else if (lower.includes('sports') || lower.includes('action') || lower.includes('wildlife') || lower.includes('fast')) {
      result = {
        name: 'High-Speed Action',
        description: 'Fast shutter speed to freeze motion. Requires a fast lens or higher ISO to compensate for the short exposure.',
        settings: {
          iso: '800 - Auto',
          shutter: '1/1000s - 1/2000s',
          aperture: 'f/2.8 - f/4',
          whiteBalance: 'Auto (AWB)',
          focus: 'Continuous AF (AF-C / AI Servo)',
        }
      };
    } else if (lower.includes('landscape') || lower.includes('nature') || lower.includes('architecture')) {
      result = {
        name: 'Landscape & Architecture',
        description: 'Deep depth of field to keep both foreground and background in sharp focus.',
        settings: {
          iso: '100',
          shutter: '1/60s - 1/125s (on tripod: any)',
          aperture: 'f/8 - f/11',
          whiteBalance: 'Daylight or Auto',
          focus: 'Manual or Single-Point AF',
        }
      };
    } else if (lower.includes('macro') || lower.includes('close up')) {
      result = {
        name: 'Macro Photography',
        description: 'Close-up photography requiring a narrow aperture to get a usable depth of field.',
        settings: {
          iso: '100 - 400 (Use Flash/Strobe)',
          shutter: '1/200s (Sync Speed)',
          aperture: 'f/11 - f/16',
          whiteBalance: 'Flash (5500K)',
          focus: 'Manual Focus (Rock back and forth)',
        }
      };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/studio/concierge] Error:', err);
    return NextResponse.json({ error: 'RV Bot recommendation failed.' }, { status: 500 });
  }
}
