// app/api/notifications/send/route.js
import admin from '../../../../lib/firebase-admin';
import connectDb from '../../../../../config/connectDb';
import UserModel from '../../../../../models/userModel';

export async function POST(req) {
  try {
    await connectDb();
    const { title, body, data, image } = await req.json();

    // Get all users with FCM tokens (using fcmToken field)
    const users = await UserModel.find({ 
      fcmToken: { $exists: true, $ne: null },
      'preferences.notificationsEnabled': true 
    }).select('fcmToken preferences');

    if (users.length === 0) {
      return Response.json({ error: 'No users with FCM tokens' }, { status: 400 });
    }

    // Since we removed notification types, send to all users with enabled notifications
    const tokens = users
      .map(user => user.fcmToken)
      .filter(token => token); // Remove null tokens

    if (tokens.length === 0) {
      return Response.json({ error: 'No valid tokens' }, { status: 400 });
    }

    const message = {
      notification: {
        title,
        body,
        image: image ,
      },
      data: {
        url: data?.url || '/',
        ...data
      },
      tokens: tokens // Send to multiple devices
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Clean up failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      // Remove failed tokens from database
      if (failedTokens.length > 0) {
        await UserModel.updateMany(
          { fcmToken: { $in: failedTokens } },
          { $unset: { fcmToken: 1 } }
        );
        console.log(`Cleaned up ${failedTokens.length} failed tokens`);
      }
    }

    return Response.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Notification sent to ${response.successCount} users`
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

