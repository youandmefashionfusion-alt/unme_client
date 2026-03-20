import connectDb from "../../../../../config/connectDb";
import CouponModel from "../../../../../models/couponModel"; // Import your Coupon model
import moment from "moment";

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, totalAmount, customerType, cartItemCount, customerEmail } = body;

    // Ensure database connection
    await connectDb();

    // Find the coupon based on the name and status
    const coupon = await CouponModel.findOne({
      name: name.toUpperCase(),
      status: "active",
      customertype: customerType,
    });

    if (!coupon) {
      return new Response(
        JSON.stringify({ message: "Coupon not found or inactive." }),
        { status: 404 }
      );
    }

    // Check if the coupon is expired
    if (moment().isAfter(moment(coupon.expiry))) {
      return new Response(JSON.stringify({ message: "Coupon has expired." }), {
        status: 400,
      });
    }

    // Validate based on discount type
    let discountAmount = 0;
    let isValid = true;

    if (coupon.discounttype === "freeShip") {
      discountAmount = 0;
    } else if (coupon.discounttype === "buyX") {
      if (coupon.minItem && cartItemCount >= coupon.minItem) {
        discountAmount = coupon.discount.includes("%")
          ? (parseFloat(coupon.discount) / 100) * totalAmount
          : parseInt(coupon.discount);
      } else {
        isValid = false;
      }
    } else if (coupon.discounttype === "order") {
      discountAmount = coupon.discount.includes("%")
        ? (parseFloat(coupon.discount) / 100) * totalAmount
        : parseInt(coupon.discount);
    }

    if (isValid) {
      return new Response(
        JSON.stringify({
          message: "Coupon valid",
          discountAmount,
          discountType: coupon.discounttype,
        }),
        { status: 200 }
      );
    } else {
      return new Response(JSON.stringify({ message: "Coupon criteria not met." }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}