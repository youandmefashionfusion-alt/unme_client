// app/api/home/blogs/route.js
import connectDb from "../../../../../config/connectDb";
import BlogModel from "../../../../../models/blogModel";

export async function GET() {
  try {
    await connectDb();
    const blogs = await BlogModel.find({ 
      state: "active" 
    })
    .sort({ updatedAt: -1 })
    .limit(6);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: blogs 
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