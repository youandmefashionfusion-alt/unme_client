// components/ImageBannerSection.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from './ImageBannerSection.module.css';
import Image from 'next/image';
import Link from 'next/link';

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
    if (!url) return "";
    const urlParts = url.split("/upload/");
    return urlParts.length === 2
      ? `${urlParts[0]}/upload/c_limit,f_auto,q_40/${urlParts[1]}`
      : url;
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