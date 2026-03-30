import mongoose from 'mongoose';

const ReadingSessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    originalText: String,
    transcribedText: String,
    accuracy: Number,
    fluencyScore: Number,
    mistakes: [
        {
            word: String,
            type: {
                type: String,
                enum: ['Mispronunciation', 'Omission', 'Insertion', 'Substitution'],
            },
            position: Number,
        },
    ],
    duration: Number, // in seconds
    completedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ReadingSession || mongoose.model('ReadingSession', ReadingSessionSchema);
