import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Score from '@/models/Score';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { studentId } = await params;

        const score = await Score.findOne({ studentId });

        if (!score) {
            return NextResponse.json({ success: false, message: 'Score not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, score });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
