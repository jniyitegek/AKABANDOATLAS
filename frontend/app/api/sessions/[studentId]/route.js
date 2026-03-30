import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReadingSession from '@/models/ReadingSession';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { studentId } = await params;

        if (!studentId) {
            return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
        }

        const sessions = await ReadingSession.find({ studentId })
            .sort({ completedAt: -1 })
            .lean();

        return NextResponse.json({ 
            success: true, 
            sessions 
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
