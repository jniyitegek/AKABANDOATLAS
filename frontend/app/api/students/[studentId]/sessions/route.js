import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReadingSession from '@/models/ReadingSession';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { studentId } = await params;

        const sessions = await ReadingSession.find({ studentId })
            .sort({ completedAt: -1 })
            .limit(10)
            .populate('bookId', 'title coverImage author')
            .lean();

        return NextResponse.json({ success: true, sessions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
