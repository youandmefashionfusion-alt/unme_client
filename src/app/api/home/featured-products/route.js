// app/api/home/featured-products/route.js
import connectDb from "../../../../../config/connectDb";
import ProductModel from "../../../../../models/productModel";

export async function GET() {
  try {
    await connectDb();
    const featuredProducts = await ProductModel.find({ 
      isFeatured: true, 
      state: "active" ,
      quantity: { $gt: 0 }
    })
    .sort({ updatedAt: -1, order: 1 })
    .limit(8);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: featuredProducts 
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500 }
    );
  }
}