// app/api/auth/password-reset/verify/route.js
import { NextResponse } from 'next/server';
import connectDb from '../../../../../../../config/connectDb';
import UserModel from '../../../../../../../models/userModel';
import crypto from 'crypto';

// Same otpStore reference (use Redis in production)
const otpStore = new Map();

export async function POST(request) {
  try {
    await connectDb();
    
    const { mobile, otp, newPassword } = await request.json();

    // Validation
    if (!mobile || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get stored OTP data
    const otpData = otpStore.get(mobile);
    
    if (!otpData) {
      return NextResponse.json(
        { success: false, message: 'OTP expired or not found. Please request a new one' },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > otpData.expires) {
      otpStore.delete(mobile);
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one' },
        { status: 400 }
      );
    }

    // Check attempts (prevent brute force)
    if (otpData.attempts >= 5) {
      otpStore.delete(mobile);
      return NextResponse.json(
        { success: false, message: 'Too many failed attempts. Please request a new OTP' },
        { status: 429 }
      );
    }

    // Verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    if (otpHash !== otpData.otpHash) {
      otpData.attempts += 1;
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid OTP',
          attemptsLeft: 5 - otpData.attempts
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await UserModel.findOne({ mobile });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.refreshToken = undefined; // Invalidate existing sessions
    
    await user.save();

    // Clear OTP
    otpStore.delete(mobile);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}