import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";
import ScrollModel from "../../../../models/bannersModel";
import CollectionModel from "../../../../models/collectionModel";
import BlogModel from "../../../../models/blogModel";
export const config = {
  maxDuration: 15, // Increased timeout for combined operations
};

export async function GET(request) {
  try {
    // Single database connection
    await connectDb();
    // Execute all queries in parallel
    const [
      trendingCollections,
      featuredCollection,
      latestProducts,
      featuedProducts,
      bossPicks,
      gatawayJewels,
      blogs

    ] = await Promise.all([
      CollectionModel.find({ isTrending: "true", status: "active" }).select("title handle").sort({ updatedAt: -1 }).limit(5),
      CollectionModel.findOne({ mostTrending: "true", status: "active" }),
      ProductModel.find({ state: "active", quantity: { $gt: 0 } }).sort({ updatedAt: -1, order: 1 }).limit(8),
      ProductModel.find({ isFeatured: true, state: "active",quantity: { $gt: 0 } }).sort({ updatedAt: -1, order: 1 }).limit(8),
      ProductModel.find({ bossPicks: true, state: "active",quantity: { $gt: 0 } }).sort({ updatedAt: -1, order: 1 }).limit(8),
      ProductModel.find({ gatawayJewels: true, state: "active",quantity: { $gt: 0 } }).sort({ updatedAt: -1, order: 1 }).limit(8),
      BlogModel.find({ state: "active" }).sort({ updatedAt: -1 }).limit(6),

      // Banners
    ]);

    const mostTrendingCollection = featuredCollection;

    // Fetch products for the most trending collection
    let mostFeaturedProducts = [];
    if (mostTrendingCollection) {
      mostFeaturedProducts = await ProductModel.find({
        collectionHandle: mostTrendingCollection.handle,
        state: "active",
        quantity: { $gt: 0 }
      })
        .limit(4)
        .sort({ order: 1, updatedAt: -1 });
    }

    // Prepare response data
    const responseData = {
      success: true,
      data: {
        trendingCollections,
        featuredCollection,
        mostFeaturedProducts,
        latestProducts,
        featuedProducts,
        bossPicks,
        gatawayJewels,
        blogs
      }
    };

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in home page API:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch home page data",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}