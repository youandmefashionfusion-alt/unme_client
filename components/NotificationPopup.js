// components/NotificationPopup.jsx
'use client';
import { useDispatch, useSelector } from 'react-redux';
import { 
  requestNotificationPermission,
  setPermissionPopup,
  clearError
} from '@/lib/slices/notificationSlice';

export default function NotificationPopup() {
  const dispatch = useDispatch();
  const { 
    userPreferences, 
    permission, 
    loading,
    error,
    showPermissionPopup
  } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Don't show if already enabled or user not authenticated
  if (!showPermissionPopup || userPreferences.notificationsEnabled || !isAuthenticated) {
    return null;
  }

  const handleEnableNotifications = async () => {
    await dispatch(requestNotificationPermission());
  };

  const handleClose = () => {
    dispatch(setPermissionPopup(false));
    dispatch(clearError());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Enable Notifications
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            Stay updated with order confirmations, promotions, and important updates
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}

          {/* Permission Denied Message */}
          {permission === 'denied' && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                Notifications blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleEnableNotifications}
              disabled={loading || permission === 'denied'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
