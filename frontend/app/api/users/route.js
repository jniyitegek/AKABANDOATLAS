import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';


import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Score from '@/models/Score';

export async function GET() {
    try {
        await dbConnect();
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, role } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();
        const userExists = await User.findOne({ email });
        if (userExists) return NextResponse.json({ message: 'User already exists' }, { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Student'
        });

        // Initialize Score if user is a Student
        if (user.role === 'Student') {
            await Score.create({ studentId: user._id });
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        return NextResponse.json({ success: true, user: userResponse }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

