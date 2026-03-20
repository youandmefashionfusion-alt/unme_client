"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    X,
    Loader2,
    Tag,
} from "lucide-react";
import {
    fetchCart,
    removeFromCart,
    updateCartItem,
    closeCart
} from "@/lib/slices/cartSlice";
import styles from "./CartDrawer.module.css";
import Router from "next/router";
import { useRouter } from "next/navigation";
import { GTM } from "@/lib/gtm";

const CartDrawer = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { items: cartItems, loading, isOpen } = useSelector((state) => state.cart);
    const [loadingItem, setLoadingItem] = useState(null);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleQuantityChange = async (id, newQty) => {
        setLoadingItem(id);
        newQty <= 0
            ? await dispatch(removeFromCart(id))
            : await dispatch(updateCartItem({ productId: id, quantity: newQty }));
        setTimeout(() => setLoadingItem(null), 400);
    };

    const handleDelete = async (id) => {
        setLoadingItem(id);
        await dispatch(removeFromCart(id));
        GTM.removeFromCart(id);
        setTimeout(() => setLoadingItem(null), 400);
    };

    // Helper function to calculate sale bundle
    const calculateSaleBundle = (cartItems) => {
        // Separate 999 and 1499 sale items
        const sale999Items = cartItems.filter(item => item.product.is999Sale);
        const sale1499Items = cartItems.filter(item => item.product.is1499Sale);
        const nonSaleItems = cartItems.filter(item => !item.product.is999Sale && !item.product.is1499Sale && !item.product.is999Sale);

        let bundle999 = null;
        let bundle1499 = null;

        // Calculate 999 bundle
        if (sale999Items.length >= 3) {
            // Sort 999 items by price ASC
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

        // Calculate 1499 bundle
        if (sale1499Items.length >= 3) {
            // Sort 1499 items by price ASC
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

    // Calculate subtotal based on sale bundles
    const calculateSubtotal = () => {
        const { bundle999, bundle1499, normalItems } = calculateSaleBundle(cartItems);

        let subtotal = 0;

        // Add bundle prices
        if (bundle999?.applied) {
            subtotal += bundle999.price;
        }
        if (bundle1499?.applied) {
            subtotal += bundle1499.price;
        }

        // Add normal items
        normalItems.forEach(item => {
            subtotal += item.product.price * item.quantity;
        });

        return subtotal;
    };

    const subtotal = calculateSubtotal();

    // Check if an item is part of any bundle
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

    const modifyCloudinaryUrl = (url) => {
        if (!url) return "";
        const urlParts = url.split("/upload/");
        return urlParts.length === 2
            ? `${urlParts[0]}/upload/c_limit,f_auto,q_40/${urlParts[1]}`
            : url;
    };

    // Calculate counts for sale items
    const getSaleCounts = () => {
        const sale999Count = cartItems.filter(item => item.product.is999Sale).length;
        const sale1499Count = cartItems.filter(item => item.product.is1499Sale).length;
        return { sale999Count, sale1499Count, sale999Count };
    };

    // *** GUEST CHECKOUT — SAME PALMONAS STYLE ***
    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        dispatch(closeCart())
        const fbclid = localStorage.getItem("fbclid");

        if (typeof window !== "undefined" && window.fbq) {
            window.fbq("track", "InitiateCheckout", {
                content_ids: cartItems?.map((item) => item?.productId),
                content_type: "product",
                value: subtotal,
                currency: "INR",
                ...(fbclid && { fbclid })
            });
        }
        GTM.beginCheckout(cartItems, subtotal);
        router.push("/checkout");
    };

    useEffect(() => {
        if (isOpen) GTM.viewCart(cartItems, subtotal);
    }, [isOpen]);

    const { sale999Count, sale1499Count } = getSaleCounts();

    return (
        <>
            {/* ===== Overlay ===== */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
                onClick={() => dispatch(closeCart())}
            ></div>

            {/* ===== Drawer ===== */}
            <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
                <div className={styles.header}>
                    <h2>
                        <ShoppingCart size={20} /> Your Cart
                    </h2>
                    <button className={styles.closeBtn} onClick={() => dispatch(closeCart())}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className={styles.centered}>
                        <Loader2 className={styles.bigLoader} />
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className={styles.empty}>
                        <ShoppingCart size={50} />
                        <p>Your cart is empty</p>
                        <Link href="/" onClick={() => dispatch(closeCart())} className={styles.shopNow}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Sale Progress Indicators */}
                        {
                            (sale999Count > 0 && sale999Count < 3) || (sale1499Count > 0 && sale1499Count < 3) &&
                            <div className={styles.saleProgress}>
                                {sale999Count > 0 && sale999Count < 3 && (
                                    <div className={styles.saleProgressItem}>
                                        <Tag size={14} />
                                        <span>Add {3 - sale999Count} more @₹999 items to get 3 for ₹999</span>
                                    </div>
                                )}
                                {sale1499Count > 0 && sale1499Count < 3 && (
                                    <div className={styles.saleProgressItem}>
                                        <Tag size={14} />
                                        <span>Add {3 - sale1499Count} more @₹1499 items to get 3 for ₹1499</span>
                                    </div>
                                )}
                                {sale999Count >= 3 && (
                                    <div className={styles.saleProgressItemSuccess}>
                                        <span>🎉 3 Items @ ₹999 Applied!</span>
                                    </div>
                                )}
                                {sale1499Count >= 3 && (
                                    <div className={styles.saleProgressItemSuccess}>
                                        <span>🎉 3 Items @ ₹1499 Applied!</span>
                                    </div>
                                )}
                            </div>
                        }



                        <div className={styles.items}>
                            {cartItems?.map((item) => {
                                const bundleType = isItemInBundle(item);
                                const isIn999Sale = item.product.is999Sale;
                                const isIn1499Sale = item.product.is1499Sale;

                                return (
                                    <div key={item.product._id} className={styles.item}>
                                        <div className={styles.image}>
                                            <Image
                                                src={modifyCloudinaryUrl(item.product.images?.[0]?.url || "/placeholder.png")}
                                                alt={item.product.title}
                                                title={item.product.title}
                                                fill
                                                sizes="70px"
                                            />
                                        </div>

                                        <div className={styles.details}>
                                            <p className={styles.title}>{item.product.title}</p>
                                            <div className={styles.priceInfo}>
                                                {bundleType === '999' ? (
                                                    <p className={styles.bundlePrice}>
                                                        In 3 for ₹999
                                                    </p>
                                                ) :
                                                    bundleType === '1499' ? (
                                                        <p className={styles.bundlePrice}>
                                                            In 3 for ₹1499
                                                        </p>
                                                    ) : (
                                                        <p className={styles.price}>
                                                            ₹{item?.product?.price?.toLocaleString()}
                                                        </p>
                                                    )}

                                                {/* Sale Badges */}
                                                <div className={styles.saleBadges}>
                                                    {isIn999Sale && !bundleType && (
                                                        <span className={`${styles.saleBadge} ${styles.sale999}`}>
                                                            @₹999
                                                        </span>
                                                    )}
                                                    {isIn1499Sale && !bundleType && (
                                                        <span className={`${styles.saleBadge} ${styles.sale1499}`}>
                                                            @₹1499
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.qtyRow}>
                                                <div className={styles.qty}>
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.product._id,
                                                                item.quantity - 1
                                                            )
                                                        }
                                                        disabled={loadingItem === item.product._id}
                                                    >
                                                        <Minus size={14} />
                                                    </button>

                                                    {loadingItem === item.product._id ? (
                                                        <Loader2 className={styles.loader} />
                                                    ) : (
                                                        <span>{item.quantity}</span>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity < item.product.quantity) {
                                                                handleQuantityChange(item.product._id, item.quantity + 1);
                                                            }
                                                        }}
                                                        disabled={
                                                            loadingItem === item.product._id || item.quantity >= item.product.quantity
                                                        }
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>

                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(item.product._id)}
                                                    disabled={loadingItem === item.product._id}
                                                >
                                                    {loadingItem === item.product._id ? (
                                                        <Loader2 className={styles.loader} />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.totalRow}>
                                <span>Subtotal</span>
                                <strong>₹{subtotal.toLocaleString()}</strong>
                            </div>

                            {/* Sale Summary */}
                            {
                                sale999Count >= 3 || sale1499Count >= 3 || sale999Count >= 3 &&
                                <div className={styles.saleSummary}>
                                    {sale999Count >= 3 && (
                                        <div className={styles.saleSummaryItem}>
                                            <span>3 Items @ ₹999</span>
                                            <span>₹999</span>
                                        </div>
                                    )}
                                    {sale1499Count >= 3 && (
                                        <div className={styles.saleSummaryItem}>
                                            <span>3 Items @ ₹1499</span>
                                            <span>₹1499</span>
                                        </div>
                                    )}
                                </div>
                            }


                            {/* === Proceed to Checkout (Always guest-safe) === */}
                            <button onClick={handleCheckout} className={styles.checkoutBtn}>
                                Proceed to Checkout <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CartDrawer;