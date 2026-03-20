// /app/api/save-token/route.js
import userMiddleware from '../../../../../../controller/userController';
import connectDb from '../../../../../../config/connectDb';
import UserModel from '../../../../../../models/userModel';

export async function PUT(req) {
  try {
    await connectDb();
    
    // Parse the request body
    const { token, _id } = await req.json();
    
    // Get auth token from URL search params
    const { searchParams } = new URL(req.url);
    const authToken = searchParams.get('token');
    
    // Verify the user using middleware
    await userMiddleware(authToken);
    
    // Update the user with the FCM token
    const updated = await UserModel.findByIdAndUpdate(
      _id, 
      { fcmToken: token }, // Fixed: added curly braces for update object
      { new: true }
    );
    
    // Check if user was found and updated
    if (!updated) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ updated }, { status: 200 });
    
  } catch (err) {
    console.error('Update user error:', err);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }

}
