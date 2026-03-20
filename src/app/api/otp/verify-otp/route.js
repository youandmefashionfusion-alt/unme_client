import Otp from "../../../../../models/otpModel";
import connectDb from "../../../../../config/connectDb"
export const config = {
  maxDuration: 10,
};
export async function POST(req) {
  try {
    const { email, otp } = await req.json();
    await connectDb()
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return Response.json({ status: false, message: "Invalid OTP" }, { status: 400 });
    }

    await Otp.deleteMany({ email });

    return Response.json({
      status: true,
      message: "OTP verified",
    });
  } catch (error) {
    return Response.json({ status: false, message: error.message }, { status: 500 });
  }
}
