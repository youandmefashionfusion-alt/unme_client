// components/NotificationManager.jsx
'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setNotification, 
  setPermission,
  loadUserPreferences
} from '../src/lib/slices/notificationSlice';
import { getMessagingInstance } from '../src/lib/firebase';
import { onMessage } from 'firebase/messaging';

export default function NotificationManager() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userPreferences } = useSelector((state) => state.notifications);

  // Initialize messaging and listen for messages
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        const messaging = await getMessagingInstance();
        if (!messaging) return;

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Received foreground message: ', payload);
          
          // Show notification if enabled
          if (userPreferences.notificationsEnabled) {
            dispatch(setNotification(payload));
            showBrowserNotification(payload);
          }
        });

        // Check current permission status
        if ('Notification' in window) {
          dispatch(setPermission(Notification.permission));
        }

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing messaging:', error);
      }
    };

    initializeMessaging();
  }, [dispatch, userPreferences.notificationsEnabled]);

  // Load user preferences when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUserPreferences());
    }
  }, [isAuthenticated, dispatch]);

  const showBrowserNotification = (payload) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/apple-touch-icon.png',
        image: payload.notification.image,
        data: payload.data
      });

      notification.onclick = () => {
        window.focus();
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };
    }
  };

  return null;

}

