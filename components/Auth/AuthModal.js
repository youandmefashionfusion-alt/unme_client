// components/Auth/AuthModal.js
"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { loginUser, registerUser, clearError } from '../../src/lib/slices/authSlice';
import { fetchCart } from '../../src/lib/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { requestNotificationPermission, loadUserPreferences } from '../../src/lib/slices/notificationSlice';
import styles from './auth.module.css'
import { Mail, Phone, User, X, Check } from 'lucide-react';
import logo from '../../images/logo.png'
import Image from 'next/image';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess, actionType = "add to cart" }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '',
    mobile: '',
    email: '',
    otp: ''
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Close modal when authentication is successful
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCart());
      
      dispatch(loadUserPreferences()).then(() => {
        handleNotificationCheck();
      });
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        handleClose();
      }, 500);
    }
  }, [isAuthenticated, user, dispatch, onSuccess]);

  const handleNotificationCheck = async () => {
    try {
      if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return;
      }

      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);

      const userStatus = await checkUserNotificationStatus();
      console.log('User notification status:', userStatus);

      const shouldAskForPermission = 
        (currentPermission === 'granted' && !userStatus.hasFCMToken) ||
        (currentPermission === 'default');

      console.log('Should ask for permission:', shouldAskForPermission, {
        permission: currentPermission,
        hasFCMToken: userStatus.hasFCMToken,
        notificationsEnabled: userStatus.notificationsEnabled
      });

      if (shouldAskForPermission) {
        console.log('Asking for notification permission...');
        await dispatch(requestNotificationPermission()).unwrap();
      } else {
        console.log('Skipping notification permission request - already setup');
      }
    } catch (error) {
      console.error('Failed to handle notification check:', error);
    }
  };

  const checkUserNotificationStatus = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return { hasFCMToken: false, notificationsEnabled: false };

      const response = await fetch(`/api/web/user/notification-status?token=${authToken}`);
      if (response.ok) {
        return await response.json();
      }
      return { hasFCMToken: false, notificationsEnabled: false };
    } catch (error) {
      console.error('Error checking user notification status:', error);
      return { hasFCMToken: false, notificationsEnabled: false };
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Send OTP
  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (data.status) {
        setOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        toast.success('OTP sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        })
      });

      const data = await response.json();
      
      if (data.status) {
        setOtpVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Submit form (Login or Register)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify your email first');
      return;
    }

    if (isLogin) {
      // Login
      await dispatch(loginUser({
        email: formData.email      
      }));
    } else {
      // Register then auto-login
      const registerResult = await dispatch(registerUser({
        firstname: formData.firstname,
        mobile: formData.mobile,
        email: formData.email
      }));
      
      if (registerUser.fulfilled.match(registerResult)) {
        await dispatch(loginUser({
          email: formData.email
        }));
      }
    }
    await handleNotificationCheck();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow digits for OTP
    if (name === 'otp' && value && !/^\d*$/.test(value)) {
      return;
    }
    
    // Limit OTP to 6 digits
    if (name === 'otp' && value.length > 6) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset OTP verification if email changes
    if (name === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setFormData(prev => ({ ...prev, otp: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      mobile: '',
      email: '',
      otp: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
    dispatch(clearError());
  };

  const handleClose = () => {
    resetForm();
    setIsLogin(true);
    if (onClose) onClose();
  };

  const switchToLogin = () => {
    setIsLogin(true);
    resetForm();
  };

  const switchToSignup = () => {
    setIsLogin(false);
    resetForm();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.authHeader}>
            <Image src={logo} alt='UnMe Logo' title='UnMe Logo' width={120} height={100} style={{width:'120px', height:'auto'}} />
            
            <h2 className={styles.title}>
              {isLogin ? 'Welcome Back' : 'Join U n Me'}
            </h2>
            
            <p className={styles.subtitle}>
              {isLogin 
                ? `Sign in to ${actionType}` 
                : `Create your account to ${actionType}`
              }
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
              onClick={switchToLogin}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
              onClick={switchToSignup}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <div className={styles.inputIcon}>
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="firstname"
                  placeholder="Full Name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required={!isLogin}
                  className={styles.formInput}
                />
              </div>
            )}
            {!isLogin && (
            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
                className={styles.formInput}
                pattern="[6-9]\d{9}"
                title="Please enter a valid 10-digit Indian mobile number"
              />
            </div>
            )}

            {/* Email with OTP */}
            <div className={styles.inputGroup}>
              <div className={styles.inputIcon}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.formInput}
                disabled={otpVerified}
              />
              {otpVerified ? (
                <span className={styles.verifiedBadge}>
                  <Check size={18} /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.otpButton}
                  onClick={handleSendOTP}
                  disabled={otpLoading || countdown > 0 || !formData.email}
                >
                  {otpLoading ? (
                    <div className={styles.spinner}></div>
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : otpSent ? (
                    'Resend'
                  ) : (
                    'Send OTP'
                  )}
                </button>
              )}
            </div>

            {/* OTP Input */}
            {otpSent && !otpVerified && (
              <div className={styles.inputGroup}>
                <div className={styles.inputIcon}>
                  <Mail size={20} />
                </div>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                  maxLength="6"
                  pattern="\d{6}"
                />
                <button
                  type="button"
                  className={styles.otpButton}
                  onClick={handleVerifyOTP}
                  disabled={verifyLoading || formData.otp.length !== 6}
                >
                  {verifyLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !otpVerified}
              className={`${styles.submitBtn} ${isAuthenticated ? styles.success : ''}`}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.authFooter}>
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className={styles.switchMode}
                onClick={isLogin ? switchToSignup : switchToLogin}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Benefits Section for Sign Up */}
          {!isLogin && (
            <div className={styles.benefits}>
              <h4>Join U n Me and enjoy:</h4>
              <ul>
                <li>🛍️ Fast & secure checkout</li>
                <li>❤️ Save your favorite items</li>
                <li>📱 Track your orders</li>
                <li>🔔 Get order notifications</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;