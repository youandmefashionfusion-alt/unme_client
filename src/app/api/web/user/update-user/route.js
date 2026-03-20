// /app/api/update-user/route.js
import userMiddleware from '../../../../../../controller/userController';
import connectDb from '../../../../../../config/connectDb';
import UserModel from '../../../../../../models/userModel';

export async function PUT(req) {
  try {
    await connectDb();
    const body = await req.json();
    const { _id, firstname,lastname, email, mobile, image } = body;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    await userMiddleware(token);
    const updateData = { firstname,lastname, email, mobile,image };
    const updated = await UserModel.findByIdAndUpdate(_id, updateData, { new: true });
    return Response.json({updated},{status:200});
  } catch (err) {
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
