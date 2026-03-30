import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
        }

        await dbConnect();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const validRoles = ['Student', 'Facilitator', 'Admin'];
        const userRole = validRoles.includes(role) ? role : 'Student';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'An error occurred during registration.' }, { status: 500 });
    }
}
