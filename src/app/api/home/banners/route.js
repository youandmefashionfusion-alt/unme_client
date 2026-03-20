// app/api/home/banners/route.js
import connectDb from "../../../../../config/connectDb";
import ScrollModel from "../../../../../models/bannersModel";

export async function GET() {
  try {
    await connectDb();
    const banners = await ScrollModel.find().sort({ createdAt: -1 })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        banners 
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