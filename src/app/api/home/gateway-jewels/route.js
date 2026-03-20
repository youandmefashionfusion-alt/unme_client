import connectDb from "../../../../../config/connectDb";
import ProductModel from "../../../../../models/productModel";

export async function GET() {
  try {
    await connectDb();
    
    const gatawayJewels = await ProductModel.find({ 
      gatawayJewels: true, 
      state: "active",
      quantity: { $gt: 0 }
    })
    .sort({ updatedAt: -1 })
    .limit(8);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: gatawayJewels 
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