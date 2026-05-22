import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Reel from '@/models/Reel';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    const reels = await Reel.find({})
      .populate('creatorId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(reels);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { videoUrl, thumbnailUrl, caption, tags } = await req.json();

    if (!videoUrl || !caption) {
      return NextResponse.json({ message: 'Video URL and caption are required' }, { status: 400 });
    }

    const reel = await Reel.create({
      creatorId: user._id,
      videoUrl,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      caption,
      tags: tags || []
    });

    return NextResponse.json({
      success: true,
      message: 'Reel posted successfully',
      reel
    }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
