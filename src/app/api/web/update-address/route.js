import UserModel from "../../../../../models/userModel";
import connectDb from "../../../../../config/connectDb";
import userMiddleware from "../../../../../controller/userController";

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const body = await req.json();
  const mobile = searchParams.get("mobile");
  const token = searchParams.get("token");

  try {
    await connectDb();
    await userMiddleware(token);

    const user = await UserModel.findOne({ mobile: mobile });

    if (!user) {
      return Response.json({ msg: "User not found" }, { status: 404 });
    }

    user.address = body;
    await user.save();

    return Response.json(
      { msg: "Address updated successfully", user },
      { status: 200 }
    );

  } catch (err) {
    console.error("Error updating address:", err);
    return Response.json(
      { msg: "Unable to update address", error: err.message },
      { status: 500 }
    );
  }
}
