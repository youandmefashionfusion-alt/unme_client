// app/api/web/login-user/route.js
import connectDb from "../../../../../../config/connectDb";
import UserModel from "../../../../../../models/userModel";
import { generateRefreshToken } from "../../../../../../config/refreshtoken";
import { generateToken } from "../../../../../../config/jwtToken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    // Input validations
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          message: "Email is required" 
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email format" 
        },
        { status: 400 }
      );
    }

    await connectDb();

    // Find the user by email and mobile
    const findUser = await UserModel.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (!findUser) {
      return NextResponse.json(
        { 
          success: false,
          message: "No account found with this email and mobile number" 
        },
        { status: 404 }
      );
    }

    // Check if user account is active
    if (findUser.status && findUser.status !== "active") {
      return NextResponse.json(
        { 
          success: false,
          message: "Your account is inactive. Please contact support." 
        },
        { status: 403 }
      );
    }
    // Generate tokens
    const refreshToken = await generateRefreshToken(findUser._id);
    const accessToken = generateToken(findUser._id);

    // Update user with refresh token and last login timestamp
    const updatedUser = await UserModel.findByIdAndUpdate(
      findUser._id,
      { 
        refreshToken,
        lastLogin: new Date()
      },
      { new: true }
    ).select('-password -refreshToken'); // Exclude sensitive fields

    // Prepare user data for response
    const userData = {
      _id: updatedUser._id,
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname || '',
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      emailVerified: updatedUser.emailVerified,
      image: updatedUser.image || {},
      role: updatedUser.role || 'user',
      cart: updatedUser.cart || [],
      wishlist: updatedUser.wishlist || [],
      address: updatedUser.address || [],
      token: accessToken,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
      maxAge: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
      path: "/",
      sameSite: "strict", // CSRF protection
    });

    // Set security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;

  } catch (error) {
    console.error("Login error:", error);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false,
          message: "Validation error occurred",
          details: error.message 
        },
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid data format" 
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false,
        message: "Login failed. Please try again later." 
      },
      { status: 500 }
    );
  }
}