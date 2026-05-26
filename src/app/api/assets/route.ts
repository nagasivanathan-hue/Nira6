import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import ExifReader from 'exifreader';
import dbConnect from '@/lib/db/mongodb';
import CreativeWork from '@/models/CreativeWork';

// Initialize GCP Storage Client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const BUCKET_NAME = process.env.GCP_GCS_BUCKET_NAME || 'nira6-portfolio-assets';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Technical EXIF Extraction
    let technicalSpecs = {};
    try {
      const tags = ExifReader.load(buffer);
      technicalSpecs = {
        cameraModel: tags['Model']?.description || 'Unknown Camera',
        lensType: tags['LensModel']?.description || 'Unknown Lens',
        aperture: tags['FNumber']?.description || 'N/A',
        focalLength: tags['FocalLength']?.description || 'N/A',
        iso: tags['ISOSpeedRatings']?.description || 'N/A',
        shutterSpeed: tags['ExposureTime']?.description || 'N/A',
      };
    } catch (e) {
      console.warn('Failed to parse EXIF details:', e);
    }

    // 2. Multithreaded Image Optimization (Max resolution capped at 4K for visual fidelity)
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 3840, height: 2160, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();

    // 3. Ingestion into Google Cloud Storage
    const bucket = storage.bucket(BUCKET_NAME);
    const fileName = `portfolios/${Date.now()}_${file.name.replace(/\s+/g, '_')}.webp`;
    const gcsFile = bucket.file(fileName);

    await gcsFile.save(optimizedBuffer, {
      contentType: 'image/webp',
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;

    // 4. Save metadata references to Database
    await dbConnect();
    const newAsset = await CreativeWork.create({
      title: file.name.split('.')[0],
      url: publicUrl,
      specs: technicalSpecs,
    });

    return NextResponse.json({ success: true, asset: newAsset }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
