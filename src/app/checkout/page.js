"use client"
import React, { useState, useEffect, useRef } from 'react'
import styles from './checkout.module.css'
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Package,
  Plus,
  Minus,
  X,
  CheckCircle,
  Tag
} from 'lucide-react';

// Import cart actions
import {
  updateCartItem,
  removeFromCart,
} from '../../lib/slices/cartSlice';
import { GTM } from '@/lib/gtm';

function useDebounce(callback, delay, deps) {
  const timeoutRef = useRef();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const CheckoutPage = () => {
  const dispatch = useDispatch();

  // Get cart data from Redux store
  const { items: cartItems, loading: cartLoading } = useSelector((state) => state.cart);

  const [orderItems, setOrderItems] = useState([]);

  // Form states
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")

  // OTP states
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(true)
  const [otpLoading, setOtpLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Payment states
  const [payMethod, setPayMethod] = useState("payu")
  const [orderType, setOrderType] = useState("Prepaid")
  const [shippingCost, setShippingCost] = useState(0)
  const [coupon, setCoupon] = useState("")
  const [couponAmount, setCouponAmount] = useState(null)  // Raw discount from API
  const [effectiveCouponDiscount, setEffectiveCouponDiscount] = useState(0) // Actual applied after cap
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [paySpin, setPaySpin] = useState(false)

  // PayU states
  const [uniqueId, setUniqueId] = useState('')
  const [transactionId, setTransactionId] = useState(null)
  const [hash, setHash] = useState(null)
  const [payUOpen, setPayUOpen] = useState(false)

  // Amount states
  const [totalAmount, setTotalAmount] = useState(0)
  const [finalAmount, setFinalAmount] = useState(0)
  const [prepaidDiscount, setPrepaidDiscount] = useState(0)

  const [errors, setErrors] = useState({
    firstname: false,
    lastname: false,
    email: false,
    phone: false,
    address: false,
    city: false,
    state: false,
    pincode: false,
  });

  // Generate unique ID for transaction
  useEffect(() => {
    const generateUniqueId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
      const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
      const randomElement = Math.random().toString(36).substring(2, 10);
      const uniqueI = `${dateTimeString}-${randomElement}`;
      return uniqueI;
    };

    const id = generateUniqueId();
    setUniqueId(id);
    setTransactionId(id)
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Calculate sale bundles for both 999 and 1499 sale types
  const calculateSaleBundle = (cartItems) => {
    // Separate items by sale type
    const sale999Items = cartItems.filter(item => item.product.is999Sale);
    const sale1499Items = cartItems.filter(item => item.product.is1499Sale);
    const nonSaleItems = cartItems.filter(item => !item.product.is999Sale && !item.product.is1499Sale);

    let bundle999 = null;
    let bundle1499 = null;

    if (sale999Items.length >= 3) {
      // Sort 999 items by price ASC to get cheapest 3
      const sorted999Items = [...sale999Items].sort(
        (a, b) => a.product.price - b.product.price
      );
      bundle999 = {
        applied: true,
        price: 999,
        items: sorted999Items.slice(0, 3),
        remainingItems: sorted999Items.slice(3)
      };
    }

    if (sale1499Items.length >= 3) {
      // Sort 1499 items by price ASC to get cheapest 3
      const sorted1499Items = [...sale1499Items].sort(
        (a, b) => a.product.price - b.product.price
      );
      bundle1499 = {
        applied: true,
        price: 1499,
        items: sorted1499Items.slice(0, 3),
        remainingItems: sorted1499Items.slice(3)
      };
    }

    // Collect all items that are not part of bundles
    const normalItems = [
      ...(bundle999 ? bundle999.remainingItems : sale999Items),
      ...(bundle1499 ? bundle1499.remainingItems : sale1499Items),
      ...nonSaleItems
    ];

    return {
      bundle999,
      bundle1499,
      normalItems
    };
  };

  // Calculate subtotal for non-sale items (for coupon application)
  const calculateNonSaleSubtotal = () => {
    const { bundle999, bundle1499, normalItems } = calculateSaleBundle(cartItems);

    // Non-sale items are those that are not in any bundle and not marked as sale
    const nonSaleOnlyItems = normalItems.filter(item => !item.product.is999Sale && !item.product.is1499Sale);

    return nonSaleOnlyItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
  };

  // Check if an item is part of a bundle
  const isItemInBundle = (item) => {
    const { bundle999, bundle1499 } = calculateSaleBundle(cartItems);
    if (bundle999?.items.some(bundleItem => bundleItem.product._id === item.product._id)) {
      return '999';
    }
    if (bundle1499?.items.some(bundleItem => bundleItem.product._id === item.product._id)) {
      return '1499';
    }
    return null;
  };

  // Main calculation effect - runs whenever cart, shipping, coupon, or payment method changes
  useEffect(() => {
    let total = 0;

    const {
      bundle1499,
      bundle999,
      normalItems,
    } = calculateSaleBundle(cartItems);

    // 1️⃣ Add bundle prices
    if (bundle999?.applied) {
      total += bundle999.price;
    }
    if (bundle1499?.applied) {
      total += bundle1499.price;
    }

    // 2️⃣ Add normal items (includes remaining sale items + non-sale)
    normalItems.forEach(item => {
      total += item.product.price * item.quantity;
    });

    setTotalAmount(total);

    // 3️⃣ Coupon ONLY on non-sale subtotal
    const nonSaleSubtotal = calculateNonSaleSubtotal();
    const effectiveCoupon = Math.min(
      couponAmount || 0,
      nonSaleSubtotal
    );
    setEffectiveCouponDiscount(effectiveCoupon);

    // 4️⃣ Prepaid discount (5% of total, only for PayU)
    let prepaidDisc = 0;
    if (payMethod === "payu") {
      prepaidDisc = Math.round(total * 0.05);
    }
    setPrepaidDiscount(prepaidDisc);

    // 5️⃣ Final amount
    const calculatedFinal = total + shippingCost - effectiveCoupon - prepaidDisc;
    setFinalAmount(calculatedFinal);

    // Prepare order items for API
    const preparedOrderItems = cartItems?.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      color: item.color,
      size: item.size
    }));
    setOrderItems(preparedOrderItems);
  }, [cartItems, shippingCost, couponAmount, payMethod]);

  // Save shipping info to localStorage
  useEffect(() => {
    localStorage.setItem("shippingInfo", JSON.stringify({
      firstname,
      lastname,
      email,
      phone,
      city,
      address,
      state,
      pincode
    }));
  }, [firstname, lastname, phone, email, city, address, pincode, state]);

  // Load saved address from localStorage
  useEffect(() => {
    const savedAddress = JSON.parse(localStorage.getItem("shippingInfo"));
    if (savedAddress && !firstname) {
      setFirstname(savedAddress.firstname || "");
      setLastname(savedAddress.lastname || "");
      setEmail(savedAddress.email || "");
      setAddress(savedAddress.address || "");
      setCity(savedAddress.city || "");
      setState(savedAddress.state || "");
      setPincode(savedAddress.pincode || "");
      setPhone(savedAddress.phone || "");
    }
  }, [firstname]);

  // Send OTP
  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      setErrors({ ...errors, email: true });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.status) {
        setOtpSent(true);
        setCountdown(60);
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
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.status) {
        setOtpVerified(true);
        toast.success('✅ Email verified successfully!');
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

  // Handle email change - reset OTP verification
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors({ ...errors, email: false });
    setOtpSent(false);
    setOtpVerified(true);
    setOtp('');
  };

  // Handle OTP input
  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value && !/^\d*$/.test(value)) return;
    if (value.length > 6) return;
    setOtp(value);
  };

  // Quantity handlers using Redux
  const increaseQty = (item) => {
    dispatch(updateCartItem({
      productId: item.product._id,
      quantity: item.quantity + 1
    }));
  };

  const decreaseQty = (item) => {
    if (item.quantity <= 1) {
      dispatch(removeFromCart(item.product._id));
    } else {
      dispatch(updateCartItem({
        productId: item.product._id,
        quantity: item.quantity - 1
      }));
    }
  };

  // Payment method handlers
  const codClick = () => {
    setShippingCost(99);
    setOrderType("COD");
    setPayMethod("cod");
    toast("💳 Cash on Delivery selected");
    GTM.addPaymentInfo(cartItems, finalAmount, "COD");
  };

  const payuClick = () => {
    setShippingCost(0);
    setOrderType("Prepaid");
    setPayMethod("payu");
    toast("💳 PayU selected");
    GTM.addPaymentInfo(cartItems, finalAmount, "Prepaid");
  };

  // Coupon handler
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await fetch("/api/coupon/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: coupon,
          totalAmount: totalAmount,
          customerType: "all",
          cartItemCount: cartItems?.length,
          customerEmail: email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCouponAmount(parseInt(data.discountAmount));
        if (data.discountType === "freeShip") {
          setShippingCost(0);
        }
        toast.success("🎉 Coupon applied successfully!");
        setShowCouponInput(false);
      } else {
        toast.error("Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {
      firstname: !firstname.trim(),
      lastname: !lastname.trim(),
      email: !email.trim() || !/\S+@\S+\.\S+/.test(email),
      phone: !phone.trim() || phone.length !== 10,
      address: !address.trim(),
      city: !city.trim(),
      state: !state.trim(),
      pincode: !pincode.trim() || pincode.length !== 6,
    };

    setErrors(newErrors);

    // Check if email is verified
    if (!otpVerified) {
      toast.error("Please verify your email first");
      return false;
    }

    if (Object.values(newErrors).some(error => error)) {
      toast.error("Please fill all required fields correctly");
      return false;
    }

    return true;
  };

  // Complete order
  const completeOrder = () => {
    if (!validateForm()) {
      return;
    }
    GTM.addShippingInfo(cartItems, finalAmount, 'Standard');

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const fbclid = localStorage.getItem("fbclid");

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_ids: cartItems?.map((item) => item?.productId),
        content_type: "product",
        value: finalAmount,
        currency: "INR",
        ...(fbclid && { fbclid })
      });
    }

    setPaySpin(true);

    // Save address
    localStorage.setItem("address", JSON.stringify({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      address: address.trim(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isVarified: otpVerified
    }));

    // Prepare order data
    const orderData = {
      totalPrice: totalAmount,
      finalAmount: finalAmount,
      shippingCost: shippingCost,
      orderType: orderType,
      discount: (effectiveCouponDiscount + prepaidDiscount) || 0,
      orderItems: orderItems,
      shippingInfo: JSON.parse(localStorage.getItem("address")),
      tag: "U & Me",
      isPartial: false
    };

    if (orderType === "COD") {
      orderData.paymentInfo = {
        orderCreationId: "COD",
        razorpayPaymentId: "COD",
        razorpayOrderId: "COD",
      };
      createOrder(orderData);
    } else {
      // For PayU, directly get hash and submit form
      handlePayUPayment(orderData);
    }
  };

  // New function for PayU payment
  const handlePayUPayment = async (orderData) => {
    try {
      // First create the order in backend to get transaction ID
      const orderResponse = await fetch("/api/payu/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const orderDataResult = await orderResponse.json();

      if (orderResponse.ok && orderDataResult.success) {
        // Get hash for PayU
        const payload = {
          transactionId: orderDataResult.transactionId,
          firstname,
          email,
          phone,
          orderItems: orderItems,
          totalPrice: totalAmount,
          finalAmount,
          shippingCost,
          discount: (effectiveCouponDiscount + prepaidDiscount) || 0
        };

        const hashResponse = await fetch("/api/payu", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });

        const hashData = await hashResponse.json();

        if (hashResponse.ok && hashData.success) {
          // Create and submit PayU form automatically
          submitPayUForm({
            transactionId: orderDataResult.transactionId,
            hash: hashData.hash,
            orderData: orderData
          });
        } else {
          toast.error(hashData.error || "Payment initiation failed");
          setPaySpin(false);
        }
      } else {
        toast.error(orderDataResult.error || "Order creation failed");
        setPaySpin(false);
      }
    } catch (error) {
      console.error("Error in PayU payment:", error);
      toast.error("An error occurred while processing the payment");
      setPaySpin(false);
    }
  };

  // Function to auto-submit PayU form
  const submitPayUForm = (paymentData) => {
    // Create a hidden form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://secure.payu.in/_payment';
    form.style.display = 'none';

    // Add all required PayU parameters
    const params = {
      key: '53ADbY',
      txnid: paymentData.transactionId,
      productinfo: phone || '',
      amount: finalAmount,
      email: email,
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      surl: `https://unmejewels.com/api/payu/success?orderData=${encodeURIComponent(
        JSON.stringify({ payUdata: getPayUOrderData(paymentData.transactionId) })
      )}`,
      furl: 'https://unmejewels.com/api/payu/failed',
      udf1: 'details1',
      udf2: 'details2',
      udf3: 'details3',
      udf4: 'details4',
      udf5: 'details5',
      hash: paymentData.hash
    };

    // Create input fields for each parameter
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Add form to body and submit
    document.body.appendChild(form);
    form.submit();
    setPaySpin(false);
  };

  // Helper function to prepare PayU order data
  const getPayUOrderData = (transactionId) => {
    return {
      totalPrice: totalAmount,
      finalAmount: finalAmount,
      shippingCost: shippingCost,
      orderType: "Prepaid",
      discount: (effectiveCouponDiscount + prepaidDiscount) || 0,
      orderItems: orderItems,
      paymentInfo: {
        orderCreationId: "Prepaid",
        razorpayPaymentId: transactionId,
        razorpayOrderId: "PayU",
      },
      shippingInfo: {
        firstname,
        lastname,
        email,
        phone,
        address,
        city,
        state,
        pincode
      }
    };
  };

  // Create order
  const createOrder = async (orderData) => {
    try {
      const response = await fetch("/api/order/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Clear cart
        cartItems.forEach(item => {
          dispatch(removeFromCart(item.product._id));
        });

        // Redirect to thank you page
        window.location.href = `/thankyou?orderNumber=${data.orderNumber}&firstname=${data.firstname}&amount=${data.amount}&email=${data.email}&phone=${data.phone}&city=${data.city}&state=${data.state}`;
      } else {
        toast.error(data.error || "Order creation failed");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPaySpin(false);
    }
  };

  const abandoneddata = {
    totalPrice: totalAmount,
    finalAmount: finalAmount,
    shippingCost: shippingCost,
    orderType: orderType,
    discount: effectiveCouponDiscount + prepaidDiscount || 0,
    orderItems: orderItems,
    paymentInfo: {
      orderCreationId: "COD",
      razorpayPaymentId: `COD`,
      razorpayOrderId: "COD",
    },
    shippingInfo: { firstname, lastname, email, phone, address, city, state, pincode }
  }

  const [hasAbandonedBeenCreated, setHasAbandonedBeenCreated] = useState(false);

  const createAbandonedCart = async () => {
    try {
      const response = await fetch("/api/abandoned/create-abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(abandoneddata),
      });
    } catch (error) {
      console.log("Error creating abandoned cart:", error);
    }
  };

  useDebounce(() => {
    if (
      firstname !== "" &&
      phone?.length === 10 &&
      !hasAbandonedBeenCreated
    ) {
      if (cartItems?.length > 0) {
        createAbandonedCart();
        setHasAbandonedBeenCreated(true);
      }
    }
  }, 2000, [firstname, phone, cartItems]);

  // Cloudinary image optimization
  const modifyCloudinaryUrl = (url) => {
    if (!url) return '/placeholder-image.jpg';
    const urlParts = url?.split('/upload/');
    return urlParts && `${urlParts[0]}/upload/c_limit,h_1000,f_auto,q_50/${urlParts[1]}`;
  };

  const saleBundleInfo = calculateSaleBundle(cartItems);

  if (cartItems?.length === 0 && !cartLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <ShoppingCart className={styles.emptyIcon} />
          <h2>Your cart is empty</h2>
          <p>Add some amazing products to proceed with checkout</p>
          <Link href="/" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      {/* Loading Overlay */}
      {paySpin && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Processing your order...</p>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.checkoutGrid}>
            {/* Left Column - Forms */}
            <div className={styles.formSection}>
              {/* Contact Information */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <User className={styles.sectionIcon} />
                  Contact Information
                </h2>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>First Name *</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.firstname ? styles.error : ''}`}
                      placeholder="Enter first name"
                      value={firstname}
                      onChange={(e) => { setFirstname(e.target.value); setErrors({ ...errors, firstname: false }); }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Last Name *</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.lastname ? styles.error : ''}`}
                      placeholder="Enter last name"
                      value={lastname}
                      onChange={(e) => { setLastname(e.target.value); setErrors({ ...errors, lastname: false }); }}
                    />
                  </div>

                  {/* Email with OTP */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="email"
                        className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                        placeholder="your@email.com"
                        value={email}
                        onChange={handleEmailChange}
                      />

                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number *</label>
                    <div className={styles.inputWithIcon}>
                      <Phone className={styles.inputIcon} />
                      <input
                        type="tel"
                        className={`${styles.formInput} ${styles.withIcon} ${errors.phone ? styles.error : ''}`}
                        placeholder="10-digit number"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: false }); }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <MapPin className={styles.sectionIcon} />
                  Shipping Address
                </h2>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Complete Address *</label>
                    <textarea
                      rows={3}
                      className={`${styles.formTextarea} ${errors.address ? styles.error : ''}`}
                      placeholder="House/Flat No., Street, Landmark..."
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setErrors({ ...errors, address: false }); }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City *</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.city ? styles.error : ''}`}
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setErrors({ ...errors, city: false }); }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>State *</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.state ? styles.error : ''}`}
                      placeholder="Enter State"
                      value={state}
                      onChange={(e) => { setState(e.target.value); setErrors({ ...errors, state: false }); }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Pincode *</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${errors.pincode ? styles.error : ''}`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value); setErrors({ ...errors, pincode: false }); }}
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <CreditCard className={styles.sectionIcon} />
                  Payment Method
                </h2>
                <div className={styles.paymentMethods}>
                  <div
                    className={`${styles.paymentMethod} ${payMethod === 'payu' ? styles.active : ''}`}
                    onClick={payuClick}
                  >
                    <div className={styles.paymentRadio}>
                      <div className={styles.radioIndicator}></div>
                    </div>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentHeader}>
                        <span className={styles.paymentName}>PayU Payment</span>
                        <span className={styles.recommended}>Recommended</span>
                      </div>
                      <p className={styles.paymentDescription}>Pay securely with UPI, cards, net banking</p>
                      <p className={styles.paymentOff}>Extra 5% Off for Prepaid Orders Only</p>
                    </div>
                    <div className={styles.paymentAmount}>
                      <span className={styles.amount}>₹{(totalAmount - prepaidDiscount - effectiveCouponDiscount).toLocaleString()}</span>
                      <span className={styles.shipping}>Free Shipping</span>
                    </div>
                  </div>

                  <div
                    className={`${styles.paymentMethod} ${payMethod === 'cod' ? styles.active : ''}`}
                    onClick={codClick}
                  >
                    <div className={styles.paymentRadio}>
                      <div className={styles.radioIndicator}></div>
                    </div>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentHeader}>
                        <span className={styles.paymentName}>Cash on Delivery</span>
                      </div>
                      <p className={styles.paymentDescription}>Pay when you receive your order</p>
                    </div>
                    <div className={styles.paymentAmount}>
                      <span className={styles.amount}>₹{(totalAmount - effectiveCouponDiscount).toLocaleString()}</span>
                      <span className={styles.shippingCharge}>+ 99 Shipping</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Order Summary */}
            <div className={styles.summarySection}>
              <div className={styles.orderSummary}>
                <h3 className={styles.summaryTitle}>
                  <Package className={styles.summaryIcon} />
                  Order Summary
                </h3>

                {/* Sale Bundle Indicators */}
                <div className={styles.saleProgress}>
                  {saleBundleInfo.bundle999 && (
                    <div className={styles.saleProgressItemSuccess}>
                      <span>🎉 3 Items @ ₹999 Applied!</span>
                    </div>
                  )}
                  {saleBundleInfo.bundle1499 && (
                    <div className={styles.saleProgressItemSuccess}>
                      <span>🎉 3 Items @ ₹1499 Applied!</span>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className={styles.cartItems}>
                  {cartItems?.map((item, index) => {
                    const bundleType = isItemInBundle(item);
                    const is999Sale = item.product.is999Sale;
                    const is1499Sale = item.product.is1499Sale;

                    return (
                      <div className={styles.cartItem} key={index}>
                        <div className={styles.itemImage}>
                          <Image
                            src={modifyCloudinaryUrl(item?.product?.images[0]?.url)}
                            alt={item?.product?.title}
                            title={item?.product?.title}
                            width={80}
                            height={80}
                            className={styles.image}
                          />
                        </div>
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemName}>{item?.product?.title}</h4>
                          <div className={styles.itemVariantContainer}>
                            <p className={styles.itemVariant}>{item?.color}</p>
                            {/* Sale Badges */}
                            <div className={styles.saleBadges}>
                              {is999Sale && !bundleType && (
                                <span className={`${styles.saleBadge} ${styles.sale999}`}>
                                  @₹999
                                </span>
                              )}
                              {is1499Sale && !bundleType && (
                                <span className={`${styles.saleBadge} ${styles.sale1499}`}>
                                  @₹1499
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={styles.itemControls}>
                            <div className={styles.quantityControls}>
                              <button
                                className={styles.quantityBtn}
                                onClick={() => decreaseQty(item)}
                                disabled={cartLoading}
                              >
                                <Minus size={14} />
                              </button>
                              <span className={styles.quantity}>{item.quantity}</span>
                              <button
                                className={styles.quantityBtn}
                                onClick={() => increaseQty(item)}
                                disabled={cartLoading}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            {bundleType === '999' ? (
                              <span className={styles.bundleItemText}>
                                3 for ₹999
                              </span>
                            ) : bundleType === '1499' ? (
                              <span className={styles.bundleItemText}>
                                3 for ₹1499
                              </span>
                            ) : (
                              <span className={styles.itemPrice}>
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Section */}
                <div className={styles.couponSection}>
                  <p className={styles.couponNote} style={{ fontSize: '13px' }}>
                    ⚠️ Coupon discount applies only to non-sale items
                  </p>
                  {!couponAmount ? (
                    !showCouponInput ? (
                      <button
                        className={styles.couponToggle}
                        onClick={() => setShowCouponInput(true)}
                      >
                        + Add coupon code
                      </button>
                    ) : (
                      <div className={styles.couponInput}>
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          className={styles.couponField}
                        />
                        <button onClick={applyCoupon} className={styles.applyBtn}>
                          Apply
                        </button>
                        <button
                          onClick={() => setShowCouponInput(false)}
                          className={styles.cancelBtn}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className={styles.appliedCoupon}>
                      <div className={styles.couponInfo}>
                        <CheckCircle className={styles.checkIcon} />
                        <span>Coupon applied</span>
                        <span className={styles.couponCode}>{coupon}</span>
                      </div>
                      <div className={styles.couponActions}>
                        <span className={styles.discount}>-₹{effectiveCouponDiscount}</span>
                        <button
                          onClick={() => setCouponAmount(null)}
                          className={styles.removeCoupon}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bundle Summary */}
                {(saleBundleInfo.bundle999 || saleBundleInfo.bundle1499) && (
                  <div className={styles.bundleSummary}>
                    {saleBundleInfo.bundle999 && (
                      <div className={styles.bundleSummaryItem}>
                        <span>3 Items @ ₹999</span>
                        <span>₹999</span>
                      </div>
                    )}
                    {saleBundleInfo.bundle1499 && (
                      <div className={styles.bundleSummaryItem}>
                        <span>3 Items @ ₹1499</span>
                        <span>₹1499</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>
                  {prepaidDiscount > 0 && (
                    <div className={styles.priceRow}>
                      <span className={styles.discountLabel}>
                        Prepaid Discount (5%)
                      </span>
                      <span className={styles.discount}>-₹{prepaidDiscount}</span>
                    </div>
                  )}
                  {effectiveCouponDiscount > 0 && (
                    <div className={styles.priceRow}>
                      <span>Coupon Discount</span>
                      <span className={styles.discount}>-₹{effectiveCouponDiscount}</span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalAmount}>₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <div className={styles.checkoutPayDiv}>
                  <button
                    className={styles.completeOrderBtn}
                    onClick={completeOrder}
                    disabled={paySpin || cartLoading || !otpVerified}
                  >
                    {paySpin ? 'Processing...' : orderType === 'COD' ? 'Place Order' : `Pay ₹${finalAmount.toLocaleString()}`}
                  </button>
                </div>

                {/* Email Verification Warning */}
                {!otpVerified && (
                  <p className={styles.verificationWarning}>
                    ⚠️ Please verify your email to proceed
                  </p>
                )}

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <div className={styles.trustItem}>
                    <Truck size={16} />
                    <span>Free shipping over ₹1499</span>
                  </div>
                  <div className={styles.trustItem}>
                    <Shield size={16} />
                    <span>Secure payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;