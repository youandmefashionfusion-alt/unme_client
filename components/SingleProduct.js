"use client"
import React, { useState, useEffect, useRef } from 'react'
import {
  Share2, X, Heart, Facebook, Twitter,
  MessageCircle, Plus, Minus,
  Package, RefreshCw, Shield, Truck, Tag, ChevronDown,
  Star, Upload, CheckCircle
} from 'lucide-react'
import styles from './SingleProduct.module.css'
import ProductCard from './ui/productCard/ProductCard'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateCartItem, removeFromCart } from '../src/lib/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../src/lib/slices/wishlistSlice'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { GTM } from '@/lib/gtm'
import Link from 'next/link'
import Perks from './Home/Perks/Perks'

const SingleProduct = ({ product, products, latestProducts }) => {
  const dispatch = useDispatch()
  const { items: cartItems } = useSelector((state) => state.cart)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const [quantity, setQuantity] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState(null)
  const [openAccordion, setOpenAccordion] = useState('description')
  const [giftWrap, setGiftWrap] = useState(false)

  // Review form state
  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewMsg, setReviewMsg] = useState('')
  const [reviewStar, setReviewStar] = useState(5)
  const [reviewImage, setReviewImage] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bottomBanner, setBottomBanner] = useState(null)
  const fileInputRef = useRef(null)
  const galleryColumnRef = useRef(null)
  const galleryStickyRef = useRef(null)
  const infoSectionRef = useRef(null)

  const mediaList = product?.images || []

  const existingCartItem = cartItems?.find(
    (item) => item?.product?._id === product?._id
  )
  const isInWishlist = wishlistItems?.some(
    (item) => item?.product?._id === product?._id
  )
  const discountPercent = product?.crossPrice
    ? Math.round(((product.crossPrice - product.price) / product.crossPrice) * 100)
    : 0
  const productSizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : Array.isArray(product?.ringSize)
        ? product.ringSize
        : []

  const handleQuantityChange = (type) => {
    if (type === 'increase' && product?.quantity > quantity) setQuantity(q => q + 1)
    else if (type === 'decrease' && quantity > 1) setQuantity(q => q - 1)
  }

  const handleAddToCart = () => {
    if (existingCartItem) {
      dispatch(updateCartItem({ productId: product._id, quantity: existingCartItem.quantity + quantity }))
      toast.success("Cart updated!")
    } else {
      dispatch(addToCart({ product, productId: product._id, quantity }))
      toast.success("Added to cart!")
    }
    GTM.addToCart({
      item_id: product._id, item_name: product.title,
      item_category: product.collectionName?.title,
      price: product.price, quantity,
    })
  }

  const handleRemoveFromCart = () => {
    dispatch(removeFromCart(product._id))
    toast.success("Removed from cart")
  }

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist!");
    } else {
      dispatch(addToWishlist({ product }));  // ✅ correct payload
      toast.success("Saved to wishlist!");
    }
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ product, productId: product._id, quantity }))
      .then(() => { window.location.href = '/checkout' })
  }

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setDeliveryStatus('available')
      toast.success('Delivery available!')
    } else {
      toast.error('Enter a valid 6-digit pincode')
    }
  }

  const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const shareOptions = [
    {
      name: 'Facebook', icon: Facebook, color: '#1877F2',
      share: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400'),
    },
    {
      name: 'Twitter', icon: Twitter, color: '#1DA1F2',
      share: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product?.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400'),
    },
    {
      name: 'WhatsApp', icon: MessageCircle, color: '#25D366',
      share: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${product?.title} ${shareUrl}`)}`, '_blank', 'width=600,height=400'),
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) { }
  }

  // ── Review handlers ──────────────────────────────────────
  const averageRating = product?.totalRating || (product?.ratings?.length
    ? (product.ratings.reduce((s, r) => s + r.star, 0) / product.ratings.length)
    : 5)

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: product?.ratings?.filter(r => r.star === star).length || 0,
    pct: product?.ratings?.length
      ? Math.round((product.ratings.filter(r => r.star === star).length / product.ratings.length) * 100)
      : 0,
  }))

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setReviewImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleReviewSubmit = async () => {
    if (!reviewName.trim() || !reviewMsg.trim()) {
      toast.error('Please fill in your name and review')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/products/rate-product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewName, email: reviewEmail,
          comment: reviewMsg, star: reviewStar,
          image: reviewImage, prodId: product?._id,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setReviewName(''); setReviewEmail(''); setReviewMsg('')
        setReviewImage(''); setReviewStar(5)
        toast.success('Review posted successfully!')
        setTimeout(() => setSubmitted(false), 4000)
      } else {
        toast.error('Failed to post review. Try again.')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const accordions = [
    {
      key: 'description', label: 'Description',
      content: <div className={styles.accordionBody} dangerouslySetInnerHTML={{ __html: product?.description }} />,
    },
    {
      key: 'specifications', label: 'Specification',
      content: (
        <ul className={`${styles.accordionBody} ${styles.specList}`}>
          {product?.material && <li><span>Material</span><span>{product.material.join(', ')}</span></li>}
          {productSizes.length > 0 && <li><span>Sizes</span><span>{productSizes.join(', ')}</span></li>}
          {product?.color && <li><span>Color</span><span>{product.color.join(', ')}</span></li>}
          {product?.gender && <li><span>Gender</span><span>{product.gender}</span></li>}
        </ul>
      ),
    },
    {
      key: 'supplier', label: 'Supplier Information',
      content: <p className={styles.accordionBody}>Product sourced from trusted manufacturers with quality assurance.</p>,
    },
    {
      key: 'returns', label: 'Returns & Exchange',
      content: <p className={styles.accordionBody}>7-day return & 10-day exchange policy. Items must be unused and in original packaging.</p>,
    },
  ]

  useEffect(() => {
    const fetchBottomBanner = async () => {
      try {
        const response = await fetch('/api/home/banners', { cache: 'no-store' })
        const data = await response.json()

        if (data?.success) {
          const otherBanners = data?.banners?.[0]?.otherBanners || []
          setBottomBanner(otherBanners[4] || otherBanners[otherBanners.length - 1] || null)
        }
      } catch (error) {
        console.error('Error fetching product page banner:', error)
      }
    }

    fetchBottomBanner()
  }, [])

  useEffect(() => {
    const stickyEl = galleryStickyRef.current
    const columnEl = galleryColumnRef.current
    const infoEl = infoSectionRef.current
    if (!stickyEl || !columnEl || !infoEl || typeof window === 'undefined') return

    const STICKY_TOP = 0
    const desktopQuery = window.matchMedia('(min-width: 901px)')
    let rafId = null

    const resetSticky = () => {
      stickyEl.style.position = 'relative'
      stickyEl.style.top = '0px'
      stickyEl.style.left = 'auto'
      stickyEl.style.width = '100%'
      stickyEl.style.zIndex = '2'
      columnEl.style.minHeight = 'auto'
    }

    const updateSticky = () => {
      rafId = null

      if (!desktopQuery.matches) {
        resetSticky()
        return
      }

      const stickyHeight = stickyEl.offsetHeight
      const infoRect = infoEl.getBoundingClientRect()
      const infoTop = window.scrollY + infoRect.top
      const infoBottom = infoTop + infoEl.offsetHeight
      const columnRect = columnEl.getBoundingClientRect()

      const start = infoTop - STICKY_TOP
      const end = infoBottom - STICKY_TOP - stickyHeight

      columnEl.style.minHeight = `${Math.max(infoEl.offsetHeight, stickyHeight)}px`

      if (end <= start) {
        resetSticky()
        return
      }

      if (window.scrollY <= start) {
        resetSticky()
        return
      }

      stickyEl.style.position = 'fixed'
      stickyEl.style.left = `${Math.round(columnRect.left)}px`
      stickyEl.style.width = `${Math.round(columnRect.width)}px`
      stickyEl.style.zIndex = '2'

      if (window.scrollY < end) {
        stickyEl.style.top = `${STICKY_TOP}px`
      } else {
        const topAfterEnd = STICKY_TOP - (window.scrollY - end)
        stickyEl.style.top = `${topAfterEnd}px`
      }
    }

    const requestUpdate = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(updateSticky)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', requestUpdate)
    } else {
      desktopQuery.addListener(requestUpdate)
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (desktopQuery.removeEventListener) {
        desktopQuery.removeEventListener('change', requestUpdate)
      } else {
        desktopQuery.removeListener(requestUpdate)
      }
      resetSticky()
    }
  }, [openAccordion, selectedIndex, mediaList.length])

  return (
    <div className={styles.productPage}>

      {/* ── Main Product Grid ── */}
      <div className={styles.productGrid}>

        {/* Left: Gallery */}
        <div className={styles.galleryColumn} ref={galleryColumnRef}>
          <div className={styles.gallerySticky} ref={galleryStickyRef}>
            <div className={styles.gallerySection}>
              <div className={styles.mainImageWrap}>
                {discountPercent > 0 && (
                  <span className={styles.saveBadge}>SAVE {discountPercent}%</span>
                )}
                <div className={styles.imageActionGroup}>
                  <button className={styles.imageActionBtn} onClick={() => setShowShareOptions(true)} aria-label="Share">
                    <Share2 size={16} />
                  </button>
                  <button
                    className={`${styles.imageActionBtn} ${isInWishlist ? styles.wishlisted : ''}`}
                    onClick={handleWishlistToggle}
                    aria-label="Wishlist"
                  >
                    <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {mediaList[selectedIndex] && (
                  isVideo(mediaList[selectedIndex]?.url) ? (
                    <video controls className={styles.mainImage}>
                      <source src={mediaList[selectedIndex]?.url} />
                    </video>
                  ) : (
                    <Image
                      src={mediaList[selectedIndex]?.url}
                      alt={product?.title}
                      className={styles.mainImage}
                      fill
                      sizes="(max-width: 900px) 100vw, 48vw"
                      priority
                    />
                  )
                )}
              </div>

              {mediaList.length > 1 && (
                <div className={styles.thumbnailRow}>
                  {mediaList.map((media, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumb} ${selectedIndex === idx ? styles.thumbActive : ''}`}
                      onClick={() => setSelectedIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      {isVideo(media?.url) ? (
                        <video src={media?.url} muted className={styles.thumbMedia} />
                      ) : (
                        <Image src={media?.url} alt={`View ${idx + 1}`} className={styles.thumbMedia} width={90} height={90} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className={styles.infoSection} ref={infoSectionRef}>

          <h1 className={styles.productTitle}>{product?.title}</h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>★★★★★</span>
            <span className={styles.ratingCount}>(2,045 reviews)</span>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.currentPrice}>₹{product?.price?.toLocaleString()}</span>
            {product?.crossPrice && (
              <span className={styles.mrpPrice}>₹{product.crossPrice.toLocaleString()}</span>
            )}
            {discountPercent > 0 && (
              <span className={styles.discountChip}>SAVE {discountPercent}%</span>
            )}
          </div>
          <p className={styles.taxNote}>Inclusive of all taxes</p>
          <p className={styles.skuText}>SKU: {product?.sku || 'N/A'}</p>

          <div className={styles.divider} />

          {/* Offers */}
          <div className={styles.offersBlock}>
            <p className={styles.sectionLabel}>Available Offers</p>
            <ul className={styles.offerList}>
              <li><Tag size={12} className={styles.tagIcon} /><span>Flat 5% Off on first order CODE: <strong className={styles.code}>SAVE5</strong></span></li>
              <li><Tag size={12} className={styles.tagIcon} /><span>Buy 3 latest products at ₹1499</span></li>
              <li><Tag size={12} className={styles.tagIcon} /><span>Flat 5% of on: <strong className={styles.code}>Prepaid Orders</strong></span></li>
              <li><Tag size={12} className={styles.tagIcon} /><span>Buy 3: <strong className={styles.code}>@999</strong></span></li>
            </ul>
          </div>

          <div className={styles.divider} />

          {/* Stock */}
          <div className={styles.stockRow}>
            <Package size={14} className={styles.stockIcon} />
            <span>In stock — ready to ship</span>
          </div>

          {/* Quantity */}
          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>Quantity</span>
            <div className={styles.qtyControl}>
              <button className={styles.qtyBtn} onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1} aria-label="Decrease">
                <Minus size={13} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => handleQuantityChange('increase')} disabled={quantity >= (product?.quantity || 99)} aria-label="Increase">
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className={styles.actionButtons}>
            <button className={styles.buyNowBtn} onClick={handleBuyNow} disabled={product?.quantity === 0}>Buy It Now</button>

            {existingCartItem ? (
              <button className={styles.removeBtn} onClick={handleRemoveFromCart}>Remove from Cart</button>
            ) : (
              <button
                className={`${styles.addToCartBtn} ${styles.alwaysShake}`}
                onClick={handleAddToCart}
                disabled={product?.quantity === 0}
              >
                Add to Cart
              </button>
            )}
          </div>

          {/* Trust Badges */}
          <div className={styles.trustGrid}>
            {[
              { Icon: Truck, label: 'Free Shipping' },
              { Icon: Shield, label: 'Skin Safe Jewellery' },
              { Icon: RefreshCw, label: '10 Days Exchange' },
              { Icon: Package, label: '7 Days Return' },
            ].map(({ Icon, label }) => (
              <div key={label} className={styles.trustItem}>
                <Icon size={18} className={styles.trustIcon} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className={styles.accordionSection}>
            {accordions.map(({ key, label, content }) => (
              <div key={key} className={styles.accordionItem}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                >
                  <span className={styles.accordionTitle}>{label}</span>
                  <ChevronDown size={16} className={`${styles.accordionChevron} ${openAccordion === key ? styles.chevronOpen : ''}`} />
                </button>
                {openAccordion === key && (
                  <div className={styles.accordionContent}>{content}</div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <section className={styles.bottomBannerSection}>
        <div className={styles.mobileBannerWrapper}>
          <Image
            src="/images/banner/unme-banner-mobile.jpg"
            alt="UNME quality banner"
            width={1600}
            height={900}
            className={styles.mobileBannerImage}
          />
        </div>

        {bottomBanner && (
          <div className={styles.desktopBannerWrapper}>
            <Perks
              banner={bottomBanner}
              className={styles.productBannerCenter}
              containerStyle={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}
            />
          </div>
        )}
      </section>

      {/* You May Also Like */}
      <section className={styles.relatedSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>You May Also Like</h2>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.relatedGrid}>
          {products?.slice(0, 4).map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </section>

      {/* Complete Your Look */}
      <section className={styles.relatedSection}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>Complete Your Look</h2>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.relatedGrid}>
          {latestProducts?.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </section>

      {/* ── Ratings Summary + Reviews ── */}
      <section className={styles.reviewsSection}>
        <div className={styles.sectionHeading} style={{ padding: '0 0 0 0' }}>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>
          <div className={styles.sectionLine} />
        </div>

        {/* Rating Overview */}
        <div className={styles.ratingOverview}>
          <div className={styles.ratingBig}>
            <span className={styles.ratingBigNum}>{Number(averageRating).toFixed(1)}</span>
            <div className={styles.ratingBigStars}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={18}
                  fill={s <= Math.round(averageRating) ? '#C9A84C' : 'none'}
                  stroke={s <= Math.round(averageRating) ? '#C9A84C' : '#C9A84C'}
                />
              ))}
            </div>
            <span className={styles.ratingBigCount}>
              {product?.ratings?.length || 0} reviews
            </span>
          </div>
          <div className={styles.ratingBars}>
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} className={styles.ratingBarRow}>
                <span className={styles.ratingBarLabel}>{star} ★</span>
                <div className={styles.ratingBarTrack}>
                  <div className={styles.ratingBarFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.ratingBarCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {product?.ratings && product.ratings.length > 0 ? (
          <div className={styles.reviewsList}>
            {product.ratings.map((r, i) => (
              <div key={i} className={styles.reviewCard}>
                <div className={styles.reviewCardTop}>
                  <div className={styles.reviewAvatar}>
                    {r.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewerName}>{r.name}</span>
                    <div className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12}
                          fill={s <= r.star ? '#C9A84C' : 'none'}
                          stroke='#C9A84C'
                        />
                      ))}
                    </div>
                  </div>
                  <span className={styles.reviewDate}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                {r.image && (
                  <div className={styles.reviewImageWrap}>
                    <Image src={r.image} alt={r.name} width={100} height={100} className={styles.reviewImg} />
                  </div>
                )}
                <p className={styles.reviewComment}>{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>No reviews yet. Be the first to share your experience!</p>
        )}
      </section>

      {/* ── Write a Review ── */}
      <section className={styles.writeReviewSection}>
        <div className={styles.sectionHeading} style={{ padding: '0 0 0 0' }}>
          <h2 className={styles.sectionTitle}>Write a Review</h2>
          <div className={styles.sectionLine} />
        </div>

        {submitted ? (
          <div className={styles.submitSuccess}>
            <CheckCircle size={40} color="#2D7A4F" />
            <p>Thank you! Your review has been submitted.</p>
          </div>
        ) : (
          <div className={styles.reviewForm}>
            {/* Name + Email row */}
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Your Name *</label>
                <input
                  className={styles.formInput}
                  type="text" placeholder="e.g. Priya S."
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Email (optional)</label>
                <input
                  className={styles.formInput}
                  type="email" placeholder="yourname@email.com"
                  value={reviewEmail}
                  onChange={e => setReviewEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Star picker */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Your Rating *</label>
              <div className={styles.starPicker}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s} type="button"
                    className={styles.starPickerBtn}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setReviewStar(s)}
                    aria-label={`Rate ${s} star`}
                  >
                    <Star
                      size={28}
                      fill={(hoverStar || reviewStar) >= s ? '#C9A84C' : 'none'}
                      stroke='#C9A84C'
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
                <span className={styles.starPickerLabel}>
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverStar || reviewStar]}
                </span>
              </div>
            </div>

            {/* Review text */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Your Review *</label>
              <textarea
                className={styles.formTextarea}
                rows={4}
                placeholder="Tell others what you think about this product..."
                value={reviewMsg}
                onChange={e => setReviewMsg(e.target.value)}
              />
            </div>

            {/* Image upload */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Add a Photo (optional)</label>
              {reviewImage ? (
                <div className={styles.previewWrap}>
                  <Image src={reviewImage} alt="Preview" width={100} height={100} className={styles.previewImg} />
                  <button className={styles.removePreview} onClick={() => setReviewImage('')} type="button">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Upload Photo</span>
                </button>
              )}
              <input
                ref={fileInputRef} type="file"
                accept="image/*" className={styles.fileInputHidden}
                onChange={handleImageUpload}
              />
            </div>

            <button
              className={styles.submitReviewBtn}
              onClick={handleReviewSubmit}
              disabled={submitting}
            >
              {submitting ? 'Posting…' : 'Post Review'}
            </button>
          </div>
        )}
      </section>

      {/* Sticky Mobile Bar */}
      <div className={styles.stickyBar}>
        <div className={styles.stickyLeft}>
          <span className={styles.stickyPrice}>₹{product?.price?.toLocaleString()}</span>
          {product?.crossPrice && <span className={styles.stickyMrp}>₹{product.crossPrice.toLocaleString()}</span>}
          {discountPercent > 0 && <span className={styles.stickyDiscount}>{discountPercent}% OFF</span>}
        </div>
        <div className={styles.stickyButtons}>
          {existingCartItem ? (
            <button className={styles.stickyRemove} onClick={handleRemoveFromCart}>Remove</button>
          ) : (
            <button
              className={`${styles.stickyCart} ${styles.alwaysShake}`}
              onClick={handleAddToCart}
              disabled={product?.quantity === 0}
            >
              Add to Cart
            </button>)}
          <button className={styles.stickyBuy} onClick={handleBuyNow} disabled={product?.quantity === 0}>Buy Now</button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareOptions && (
        <div className={styles.modalOverlay} onClick={() => setShowShareOptions(false)}>
          <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Share</h3>
              <button className={styles.modalClose} onClick={() => setShowShareOptions(false)}><X size={18} /></button>
            </div>
            <div className={styles.shareIcons}>
              {shareOptions.map((opt, i) => {
                const Icon = opt.icon
                return (
                  <button key={i} className={styles.shareIconBtn} onClick={opt.share}>
                    <span className={styles.shareCircle} style={{ background: opt.color }}>
                      <Icon size={18} color="#fff" />
                    </span>
                    <span className={styles.shareLabel}>{opt.name}</span>
                  </button>
                )
              })}
            </div>
            <div className={styles.copyRow}>
              <input className={styles.copyInput} type="text" value={shareUrl} readOnly />
              <button className={styles.copyBtn} onClick={copyToClipboard}>{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SingleProduct
