// components/WearRepeatLove.tsx
"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CarouselSection.module.css';
import ProductCard from '../../ui/productCard/ProductCard';
import Heading from '../../ui/Heading/Heading'; // Import reusable heading
import useEmblaCarousel from 'embla-carousel-react';
import { GTM } from '@/lib/gtm';

const CarouselSection = ({ 
  data, 
  title, 
  subtitle, 
  viewAllLink,
  viewAllText = 'View All',
  headingAlign = 'center',
  showProgress = false 
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 1,
    align: 'start',
  });

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    
    // Calculate progress
    const progress = (emblaApi.selectedScrollSnap() / (emblaApi.scrollSnapList().length - 1)) * 100;
    setProgress(progress);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    setLoading(false);
    if (data?.length) {
      const items = data.map(item => ({
        item_id: item._id,
        item_name: item.title,
        item_category: item.collectionName?.title,
        price: item.price
      }));
      GTM.viewItemList(title, items);
    }
  }, [data, title]);

  // Check for mobile viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (loading) {
    return (
      <section className={styles.carouselSection}>
        <div className={styles.container}>
          <Heading title={title} subtitle="Loading..." />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        {/* Reusable Heading Component */}
        <Heading 
          title={title}
          subtitle={subtitle}
          align={headingAlign}
          viewAllLink={viewAllLink}
          viewAllText={viewAllText}
        />

        {/* Mobile Grid View */}
        {isMobile ? (
          <div className={styles.mobileGrid}>
            {data?.slice(0, 8)?.map((product) => ( // Show only 4 products on mobile
              <div className={styles.gridItem} key={product._id || product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Desktop/Tablet Carousel View */
          <div className={styles.embla}>
            {/* <button 
              className={`${styles.emblaButton} ${styles.prev}`} 
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous products"
            >
              <ChevronLeft size={22} />
            </button> */}

            <div className={styles.emblaViewport} ref={emblaRef}>
              <div className={styles.emblaContainer}>
                {data.map((product) => (
                  <div className={styles.emblaSlide} key={product._id || product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* <button 
              className={`${styles.emblaButton} ${styles.next}`} 
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next products"
            >
              <ChevronRight size={22} />
            </button> */}

            {/* Optional Progress Bar */}
            {showProgress && data.length > 4 && (
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarouselSection;