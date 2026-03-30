import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sentence from '@/models/Sentence';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const sentences = await Sentence.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, sentences });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Facilitator')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { text, difficulty } = await req.json();

        if (!text) {
            return NextResponse.json({ success: false, error: 'Sentence text is required' }, { status: 400 });
        }

        const sentence = await Sentence.create({
            text,
            difficulty: difficulty || 'Medium',
            createdBy: session.user.id
        });

        return NextResponse.json({ success: true, sentence });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
