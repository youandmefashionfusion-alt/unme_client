// components/PromoCards.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PromoSection.module.css';
import { MoveRight } from "lucide-react";

const PromoCards = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/home/banners', {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setBanners(data.banners || []);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

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

  // Get promoCards (banners 6-8)
  const promoCards = banners.slice(6, 8);

  if (loading) {
    return (
      <section className={styles.promoSection} data-aos="fade-up">
        <div className={styles.container}>
          <div className="min-h-[400px]"></div>
        </div>
      </section>
    );
  }

  if (promoCards.length === 0) return null;

  return (
    <section className={styles.promoSection} data-aos="fade-up">
      <div className={styles.container}>
        <div className={styles.cardsGrid}>
          {promoCards.map((promo, index) => (
            <div
              key={promo._id || index}
              className={styles.promoCard}
            >
              {/* Background Image */}
              <div className={styles.cardImageWrapper}>
                <Image
                  src={modifyCloudinaryUrl(promo?.url)}
                  alt={promo?.title}
                  title={promo?.title}
                  priority
                  fill
                  className={styles.cardImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content Overlay */}
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{promo?.title}</h2>
                <p className={styles.cardSubtitle}>{promo?.subtitle}</p>

                <Link href={promo?.link || '#'} className={styles.cardButton}>
                  <span className={styles.buttonText}>View Full Collection</span>
                  <MoveRight width={20} height={20} />
                </Link>
              </div>

              {/* Hover Overlay */}
              <div className={styles.hoverOverlay}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoCards;