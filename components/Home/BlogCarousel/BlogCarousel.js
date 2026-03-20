// components/BlogCarousel.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './BlogCarousel.module.css';
import productCard from '../../../images/productCard.png'

const BlogCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 1,
    align: 'start',
  });

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/home/blogs');
        const data = await res.json();
        if (data.success) {
          setBlogs(data.data);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className={styles.blogSection}>
        <div className={styles.container}>
          <div className="min-h-[400px] flex items-center justify-center">
            Loading blogs...
          </div>
        </div>
      </section>
    );
  }

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={16} className={styles.sparkleIcon} />
            <span>The Jewellery Journal</span>
            <Sparkles size={16} className={styles.sparkleIcon} />
          </div>
          <h2 className={styles.title}>Timeless Stories & Expert Insights</h2>
          <p className={styles.subtitle}>
            Discover the art of fine jewellery through curated stories, styling tips, and expert
            guidance to help you celebrate life's precious moments.
          </p>
        </div>

        {/* Carousel */}
        <div className={styles.embla}>
          <button className={`${styles.navButton} ${styles.prev}`} onClick={scrollPrev}>
            <ChevronLeft size={22} />
          </button>

          <div className={styles.emblaViewport} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {blogs.map((post) => (
                <div className={styles.emblaSlide} key={post._id || post.id}>
                  <article className={styles.blogCard}>
                    {/* Image */}
                    <div className={styles.imageContainer}>
                      <Image
                        src={post.image || post.imageUrl || productCard}
                        alt={post.title}
                        title={post.title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                      {/* Meta */}
                      <div className={styles.meta}>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>
                            {new Date(post.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={14} />
                          <span>{post.readTime || '5 min read'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className={styles.blogTitle}>{post.title}</h3>

                      {/* Excerpt */}
                      <p className={styles.excerpt} dangerouslySetInnerHTML={{__html:post.excerpt || post.description}}/>

                      {/* Read More Link */}
                      <Link href={`/blogs/${post.slug || post.handle}`} className={styles.readMore}>
                        <span>Discover More</span>
                        <ArrowRight size={16} className={styles.arrow} />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <button className={`${styles.navButton} ${styles.next}`} onClick={scrollNext}>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogCarousel;