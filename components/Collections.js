'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../src/app/collections/[cid]/collections.module.css';

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
    if (!url) return '/placeholder.jpg';
    const parts = url.split('/upload/');
    return parts.length === 2
      ? `${parts[0]}/upload/c_limit,h_800,f_auto,q_40/${parts[1]}`
      : url;
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