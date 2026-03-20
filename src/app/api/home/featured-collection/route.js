// app/api/home/featured-collection/route.js
import connectDb from "../../../../../config/connectDb";
import CollectionModel from "../../../../../models/collectionModel";
import ProductModel from "../../../../../models/productModel";

export async function GET() {
  try {
    await connectDb();
    
    const featuredCollection = await CollectionModel.findOne({ 
      mostTrending: "true", 
      status: "active" 
    });
    
    let mostFeaturedProducts = [];
    if (featuredCollection) {
      mostFeaturedProducts = await ProductModel.find({
        collectionHandle: featuredCollection.handle,
        state: "active",
        quantity: { $gt: 0 }
      })
      .limit(4)
      .sort({ order: 1, updatedAt: -1 });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          featuredCollection,
          mostFeaturedProducts
        }
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