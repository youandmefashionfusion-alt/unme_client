import connectDb from "../../../../../config/connectDb"
import ProductModel from "../../../../../models/productModel";
export const config = {
    maxDuration: 10,
};
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""
    try {
        await connectDb()
        const products = await ProductModel.find({ collectionHandle: id, state: "active", quantity: { $gt: 0 } }).sort({ updatedAt: -1, order: 1 }).limit(8);
        return Response.json({ products }, {
            status: 200, 
        })
    }
    catch (error) {
        return Response.json({ status: 500, message: error })
    }
}