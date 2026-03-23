// components/Perks.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from './Perks.module.css';
import Image from 'next/image';
import { normalizeImageUrl } from '@/lib/imageUtils';

const Perks = ({ banner, className = "", containerStyle = undefined }) => {
  const [loading, setLoading] = useState(false);
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
    return (
      <div
        className={`${styles.imageBannerSection} ${className}`.trim()}
        style={{ minHeight: '300px', ...containerStyle }}
      ></div>
    );
  }

  return (
    <div
      className={`${styles.imageBannerSection} ${className}`.trim()}
      style={containerStyle}
    >
      <Image
        src={modifyCloudinaryUrl(banner?.url)}
        alt="Enjoy the perks"
        title="Enjoy the perks"
        width={1400}
        height={1000}
        className={styles.bannerImage}
        priority
      />
    </div>
  );
};

export default Perks;
