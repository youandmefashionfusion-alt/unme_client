"use client";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import styles from './saleProducts.module.css';
import useEmblaCarousel from 'embla-carousel-react';
import { GTM } from '@/lib/gtm';
import ProductCard from '../../ui/productCard/ProductCard';
import Heading from '../../ui/Heading/Heading';
import Link from 'next/link';

const SaleProducts = ({ data, type }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 1,
    align: 'start',
  });

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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

      GTM.viewItemList('Sale Products', items);
    }
  }, [data]);

  // Check for mobile viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get title based on type
  const getTitle = () => {
    return type === '999'
      ? "Buy 3 Products at just Rs.999"
      : type === '999' ?
        'Get Latest Necklaces'
        : "Buy 3 Products at just Rs.1499";
  };


  if (loading) {
    return (
      <section className={`${styles.saleSection} ${type === '999' ? styles.variant999 : styles.variant999}`}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <Heading title={getTitle()} align="center" />
            {/* <div className={styles.priceBadge}>
              <span>Any 3 for</span> ₹{type}
            </div> */}
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section className={`${styles.saleSection} ${type === '999' ? styles.variant999 : styles.variant999}`}>
      <div className={styles.container}>
        {/* Header with Title and Price Badge */}
        <div className={styles.headerContent}>
          <Heading title={getTitle()} align="center" />

        </div>

        {/* Mobile Grid View */}
        {isMobile ? (
          <div className={styles.mobileGrid}>
            {data.slice(0, 4).map((product) => (
              <div className={styles.gridItem} key={product._id || product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Carousel View */
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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
          </div>
        )}

        {/* View All Link (styled like CarouselSection) */}
        <div className="text-center mt-6">
          <Link
            href="/valentine-sale"
            className="flex items-center justify-center gap-2 text-black text-[15px] font-bold"
          >
            <span>View All Offers</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SaleProducts;