// app/api/web/session/route.js
import { NextResponse } from "next/server";
import connectDb from "../../../../../config/connectDb";
import UserModel from "../../../../../models/userModel";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await connectDb();

    // Get refreshToken from cookies
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ 
        user: null,
        isAuthenticated: false 
      });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Token verification failed:", error);
      // Clear invalid token
      const response = NextResponse.json({ 
        user: null,
        isAuthenticated: false 
      });
      response.cookies.delete('refreshToken');
      return response;
    }

    // Find user by ID from the token
    const user = await UserModel.findById(decoded.id)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      // Clear token if user not found
      const response = NextResponse.json({ 
        user: null,
        isAuthenticated: false 
      });
      response.cookies.delete('refreshToken');
      return response;
    }

    // Verify the refresh token matches the one in database
    const dbUser = await UserModel.findById(decoded.id).select('refreshToken');
    if (!dbUser || dbUser.refreshToken !== refreshToken) {
      // Token doesn't match, clear it
      const response = NextResponse.json({ 
        user: null,
        isAuthenticated: false 
      });
      response.cookies.delete('refreshToken');
      return response;
    }

    // Return user session data
    return NextResponse.json({
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobile: user.mobile,
        image: user.image,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      isAuthenticated: true,
      expires: decoded.exp,
    });

  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { 
        user: null,
        isAuthenticated: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}