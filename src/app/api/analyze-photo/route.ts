import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import dbConnect from '@/lib/db/mongodb';
import PhotoAnalysis from '@/models/PhotoAnalysis';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — Advanced AI Photo Analysis API (/api/analyze-photo)
   ═══════════════════════════════════════════════════════════ */

interface EstimatedValue {
  value: string;
  confidence: string;
}

interface AnalysisResult {
  camera_model: string;
  lens_model: string;
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
  
  // Section 7 JSON Format alignment properties:
  lighting_type: string;
  photography_style: string;
  difficulty_level: string;
  confidence_score: string;
  recreation_tips: string[];
  beginner_tips: string[];

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
5. Lens type / Lens model
6. Lighting setup / Lighting type
7. Time of day
8. Editing/color grading style
9. Photography category / Photography style
10. Difficulty to recreate / Difficulty level

Format your output exactly like this valid JSON structure:
{
  "camera_model": "e.g. Sony Alpha 7S III",
  "lens_model": "e.g. FE 24-70mm f/2.8 GM II",
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
  "lighting_type": "Three-point studio lighting",
  "photography_style": "Portrait / Cinematic",
  "difficulty_level": "Medium",
  "confidence_score": "88%",
  "recreation_tips": [
    "Why settings were likely used: ...",
    "How to recreate: Setup lights at 45 degree angle..."
  ],
  "beginner_tips": [
    "Tip 1: Use a wide aperture to blur the background.",
    "Tip 2: Place key light slightly higher than the subject."
  ],
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

    // ── 2. Parse request body ────────────────────────────────
    const body = await request.json().catch(() => null);
    if (!body || typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "imageUrl" in request body.' },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    // Validate URL syntax
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'The provided imageUrl is not a valid URL.' },
        { status: 400 }
      );
    }

    // ── 3. Image Optimization with Sharp ─────────────────────
    let optimizedImageUrl = imageUrl;
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Optimize image with Sharp: resize to max 1500px width, compress to JPEG
        const optimizedBuffer = await sharp(buffer)
          .resize({ width: 1500, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const base64Image = optimizedBuffer.toString('base64');
        optimizedImageUrl = `data:image/jpeg;base64,${base64Image}`;
      }
    } catch (optErr) {
      console.warn('[analyze-photo] Sharp optimization skipped or failed, using original URL:', optErr);
    }

    // ── 4. Call OpenAI GPT-4o Vision ─────────────────────────
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
                text: 'Analyze this photograph and return the structured JSON response according to the schema instructions.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: optimizedImageUrl,
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

    // ── 5. Parse the JSON response from GPT ──────────────────
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

    // Normalize utility function
    const normalizeValue = (val: any, defaultVal: string): EstimatedValue => {
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
      camera_model: String(analysis.camera_model || 'Unknown Camera'),
      lens_model: String(analysis.lens_model || 'Unknown Lens'),
      aperture: normalizeValue(analysis.aperture, 'f/2.8'),
      iso: normalizeValue(analysis.iso, '400'),
      shutter_speed: normalizeValue(analysis.shutter_speed, '1/125s'),
      focal_length: normalizeValue(analysis.focal_length, '50mm'),
      lens_type: normalizeValue(analysis.lens_type || analysis.lens_model, 'Prime'),
      lighting_setup: normalizeValue(analysis.lighting_setup || analysis.lighting_type, 'Soft lighting'),
      time_of_day: normalizeValue(analysis.time_of_day, 'Studio'),
      editing_style: normalizeValue(analysis.editing_style, 'Clean'),
      photography_category: normalizeValue(analysis.photography_category || analysis.photography_style, 'General'),
      difficulty_to_recreate: normalizeValue(analysis.difficulty_to_recreate || analysis.difficulty_level, 'Medium'),
      
      lighting_type: String(analysis.lighting_type || analysis.lighting_setup?.value || 'Soft lighting'),
      photography_style: String(analysis.photography_style || analysis.photography_category?.value || 'General'),
      difficulty_level: String(analysis.difficulty_level || analysis.difficulty_to_recreate?.value || 'Medium'),
      confidence_score: String(analysis.confidence_score || '85%'),
      recreation_tips: Array.isArray(analysis.recreation_tips) ? analysis.recreation_tips : [
        String(analysis.explanations?.why_settings_used || 'No explanation why settings used.'),
        String(analysis.explanations?.how_to_recreate || 'No recreation tips provided.')
      ],
      beginner_tips: Array.isArray(analysis.beginner_tips) ? analysis.beginner_tips : [
        String(analysis.explanations?.beginner_friendly_tips || 'No beginner tips provided.')
      ],

      explanations: {
        why_settings_used: String(
          analysis.explanations?.why_settings_used ||
          (Array.isArray(analysis.recreation_tips) ? analysis.recreation_tips[0] : '') ||
          'Why settings used explanation.'
        ),
        how_to_recreate: String(
          analysis.explanations?.how_to_recreate ||
          (Array.isArray(analysis.recreation_tips) ? analysis.recreation_tips[1] : '') ||
          'How to recreate instructions.'
        ),
        beginner_friendly_tips: String(
          analysis.explanations?.beginner_friendly_tips ||
          (Array.isArray(analysis.beginner_tips) ? analysis.beginner_tips.join('\n') : '') ||
          'Beginner friendly recommendations.'
        ),
      },
    };

    // ── 6. Save history to MongoDB ──────────────────────────
    try {
      await dbConnect();
      await PhotoAnalysis.create({
        imageUrl: imageUrl,
        cameraModel: result.camera_model,
        lensModel: result.lens_model,
        aperture: result.aperture.value,
        iso: result.iso.value,
        shutterSpeed: result.shutter_speed.value,
        focalLength: result.focal_length.value,
        lightingType: result.lighting_type,
        editingStyle: result.editing_style.value,
        photographyStyle: result.photography_style,
        difficultyLevel: result.difficulty_level,
        confidenceScore: result.confidence_score,
        recreationTips: result.recreation_tips,
        beginnerTips: result.beginner_tips,
      });
    } catch (dbErr) {
      console.error('[analyze-photo] Failed to log history in MongoDB:', dbErr);
    }

    return NextResponse.json(result, { status: 200 });

  } catch (err) {
    console.error('[analyze-photo] Server error:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during analysis.' },
      { status: 500 }
    );
  }
}
