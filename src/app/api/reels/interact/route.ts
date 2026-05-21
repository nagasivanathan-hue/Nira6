import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Reel from '@/models/Reel';
import { verifyAuth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const { reelId, action, text } = await req.json();

    if (!reelId) {
      return NextResponse.json({ message: 'Reel ID is required' }, { status: 400 });
    }

    const reel = await Reel.findById(reelId);
    if (!reel) {
      return NextResponse.json({ message: 'Reel not found' }, { status: 404 });
    }

    if (action === 'like') {
      const index = reel.likes.indexOf(user._id);
      if (index === -1) {
        // Like
        reel.likes.push(user._id);
      } else {
        // Unlike
        reel.likes.splice(index, 1);
      }
      await reel.save();
      return NextResponse.json({ success: true, likes: reel.likes });
    }

    if (action === 'comment') {
      if (!text || !text.trim()) {
        return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
      }
      const newComment = {
        userId: user._id,
        text: text.trim()
      };
      reel.comments.push(newComment);
      await reel.save();

      // Return the newly populated comments
      const populated = await Reel.findById(reelId)
        .populate('comments.userId', 'name avatar')
        .lean() as any;

      return NextResponse.json({ success: true, comments: populated?.comments || [] });
    }

    if (action === 'view') {
      reel.views += 1;
      await reel.save();
      return NextResponse.json({ success: true, views: reel.views });
    }

    return NextResponse.json({ message: 'Invalid action parameter' }, { status: 400 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
