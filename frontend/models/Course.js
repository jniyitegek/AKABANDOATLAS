import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String, // YouTube link or Supabase video link
        required: true,
    },
    img: String, // Thumbnail image
    duration: String, // e.g., "12m 45s"
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    lessonsCount: {
        type: Number,
        default: 1,
    },
    rating: {
        type: Number,
        default: 0, // Mock rating system
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
