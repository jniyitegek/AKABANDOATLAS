import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    overallAccuracy: Number,
    totalSessions: Number,
    totalDurationSeconds: { type: Number, default: 0 },
    averageFluency: { type: Number, default: 0 },
    lastSessionDate: Date,
    progressData: [
        {
            date: Date,
            accuracy: Number,
        }
    ],
    mistakeSummary: {
        Omission: { type: Number, default: 0 },
        Mispronunciation: { type: Number, default: 0 },
        Substitution: { type: Number, default: 0 },
        Insertion: { type: Number, default: 0 },
    },
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);
