// components/ImageBannerSection.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from './ImageBannerSection.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { normalizeImageUrl } from '@/lib/imageUtils';

const ImageBannerSection = ({ banner, contentLeft = false, textWhite = false }) => {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    setLoading(false)
  },[banner])
  const style = {
    color: textWhite ? 'white' : 'black',
    left: contentLeft ? '50px' : 'auto',
    right: contentLeft ? 'auto' : '50px',
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

  if (loading || !banner) {
    return <div className={styles.imageBannerSection} style={{ minHeight: '400px' }}></div>;
  }

  return (
    <div className={styles.imageBannerSection}>
      <Link href={`/collections/${banner.link || '#'}`}>
        <Image
          src={modifyCloudinaryUrl(banner?.url)}
          alt={banner?.title}
          title={banner?.title}
          width={1400}
          height={1000}
          className={styles.bannerImage}
          priority
          data-aos="fade-left"
        />
      </Link>
    </div>
  );
};

export default ImageBannerSection;