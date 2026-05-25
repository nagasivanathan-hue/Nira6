import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — AI Photo Analysis API  (/api/analyze-photo)
   Sends an image URL to OpenAI GPT-4o Vision and returns
   structured photography telemetry as JSON.
   ═══════════════════════════════════════════════════════════ */

interface AnalysisResult {
  aperture: string;
  iso: string;
  shutter_speed: string;
  focal_length: string;
  lighting_type: string;
  editing_style: string;
  photography_style: string;
  recreation_tips: string[];
  confidence_score: number;
}

const SYSTEM_PROMPT = `You are an expert photography analyst and Director of Photography. Given an image, analyze its visual characteristics and estimate the camera settings and artistic choices used to create it.

You MUST respond with ONLY a valid JSON object — no markdown, no backticks, no explanation. The JSON must have exactly these fields:

{
  "aperture": "estimated f-stop (e.g. f/2.8)",
  "iso": "estimated ISO value (e.g. 400)",
  "shutter_speed": "estimated shutter speed (e.g. 1/125s)",
  "focal_length": "estimated focal length (e.g. 85mm)",
  "lighting_type": "type of lighting (e.g. Natural golden hour, Studio three-point, Mixed ambient)",
  "editing_style": "post-processing style (e.g. Film emulation, HDR, Minimal grading)",
  "photography_style": "genre/style (e.g. Portrait, Street, Cinematic, Product)",
  "recreation_tips": ["array of 3-5 actionable tips to recreate this shot"],
  "confidence_score": 0.85
}

The confidence_score should be between 0.0 and 1.0 reflecting how confident you are in the analysis.`;

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
        max_tokens: 800,
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
    // Strip any markdown fences if GPT wraps them despite instructions
    const cleaned = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    let analysis: AnalysisResult;
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
    const result: AnalysisResult = {
      aperture: String(analysis.aperture || 'Unknown'),
      iso: String(analysis.iso || 'Unknown'),
      shutter_speed: String(analysis.shutter_speed || 'Unknown'),
      focal_length: String(analysis.focal_length || 'Unknown'),
      lighting_type: String(analysis.lighting_type || 'Unknown'),
      editing_style: String(analysis.editing_style || 'Unknown'),
      photography_style: String(analysis.photography_style || 'Unknown'),
      recreation_tips: Array.isArray(analysis.recreation_tips)
        ? analysis.recreation_tips.map(String)
        : [],
      confidence_score: typeof analysis.confidence_score === 'number'
        ? Math.min(1, Math.max(0, analysis.confidence_score))
        : 0.5,
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
