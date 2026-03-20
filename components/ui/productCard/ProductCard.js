"use client";
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingCart, Heart, X, Plus, Minus, ShoppingBag } from 'lucide-react';

import {
  addToCart,
  openCart,
  removeFromCart,
  updateCartItem
} from '../../../src/lib/slices/cartSlice';

import {
  addToWishlist,
  removeFromWishlist
} from '../../../src/lib/slices/wishlistSlice';

import styles from './ProductCard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { GTM } from '@/lib/gtm';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // CHECK EXISTING
  const isInWishlist = wishlistItems.some(
    (item) => item.product._id === product._id
  );

  const cartItem = cartItems.find(
    (item) => item.product._id === product._id
  );

  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // WISHLIST HANDLER
  const toggleWishlist = useCallback(async (e) => {
    e.stopPropagation();
    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist!");
      } else {
        await dispatch(addToWishlist({ product })).unwrap();
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Wishlist update failed");
    }

    setWishlistLoading(false);
  }, [dispatch, product, isInWishlist]);

  // ADD TO CART
  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    setCartLoading(true);

    try {
      await dispatch(
        addToCart({
          product, productId: product._id, quantity: 1
        })
      ).unwrap();
      toast.success("Added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }

    setCartLoading(false);
    GTM.addToCart({
      item_id: product._id,
      item_name: product.title,
      item_category: product.collectionName?.title,
      price: product.price,
      quantity: quantity
    });
  }, [dispatch, product]);

  // VIEW CART
  const handleViewCart = useCallback(async (e) => {
    e.stopPropagation();
    dispatch(openCart());
  }, [dispatch]);

  // QUICK VIEW
  const openQuickView = (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setQuantity(cartQuantity || 1);
    GTM.viewItem({
      item_id: product._id,
      item_name: product.title,
      item_category: product.collectionName?.title,
      price: product.price
    });
  };

  const closeQuickView = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleQuickViewAddToCart = async () => {
    setCartLoading(true);
    GTM.addToCart({
      item_id: selectedProduct._id,
      item_name: selectedProduct.title,
      item_category: selectedProduct.collectionName?.title,
      price: selectedProduct.price,
      quantity: quantity
    });

    try {
      if (isInCart) {
        await dispatch(
          updateCartItem({
            productId: selectedProduct._id,
            quantity: cartQuantity + quantity,
          })
        ).unwrap();
      } else {
        await dispatch(
          addToCart({
            product: selectedProduct,
            productId: selectedProduct._id,
            quantity,
          })
        ).unwrap();
      }

      toast.success("Added to cart!");
      closeQuickView();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }

    setCartLoading(false);
  };

  const handleQuickViewBuyNow = async () => {
    setCartLoading(true);

    try {
      if (isInCart) {
        await dispatch(
          updateCartItem({
            productId: selectedProduct._id,
            quantity,
          })
        ).unwrap();
      } else {
        await dispatch(
          addToCart({
            product: selectedProduct,
            productId: selectedProduct._id,
            quantity,
          })
        ).unwrap();
      }

      router.push("/checkout");
    } catch (err) {
      console.error(err);
      toast.error("Failed to proceed!");
    }

    setCartLoading(false);
  };

  // NAVIGATE TO PRODUCT
  const handleNavigateToProduct = () => {
    GTM.selectItem(product.title, {
      item_id: product._id,
      item_name: product.title,
      price: product.price
    });
    router.push(`/products/${product?.handle}`);
  };

  // DISCOUNT CALC
  const discount =
    product.crossPrice > product.price
      ? Math?.round(
        ((product.crossPrice - product.price) / product.crossPrice) * 100
      )
      : 0;

  const modifyCloudinaryUrl = (url) => {
    if (!url) return "";
    const parts = url.split("/upload/");
    return parts.length === 2
      ? `${parts[0]}/upload/c_limit,h_800,f_auto,q_40/${parts[1]}`
      : url;
  };

  // Get the image to display (second image on hover if available)
  const displayImage = isHovered && product?.images[1]?.url
    ? modifyCloudinaryUrl(product.images[1].url)
    : modifyCloudinaryUrl(product?.images[0]?.url);

  //  ya hain ratring calculate
  const avgRating =
    product?.ratings?.length > 0
      ? product.ratings.reduce((sum, r) => sum + r.star, 0) / product.ratings.length
      : 0;

  // QUICK VIEW PORTAL
  const renderQuickView = () => {
    if (!selectedProduct || typeof window === 'undefined') return null;

    return createPortal(
      <div className={styles.popupOverlay} onClick={closeQuickView}>
        <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={closeQuickView}>
            <X size={20} />
          </button>

          <div className={styles.popupGrid}>
            {/* Product Image */}
            <div className={styles.popupImageWrapper}>
              <Image
                src={modifyCloudinaryUrl(selectedProduct?.images[0]?.url)}
                alt={selectedProduct?.title}
                title={selectedProduct?.title}
                fill
                className={styles.popupImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className={styles.popupDetails}>
              <h2 className={styles.popupTitle}>{selectedProduct?.title}</h2>

              <div className={styles.popupPriceSection}>
                <div className={styles.popupPrice}>
                  <span className={styles.popupCurrentPrice}>₹{selectedProduct?.price?.toLocaleString()}</span>
                  {selectedProduct?.crossPrice && selectedProduct.crossPrice > selectedProduct.price && (
                    <span className={styles.popupOldPrice}>₹{selectedProduct?.crossPrice?.toLocaleString()}</span>
                  )}
                </div>
                {discount > 0 && (
                  <span className={styles.popupDiscountBadge}>{discount}% OFF</span>
                )}
              </div>

              {/* Product Description */}
              {selectedProduct?.description && (
                <div className={styles.descriptionSection}>
                  <p
                    className={styles.description}
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.description.length > 200
                        ? selectedProduct?.description?.substring(0, 200) + '...'
                        : selectedProduct?.description
                    }}
                  />
                </div>
              )}

              {/* Product Specifications */}
              <div className={styles.specifications}>
                <h4 className={styles.specsTitle}>Specifications</h4>
                <div className={styles.specsGrid}>
                  {selectedProduct?.sku && (
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>SKU</span>
                      <span className={styles.specValue}>{selectedProduct.sku}</span>
                    </div>
                  )}
                  {selectedProduct?.material && selectedProduct.material.length > 0 && (
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Material</span>
                      <span className={styles.specValue}>{selectedProduct.material.join(', ')}</span>
                    </div>
                  )}
                  {selectedProduct?.weight && (
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Weight</span>
                      <span className={styles.specValue}>{selectedProduct.weight}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity and Wishlist Row */}
              <div className={styles.quantityWishlistRow}>
                <div className={styles.quantitySection}>
                  <span className={styles.quantityLabel}>Qty</span>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={cartLoading}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => {
                        if (quantity < selectedProduct?.quantity) {
                          setQuantity(quantity + 1);
                        }
                      }}
                      disabled={cartLoading || quantity >= selectedProduct?.quantity}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <button
                  className={`${styles.wishlistBtnPopup} ${isInWishlist ? styles.inWishlist : ''}`}
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    size={18}
                    fill={isInWishlist ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Cart Status */}
              {isInCart && (
                <div className={styles.cartStatusBanner}>
                  <ShoppingCart size={14} />
                  <span>{cartQuantity} item(s) in cart</span>
                </div>
              )}

              {/* Action Buttons */}
              {product?.quantity === 0 && (
                <p style={{ color: 'var(--primary-color)', margin: 0 }}>Out of Stock</p>
              )}

              <div className={styles.popupActions}>
                <button
                  className={styles.popupAddToCartBtn}
                  onClick={handleQuickViewAddToCart}
                  disabled={cartLoading || product?.quantity === 0}
                >
                  <ShoppingCart size={16} />
                  <span>{cartLoading ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  className={styles.popupBuyNowBtn}
                  onClick={handleQuickViewBuyNow}
                  disabled={cartLoading || product?.quantity === 0}
                >
                  <ShoppingBag size={16} />
                  <span>{cartLoading ? 'Processing...' : 'Buy Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div
        className="group bg-white rounded-md overflow-hidden border border-gray-200 
        hover:shadow-md transition duration-200 w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* IMAGE AREA */}
        <div className="relative bg-gray-100 aspect-square overflow-hidden">

          {/* SALE BADGE */}
          {product?.is999Sale && (
            <span className="absolute top-2 left-2 z-10 bg-red-700 text-white text-xs font-semibold px-2 py-[2px]">
              BUY 3 @999
            </span>
          )}

          {/* RIGHT ICONS */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">

            <button
              onClick={toggleWishlist}
              className="bg-white border rounded p-1 shadow-sm hover:bg-gray-50"
            >
              <Heart
                size={16}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={openQuickView}
              className="bg-white border rounded p-1 shadow-sm hover:bg-gray-50"
            >
              <Eye size={16} />
            </button>

          </div>

          {/* PRODUCT IMAGE */}
          <div
            className="relative w-full h-full cursor-pointer"
            onClick={handleNavigateToProduct}
          >

            <Image
              src={displayImage}
              alt={product?.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />

          </div>

        </div>


        {/* PRODUCT INFO */}
        <div className="p-3 space-y-2">

          {/* TITLE */}
          <h3
            onClick={handleNavigateToProduct}
            className="text-[14px] leading-snug h-9 text-gray-800 line-clamp-2 cursor-pointer"
          >
            {product?.title}
          </h3>


          {/* PRICE */}
          <div className="flex items-center gap-2 text-sm">

            <span className="font-semibold text-black">
              ₹{product?.price?.toLocaleString()}
            </span>

            {product?.crossPrice > product.price && (
              <span className="line-through text-gray-400">
                ₹{product?.crossPrice?.toLocaleString()}
              </span>
            )}

            {discount > 0 && (
              <span className="text-green-600 text-sm font-semibold">
                {discount}% OFF
              </span>
            )}

          </div>


          {/* RATING */}
          <div className="flex items-center gap-1 text-yellow-500 text-[13px] min-h-[18px]">

            {product?.totalRating > 0 ? (
              <>
                {"★★★★★".slice(0, Math.round(avgRating))}
                <span className="text-gray-500 text-xs ml-1">
                  {avgRating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-yellow-500 text-xs">
                No rating
              </span>
            )}

          </div>

          {/* ADD TO CART */}
          {isInCart ? (

            <button
              onClick={handleViewCart}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-md text-sm hover:bg-black"
            >

              <Eye size={16} />
              View Cart

            </button>

          ) : (

            <button
              onClick={handleAddToCart}
              disabled={product?.quantity === 0}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--primary-color)] text-white py-2 rounded-md text-sm hover:bg-black disabled:opacity-50"
            >

              <ShoppingCart size={16} />
              {product?.quantity === 0 ? "Out of Stock" : "ADD TO CART"}

            </button>

          )}

        </div>
      </div>

      {renderQuickView()}
    </>
  )
};

export default React.memo(ProductCard);