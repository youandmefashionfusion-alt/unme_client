"use client";

import { useEffect, useState } from 'react';
import styles from './FeaturedCollection.module.css';
import ProductCard from '../../ui/productCard/ProductCard';
import Heading from '../../ui/Heading/Heading'; // Import Heading component
import Link from 'next/link';
import { MoveRight, Package } from 'lucide-react';
import { GTM } from '@/lib/gtm';

const FeaturedCollection = ({
  initialCollections = [],
  title = "Featured Collection",
  viewAllText = "View All",
  showViewAll = true
}) => {
  const [collections, setCollections] = useState(initialCollections);
  const [activeTab, setActiveTab] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  // Set initial active tab
  useEffect(() => {
    if (initialCollections.length > 0) {
      setActiveTab(initialCollections[0]);
    }
  }, [initialCollections]);

  // Fetch products when activeTab changes
  useEffect(() => {
    if (!activeTab) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await fetch(`/api/home/get-collection-products?id=${activeTab.handle}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  // GTM tracking
  useEffect(() => {
    if (products.length > 0) {
      const items = products.map(item => ({
        item_id: item._id,
        item_name: item.title,
        item_category: item.collectionName?.title,
        price: item.price
      }));

      GTM.viewItemList('Featured Products List', items);
    }
  }, [products]);

  // Set loading to false when collections are loaded
  useEffect(() => {
    if (initialCollections.length > 0) {
      setLoading(false);
    }
  }, [initialCollections]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <Heading title={title} align="center" />

          <div className={styles.loadingState}>
            <div className={styles.skeletonButtons}>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className={styles.skeletonButton} />
              ))}
            </div>
            <div className={styles.skeletonGrid}>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className={styles.skeletonCard} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!collections || collections.length === 0) return null;

  return (
    <section className=" max-w-7xl mx-auto px-4">
      <div className={styles.container}>
        {/* Collection Buttons - Now wraps naturally on mobile */}
        <Heading title="Unme Top Styles" align="center" />
        <div className={styles?.buttonsWrapper}>
          <div className={styles?.buttonsContainer}>
            {collections?.map((collection) => (
              <button
                key={collection._id}
                className={`${styles.collectionBtn} ${activeTab?.handle === collection.handle ? styles.activeBtn : ''
                  }`}
                onClick={() => handleTabChange(collection)}
                disabled={productsLoading}
              >
                {collection?.title}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className={styles?.loadingProducts}>
            <div className={styles?.loadingSpinner} />
          </div>
        ) : products?.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {products?.slice(0, 10)?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* View All Button - Optional */}
            {showViewAll && (
              <div className={styles.viewAllContainer}>
                <Link href={`/collections/${activeTab?.handle}`} className={styles.viewAllLink}>
                  <span>{viewAllText}</span>
                  <MoveRight className={styles.arrowIcon} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noProducts}>
            <Package className={styles.noProductsIcon} />
            <p>No products found in this collection</p>
            <button
              className={styles.resetBtn}
              onClick={() => setActiveTab(collections[0])}
            >
              Browse other collections
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCollection;
