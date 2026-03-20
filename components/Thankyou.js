"use client"
import React, { useEffect, useRef } from 'react'
import styles from '../src/app/thankyou/thank.module.css'
import Link from 'next/link'
import { useSearchParams } from "next/navigation";
import { useDispatch } from 'react-redux';
import { clearCart } from '../src/lib/slices/cartSlice';
import { CheckCircle, Package, Mail, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { GTM } from '@/lib/gtm';

const ThankYouPage = () => {
    const searchParams = useSearchParams();
    const orderNumber = searchParams?.get("orderNumber") || ""
    const firstname = searchParams?.get("firstname") || "";
    const amount = searchParams?.get("amount") || 0;
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear cart from Redux store
        dispatch(clearCart());

        // Also clear from localStorage if you're persisting there
        if (typeof window !== 'undefined') {
            localStorage.removeItem("cartState");
            localStorage.removeItem("cart");
        }
    }, [dispatch, orderNumber])

    const viewContentFired = useRef(false);

    useEffect(() => {
        if (orderNumber && !viewContentFired.current) {
            if (orderNumber !== "" && firstname !== "" && amount !== 0) {
                const fbclid = localStorage.getItem("fbclid");

                if (typeof window !== "undefined" && window.fbq) {
                    window.fbq("track", "Purchase", {
                        content_name: "Checkout",
                        content_category: "Page",
                        content_ids: ["purchase"],
                        content_type: "page",
                        value: amount,
                        currency: "INR",
                        ...(fbclid && { fbclid })
                    });
                }

                const addToCartEvent = async () => {
                    try {
                        await fetch(`/api/chart/post-event?event=Purchase`, {
                            method: "POST",
                            headers: {
                                "Content-type": "application/json"
                            }
                        })
                    } catch (err) {
                        console.log(err)
                    }
                }
                addToCartEvent()
            }
            viewContentFired.current = true;
        }
        GTM.purchase(orderNumber, amount);
    }, [orderNumber, firstname, amount]);

    return (
        <div className={styles.thankYouPage}>
            {/* Background Elements */}
            <div className={styles.backgroundElements}>
                <div className={styles.floatingCircle1}></div>
                <div className={styles.floatingCircle2}></div>
                <div className={styles.floatingCircle3}></div>
            </div>

            <div className={styles.container}>
                {/* Success Icon */}
                <div className={styles.iconWrapper}>
                    <div className={styles.successIcon}>
                        <CheckCircle />
                        <div className={styles.sparkle}>
                            <Sparkles size={20} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Thank You, <span className={styles.highlight}>{firstname}</span>
                    </h1>

                    <p className={styles.subtitle}>
                        Your order has been confirmed and is being prepared
                    </p>

                    {/* Order Details Card */}
                    <div className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <Package className={styles.orderIcon} />
                            <h3>Order Summary</h3>
                        </div>

                        <div className={styles.orderDetails}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Order Number</span>
                                <span className={styles.detailValue}>{orderNumber}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Total Amount</span>
                                <span className={styles.detailValue}>
                                    ₹{parseInt(amount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className={styles.nextSteps}>
                        <h3>What's Next?</h3>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <div className={styles.stepIcon}>
                                    <Mail size={18} />
                                </div>
                                <div className={styles.stepContent}>
                                    <h4>Confirmation Email</h4>
                                    <p>You'll receive an order confirmation shortly</p>
                                </div>
                            </div>
                            <div className={styles.step}>
                                <div className={styles.stepIcon}>
                                    <Package size={18} />
                                </div>
                                <div className={styles.stepContent}>
                                    <h4>Order Tracking</h4>
                                    <p>Track your order status in real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Info */}
                    <div className={styles.supportInfo}>
                        <p className={styles.supportText}>
                            Need assistance? Contact our support team at{' '}
                            <a href="mailto:unmejewels@gmail.com" className={styles.supportLink}>
                                unmejewels@gmail.com
                            </a>
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <Link href="/profile" className={styles.primaryButton}>
                            <span>Track Your Order</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/" className={styles.secondaryButton}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ThankYouPage