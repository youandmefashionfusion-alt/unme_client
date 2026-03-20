// app/api/user/preferences/route.js
import userMiddleware from '../../../../../../controller/userController';
import connectDb from '../../../../../../config/connectDb';
import UserModel from '../../../../../../models/userModel';

export async function GET(req) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(req.url);
    const authToken = searchParams.get('token');
    
    const user = await userMiddleware(authToken);
    
    const userData = await UserModel.findById(user._id).select('preferences');
    
    // Simple preferences - only notificationsEnabled
    const preferences = userData?.preferences || {
      notificationsEnabled: false
    };

    return Response.json({ preferences }, { status: 200 });
    
  } catch (error) {
    console.error('Get preferences error:', error);
    return Response.json({ error: 'Failed to get preferences' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();
    
    const { preferences, _id } = await req.json();
    const { searchParams } = new URL(req.url);
    const authToken = searchParams.get('token');
    
    await userMiddleware(authToken);
    
    const updated = await UserModel.findByIdAndUpdate(
      _id,
      { 
        preferences: preferences,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updated) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ 
      success: true,
      preferences: updated.preferences 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    return Response.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}