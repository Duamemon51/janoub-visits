import connectToDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    // 🔗 DB Connect
    await connectToDB();

    // 🔍 Check user
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    // 🔑 Password verify
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401 }
      );
    }

    // 🔒 JWT generate
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🍪 Token as HttpOnly cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // ✅ Success response
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar || '/profile.jpg', // fallback avatar
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('SIGNIN ERROR:', error);
    return new Response(
      JSON.stringify({
        message: error.message || 'Internal Server Error',
      }),
      { status: 500 }
    );
  }
};
