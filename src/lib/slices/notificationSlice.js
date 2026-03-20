// store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper functions
const getMessagingInstance = async () => {
  const { getMessagingInstance } = await import('../firebase');
  return getMessagingInstance();
};

const getToken = async (messaging, options) => {
  const { getToken } = await import('firebase/messaging');
  return getToken(messaging, options);
};

export const checkAndRequestNotificationPermission = createAsyncThunk(
  'notifications/checkAndRequestPermission',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get token from localStorage
      let authToken = null;
      let userData = null;
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      }

      // Get user ID from Redux state as fallback
      const state = getState();
      const userId = userData?._id || state.auth.user?._id;

      if (!authToken || !userId) {
        throw new Error('Authentication required');
      }

      // Check current notification state
      const { userPreferences, fcmToken, permission } = state.notifications;
      
      // Conditions for requesting permission
      const shouldRequest = 
        permission === 'default' && 
        (!userPreferences.notificationsEnabled || !fcmToken);

      console.log('Notification permission check:', {
        permission,
        preferencesEnabled: userPreferences.notificationsEnabled,
        fcmTokenPresent: !!fcmToken,
        shouldRequest
      });

      if (shouldRequest) {
        // Use the existing requestNotificationPermission thunk
        const result = await dispatch(requestNotificationPermission()).unwrap();
        return { ...result, wasRequested: true };
      } else {
        return { 
          token: fcmToken, 
          permission,
          wasRequested: false,
          reason: permission !== 'default' ? 'Permission already decided' : 
                  userPreferences.notificationsEnabled && fcmToken ? 'Already enabled' : 
                  'Conditions not met'
        };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update the existing requestNotificationPermission to include more debugging
export const requestNotificationPermission = createAsyncThunk(
  'notifications/requestPermission',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from localStorage
      let authToken = null;
      let userData = null;
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      }

      // Get user ID from Redux state as fallback
      const state = getState();
      const userId = userData?._id || state.auth.user?._id;

      if (!authToken || !userId) {
        throw new Error('Authentication required');
      }

      const messaging = await getMessagingInstance();
      if (!messaging) {
        throw new Error('Messaging not supported');
      }

      const permissionResult = await Notification.requestPermission();
      console.log('Permission result:', permissionResult);
      
      if (permissionResult === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        
        console.log('FCM Token received:', !!token);
        
        if (token) {
          // Save token to backend
          const saveTokenResponse = await fetch(`/api/web/user/save-token?token=${authToken}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, _id: userId }),
          });
          
          if (!saveTokenResponse.ok) {
            throw new Error('Failed to save token');
          }

          console.log('Token saved successfully');

          // Enable notifications in preferences
          const prefResponse = await fetch(`/api/web/user/preferences?token=${authToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              preferences: { notificationsEnabled: true }, 
              _id: userId 
            }),
          });

          if (!prefResponse.ok) {
            throw new Error('Failed to enable notifications');
          }

          console.log('Preferences updated successfully');

          const prefData = await prefResponse.json();
          return { token, permission: permissionResult, preferences: prefData.preferences };
        }
      }
      
      return { token: null, permission: permissionResult };
    } catch (error) {
      console.error('Error in requestNotificationPermission:', error);
      return rejectWithValue(error.message);
    }
  }
);
// Async thunk for loading user preferences
export const loadUserPreferences = createAsyncThunk(
  'notifications/loadPreferences',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from localStorage
      let authToken = null;
      let userData = null;
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('authToken');
        const userDataStr = localStorage.getItem('userData');
        userData = userDataStr ? JSON.parse(userDataStr) : null;
      }

      // Get user ID from Redux state as fallback
      const state = getState();
      const userId = userData?._id || state.auth.user?._id;

      if (!authToken || !userId) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/web/user/preferences?token=${authToken}`);
      
      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }
      
      const data = await response.json();
      return data.preferences;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    // Notification state
    notification: null,
    fcmToken: null,
    permission: 'default',
    
    // User preferences
    userPreferences: {
      notificationsEnabled: false
    },
    
    // Loading states
    loading: false,
    error: null,
    
    // UI state
    showToast: false,
    showPermissionPopup: true,
  },
  reducers: {
    setNotification: (state, action) => {
      state.notification = action.payload;
      state.showToast = true;
    },
    
    clearNotification: (state) => {
      state.notification = null;
      state.showToast = false;
    },
    
    hideToast: (state) => {
      state.showToast = false;
    },
    
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    
    setPermission: (state, action) => {
      state.permission = action.payload;
    },
    
    resetNotificationState: (state) => {
      state.notification = null;
      state.showToast = false;
      state.userPreferences.notificationsEnabled = false;
      state.showPermissionPopup = true;
    },
    
    clearError: (state) => {
      state.error = null;
    },

    setPermissionPopup: (state, action) => {
      state.showPermissionPopup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Permission
      .addCase(requestNotificationPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestNotificationPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permission = action.payload.permission;
        state.fcmToken = action.payload.token;
        if (action.payload.permission === 'granted') {
          state.userPreferences.notificationsEnabled = true;
          if (action.payload.preferences) {
            state.userPreferences = action.payload.preferences;
          }
        }
        state.error = null;
        console.log('Notification permission fulfilled:', action.payload);
      })
      .addCase(requestNotificationPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userPreferences.notificationsEnabled = false;
        console.log('Notification permission rejected:', action.payload);
      })
      
      // Check and Request Permission
      .addCase(checkAndRequestNotificationPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAndRequestNotificationPermission.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.wasRequested) {
          state.permission = action.payload.permission;
          state.fcmToken = action.payload.token;
          if (action.payload.permission === 'granted') {
            state.userPreferences.notificationsEnabled = true;
          }
        }
        state.error = null;
        console.log('Notification check completed:', action.payload);
      })
      .addCase(checkAndRequestNotificationPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('Notification check failed:', action.payload);
      })
      
      // Load Preferences
      .addCase(loadUserPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.userPreferences = action.payload;
        state.error = null;
        console.log('Preferences loaded:', action.payload);
      })
      .addCase(loadUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setNotification,
  clearNotification,
  hideToast,
  setFCMToken,
  setPermission,
  resetNotificationState,
  clearError,
  setPermissionPopup,
} = notificationSlice.actions;


export default notificationSlice.reducer;


