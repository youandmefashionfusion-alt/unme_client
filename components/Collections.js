'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../src/app/collections/[cid]/collections.module.css';
import { normalizeImageUrl } from '@/lib/imageUtils';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collection/getallcollections');
      const data = await response.json();
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Our Collections</h1>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Our Collections</h1>
      
      <div className={styles.grid}>
        {collections.map((collection) => (
          <Link 
            href={`/collections/${collection.handle}`} 
            key={collection._id}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={modifyCloudinaryUrl(collection?.images[0]?.url)}
                title={collection.title}
                alt={collection.title}
                className={styles.image}
                width={700}
                height={900}
              />
            </div>
            <h3 className={styles.title}>{collection.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Collections;