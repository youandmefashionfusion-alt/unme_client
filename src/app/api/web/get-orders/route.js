import OrderModel from "../../../../../models/orderModel";
import connectDb from "../../../../../config/connectDb";
import userMiddleware from "../../../../../controller/userController";
export const config = {
  maxDuration: 10,
};
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

  try {
  await connectDb();
    // Use req.nextUrl to get query parameters
    await userMiddleware(token);
    // Check if email is provided
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find orders where the email matches the user's email in shippingInfo
    const orders = await OrderModel.find({ "shippingInfo.email": email })
      .populate("orderItems.product"); // Populate product data in orderItems (if needed)

    // Check if orders are found
    if (!orders || orders.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No orders found for this email" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the orders
    return new Response(
      JSON.stringify({ success: true, orders }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Server Error", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
