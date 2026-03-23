"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import { normalizeImageUrl } from '@/lib/imageUtils';

const HeroSection = ({ mobileBanners, desktopBanners }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [filteredSlides, setFilteredSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const autoPlayTimer = useRef(null);

  // Split slides based on screen size
  const updateSlides = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (window.innerWidth <= 768) {
      setFilteredSlides(mobileBanners);
    } else {
      setFilteredSlides(desktopBanners);
    }
    setIsLoading(false);
  }, [mobileBanners, desktopBanners]);

  useEffect(() => {
    if (mobileBanners.length > 0 || desktopBanners.length > 0) {
      updateSlides();
    }
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, [mobileBanners, desktopBanners, updateSlides]);

  // Progress bar animation
  useEffect(() => {
    if (filteredSlides.length > 1 && !isLoading && activeSlide !== undefined) {
      setProgress(0);
      const interval = 50; // Update every 50ms
      const step = (interval / 5000) * 100; // 5 seconds total

      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            return 100;
          }
          return prev + step;
        });
      }, interval);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [activeSlide, filteredSlides.length, isLoading]);

  // Auto-play with cleanup
  const nextSlide = useCallback(() => {
    if (filteredSlides.length === 0 || filteredSlides.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % filteredSlides.length);
      setIsTransitioning(false);
    }, 300);
  }, [filteredSlides]);

  useEffect(() => {
    if (filteredSlides.length > 1 && !isLoading) {
      autoPlayTimer.current = setInterval(nextSlide, 5000);
      return () => {
        if (autoPlayTimer.current) {
          clearInterval(autoPlayTimer.current);
        }
      };
    }
  }, [nextSlide, filteredSlides.length, isLoading]);

  const goToSlide = (index) => {
    if (index !== activeSlide && filteredSlides.length > 1) {
      // Clear intervals
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
      
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

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

  const handleImageLoad = (index) => {
    setImageLoadStatus(prev => ({ ...prev, [index]: true }));
  };

  // Skeleton Loading State
  if (isLoading || filteredSlides.length === 0) {
    return (
      <section className={styles.heroSection}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonImage} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.slideContainer}>
        {filteredSlides.map((slide, index) => (
          <div
            key={slide._id || index}
            className={`${styles.slide} ${
              index === activeSlide ? styles.active : ""
            }`}
          >
            {/* Skeleton overlay while image loads */}
            {!imageLoadStatus[index] && (
              <div className={styles.skeletonContainer}>
                <div className={styles.skeletonImage} />
              </div>
            )}
            
            <div 
              className={styles.imageWrapper}
              style={{ 
                opacity: imageLoadStatus[index] ? 1 : 0,
                transition: 'opacity 500ms ease'
              }}
            >
              <Image
                src={modifyCloudinaryUrl(slide?.url) || "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764331543/cw2sd2xwqfryyu2nglcu.png"}
                alt={slide?.title || "Hero banner"}
                title={slide?.title || "Hero banner"}
                width={1920}
                height={1080}
                className={styles.heroImage}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageLoad(index)}
              />
            </div>

            {/* Modern Content Overlay */}
            {slide?.title && (
              <div className={styles.contentOverlay}>
                <h1 className={styles.slideTitle}>{slide.title}</h1>
                {slide.description && (
                  <p className={styles.slideDescription}>{slide.description}</p>
                )}
                {slide.ctaLink && (
                  <Link href={slide.ctaLink} className={styles.slideButton}>
                    {slide.ctaText || "Shop Now"}
                    <span>→</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Arrow Navigation */}
        {/* {filteredSlides.length > 1 && (
          <>
            <button 
              className={`${styles.arrowNav} ${styles.arrowPrev}`}
              onClick={() => goToSlide((activeSlide - 1 + filteredSlides.length) % filteredSlides.length)}
              aria-label="Previous slide"
            >
              ←
            </button>
            <button 
              className={`${styles.arrowNav} ${styles.arrowNext}`}
              onClick={() => goToSlide((activeSlide + 1) % filteredSlides.length)}
              aria-label="Next slide"
            >
              →
            </button>
          </>
        )} */}

        {/* Progress Bar */}
        {filteredSlides.length > 1 && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Modern Navigation Dots */}
      {filteredSlides?.length > 1 && (
        <div className={styles.navigation}>
          {filteredSlides?.map((_, index) => (
            <button
              key={index}
              className={`${styles.navDot} ${
                index === activeSlide ? styles.active : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;