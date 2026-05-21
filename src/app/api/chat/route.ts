import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import ChatMessage from '@/models/ChatMessage';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const contactId = url.searchParams.get('contactId');

    if (!contactId) {
      // Return list of conversations (distinct contacts we have messaged)
      const messages = await ChatMessage.find({
        $or: [{ senderId: user._id }, { recipientId: user._id }]
      })
        .populate('senderId', 'name avatar')
        .populate('recipientId', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();

      // Group by unique contact
      const conversationsMap = new Map();
      messages.forEach((msg: any) => {
        const otherUser = msg.senderId._id.toString() === user._id.toString()
          ? msg.recipientId
          : msg.senderId;

        const otherUserId = otherUser._id.toString();
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            contact: otherUser,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
            unreadCount: !msg.read && msg.recipientId._id.toString() === user._id.toString() ? 1 : 0
          });
        } else if (!msg.read && msg.recipientId._id.toString() === user._id.toString()) {
          const existing = conversationsMap.get(otherUserId);
          existing.unreadCount += 1;
        }
      });

      return NextResponse.json(Array.from(conversationsMap.values()));
    }

    // Return message history with specific contact
    const chatHistory = await ChatMessage.find({
      $or: [
        { senderId: user._id, recipientId: contactId },
        { senderId: contactId, recipientId: user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages sent by contact to me as read
    await ChatMessage.updateMany(
      { senderId: contactId, recipientId: user._id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json(chatHistory);
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
    const { recipientId, content, type } = await req.json();

    if (!recipientId || !content) {
      return NextResponse.json({ message: 'Recipient and content are required' }, { status: 400 });
    }

    const message = await ChatMessage.create({
      senderId: user._id,
      recipientId,
      content,
      type: type || 'text',
      read: false
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
