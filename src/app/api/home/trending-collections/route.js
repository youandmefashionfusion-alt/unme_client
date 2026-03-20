// app/api/home/trending-collections/route.js
import connectDb from "../../../../../config/connectDb";
import CollectionModel from "../../../../../models/collectionModel";

export async function GET() {
  try {
    await connectDb();
    const trendingCollections = await CollectionModel.find({ 
      isTrending: "true", 
      status: "active" 
    })
    .select("title handle")
    .sort({ updatedAt: 1 })
    .limit(5);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: trendingCollections 
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