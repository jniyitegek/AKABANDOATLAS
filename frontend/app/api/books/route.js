import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET() {
    try {
        await dbConnect();
        const books = await Book.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, books });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();

        const book = await Book.create(data);
        return NextResponse.json({ success: true, book }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
