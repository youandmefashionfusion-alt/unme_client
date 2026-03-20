// app/api/web/wishlist/route.js
import { NextResponse } from "next/server";
import connectDb from "../../../../../config/connectDb";
import UserModel from "../../../../../models/userModel";
import jwt from 'jsonwebtoken';

// Helper function to verify token and get user ID
async function verifyToken(req) {
  try {
    // Get token from either cookie or Authorization header
    let token;
    
    // Check cookie first
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (refreshToken) {
      token = refreshToken;
    }
    
    // If no cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return { error: "No token provided", status: 401 };
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify the token exists in database (for refresh tokens)
    if (refreshToken) {
      const dbUser = await UserModel.findById(decoded.id).select('refreshToken');
      if (!dbUser || dbUser.refreshToken !== refreshToken) {
        return { error: "Invalid token", status: 401 };
      }
    }

    return { userId: decoded.id };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req) {
  try {
    await connectDb();
    
    const tokenResult = await verifyToken(req);
    if (tokenResult.error) {
      return NextResponse.json({ error: tokenResult.error }, { status: tokenResult.status });
    }

    const user = await UserModel.findById(tokenResult.userId)
      .populate("wishlist.product")
      .select("wishlist");
    
    return NextResponse.json({ 
      success: true, 
      wishlist: user.wishlist 
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();
    
    const tokenResult = await verifyToken(req);
    if (tokenResult.error) {
      return NextResponse.json({ error: tokenResult.error }, { status: tokenResult.status });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required" 
      }, { status: 400 });
    }

    const user = await UserModel.findById(tokenResult.userId);
    
    // Check if product already exists in wishlist
    const existingItem = user.wishlist.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return NextResponse.json({ 
        error: "Product already in wishlist" 
      }, { status: 400 });
    }

    // Add product to wishlist
    user.wishlist.push({ product: productId });
    await user.save();

    const updatedUser = await UserModel.findById(tokenResult.userId)
      .populate("wishlist.product");
    
    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDb();
    
    const tokenResult = await verifyToken(req);
    if (tokenResult.error) {
      return NextResponse.json({ error: tokenResult.error }, { status: tokenResult.status });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required" 
      }, { status: 400 });
    }

    const user = await UserModel.findById(tokenResult.userId);
    
    // Remove product from wishlist
    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      item => item.product.toString() !== productId
    );

    // Check if item was actually removed
    if (user.wishlist.length === initialLength) {
      return NextResponse.json({ 
        error: "Product not found in wishlist" 
      }, { status: 404 });
    }

    await user.save();

    const updatedUser = await UserModel.findById(tokenResult.userId)
      .populate("wishlist.product");
    
    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}