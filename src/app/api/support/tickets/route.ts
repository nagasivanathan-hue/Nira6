import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Ticket from '@/models/Ticket';
import { verifyAuth } from '@/lib/auth/auth';

export async function GET(req: Request) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    await dbConnect();
    const tickets = await Ticket.find({ user: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(tickets);
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
    const { subject, category, description } = await req.json();

    if (!subject || !category || !description) {
      return NextResponse.json({ message: 'Missing subject, category, or description' }, { status: 400 });
    }

    // Auto-generated premium response based on category
    let initialAutoReply = "Thank you for reaching out to NIRA6 Support! Our gear specialists are reviewing your request. We will update you shortly.";
    if (category === 'repair') {
      initialAutoReply = "Hello! A senior technician has received your camera repair request. We'll examine the description and contact you to schedule a professional diagnostics inspection.";
    } else if (category === 'rent') {
      initialAutoReply = "Hi creator, your rental booking/extension ticket has been received. We've notified the owner and will verify logistics availability.";
    } else if (category === 'payment') {
      initialAutoReply = "Hi, we have flagged your transactional query to our finance operations team. Rest assured, your payment status will be updated within 30 minutes.";
    }

    const ticket = new Ticket({
      user: user._id,
      subject,
      category,
      description,
      status: 'in-progress',
      replies: [
        {
          sender: 'NIRA6 AI Agent',
          message: "Greetings! Your ticket has been logged in our secure CRM queue. A live support engineer is reviewing your case details.",
          date: new Date()
        },
        {
          sender: 'Rohan (Support Desk)',
          message: initialAutoReply,
          date: new Date(Date.now() + 2000) // slight delay simulation
        }
      ]
    });

    const savedTicket = await ticket.save();
    return NextResponse.json(savedTicket, { status: 201 });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
