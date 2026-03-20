import AbondendModel from "../../../../../models/abandonedModel"; // Your Order model
import connectDb from "../../../../../config/connectDb";

// Function to update inventory after order creation
export const config = {
  maxDuration: 10,
};
export async function POST(req,res){
  const body = await req.text(); // Read the raw body as a string
  const parsedBody = JSON.parse(body); // Parse the string as JSON
  const { shippingInfo, orderItems, totalPrice, finalAmount, shippingCost, orderType, discount, paymentInfo } = parsedBody;
  try {
    await connectDb()

    // If inventory is sufficient, create the order
    const aban1=await AbondendModel.create({
      shippingInfo,
      orderItems,
      totalPrice,
      finalAmount,
      shippingCost,
      orderType,
      discount,
      paymentInfo,
    });
      
    return Response.json(
      { success: true, status: "Abandoned Created"},
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Creating Abandoned:", error.message);
    return Response.json(
      { success: false, error: "Failed to create Abandoned" },
      { status: 500 }
    );
  }
};

