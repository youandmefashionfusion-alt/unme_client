// app/api/web/create-user/route.js
import connectDb from "../../../../../../config/connectDb";
import UserModel from "../../../../../../models/userModel";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstname, mobile, email, image = {} } = body;

    // Input validations
    if (!firstname || !mobile || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields",
          details: "Firstname, mobile, and email are required" 
        },
        { status: 400 }
      );
    }

    // Firstname validation
    if (typeof firstname !== 'string' || firstname.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid firstname",
          details: "Firstname must be at least 2 characters long" 
        },
        { status: 400 }
      );
    }

    // Mobile validation (Indian mobile format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (typeof mobile !== 'string' || !mobileRegex.test(mobile)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid mobile number",
          details: "Please provide a valid 10-digit Indian mobile number" 
        },
        { status: 400 }
      );
    }

    // Email validation (now required)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email format",
          details: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // Image validation (optional but must be object if provided)
    if (image && (typeof image !== 'object' || Array.isArray(image))) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid image format",
          details: "Image must be an object" 
        },
        { status: 400 }
      );
    }

    await connectDb();

    // Check if mobile already exists
    const existingMobile = await UserModel.findOne({ mobile });
    if (existingMobile) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Mobile number already exists",
          details: "A user with this mobile number already exists" 
        },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email already exists",
          details: "A user with this email already exists" 
        },
        { status: 409 }
      );
    }

    // Trim and sanitize inputs
    const sanitizedData = {
      firstname: firstname.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      emailVerified: true, // Mark as verified since OTP was used
      ...(image && Object.keys(image).length > 0 && { image })
    };

    // Create user without password
    const user = new UserModel(sanitizedData);
    await user.save();

    // Remove sensitive data from response
    const userResponse = {
      _id: user._id,
      firstname: user.firstname,
      mobile: user.mobile,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      cart: [],
      wishlist: [],
      address: user.address,
      createdAt: user.createdAt
    };

    return NextResponse.json(
      { 
        success: true, 
        message: "User created successfully",
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("User registration error:", err);

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          error: "Duplicate entry",
          details: `A user with this ${field} already exists` 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: "Failed to create user" 
      },
      { status: 500 }
    );
  }
}