import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — AI Photo Analysis API  (/api/analyze-photo)
   Sends an image URL to OpenAI GPT-4o Vision and returns
   structured photography telemetry as JSON.
   ═══════════════════════════════════════════════════════════ */

interface EstimatedValue {
  value: string;
  confidence: string;
}

interface AnalysisResult {
  aperture: EstimatedValue;
  iso: EstimatedValue;
  shutter_speed: EstimatedValue;
  focal_length: EstimatedValue;
  lens_type: EstimatedValue;
  lighting_setup: EstimatedValue;
  time_of_day: EstimatedValue;
  editing_style: EstimatedValue;
  photography_category: EstimatedValue;
  difficulty_to_recreate: EstimatedValue;
  explanations: {
    why_settings_used: string;
    how_to_recreate: string;
    beginner_friendly_tips: string;
  };
}

const SYSTEM_PROMPT = `You are a professional photography analyst AI.

Analyze this uploaded image and estimate:

1. Aperture
2. ISO
3. Shutter speed
4. Focal length
5. Lens type
6. Lighting setup
7. Time of day
8. Editing/color grading style
9. Photography category
10. Difficulty to recreate

Then explain:
- Why these settings were likely used
- How to recreate this image
- Beginner-friendly tips

Return ONLY valid JSON.

Add confidence percentages for every estimate.

Format your output exactly like this:
{
  "aperture": { "value": "f/2.8", "confidence": "90%" },
  "iso": { "value": "400", "confidence": "85%" },
  "shutter_speed": { "value": "1/125s", "confidence": "80%" },
  "focal_length": { "value": "85mm", "confidence": "95%" },
  "lens_type": { "value": "Prime / Zoom", "confidence": "85%" },
  "lighting_setup": { "value": "Three-point / Natural light", "confidence": "90%" },
  "time_of_day": { "value": "Golden Hour / Studio", "confidence": "95%" },
  "editing_style": { "value": "Cinematic warm / Vintage film", "confidence": "85%" },
  "photography_category": { "value": "Portrait / Landscape", "confidence": "95%" },
  "difficulty_to_recreate": { "value": "Medium / Easy / Hard", "confidence": "80%" },
  "explanations": {
    "why_settings_used": "Detailed explanation of why these settings were selected.",
    "how_to_recreate": "Step-by-step description of how to recreate this image.",
    "beginner_friendly_tips": "Beginner-friendly tips to get started."
  }
}`;

export async function POST(request: NextRequest) {
  try {
    // ── 1. Validate API key ──────────────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured on the server.' },
        { status: 503 }
      );
    }

    // ── 2. Parse & validate request body ─────────────────────
    const body = await request.json().catch(() => null);
    if (!body || typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "imageUrl" in request body.' },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'The provided imageUrl is not a valid URL.' },
        { status: 400 }
      );
    }

    // ── 3. Call OpenAI GPT-4o Vision ─────────────────────────
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this photograph and return the structured JSON response with camera settings, style analysis, and recreation tips.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text().catch(() => 'Unknown error');
      console.error('[analyze-photo] OpenAI API error:', openaiResponse.status, errText);
      return NextResponse.json(
        { error: 'Failed to analyze image. The AI service returned an error.' },
        { status: 502 }
      );
    }

    const openaiData = await openaiResponse.json();
    const rawContent = openaiData?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'The AI service returned an empty response.' },
        { status: 502 }
      );
    }

    // ── 4. Parse the JSON response from GPT ──────────────────
    const cleaned = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let analysis: any;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      console.error('[analyze-photo] Failed to parse GPT response as JSON:', cleaned);
      return NextResponse.json(
        { error: 'The AI returned a malformed response. Please try again.' },
        { status: 502 }
      );
    }

    // ── 5. Validate and normalize the response ───────────────
    const normalizeEstimatedValue = (val: any, defaultVal: string): EstimatedValue => {
      if (val && typeof val === 'object') {
        return {
          value: String(val.value || defaultVal),
          confidence: String(val.confidence || '50%'),
        };
      }
      return {
        value: String(val || defaultVal),
        confidence: '50%',
      };
    };

    const result: AnalysisResult = {
      aperture: normalizeEstimatedValue(analysis.aperture, 'f/2.8'),
      iso: normalizeEstimatedValue(analysis.iso, '400'),
      shutter_speed: normalizeEstimatedValue(analysis.shutter_speed, '1/125s'),
      focal_length: normalizeEstimatedValue(analysis.focal_length, '50mm'),
      lens_type: normalizeEstimatedValue(analysis.lens_type, 'Prime'),
      lighting_setup: normalizeEstimatedValue(analysis.lighting_setup, 'Soft lighting'),
      time_of_day: normalizeEstimatedValue(analysis.time_of_day, 'Studio'),
      editing_style: normalizeEstimatedValue(analysis.editing_style, 'Clean'),
      photography_category: normalizeEstimatedValue(analysis.photography_category, 'General'),
      difficulty_to_recreate: normalizeEstimatedValue(analysis.difficulty_to_recreate, 'Medium'),
      explanations: {
        why_settings_used: String(
          analysis.explanations?.why_settings_used || 
          analysis.why_settings_used || 
          'No explanation provided.'
        ),
        how_to_recreate: String(
          analysis.explanations?.how_to_recreate || 
          analysis.how_to_recreate || 
          'No recreation guide provided.'
        ),
        beginner_friendly_tips: String(
          analysis.explanations?.beginner_friendly_tips || 
          analysis.beginner_friendly_tips || 
          'No beginner tips provided.'
        ),
      },
    };

    return NextResponse.json(result, { status: 200 });

  } catch (err) {
    console.error('[analyze-photo] Unexpected server error:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
