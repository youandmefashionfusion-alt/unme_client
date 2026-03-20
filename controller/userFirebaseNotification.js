// hooks/useFirebaseNotification.js
import { useState, useEffect } from 'react';
import { getMessagingInstance } from '../src/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useSelector } from 'react-redux';

export const useFirebaseNotification = () => {
  const [notification, setNotification] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const user = useSelector((state)=>state.auth.user)

  // Request notification permission
  const requestPermission = async () => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      const permissionStatus = await Notification.requestPermission();
      setPermission(permissionStatus);

      if (permissionStatus === 'granted') {
        console.log('Notification permission granted.');
        await getFCMToken(messaging);
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  // Get FCM token
  const getFCMToken = async (messaging) => {
    try {
      // Use your VAPID key from Firebase Console
      // Project Settings → Cloud Messaging → Web Push certificates
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        setFcmToken(token);
        console.log('FCM Token:', token);
        
        // Send token to your backend
        await saveTokenToServer(token);
      } else {
        console.log('No registration token available.');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  // Save token to your database
  const saveTokenToServer = async (token) => {
    try {
      const response = await fetch(`/api/web/user/save-token?token=${user?.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, _id:user?._id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save token');
      }
    } catch (error) {
      console.error('Error saving token to server:', error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    const initializeMessaging = async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      // Handle messages when app is in foreground
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Received foreground message: ', payload);
        setNotification(payload);
        
        // Show in-app notification
        showInAppNotification(payload);
      });

      return unsubscribe;
    };

    initializeMessaging();
  }, []);

  const showInAppNotification = (payload) => {
    // You can use any notification library here
    // For now, we'll use the browser's notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png',
        image: payload.notification.image,
        data: payload.data
      });
    }
  };

  return {
    notification,
    fcmToken,
    permission,
    requestPermission,
    getFCMToken
  };
};