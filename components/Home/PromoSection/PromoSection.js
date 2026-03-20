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
    if (!url) return "";
    const urlParts = url.split("/upload/");
    return urlParts.length === 2
      ? `${urlParts[0]}/upload/c_limit,f_auto,q_40/${urlParts[1]}`
      : url;
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