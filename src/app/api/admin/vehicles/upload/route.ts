import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../auth-middleware';

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  if (!CLOUDINARY_URL || !CLOUDINARY_UPLOAD_PRESET) {
    return NextResponse.json({ error: 'Cloudinary config missing' }, { status: 500 });
  }
  const { image } = await req.json(); // image: base64 string or file
  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }
  try {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) {
      return NextResponse.json({ error: 'Upload failed', details: data }, { status: 500 });
    }
    return NextResponse.json({ url: data.secure_url });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 