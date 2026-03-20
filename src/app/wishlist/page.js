// app/wishlist/page.js
"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Eye,
  X
} from 'lucide-react';
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../../lib/slices/wishlistSlice';
import { addToCart } from '../../lib/slices/cartSlice';
import './Wishlist.css';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));

  };

  const handleAddToCart = (product, quantity = 1) => {
    dispatch(addToCart({ product, productId: product._id, quantity,inSale: product?.isInSale || false }));
  };

  const handleMoveAllToCart = () => {
    const moveAllAction = () => {
      wishlistItems.forEach(item => {
          dispatch(addToCart({ product,productId: item.product._id, quantity: 1,inSale: product?.isInSale || false }));
      });
      // Clear wishlist after moving all to cart
        dispatch(clearWishlist());
    };
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
        dispatch(clearWishlist());
    }
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
    setSelectedProduct(null);
  };

  const calculateDiscount = (product) => {
    if (!product?.crossPrice || product.crossPrice <= product.price) return 0;
    return Math.round(((product.crossPrice - product.price) / product.crossPrice) * 100);
  };

  const modifyCloudinaryUrl = (url) => {
    const urlParts = url?.split('/upload/');
    return urlParts && `${urlParts[0]}/upload/c_limit,h_1000,f_auto,q_50/${urlParts[1]}`;
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* Header */}
        <div className="wishlist-header">
          <div className="wishlist-title-section">
            <h1 className="wishlist-title">
              <Heart className="wishlist-icon" />
              My Wishlist
            </h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="wishlist-actions">
              <button
                className="btn-secondary"
                onClick={handleMoveAllToCart}
              >
                <ShoppingCart size={16} />
                Move All to Cart
              </button>
              <button
                className="btn-danger"
                onClick={handleClearWishlist}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-state">
              <Heart className="empty-icon" />
              <h2>Your wishlist is empty</h2>
              <p>Save your favorite items here for easy access later</p>
              <Link href="/collections/all" className="btn-primary">
                <ShoppingBag size={16} />
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const product = item.product;
              const discount = calculateDiscount(product);

              return (
                <div key={product._id} className="wishlist-card">
                  {/* Product Image */}
                  <div className="wishlist-image">
                    <Link href={`/products/${product.handle}`}>
                      <Image
                        src={modifyCloudinaryUrl(product.images[0]?.url)}
                        alt={product.title}
                        title={product.title}
                        fill
                        className="product-image"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </Link>

                    {/* Actions */}
                    <div className="wishlist-card-actions">
                      <button
                        className="action-btn quick-view-btn"
                        onClick={() => openQuickView(product)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn remove-btn"
                        onClick={() => handleRemoveFromWishlist(product._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="discount-badge">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="wishlist-card-info">
                    <Link href={`/products/${product.handle}`} className="product-link">
                      <h3 className="product-title">{product.title}</h3>
                    </Link>

                    <div className="product-price">
                      <span className="current-price">₹{product.price?.toLocaleString()}</span>
                      {product.crossPrice && product.crossPrice > product.price && (
                        <span className="original-price">
                          ₹{product.crossPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product, 1)}
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="wishlist-footer">
            <Link href="/" className="continue-shopping">
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="quick-view-overlay" onClick={closeQuickView}>
          <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeQuickView}>
              <X size={24} />
            </button>

            <div className="quick-view-grid">
              <div className="quick-view-image">
                <Image
                  src={modifyCloudinaryUrl(selectedProduct.images[0]?.url)}
                  alt={selectedProduct.title}
                  title={selectedProduct.title}
                  fill
                  className="product-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="quick-view-details">
                <h2>{selectedProduct.title}</h2>

                <div className="quick-view-price">
                  <span className="current-price">₹{selectedProduct.price?.toLocaleString()}</span>
                  {selectedProduct.crossPrice && selectedProduct.crossPrice > selectedProduct.price && (
                    <span className="original-price">
                      ₹{selectedProduct.crossPrice?.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="quick-view-actions">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      handleAddToCart(selectedProduct, 1);
                      closeQuickView();
                    }}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${selectedProduct.handle}`}
                    className="btn-secondary"
                    onClick={closeQuickView}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;