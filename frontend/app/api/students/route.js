import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Score from '@/models/Score';

export async function GET() {
    try {
        await dbConnect();

        // Get all students
        const students = await User.find({ role: 'Student' }, '-password').lean();

        // Fetch all scores for these students in one query
        const studentIds = students.map(s => s._id);
        const scores = await Score.find({ studentId: { $in: studentIds } }).lean();

        // Map scores by studentId string for O(1) lookup
        const scoreMap = {};
        scores.forEach(sc => {
            scoreMap[sc.studentId.toString()] = sc;
        });

        const result = students.map(student => ({
            ...student,
            score: scoreMap[student._id.toString()] || null,
        }));

        return NextResponse.json({ success: true, students: result });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
