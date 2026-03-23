// components/StatementPiece.tsx
"use client";

import React, { useEffect, useState } from 'react';
import styles from './StatementPiece.module.css';
import ProductCardStatement from '../../ui/productCard/ProductCardStatement';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/imageUtils';

const StatementPiece = ({ banner }) => {
  const [featuredCollection, setFeaturedCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const collectionRes = await fetch('/api/home/featured-collection');
        const collectionData = await collectionRes.json();

        if (collectionData.success) {
          setFeaturedCollection(collectionData.data.featuredCollection);
          setProducts(collectionData.data.mostFeaturedProducts || []);
        }
      } catch (error) {
        console.error('Error fetching statement piece data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <section className={styles.statementSection}>
        <div className={styles.container}>
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonLeft}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonProducts}>
                {[1, 2, 3, 4]?.map((item) => (
                  <div key={item} className={styles.skeletonProduct} />
                ))}
              </div>
            </div>
            <div className={styles.skeletonRight} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">

          {/* LEFT - PRODUCTS */}
          <div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                Statement Pieces
              </h2>
              <Link
                href="/collections"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 gap-3">
              {products?.slice(0, 4).map((item, index) => (
                <ProductCardStatement key={item._id || index} product={item} />
              ))}
            </div>

          </div>

          {/* RIGHT - BANNER */}
          {banner && (
            <div className="relative h-[420px] lg:h-auto rounded-lg overflow-hidden">
              <Image
                src={modifyCloudinaryUrl(banner?.url)}
                alt={banner?.title}
                fill
                className="object-cover"
              />
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default StatementPiece;