// app/api/auth/password-reset/request/route.js
import { NextResponse } from 'next/server';
import connectDb from '../../../../../../config/connectDb';
import UserModel from '../../../../../../models/userModel';
import crypto from 'crypto'

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

// Function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Normalize phone number
function normalizePhoneNumber(phone) {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Extract and return last 10 digits
  return digits.slice(-10);
}

export async function POST(request) {
  try {
    await connectDb();
    
    const { mobile } = await request.json();

    // Validation
    if (!mobile) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    if (mobile.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Find user by mobile
    const user = await UserModel.findOne({ mobile });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found with this mobile number' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(mobile, {
      otpHash,
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    // Send OTP using your existing send-otp API
    try {
      const normalizedPhone = normalizePhoneNumber(mobile);
      
      const otpResponse = await fetch(`https://unmejewels.com/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, otp })
      });

      const otpData = await otpResponse.json();
      
      if (otpData.status !== 100) {
        // Clean up stored OTP if sending failed
        otpStore.delete(mobile);
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully to your mobile number',
        mobile: mobile.replace(/(\d{2})\d+(\d{2})/, '$1******$2'), // Mask mobile
        expiresIn: 600 // 10 minutes in seconds
      });

    } catch (error) {
      console.error('OTP sending error:', error);
      otpStore.delete(mobile);
      return NextResponse.json(
        { success: false, message: 'An error occurred while sending OTP' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}



