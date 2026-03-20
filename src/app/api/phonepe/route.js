import axios from "axios";
import uniqid from "uniqid";
import crypto from "crypto";
import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";

export const config = {
  maxDuration: 30,
};

// Utility function to generate SHA256 hash
const SHA256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// Validate order prices
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
        throw new Error(`Not enough quantity available for ${foundProduct.title}`);
      }
    }

    // Validate total price (allow small rounding differences)
    if (Math.abs(calculatedTotalPrice - totalPrice) > 1) {
      throw new Error(
        `Total price mismatch. Expected: ₹${calculatedTotalPrice}, Received: ₹${totalPrice}`
      );
    }

    // Calculate expected final amount
    const expectedFinalAmount = calculatedTotalPrice - discount + shippingCost;
    
    if (Math.abs(expectedFinalAmount - finalAmount) > 1) {
      throw new Error(
        `Final amount mismatch. Expected: ₹${expectedFinalAmount}, Received: ₹${finalAmount}`
      );
    }

    console.log("All prices and amounts validated successfully");
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      amount, 
      number, 
      merchantTransactionId, 
      orderItems, 
      totalPrice, 
      finalAmount, 
      shippingCost, 
      discount, 
    } = body;

    // Validate required environment variables
    if (!process.env.PMID || !process.env.PSALT || !process.env.PSALTINDEX) {
      throw new Error("PhonePe environment variables are not configured");
    }

    // Validate required fields
    if (!amount || !number || !merchantTransactionId) {
      return Response.json(
        { success: false, error: "Missing required fields: amount, number, or merchantTransactionId" },
        { status: 400 }
      );
    }

    await connectDb();
    
    // Validate order prices
    await validateOrderPricesAndAmounts(orderItems, totalPrice, finalAmount, discount, shippingCost);

    const payEndpoint = "/pg/v1/pay";
    const userId = "MUID" + uniqid();

    // PhonePe payload
    const payload = {
      merchantId: process.env.PMID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${process.env.API_PORT || 'https://unmejewels.com/api/'}phonepe/status?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.API_PORT || 'https://unmejewels.com/api/'}phonepe/callback`,
      mobileNumber: number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Encode payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    
    // Generate X-VERIFY header
    const stringToHash = base64Payload + payEndpoint + process.env.PSALT;
    const xVerify = SHA256(stringToHash) + "###" + process.env.PSALTINDEX;

    console.log("PhonePe Request:", {
      merchantId: process.env.PMID,
      merchantTransactionId,
      amount: amount * 100,
      base64Payload,
      xVerify
    });

    // Make request to PhonePe
    const options = {
      method: "POST",
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox${payEndpoint}`,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-CALLBACK-URL": `${process.env.API_PORT || 'https://unmejewels.com/api/'}phonepe/callback`,
      },
      data: {
        request: base64Payload,
      },
    };

    const response = await axios.request(options);
    console.log("PhonePe Response:", response.data);

    if (response.data.success && response.data.data.instrumentResponse.redirectInfo) {
      return Response.json(
        { 
          success: true, 
          url: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: merchantTransactionId
        },
        { status: 200 }
      );
    } else {
      return Response.json(
        { 
          success: false, 
          error: response.data.message || "Payment initiation failed",
          details: response.data
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("PhonePe API Error:", error.response?.data || error.message);
    
    return Response.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      },
      { status: 500 }
    );
  }
}