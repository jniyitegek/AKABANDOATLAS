import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Update user profile (name, email)
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        // Only allow a user to update themselves, unless they are an Admin
        if (session.user.id !== id && session.user.role !== 'Admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { name, email, image } = await req.json();
        await dbConnect();

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (image) updateData.image = image;

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Update password
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { currentPassword, newPassword } = await req.json();

        await dbConnect();
        const user = await User.findById(id);

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Delete user (Admin only)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        await dbConnect();
        await User.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
