"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import styles from './Reviews.module.css';
import Image from 'next/image';
import { GTM } from '@/lib/gtm';
import useEmblaCarousel from 'embla-carousel-react';
import Heading from '../../ui/Heading/Heading';

const ReviewsList = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 1,
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/get-ratings');
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.ratings || []);
          
          if (typeof GTM !== 'undefined') {
            const items = data.ratings?.map(item => ({
              item_id: item._id,
              item_name: item.title,
              item_category: 'Reviews',
              price: item.price
            })) || [];
            GTM.viewItemList('Customer Reviews', items);
          }
        } else {
          setError(data.error || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating)) {
        stars.push(
          <Star key={i} size={16} className={styles.starIcon} fill="#ffb800" stroke="#ffb800" />
        );
      } else {
        stars.push(
          <Star key={i} size={16} className={styles.starIconOutline} fill="none" stroke="#e0e0e0" />
        );
      }
    }
    return stars;
  };

  const modifyCloudinaryUrl = (url) => {
    if (!url) return '/placeholder-image.jpg';
    const urlParts = url.split('/upload/');
    return urlParts.length > 1 
      ? `${urlParts[0]}/upload/c_limit,h_200,f_auto,q_40/${urlParts[1]}`
      : url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <Heading 
            title="What Our Customers Say" 
            align="center" 
            subtitle="Real reviews from real customers"
          />
          
          <div className={styles.skeletonContainer}>
            {[1, 2, 3].map((item) => (
              <div key={item} className={styles.skeletonCard}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine.short} />
                <div style={{ marginTop: 20 }}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine.medium} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !reviews?.length) {
    return (
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <Heading 
            title="What Our Customers Say" 
            align="center" 
            subtitle="Real reviews from real customers"
          />
          
          <div className={styles.errorContainer}>
            <span className={styles.errorIcon}>😕</span>
            <p className={styles.errorText}>
              {error || 'No reviews available at the moment.'}
            </p>
            {error && (
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <Heading 
          title="What Our Customers Say" 
          align="center" 
          subtitle="Real reviews from real customers"
        />

        <div className={styles.embla}>
          {/* Previous Button */}
          <button 
            className={`${styles.emblaButton} ${styles.prev}`} 
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous reviews"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Carousel Viewport */}
          <div className={styles.emblaViewport} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {reviews.map((review, index) => (
                <div className={styles.emblaSlide} key={index}>
                  <div className={styles.reviewCard}>
                    {/* Reviewer Header */}
                    <div className={styles.reviewerHeader}>
                      <div className={styles.reviewerAvatar}>
                        {getUserInitials(review.latestRating?.name)}
                      </div>
                      <div className={styles.reviewerInfo}>
                        <h4 className={styles.reviewerName}>
                          {review.latestRating?.name || 'Anonymous'}
                        </h4>
                        <div className={styles.reviewMeta}>
                          <div className={styles.starsContainer}>
                            {renderStars(review.latestRating?.star || 5)}
                            <span className={styles.ratingValue}>
                              ({review.latestRating?.star || 5}.0)
                            </span>
                          </div>
                          {/* <span className={styles.reviewDate}>
                            {formatDate(review.latestRating?.date)}
                          </span> */}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className={styles.reviewContent}>
                      <p className={styles.reviewText}>
                        "{review.latestRating?.comment || 'No comment provided.'}"
                      </p>
                    </div>

                    {/* Product Info */}
                    <div className={styles.productSection}>
                      <div className={styles.productImage}>
                        <Image
                          src={modifyCloudinaryUrl(review.images?.[0]?.url)}
                          alt={review.title}
                          width={60}
                          height={60}
                          className={styles.productThumb}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h5 className={styles.productTitle}>
                          {review.title}
                        </h5>
                        <span className={styles.verifiedBadge}>
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button 
            className={`${styles.emblaButton} ${styles.next}`} 
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next reviews"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsList;