import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReadingSession from '@/models/ReadingSession';
import Score from '@/models/Score';

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();

        // Create session record
        const session = await ReadingSession.create(data);

        const { studentId, accuracy, fluencyScore = 0, duration = 0, mistakes = [] } = data;

        // Aggregate mistake types from this session
        const mistakeCounts = { Omission: 0, Mispronunciation: 0, Substitution: 0, Insertion: 0 };
        mistakes.forEach(m => {
            if (mistakeCounts[m.type] !== undefined) mistakeCounts[m.type]++;
        });

        let score = await Score.findOne({ studentId });

        if (!score) {
            score = await Score.create({
                studentId,
                overallAccuracy: accuracy,
                totalSessions: 1,
                totalDurationSeconds: duration,
                averageFluency: fluencyScore,
                lastSessionDate: new Date(),
                progressData: [{ date: new Date(), accuracy }],
                mistakeSummary: {
                    Omission: mistakeCounts.Omission || 0,
                    Mispronunciation: mistakeCounts.Mispronunciation || 0,
                    Substitution: mistakeCounts.Substitution || 0,
                    Insertion: mistakeCounts.Insertion || 0,
                },
            });
        } else {
            const newTotal = score.totalSessions + 1;
            const currentAccuracy = score.overallAccuracy || 0;
            const currentFluency = score.averageFluency || 0;
            
            const newAccuracy = ((currentAccuracy * score.totalSessions) + accuracy) / newTotal;
            const newFluency = ((currentFluency * score.totalSessions) + fluencyScore) / newTotal;

            score.overallAccuracy = Math.round(newAccuracy);
            score.totalSessions = newTotal;
            score.totalDurationSeconds = (score.totalDurationSeconds || 0) + duration;
            score.averageFluency = Math.round(newFluency);
            score.lastSessionDate = new Date();
            score.progressData.push({ date: new Date(), accuracy });

            // Ensure mistakeSummary exists
            if (!score.mistakeSummary) {
                score.mistakeSummary = { Omission: 0, Mispronunciation: 0, Substitution: 0, Insertion: 0 };
            }

            // Increment mistake counts
            score.mistakeSummary.Omission = (score.mistakeSummary.Omission || 0) + mistakeCounts.Omission;
            score.mistakeSummary.Mispronunciation = (score.mistakeSummary.Mispronunciation || 0) + mistakeCounts.Mispronunciation;
            score.mistakeSummary.Substitution = (score.mistakeSummary.Substitution || 0) + mistakeCounts.Substitution;
            score.mistakeSummary.Insertion = (score.mistakeSummary.Insertion || 0) + mistakeCounts.Insertion;

            score.markModified('mistakeSummary');
            await score.save();
        }

        return NextResponse.json({ success: true, session, score }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

