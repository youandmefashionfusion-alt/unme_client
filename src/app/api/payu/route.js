import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";
import crypto from "crypto";
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
  const body = await request.text(); // Read the raw body as a string
  const parsedBody = JSON.parse(body);
  try {
    const { transactionId, firstname, email, phone, orderItems, totalPrice, finalAmount, shippingCost, discount } = parsedBody
    await connectDb()
    // await validateOrderPricesAndAmounts(orderItems, totalPrice, finalAmount, discount, shippingCost);

    const data = {
      key: process.env.MERCHANT_KEY,
      txnid: transactionId,
      amount: finalAmount,
      productinfo: phone,
      firstname: firstname,
      email: email,
      udf1: "details1",
      udf2: "details2",
      udf3: "details3",
      udf4: "details4",
      udf5: "details5",
    }
    const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}||||||${process.env.MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return Response.json(
      {
        success: true, hash: hash,
        transactionId: transactionId, error: "Payment successfull"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in POST handler:", error.message);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}