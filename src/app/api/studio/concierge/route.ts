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
    const deviceModel: string = body.deviceModel || 'Standard';

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'Provide a photography type or prompt.' },
        { status: 400 }
      );
    }

    const lower = prompt.toLowerCase();
    const modelName = deviceModel.trim();
    const brand = modelName.toLowerCase();

    // 1. Attempt OpenAI Dynamic Customization
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey && openaiApiKey !== 'placeholder') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `You are the NIRA6 RV Bot, an expert photography assistant. You generate exact manual camera or phone settings, tips, and step-by-step instructions tailored specifically to the user's camera model or mobile model.
Do not return generic or standardized settings like "f/1.4 - f/2.8" or "100 - 200". Give specific, precise, realistic values or range suggestions that are highly optimized for the requested photography style on that exact device.
For example, if the device is a specific camera model (e.g. Sony A7IV) and style is "Portrait", recommend specific settings suited for it (e.g. ISO 100, f/1.8, 1/200s, Eye AF tracking).
The steps should include specific dial settings, buttons, or menus specific to that brand/model (e.g. Sony's Fn menu, Canon's Q button, iPhone's ProRAW selector or native sliders).

You must respond ONLY with a JSON object that matches the following schema:
{
  "name": "Photography Style Name",
  "description": "Short description of the photo setup",
  "sampleImage": "Choose exactly one of: '/assets/style_portrait.png', '/assets/style_astrophotography.png', '/assets/style_landscape.png', '/assets/style_sports.png', '/assets/style_macro.png', '/assets/style_street.png'",
  "settings": {
    "iso": "Specific ISO value or setting suited for this model and style",
    "shutter": "Specific shutter speed suited for this model and style",
    "aperture": "Specific aperture value (f-number) or simulation mode/lens suggestion suited for this model and style",
    "whiteBalance": "Specific White Balance setting (e.g. Daylight, custom Kelvin, etc.)",
    "focus": "Specific focus mode/setup suited for this model and style"
  },
  "tips": [
    "Tip 1 tailored to style & device model",
    "Tip 2",
    "Tip 3"
  ],
  "steps": [
    "Step 1 specific to device model menu or physical buttons",
    "Step 2",
    "Step 3",
    "Step 4",
    "Step 5"
  ]
}`
              },
              {
                role: 'user',
                content: `Photography Style/Prompt: "${prompt}"\nDevice Type: "${deviceType}"\nDevice Model: "${modelName}"`
              }
            ],
            temperature: 0.3
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let jsonText = data.choices[0].message.content || '';
          
          // Strip potential markdown JSON code block formatting
          jsonText = jsonText.trim();
          if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
          }
          jsonText = jsonText.trim();

          const parsed = JSON.parse(jsonText);
          return NextResponse.json(parsed, { status: 200 });
        } else {
          console.warn('[api/studio/concierge] OpenAI API returned status:', response.status);
        }
      } catch (err) {
        console.error('[api/studio/concierge] Failed to fetch settings from OpenAI:', err);
      }
    }

    // 2. Fallback rules-based classification with highly brand-specific settings
    let result: any = {
      name: 'Portrait Photography',
      description: 'A beautiful portrait setup focused on isolating your subject with a soft, blurred background.',
      sampleImage: '/assets/style_portrait.png',
      settings: {
        iso: '100',
        shutter: '1/200s',
        aperture: deviceType === 'camera' ? 'f/1.8' : 'Portrait Mode (Max Aperture Simulation)',
        whiteBalance: '5200K (Daylight)',
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
          iso: deviceType === 'camera' ? '3200' : '800 (Night Mode active)',
          shutter: deviceType === 'camera' ? '20s' : '30s (Tripod auto-detection)',
          aperture: deviceType === 'camera' ? 'f/2.8 (Wide Open)' : 'Standard lens (Lowest f-number)',
          whiteBalance: '4000K (Cool tint)',
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
          iso: '100 (Lowest native)',
          shutter: '2s (Silky water) or 15s (Light trails)',
          aperture: deviceType === 'camera' ? 'f/11' : 'Pro Mode (Locked exposure)',
          whiteBalance: '5500K',
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
          iso: '800',
          shutter: '1/1600s (Fast to freeze)',
          aperture: deviceType === 'camera' ? 'f/2.8' : 'Telephoto lens (if available)',
          whiteBalance: 'Auto (AWB)',
          focus: deviceType === 'camera' ? 'Continuous Tracking (AF-C)' : 'Burst Mode tracking',
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
          iso: '100',
          shutter: '1/160s',
          aperture: deviceType === 'camera' ? 'f/8 (Sweet spot)' : 'Wide Angle lens (0.5x)',
          whiteBalance: '5500K (Daylight)',
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
          iso: '200',
          shutter: '1/200s (Standard sync speed)',
          aperture: deviceType === 'camera' ? 'f/13' : 'Macro Lens Mode (automatic)',
          whiteBalance: 'Auto (AWB)',
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
          iso: deviceType === 'camera' ? '1600' : '400 (Night mode active)',
          shutter: '1/160s',
          aperture: deviceType === 'camera' ? 'f/2.0' : 'Night mode (simulated)',
          whiteBalance: '4200K (Cool urban mood)',
          focus: 'Zone focusing or Eye AF tracking',
        },
        tips: [
          'Look for neon signs or street lamps to act as primary light sources to light your subject\'s face.',
          'Find wet pavement after rain to capture beautiful, vibrant reflections of colored city lights.',
          'Shoot from the hip or pre-focus on a spot and wait for a subject to walk into your frame.'
        ]
      };
    }

    // Dynamic settings overrides based on modelName brand
    if (brand.includes('sony')) {
      result.settings.focus = 'Real-time Eye AF / Tracking AF-C';
      if (lower.includes('portrait')) {
        result.settings.aperture = 'f/1.8 (Sony prime lens sweet spot)';
      }
    } else if (brand.includes('canon')) {
      result.settings.focus = 'Dual Pixel CMOS AF / Servo AF';
    } else if (brand.includes('nikon')) {
      result.settings.focus = 'Subject Tracking AF / AF-C';
    } else if (brand.includes('fuji')) {
      result.settings.focus = 'Eye Detection AF (AF-C Mode)';
    } else if (brand.includes('iphone')) {
      result.settings.focus = 'Tap-to-focus and slide exposure (AE/AF Lock)';
      if (brand.includes('15') || brand.includes('16') || brand.includes('pro')) {
        result.settings.aperture = 'Main Camera f/1.78 (Portrait Mode simulation)';
      }
    } else if (brand.includes('samsung') || brand.includes('galaxy')) {
      result.settings.focus = 'Laser Auto Focus / Tracking AF';
    }

    // Set customized steps using the deviceModel name
    if (deviceType === 'mobile') {
      const isIphone = brand.includes('iphone');
      const isSamsung = brand.includes('samsung') || brand.includes('galaxy');

      result.steps = [
        `Mount your ${modelName} securely in a clamp or tripod mount.`,
        isIphone ? `Open the iOS Camera app, tap the top arrow, and enable Apple ProRAW (12MP/48MP) if available.` :
        isSamsung ? `Open the Samsung Camera app, select "More", and open "Pro Mode" or "Expert RAW".` :
        `Open the native camera app on your ${modelName} and switch to "Pro Mode" or "Manual Mode".`,
        `Set the manual dials: ISO ${result.settings.iso}, Shutter ${result.settings.shutter}, and Aperture ${result.settings.aperture}.`,
        isIphone ? 'Tap your subject on the screen, then slide the sun icon next to the box to fine-tune exposure.' :
        'Tap to focus on your subject, and toggle the manual focus slider to adjust details.',
        `Use the physical volume down button on your ${modelName} as the shutter release or trigger a 3-second self-timer.`
      ];
    } else {
      const isSony = brand.includes('sony');
      const isCanon = brand.includes('canon');
      const isNikon = brand.includes('nikon');
      const isFuji = brand.includes('fuji');

      result.steps = [
        `Mount your ${modelName} on a sturdy tripod and switch the mode dial to Manual (M).`,
        isSony ? `Press the Fn button on your ${modelName} to set focus mode to AF-C and select Real-time Eye AF.` :
        isCanon ? `Use the Q menu on your ${modelName} to set Focus Method to Face/Eye tracking in Servo AF.` :
        isNikon ? `Press the [i] button on your ${modelName} to configure Focus Mode to AF-C with subject tracking.` :
        isFuji ? `Press the Q button on your ${modelName} to enable Face/Eye detection AF.` :
        `Configure your ${modelName}'s focus mode to: ${result.settings.focus}.`,
        `Dial in the manual exposure settings: ISO ${result.settings.iso}, Shutter ${result.settings.shutter}, and Aperture ${result.settings.aperture}.`,
        `Go to the image format menu on your ${modelName} and select uncompressed RAW to retain maximum dynamic range.`,
        isSony ? `Set the drive mode to Self-Timer (2s) or use the Sony Creator App remote shutter.` :
        isCanon ? `Configure drive mode to 2-second self-timer to prevent touch-shake.` :
        `Use a remote shutter release or configure a 2-second exposure delay on your ${modelName} to avoid shutter shake.`
      ];
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[api/studio/concierge] Error:', err);
    return NextResponse.json({ error: 'RV Bot recommendation failed.' }, { status: 500 });
  }
}
