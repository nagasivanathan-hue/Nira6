import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCsrf } from '@/lib/csrf';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export async function POST(req: Request) {
  try {
    // 0. CSRF Validation
    if (!verifyCsrf(req)) {
      return NextResponse.json({ message: 'CSRF validation failed' }, { status: 403 });
    }

    // 1. Rate Limiting: 5 uploads per minute per IP
    const clientIp = getClientIp(req);
    const { allowed, resetIn } = checkRateLimit(`upload:${clientIp}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });

    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many upload attempts. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // 2. Validate File Size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File size exceeds the 5MB limit.' },
        { status: 400 }
      );
    }

    // 3. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { message: `Invalid file type. Only images (${ALLOWED_EXTENSIONS.join(', ')}) are allowed.` },
        { status: 400 }
      );
    }

    // 4. Validate Extension
    const fileExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { message: 'Invalid file extension.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 5. Sanitize Filename to prevent path traversal & injection
    const sanitizedBase = path.basename(file.name)
      .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace special chars with underscores
      .replace(/_{2,}/g, '_');          // Deduplicate underscores
      
    const filename = `${Date.now()}_${sanitizedBase}`;
    const filePath = path.join(uploadDir, filename);

    // Write file safely
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
