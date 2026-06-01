import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — RV Bot API (/api/studio/concierge)
   POST: Accepts style/prompt, deviceType, and deviceModel.
         Returns recommended camera settings, steps using the
         actual model, and a sample image path.
   ═══════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string = body.prompt || body.style || '';
    const deviceType: 'camera' | 'mobile' = body.deviceType || 'camera';
    const deviceModel: string = body.deviceModel || 'Standard Camera';

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'Provide a photography type or prompt.' },
        { status: 400 }
      );
    }

    const lower = prompt.toLowerCase();
    const modelName = deviceModel.trim() || (deviceType === 'camera' ? 'DSLR/Mirrorless Camera' : 'Smartphone');

    let result: any = {
      name: 'Portrait Photography',
      description: 'A beautiful portrait setup focused on isolating your subject with a soft, blurred background.',
      sampleImage: '/assets/style_portrait.png',
      settings: {
        iso: '100 - 200 (Low for clarity)',
        shutter: '1/200s (Avoid camera shake)',
        aperture: deviceType === 'camera' ? 'f/1.4 - f/2.8' : 'Portrait Mode (Max Aperture Simulation)',
        whiteBalance: '5200K (Daylight) or Auto',
        focus: deviceType === 'camera' ? 'Eye Autofocus (AF-C)' : 'Tap subject to lock eye focus',
      },
      tips: [
        'Position your subject in soft window light or during golden hour to get flattering shadows.',
        'Create depth by putting some distance between your subject and the background.',
        'Align your subject\'s eyes with the upper horizontal grid line for a strong composition.'
      ]
    };

    if (lower.includes('star') || lower.includes('astro') || lower.includes('night sky') || lower.includes('sky')) {
      result = {
        name: 'Astrophotography & Star Trails',
        description: 'Settings to capture the stars, Milky Way, or circular trails at night. Requires a sturdy tripod.',
        sampleImage: '/assets/style_astrophotography.png',
        settings: {
          iso: deviceType === 'camera' ? '1600 - 3200' : '400 - 800 (Night Mode active)',
          shutter: deviceType === 'camera' ? '20s - 25s' : '10s - 30s (Tripod auto-detection)',
          aperture: deviceType === 'camera' ? 'f/1.4 - f/2.8 (Wide Open)' : 'Standard lens (Lowest f-number)',
          whiteBalance: '3800K - 4200K (Cool blue tint)',
          focus: 'Manual Focus (Infinity ∞)',
        },
        tips: [
          'Locate the North Star (Polaris) to create perfect circular star trails around a central point.',
          'Turn off image stabilization on your lens/body since you are using a tripod to avoid internal drift.',
          'For star fields, use the 500-Rule (500 divided by focal length = max shutter speed in seconds to avoid star trails).'
        ]
      };
    } else if (lower.includes('slow shutter') || lower.includes('waterfall') || lower.includes('light trail') || lower.includes('motion')) {
      result = {
        name: 'Slow Shutter & Motion Blur',
        description: 'Ideal for silky waterfalls or car light trails. Requires a stable mount and possibly an ND filter.',
        sampleImage: '/assets/style_landscape.png',
        settings: {
          iso: '50 - 100 (Lowest possible)',
          shutter: '1/2s - 4s (Silky water) or 10s+ (Light trails)',
          aperture: deviceType === 'camera' ? 'f/8 - f/16' : 'Pro Mode (Locked exposure)',
          whiteBalance: 'Auto (AWB) or 5500K',
          focus: 'Single AF on stationary foreground',
        },
        tips: [
          'Use a Neutral Density (ND) filter during daylight to avoid overexposing the long exposure.',
          'Keep rock formations or roads razor sharp to create a striking contrast with the blurred motion.',
          'Position yourself low to the ground to capture longer, more dynamic light streaks.'
        ]
      };
    } else if (lower.includes('sport') || lower.includes('action') || lower.includes('wildlife') || lower.includes('fast') || lower.includes('running')) {
      result = {
        name: 'High-Speed Sports & Action',
        description: 'Fast shutter speed configuration designed to freeze rapid motion in sports, wildlife, or events.',
        sampleImage: '/assets/style_sports.png',
        settings: {
          iso: '400 - 1600 (Depending on ambient light)',
          shutter: '1/1000s - 1/2000s (Fast to freeze)',
          aperture: deviceType === 'camera' ? 'f/2.8 - f/4' : 'Telephoto lens (if available)',
          whiteBalance: 'Auto (AWB)',
          focus: deviceType === 'camera' ? 'Continuous Tracking (AF-C / AI Servo)' : 'Burst Mode tracking',
        },
        tips: [
          'Anticipate the direction of movement and leave space in front of the subject for them to "move into".',
          'Use burst mode to capture a rapid sequence; you only need one frame to be perfectly timed.',
          'Try panning with the subject at 1/60s to create a blurred speed effect in the background.'
        ]
      };
    } else if (lower.includes('landscape') || lower.includes('nature') || lower.includes('architecture') || lower.includes('mountain')) {
      result = {
        name: 'Landscape & Architecture',
        description: 'Maximize your depth of field to ensure both close-up elements and distant horizons are sharp.',
        sampleImage: '/assets/style_landscape.png',
        settings: {
          iso: '100 (Cleanest image quality)',
          shutter: '1/125s (Handheld) or any (on Tripod)',
          aperture: deviceType === 'camera' ? 'f/8 - f/11 (Sweet spot)' : 'Wide Angle lens (0.5x)',
          whiteBalance: 'Daylight (5500K)',
          focus: 'Single point focus on one-third into the scene',
        },
        tips: [
          'Use leading lines like paths, walls, or shorelines to guide the viewer\'s eyes through the frame.',
          'Compose during Golden Hour or Blue Hour to get long, dramatic shadows and warm golden highlights.',
          'Activate the rule of thirds grid and ensure your horizon line is perfectly level.'
        ]
      };
    } else if (lower.includes('macro') || lower.includes('close up') || lower.includes('insect') || lower.includes('flower')) {
      result = {
        name: 'Macro Close-Up Photography',
        description: 'Extremely detailed close-up shooting. The depth of field is razor-thin, requiring precise focus.',
        sampleImage: '/assets/style_macro.png',
        settings: {
          iso: '100 - 400 (Use strobe flash if possible)',
          shutter: '1/200s (Standard flash sync speed)',
          aperture: deviceType === 'camera' ? 'f/11 - f/16' : 'Macro Lens Mode (automatic)',
          whiteBalance: 'Flash (5500K) or Auto',
          focus: 'Manual Focus (Rock device back/forth)',
        },
        tips: [
          'Shoot parallel to your subject to maximize the parts of it that stay within the thin focus plane.',
          'A diff-strobe is highly recommended to light the subject since close distance blocks ambient light.',
          'Use manual focus: set the focus distance, then slowly move closer until the details pop in sharp.'
        ]
      };
    } else if (lower.includes('street') || lower.includes('night') || lower.includes('neon') || lower.includes('city')) {
      result = {
        name: 'Street & Night Cityscapes',
        description: 'High contrast, moody settings for street scenes, neon reflections, and low-light urban environments.',
        sampleImage: '/assets/style_street.png',
        settings: {
          iso: deviceType === 'camera' ? '800 - 3200' : '400 - 800 (Night mode)',
          shutter: '1/125s (Freeze pedestrian motion)',
          aperture: deviceType === 'camera' ? 'f/1.8 - f/2.8 (Bright aperture)' : 'Night mode (simulated)',
          whiteBalance: 'Auto (AWB) or 4000K (Cool urban mood)',
          focus: 'Zone focusing or Eye AF tracking',
        },
        tips: [
          'Look for neon signs or street lamps to act as primary light sources to light your subject\'s face.',
          'Find wet pavement after rain to capture beautiful, vibrant reflections of colored city lights.',
          'Shoot from the hip or pre-focus on a spot and wait for a subject to walk into your frame.'
        ]
      };
    }

    // Set customized steps using the deviceModel name
    if (deviceType === 'mobile') {
      result.steps = [
        `Mount your ${modelName} on a tripod or hold it firmly with both hands.`,
        'Open the camera application and switch to "Pro Mode", "Manual Mode", or a specialized settings app.',
        'Lock focus by tapping your primary subject, then drag the exposure slider to balance highlights.',
        `Ensure your ${modelName}'s lens is wiped clean, and shoot in RAW format if available.`,
        'Use the 3-second self-timer to prevent touch-shake when taking the photograph.'
      ];
    } else {
      result.steps = [
        `Mount your ${modelName} on a sturdy tripod and switch the mode dial to Manual (M).`,
        `Attach your preferred lens and toggle the switch to Manual Focus (MF) or continuous tracking (AF-C).`,
        `Dial in the settings: ISO ${result.settings.iso}, Shutter ${result.settings.shutter}, and Aperture ${result.settings.aperture}.`,
        'Select RAW format in your camera menu to retain maximum dynamic range for color grading.',
        `Use a remote shutter trigger or configure a 2-second exposure delay on your ${modelName} to avoid shutter shake.`
      ];
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/studio/concierge] Error:', err);
    return NextResponse.json({ error: 'RV Bot recommendation failed.' }, { status: 500 });
  }
}
