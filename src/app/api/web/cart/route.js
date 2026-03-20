// app/api/web/cart/route.js
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
      .populate("cart.product")
      .select("cart quantity");
    
    return NextResponse.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();
    
    const tokenResult = await verifyToken(req);
    if (tokenResult.error) {
      return NextResponse.json({ error: tokenResult.error }, { status: tokenResult.status });
    }

    const { productId, quantity = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const user = await UserModel.findById(tokenResult.userId);
    
    // Check if product already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity,
      });
    }

    await user.save();

    const updatedUser = await UserModel.findById(tokenResult.userId).populate("cart.product");
    
    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDb();
    
    const tokenResult = await verifyToken(req);
    if (tokenResult.error) {
      return NextResponse.json({ error: tokenResult.error }, { status: tokenResult.status });
    }

    const { productId, quantity } = await req.json();

    const user = await UserModel.findById(tokenResult.userId);
    const cartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      user.cart = user.cart.filter(
        item => item.product.toString() !== productId
      );
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();

    const updatedUser = await UserModel.findById(tokenResult.userId).populate("cart.product");
    
    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const user = await UserModel.findById(tokenResult.userId);
    
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    const updatedUser = await UserModel.findById(tokenResult.userId).populate("cart.product");
    
    return NextResponse.json({
      success: true,
      message: "Product removed from cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}