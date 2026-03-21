import connectDb from "../../../../../config/connectDb";
import ProductModel from "../../../../../models/productModel";

export async function GET(req) {
  try {
    await connectDb();
    const searchParams = new URL(req.url);
    const limit = searchParams.searchParams.get("limit");

    const saleProducts = await ProductModel.find({
      is1499Sale: true,
      state: "active",
      quantity: { $gt: 0 },
    })
      .sort({ quantity: -1, updatedAt: -1 })
      .limit(limit ? parseInt(limit, 10) : 100);

    return new Response(
      JSON.stringify({
        success: true,
        data: saleProducts,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
