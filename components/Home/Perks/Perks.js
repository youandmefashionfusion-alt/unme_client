// components/Perks.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from './Perks.module.css';
import Image from 'next/image';

const Perks = ({ banner, className = "", containerStyle = undefined }) => {
  const [loading, setLoading] = useState(false);
  const modifyCloudinaryUrl = (url) => {
    if (!url) return "";
    const urlParts = url.split("/upload/");
    return urlParts.length === 2
      ? `${urlParts[0]}/upload/c_limit,f_auto,q_40/${urlParts[1]}`
      : url;
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
