import AbondendModel from "../../../../../models/abandonedModel"; // Your Order model
import connectDb from "../../../../../config/connectDb";

// Function to update inventory after order creation
export const config = {
  maxDuration: 10,
};
export async function POST(req) {
  try {
    const parsedBody = await req.json();
    const {
      shippingInfo,
      orderItems,
      totalPrice,
      finalAmount,
      shippingCost,
      orderType,
      discount,
      paymentInfo,
    } = parsedBody || {};

    const sanitizedPhone = String(shippingInfo?.phone || "").replace(/\D/g, "");

    if (!shippingInfo?.firstname || sanitizedPhone.length !== 10) {
      return Response.json(
        { success: false, error: "Invalid shipping info for abandoned cart" },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return Response.json(
        { success: false, error: "Cannot create abandoned cart without items" },
        { status: 400 }
      );
    }

    await connectDb();

    const payload = {
      shippingInfo: {
        ...shippingInfo,
        phone: Number(sanitizedPhone),
      },
      orderItems,
      totalPrice,
      finalAmount,
      shippingCost,
      orderType,
      discount,
      paymentInfo,
      orderCalled: "pending",
    };

    let abandonedDoc = null;
    let lastError = null;

    // Retry on duplicate key because orderNumber is generated in pre-save.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        abandonedDoc = await AbondendModel.create(payload);
        break;
      } catch (error) {
        lastError = error;
        if (error?.code !== 11000) break;
      }
    }

    if (!abandonedDoc) {
      throw lastError || new Error("Failed to create abandoned cart");
    }

    return Response.json(
      {
        success: true,
        status: "Abandoned Created",
        abandonedId: abandonedDoc._id,
      },
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

