import connectToDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const POST = async (req) => {
  await connectToDB();

  const data = await req.formData();
  const firstName = data.get('firstName');
  const lastName = data.get('lastName');
  const email = data.get('email');
  const password = data.get('password');
  const avatarFile = data.get('avatar'); // File object

  if (!firstName || !lastName || !email || !password) {
    return new Response(
      JSON.stringify({ message: 'All fields are required' }),
      { status: 400 }
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response(
      JSON.stringify({ message: 'User already exists' }),
      { status: 400 }
    );
  }

  let avatarUrl = '';
  if (avatarFile && avatarFile.size > 0) {
    // Save avatar to public/uploads folder
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}_${avatarFile.name}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    avatarUrl = `/uploads/${fileName}`;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    avatar: avatarUrl,
    resetToken: null,
    resetTokenExpires: null,
  });

  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return new Response(
    JSON.stringify({
      token,
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        avatar: avatarUrl,
      },
    }),
    { status: 201 }
  );
};
