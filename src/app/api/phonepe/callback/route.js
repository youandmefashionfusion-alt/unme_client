import crypto from "crypto";
import connectDb from '../../../../../config/connectDb'

export const config = {
  maxDuration: 30,
};

const SHA256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("PhonePe Callback Received:", body);

    // Verify callback signature
    const callbackData = body;
    const xVerifyHeader = request.headers.get("X-VERIFY");
    
    if (!xVerifyHeader) {
      console.error("No X-VERIFY header in callback");
      return Response.json({ success: false, error: "Invalid callback" }, { status: 400 });
    }

    // Process the callback data
    const { success, code, merchantTransactionId, transactionId } = callbackData;
    
    if (success && code === "PAYMENT_SUCCESS") {
      // Payment was successful
      // Here you can update your database, send confirmation emails, etc.
      console.log("Payment Successful:", {
        merchantTransactionId,
        transactionId,
        amount: callbackData.amount / 100 // Convert back to rupees
      });

      // TODO: Update your order status in database
      await connectDb();
      // Add your order update logic here

    } else {
      // Payment failed
      console.log("Payment Failed:", callbackData);
      
      // TODO: Update order status to failed in database
    }

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Callback Processing Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}