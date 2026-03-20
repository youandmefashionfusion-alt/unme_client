// app/api/web/user/notification-status/route.js
import userMiddleware from '../../../../../../controller/userController';
import connectDb from '../../../../../../config/connectDb';
import UserModel from '../../../../../../models/userModel';

export async function GET(req) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(req.url);
    const authToken = searchParams.get('token');
    
    const user = await userMiddleware(authToken);
    const userData = await UserModel.findById(user._id)
      .select('fcmToken preferences');
    
    return Response.json({
      hasFCMToken: !!userData.fcmToken,
      notificationsEnabled: userData.preferences?.notificationsEnabled || false,
      fcmToken: userData.fcmToken
    });
    
  } catch (error) {
    console.error('Error checking notification status:', error);
    return Response.json({ 
      hasFCMToken: false, 
      notificationsEnabled: false 
    }, { status: 500 });
  }
}