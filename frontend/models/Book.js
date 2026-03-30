import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    coverImage: String,
    fileUrl: String,
    category: String,
    language: {
        type: String,
        default: 'Kinyarwanda',
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    fullText: {
        type: String,
        default: '',
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
