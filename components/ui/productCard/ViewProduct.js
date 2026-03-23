"use client";
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Eye, ShoppingCart, Heart, X, Plus, Minus, ShoppingBag } from 'lucide-react';

import {
  addToCart,
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

const ViewProduct = ({ selectedProduct, setSelectedProduct, handleQuickViewAddToCart, handleQuickViewBuyNow }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // -----------------------------------------------------
  // CHECK EXISTING
  // -----------------------------------------------------
  const isInWishlist = wishlistItems.some(
    (item) => item.product._id === product._id
  );

  const cartItem = cartItems.find(
    (item) => item.product._id === product._id
  );

  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // -----------------------------------------------------
  // WISHLIST HANDLER
  // -----------------------------------------------------
  const toggleWishlist = useCallback(async (e) => {
    e.stopPropagation(); // Prevent navigation
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

  const closeQuickView = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };


  // -----------------------------------------------------
  // NAVIGATE TO PRODUCT
  // -----------------------------------------------------
  const handleNavigateToProduct = () => {
    router.push(`/products/${product?.handle}`);
  };

  // -----------------------------------------------------
  // DISCOUNT CALC
  // -----------------------------------------------------
  const discount =
    product.crossPrice > product.price
      ? Math.round(
        ((product.crossPrice - product.price) / product.crossPrice) * 100
      )
      : 0;

  const modifyCloudinaryUrl = (url) => {
  if (!url) return '';
  const cloudfront = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || 'https://d2gtpgxs0y565n.cloudfront.net';
  
  // Check if it's an S3 URL - convert to CloudFront
  if (url.includes('s3.') || url.includes('amazonaws.com')) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return `${cloudfront}${pathname}`;
    } catch (e) {
      return url;
    }
  }
  
  // Apply Cloudinary transformations for Cloudinary URLs
  if (!url.includes('/upload/')) return url;
  const urlParts = url.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/c_limit,h_1000,f_auto,q_50/${urlParts[1]}`;
  }
  return url;
};

  return (
    <>
      <div className={styles.productCard} data-aos="fade-up">
        {/* Discount Badge */}
        {/* {discount > 0 && (
          <div className={styles.discountBadge}>
            {discount}% OFF
          </div>
        )} */}

        {/* Wishlist Button */}
        <button
          className={`${styles.wishlistBtn} ${isInWishlist ? styles.inWishlist : ''}`}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
          className={styles.actionIcons}
            fill={isInWishlist ? 'currentColor' : 'none'}
          />
          {wishlistLoading && <div className={styles.loadingSpinner}></div>}
        </button>
        <button
          className={styles.quickViewIcon}
          onClick={openQuickView}
        >
          <Eye className={styles.actionIcons} />
        </button>

        {/* Product Image - Clickable to navigate */}
        <div className={styles.imageWrapper} onClick={handleNavigateToProduct}>
          <div className={styles.imageLink}>
            <Image
              src={modifyCloudinaryUrl(product?.images[0]?.url)}
              alt={product?.title}
              title={product?.title}
              fill
              className={styles.productImage}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {/* Hover Actions */}
          <div className={styles.hoverActions}>
            {isInCart ? (
              <button
                className={`${styles.actionBtn} ${styles.inCartBtn}`}
                onClick={handleRemoveFromCart}
                disabled={cartLoading}
              >
                <Eye size={18} />
                <span>View Cart</span>
                {cartLoading && <div className={styles.loadingSpinner}></div>}
              </button>
            ) : (
              <button
                className={styles.actionBtn}
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                <ShoppingCart size={18} />
                <span>Add to cart</span>
                {cartLoading && <div className={styles.loadingSpinner}></div>}
              </button>
            )}
          </div>
        </div>

        {/* Product Info - Also clickable to navigate */}
        <div className={styles.productInfo} onClick={handleNavigateToProduct}>
          <div className={styles.productNameContainer}>
            <h3 className={styles.productName}>{product?.title}</h3>
          </div>
          <div className={styles.priceContainer}>
            <span className={styles.price}>₹{product?.price?.toLocaleString()}</span>
            {product?.crossPrice && product.crossPrice > product.price && (
              <>
                <span className={styles.originalPrice}>₹{product?.crossPrice?.toLocaleString()}</span>
                {discount > 0 && (
                  <span className={styles.discount}>{discount}% OFF</span>
                )}
              </>
            )}
          </div>

          {/* Cart Quantity Indicator */}
          {isInCart && (
            <div className={styles.cartIndicator}>
              In cart: {cartQuantity}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Popup */}
      {selectedProduct && (
        <div className={styles.popupOverlay} onClick={closeQuickView}>
          <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeQuickView}>
              <X size={24} />
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
                <h3 className={styles.popupTitle}>{selectedProduct?.title}</h3>

                <div className={styles.popupPrice}>
                  <span className={styles.currentPrice}>₹{selectedProduct?.price?.toLocaleString()}</span>
                  {selectedProduct?.crossPrice && selectedProduct.crossPrice > selectedProduct.price && (
                    <>
                      <span className={styles.oldPrice}>₹{selectedProduct?.crossPrice?.toLocaleString()}</span>
                      {discount > 0 && (
                        <span className={styles.popupDiscount}>{discount}% OFF</span>
                      )}
                    </>
                  )}
                </div>

                {/* Product Details */}
                {selectedProduct?.color && selectedProduct.color.length > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Color:</span>
                    <span className={styles.detailValue}>{selectedProduct.color.join(', ')}</span>
                  </div>
                )}

                {(Array.isArray(selectedProduct?.sizes) && selectedProduct.sizes.length > 0) ||
                (Array.isArray(selectedProduct?.ringSize) && selectedProduct.ringSize.length > 0) ? (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Sizes:</span>
                    <span className={styles.detailValue}>
                      {(selectedProduct?.sizes?.length
                        ? selectedProduct.sizes
                        : selectedProduct?.ringSize || []
                      ).join(', ')}
                    </span>
                  </div>
                ) : null}

                {selectedProduct?.material && selectedProduct.material.length > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Material:</span>
                    <span className={styles.detailValue}>{selectedProduct.material.join(', ')}</span>
                  </div>
                )}

                {selectedProduct?.type && selectedProduct.type.length > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Type:</span>
                    <span className={styles.detailValue}>{selectedProduct.type.join(', ')}</span>
                  </div>
                )}

                {selectedProduct?.gender && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Gender:</span>
                    <span className={styles.detailValue}>{selectedProduct.gender}</span>
                  </div>
                )}

                {/* Quantity */}
                <div className={styles.quantityContainer}>
                  <span className={styles.quantityLabel}>Quantity:</span>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={cartLoading}
                    >
                      <Minus size={16} />
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
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    className={`${styles.wishlistBtnPopup} ${isInWishlist ? styles.inWishlist : ''}`}
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                  >
                    <Heart
                      size={20}
                      fill={isInWishlist ? 'currentColor' : 'none'}
                    />
                    {wishlistLoading && <div className={styles.loadingSpinner}></div>}
                  </button>

                  {/* Cart Status */}
                  {isInCart && (
                    <div className={styles.cartStatus}>
                      Already in cart: {cartQuantity}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={styles.popupActions}>
                  <button
                    className={styles.buyNowBtn}
                    onClick={handleQuickViewBuyNow}
                    disabled={cartLoading}
                  >
                    <ShoppingBag size={18} />
                    {cartLoading ? 'Processing...' : 'Buy Now'}
                    {cartLoading && <div className={styles.loadingSpinner}></div>}
                  </button>

                  {isInCart ? (
                    <button
                      className={styles.removeFromCartBtn}
                      onClick={handleRemoveFromCart}
                      disabled={cartLoading}
                    >
                      <ShoppingCart size={18} />
                      {cartLoading ? 'Removing...' : 'Remove from Cart'}
                      {cartLoading && <div className={styles.loadingSpinner}></div>}
                    </button>
                  ) : (
                    <button
                      className={styles.addToCartBtn}
                      onClick={handleQuickViewAddToCart}
                      disabled={cartLoading}
                    >
                      <ShoppingCart size={18} />
                      {cartLoading ? 'Adding...' : 'Add to Cart'}
                      {cartLoading && <div className={styles.loadingSpinner}></div>}
                    </button>
                  )}
                </div>

                {/* Other Details */}
                <div className={styles.otherDetails}>
                  <h4 className={styles.detailsTitle}>Product Details</h4>
                  {selectedProduct?.sku && (
                    <p className={styles.detailText}>SKU: {selectedProduct.sku}</p>
                  )}
                  {selectedProduct?.description && (
                    <p
                      className={styles.detailText}
                      dangerouslySetInnerHTML={{
                        __html: selectedProduct.description.length > 150
                          ? selectedProduct?.description?.substring(0, 150) + '...'
                          : selectedProduct?.description
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ViewProduct);
