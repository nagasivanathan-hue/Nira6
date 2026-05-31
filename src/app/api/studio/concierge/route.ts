import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — RV Bot API  (/api/studio/concierge)
   POST: Accepts a scene prompt, returns recommended manual 
         camera settings and optional step-by-step procedure.
   ═══════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string = body.prompt || '';

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'Provide a scene description prompt.' },
        { status: 400 }
      );
    }

    const lower = prompt.toLowerCase();
    
    // Device detection
    const mobileKeywords = ['iphone', 'galaxy', 'pixel', 'samsung', 'apple', 'mobile', 'phone', 'smartphone'];
    const cameraKeywords = ['sony', 'canon', 'nikon', 'fujifilm', 'lumix', 'panasonic', 'camera', 'dslr', 'mirrorless'];
    
    let deviceType: 'mobile' | 'camera' | null = null;
    let detectedDeviceName = '';
    
    for (const kw of mobileKeywords) {
      if (lower.includes(kw)) {
        deviceType = 'mobile';
        detectedDeviceName = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }
    
    if (!deviceType) {
      for (const kw of cameraKeywords) {
        if (lower.includes(kw)) {
          deviceType = 'camera';
          detectedDeviceName = kw.charAt(0).toUpperCase() + kw.slice(1);
          break;
        }
      }
    }

    let result: any = {
      name: 'Standard Portrait',
      description: 'A balanced setup for standard photography with a slightly shallow depth of field for subject isolation.',
      settings: {
        iso: '100 - 200',
        shutter: '1/200s',
        aperture: 'f/1.8 - f/2.8',
        whiteBalance: 'Auto (AWB) or 5200K',
        focus: 'Continuous AF (Eye Tracking)',
      },
      tips: [
        'Shoot during the golden hour for soft, flattering directional light.',
        'Keep the subject\'s eyes in the upper third of the frame for a stronger composition.',
        'Use negative space around the subject to give the portrait breathing room.'
      ]
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
        },
        tips: [
          'Locate the North Star (Polaris) to create perfect circular star trails around a central point.',
          'Include a strong foreground element (like a tree, tent, or mountain peak) to give the sky a sense of scale.',
          'Avoid nights with a full moon if you want to capture the faint details of the Milky Way.'
        ]
      };
      if (deviceType) {
        result.steps = deviceType === 'mobile' 
          ? [
              `Mount your ${detectedDeviceName} on a sturdy tripod.`,
              'Open your camera app and switch to Pro/Manual mode or use a specialized long-exposure app.',
              'Set the focus to Manual and slide it all the way to Infinity (∞).',
              'Set your shutter speed to the maximum allowed (usually 10-30s) and ISO to 800.',
              'Use a 3-second timer to avoid shaking the device when tapping the shutter button.'
            ]
          : [
              `Mount your ${detectedDeviceName} on a sturdy tripod to completely eliminate camera shake.`,
              'Switch your camera dial to Manual (M) mode.',
              'Turn off autofocus on your lens and set the focus ring to Infinity (∞).',
              'Set your aperture as wide as possible (e.g., f/1.4 to f/2.8), shutter speed to 20-30s, and ISO between 800-3200.',
              'Use a remote shutter release or a 2-second timer to take the shot without touching the camera.'
            ];
      }
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
        },
        tips: [
          'For waterfalls, compose the shot so the water leads the viewer\'s eye from the foreground into the background.',
          'Include stationary elements like rocks or bridges in the frame to emphasize the motion blur by contrast.',
          'When shooting light trails, try positioning yourself low to the ground to make the trails look larger and more dynamic.'
        ]
      };
      if (deviceType) {
        result.steps = deviceType === 'mobile'
          ? [
              `Place your ${detectedDeviceName} on a tripod or lean it against a stable surface.`,
              'If shooting a waterfall in daylight, use a Live Photo mode and apply the Long Exposure effect, or use a Pro app.',
              'For light trails at night, switch to Pro mode and lower your ISO to the minimum.',
              'Adjust the shutter speed between 1 to 5 seconds depending on the traffic/water speed.',
              'Use a timer to trigger the shutter.'
            ]
          : [
              `Mount your ${detectedDeviceName} on a tripod.`,
              'If shooting in daylight, attach an ND (Neutral Density) filter to your lens to avoid overexposure.',
              'Set your camera to Shutter Priority (S/Tv) or Manual (M) mode.',
              'Lower ISO to 100 and set shutter speed to 1-5 seconds.',
              'Focus on your static subject, then switch to manual focus to lock it before pressing the shutter.'
            ];
      }
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
        },
        tips: [
          'Anticipate the action. Press the shutter a fraction of a second before the peak moment occurs.',
          'Leave empty space in front of a moving subject so it has room to "move" into the frame.',
          'Try panning with the subject at a slightly slower shutter speed (e.g., 1/60s) to blur the background while keeping the subject sharp.'
        ]
      };
      if (deviceType) {
        result.steps = deviceType === 'mobile'
          ? [
              `Hold your ${detectedDeviceName} firmly with both hands.`,
              'Tap and hold on the subject on your screen to lock focus and exposure.',
              'If your phone has an Action mode or Burst mode, enable it now.',
              'Follow the subject smoothly (panning) while holding down the shutter button to capture a burst of photos.',
              'Review the burst sequence and save the sharpest frame.'
            ]
          : [
              `Set your ${detectedDeviceName} to Shutter Priority (S/Tv) or Manual (M) mode.`,
              'Dial your shutter speed up to 1/1000s or faster to freeze the action.',
              'Change your autofocus mode to Continuous (AF-C / AI Servo) so it tracks the moving subject.',
              'Set your drive mode to High-Speed Continuous (Burst mode).',
              'Half-press the shutter to track the subject, then fully press and hold to shoot the burst.'
            ];
      }
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
        },
        tips: [
          'Use leading lines, such as a path, river, or fence, to draw the viewer\'s eye deep into the landscape.',
          'Include a foreground element very close to the camera to create a sense of three-dimensional depth.',
          'Look for framing elements like overhanging branches or archways to naturally border your subject.'
        ]
      };
      if (deviceType) {
        result.steps = deviceType === 'mobile'
          ? [
              `Switch your ${detectedDeviceName} to the wide-angle lens (e.g., 0.5x).`,
              'Tap on the primary point of interest in the distance to set focus.',
              'If the sky is too bright, tap the screen and drag the exposure slider down slightly.',
              'Hold the device steady and keep the horizon level (use the grid overlay if available).',
              'Take the shot, or use panorama mode for an even wider field of view.'
            ]
          : [
              `Attach a wide-angle lens to your ${detectedDeviceName} and mount it on a tripod.`,
              'Switch to Aperture Priority (A/Av) or Manual (M) mode.',
              'Stop down your aperture to f/8 or f/11 to ensure front-to-back sharpness (deep depth of field).',
              'Set ISO to 100 for maximum dynamic range and minimal noise.',
              'Use a single autofocus point to focus one-third of the way into the scene, then take the photo.'
            ];
      }
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
        },
        tips: [
          'Shoot parallel to your subject (like the wing of a butterfly) to get as much of it in focus as possible.',
          'Backgrounds matter. Shift your angle slightly to get a clean, uncluttered background that makes the tiny subject pop.',
          'Shoot early in the morning when insects are cold and sluggish, making them easier to photograph.'
        ]
      };
      if (deviceType) {
        result.steps = deviceType === 'mobile'
          ? [
              `Move your ${detectedDeviceName} extremely close to the subject (within a few inches).`,
              'If your device has an ultra-wide lens with macro capabilities, ensure Macro mode is triggered (often automatic).',
              'Tap the subject on the screen to lock focus.',
              'Ensure there is plenty of light hitting the subject, as macro blocks ambient light.',
              'Hold your breath to stay perfectly still, then capture the image.'
            ]
          : [
              `Attach a dedicated Macro lens (e.g., 90mm or 100mm) to your ${detectedDeviceName}.`,
              'Switch your camera and lens to Manual Focus.',
              'Set your aperture to f/11 or f/16 to get enough depth of field on the tiny subject.',
              'Turn on your flash or macro ring light to compensate for the narrow aperture.',
              'Physically rock your body slightly forward and backward until the subject is razor sharp, then press the shutter.'
            ];
      }
    } else {
      // Default fallback steps
      if (deviceType) {
        result.steps = deviceType === 'mobile'
          ? [
              `Clean the lens of your ${detectedDeviceName} with a microfiber cloth.`,
              'Frame your subject using the rule of thirds grid on your screen.',
              'Tap on the subject to lock focus and adjust the exposure slider if needed.',
              'Hold the device steady and press the shutter button.'
            ]
          : [
              `Make sure your ${detectedDeviceName} is in Aperture Priority or Manual mode.`,
              'Select an appropriate ISO based on your lighting (100 for sun, 800+ for indoors).',
              'Set your aperture to control the depth of field (lower f-number for blurry background).',
              'Focus on your subject\'s eyes or the most critical element of the scene.',
              'Press the shutter smoothly without jerking the camera.'
            ];
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/studio/concierge] Error:', err);
    return NextResponse.json({ error: 'RV Bot recommendation failed.' }, { status: 500 });
  }
}

