// app/profile/page.js
"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  ShoppingBag,
  Heart,
  Clock,
  Package,
  Truck,
  CheckCircle,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { logoutUser } from '../../lib/slices/authSlice';
import AuthModal from '../../../components/Auth/AuthModal';
import './Profile.css';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    image: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        image: user.image || ''
      });

      if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchOrders = async () => {
    if (!user?.mobile) return;

    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/web/get-orders?email=${user.email}&token=${token}`);

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?._id) return;

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/web/user/update-user?token=${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: user._id,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          mobile: formData.mobile,
          image: formData.image
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local storage and Redux state
        const updatedUser = { ...user, ...data.updated };
        localStorage.setItem('userData', JSON.stringify(updatedUser));

        setIsEditing(false);
        toast.success('Profile updated successfully!');

        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      mobile: user.mobile || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      image: user.image || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'warning';
      case 'processing': return 'info';
      case 'ordered': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'processing':
      case 'ordered': return <Package size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderItemsCount = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleViewOrderDetails = (orderId) => {
    // Navigate to order details page or show modal
    console.log('View order details:', orderId);
    // You can implement order details view here
  };

  const handleTrackOrder = (order) => {
    if (order.trackingInfo?.link) {
      window.open(order.trackingInfo.link, '_blank');
    } else {
      toast.error('Tracking information not available yet.');
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="profile-not-auth">
        <div className="not-auth-content">
          <User className="not-auth-icon" />
          <h2>Please log in to view your profile</h2>
          <p>You need to be logged in to access your profile information</p>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => setShowAuthModal(false)}
            actionType="access your profile"
          />
          <button
            className="btn-primary"
            onClick={() => setShowAuthModal(true)}
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account and view your orders</p>
        </div>

        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.firstname}
                    title={user.firstname}
                    fill
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div className="user-info">
                <h3>{user?.firstname} {user?.lastname}</h3>
                <p>{user?.email}</p>
                <span className="member-since">
                  Member since {new Date(user?.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <User size={18} />
                Personal Info
              </button>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag size={18} />
                Orders
                {orders.length > 0 && (
                  <span className="nav-badge">{orders.length}</span>
                )}
              </button>
              <button
                className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => window.location.href = '/wishlist'}
              >
                <Heart size={18} />
                Wishlist
              </button>
              <button className="nav-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <User className="section-icon" />
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      className="edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={updateLoading}
                      >
                        <Save size={16} />
                        {updateLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancel}
                        disabled={updateLoading}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-field">
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        className="info-input"
                        required
                      />
                    ) : (
                      <p className="info-value">{user?.firstname || 'Not set'}</p>
                    )}
                  </div>

                  <div className="info-field">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        className="info-input"
                        required
                      />
                    ) : (
                      <p className="info-value">{user?.lastname || 'Not set'}</p>
                    )}
                  </div>

                  <div className="info-field">
                    <label>
                      <Mail size={16} />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="info-input"
                        required
                      />
                    ) : (
                      <p className="info-value">{user?.email || 'Not set'}</p>
                    )}
                  </div>

                  <div className="info-field">
                    <label>
                      <Phone size={16} />
                      Mobile
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="info-input"
                        required
                        pattern="[6-9]\d{9}"
                        title="Please enter a valid 10-digit Indian mobile number"
                      />
                    ) : (
                      <p className="info-value">{user?.mobile || 'Not set'}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="info-field full-width">
                      <label>Profile Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="info-input"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </div>

                {/* Address Information (Read-only for now) */}
                <div className="address-section">
                  <h3 className="address-title">
                    <MapPin size={18} />
                    Shipping Address
                  </h3>
                  {user?.address ? (
                    <div className="address-display">
                      <p>{user.address}</p>
                      <p>{user.city}, {user.state} - {user.pincode}</p>
                    </div>
                  ) : (
                    <p className="no-address">No address saved yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <ShoppingBag className="section-icon" />
                    My Orders
                  </h2>
                  <button
                    className="refresh-btn"
                    onClick={fetchOrders}
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex items-center justify-center py-24 px-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center transition hover:shadow-xl">

                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
                        <ShoppingBag className="w-10 h-10 text-amber-600" />
                      </div>

                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        No Orders Yet
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Looks like you haven't placed any orders yet.
                        Start exploring our collections and find something you love.
                      </p>

                      <button
                        onClick={() => (window.location.href = "/collections/all")}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-600 text-white font-medium shadow-md hover:bg-amber-700 hover:shadow-lg transition-all duration-300"
                      >
                        Start Shopping
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className={`order-card ${getStatusColor(order.orderStatus)}`}
                      >
                        <div className="order-header">
                          <div className="order-info">
                            <h4>Order #{order.orderNumber}</h4>
                            <p className="order-date">
                              Placed on {formatOrderDate(order.createdAt)}
                            </p>
                            <p className="order-amount">
                              Total: ₹{order.finalAmount?.toLocaleString()}
                            </p>
                          </div>
                          <div className={`order-status ${getStatusColor(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="order-items">
                            <strong>Items:</strong> {getOrderItemsCount(order.orderItems)} products
                          </div>

                          {order.trackingInfo && (
                            <div className="tracking-info">
                              <Truck size={14} />
                              <span>
                                {order.trackingInfo.partner || 'Tracking'}:
                                {order.trackingInfo.link ? (
                                  <a
                                    href={order.trackingInfo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tracking-link"
                                  >
                                    {order.trackingInfo.link}
                                  </a>
                                ) : (
                                  ' Not available'
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="order-actions">
                          <button
                            className="action-btn primary"
                            onClick={() => handleViewOrderDetails(order._id)}
                          >
                            <ExternalLink size={14} />
                            View Details
                          </button>
                          <button
                            className="action-btn secondary"
                            onClick={() => handleTrackOrder(order)}
                          >
                            <Truck size={14} />
                            Track Order
                          </button>
                          {order.orderStatus?.toLowerCase() === 'delivered' && (
                            <button className="action-btn secondary">
                              Reorder
                            </button>
                          )}
                        </div>

                        {/* Order Timeline */}
                        <div className="order-timeline">
                          <div className="timeline-item active">
                            <div className="timeline-dot"></div>
                            <span>Order Placed</span>
                            <span>{formatOrderDate(order.createdAt)}</span>
                          </div>

                          {order.orderStatus?.toLowerCase() === 'processing' && (
                            <div className="timeline-item active">
                              <div className="timeline-dot"></div>
                              <span>Processing</span>
                              <span>In progress</span>
                            </div>
                          )}

                          {['shipped', 'delivered'].includes(order.orderStatus?.toLowerCase()) && (
                            <div className="timeline-item active">
                              <div className="timeline-dot"></div>
                              <span>Shipped</span>
                              <span>
                                {order.updatedAt ? formatOrderDate(order.updatedAt) : 'In progress'}
                              </span>
                            </div>
                          )}

                          {order.orderStatus?.toLowerCase() === 'delivered' && (
                            <div className="timeline-item active">
                              <div className="timeline-dot"></div>
                              <span>Delivered</span>
                              <span>
                                {order.updatedAt ? formatOrderDate(order.updatedAt) : 'Completed'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats - Only show on personal tab */}
            {activeTab === 'personal' && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon orders">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{orders.length}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon wishlist">
                    <Heart size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{wishlist?.length}</h3>
                    <p>Wishlist Items</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon delivered">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length}</h3>
                    <p>Delivered</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfilePage;

