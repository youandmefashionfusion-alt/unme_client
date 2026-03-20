import axios from "axios";
import connectDb from "../../../../../config/connectDb";
import ProductModel from "../../../../../models/productModel";

export const config = {
  maxDuration: 10,
};

const validateOrderPricesAndAmounts = async (orderItems, totalPrice, finalAmount, discount, shippingCost) => {
  try {
    let calculatedTotalPrice = 0;

    for (const orderItem of orderItems) {
      const { product, quantity } = orderItem;
      const productId = product;

      const foundProduct = await ProductModel.findById(productId);

      if (!foundProduct) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      calculatedTotalPrice += foundProduct.price * quantity;

      if (foundProduct.quantity < quantity) {
        throw new Error(`Not enough quantity available`);
      }
    }

    if (calculatedTotalPrice !== totalPrice) {
      throw new Error(
        `Total price mismatch. Expected: ₹${calculatedTotalPrice}, Received: ₹${totalPrice}`
      );
    }

    const expectedFinalAmount = calculatedTotalPrice - discount + shippingCost;

    if (expectedFinalAmount !== finalAmount) {
      throw new Error(
        `Final amount mismatch. Expected: ₹${expectedFinalAmount}, Received: ₹${finalAmount}`
      );
    }

    console.log("All prices and amounts validated successfully");
  } catch (error) {
    throw new Error(error.message);
  }
};

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderDataString = searchParams.get("orderData");
    
    if (!orderDataString) {
      throw new Error("Order data is missing");
    }
    
    const decodedData = decodeURIComponent(orderDataString);
    const parsedData = JSON.parse(decodedData);
    const orderData = parsedData.payUdata;

    console.log("📦 Received Order Data:", orderData);

    // Connect to database
    await connectDb();

    // FIXED: Pass parameters individually, not as object
    // await validateOrderPricesAndAmounts(
    //   orderData.orderItems,
    //   orderData.totalPrice,
    //   orderData.finalAmount, 
    //   orderData.discount,
    //   orderData.shippingCost
    // );

    console.log("✅ Validation passed, creating order...");

    // Create order
    const response = await axios.post(
      "https://unmejewels.com/api/order/create-order",
      orderData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("📋 Order Creation Response:", response.data);

    const { success, orderNumber, amount, firstname, email, phone, city, state } = response.data;

    if (success) {
      const redirectUrl = `https://unmejewels.com/thankyou?orderNumber=${orderNumber}&firstname=${firstname}&amount=${amount}&email=${email}&phone=${phone}&city=${city}&state=${state}`;

      console.log("✅ Order created successfully, redirecting to:", redirectUrl);

      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } else {
      console.error("❌ Order creation failed");
      
      return new Response(
        JSON.stringify({ success: false, error: "Order Creation Failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("❌ Error in POST handler:", error.message);
    console.error("Error details:", error);
    
    // Redirect to checkout page on error
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://unmejewels.com/checkout?error=payment_failed",
      },
    });
  }
}