import React from 'react'
import Image from 'next/image';
import styles from './blogs.module.css'
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/imageUtils';

export const dynamic = "force-dynamic";

export const metadata = {
  title: "U n Me | Journal & Stories",
  description:
    "Explore stories, inspiration, and insights from the world of U n Me jewelry. Discover the art of meaningful jewelry and timeless elegance.",
  keywords: [
    "Jewelry Blog",
    "Jewelry Stories",
    "U n Me Journal",
    "Jewelry Inspiration",
    "Handcrafted Jewelry Stories",
  ],
  openGraph: {
    title: "U n Me | Journal & Stories",
    description:
      "Explore stories, inspiration, and insights from the world of U n Me jewelry.",
    url: "https://unmejewels.com/blogs",
    images: [
      {
        url: "https://d2gtpgxs0y565n.cloudfront.net/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Collection",
      },
    ],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://unmejewels.com/blogs" },
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const BlogsPage = async() => {
  let blogs = []
  
  try {
    const response = await fetch(`${process.env.API_PORT}blogs`, {
      cache: 'no-store'
    })
    const data = await response.json()
    if(data?.length > 0) {
      blogs = data
    }
  } catch(err) {
    console.log(err)
  }

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

  return (
    <div className={styles.blogsPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header} data-aos="fade-up">
          <h1 className={styles.title}>UnMe Blogs</h1>
          <p className={styles.subtitle}>
            Stories, inspiration, and insights from the world of U n Me
          </p>
        </div>

        {/* Blog Grid */}
        {blogs?.length > 0 ? (
          <div className={styles.blogGrid}>
            {blogs.map((item, index) => (
              <Link 
                href={`/blogs/${item?.handle}`} 
                key={index} 
                className={styles.blogCard}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {/* Image */}
                {item?.image && (
                  <div className={styles.cardImageWrapper}>
                    <Image 
                      src={modifyCloudinaryUrl(item?.image)} 
                      alt={item?.title} 
                      title={item?.title} 
                      width={600}
                      height={400}
                      className={styles.cardImage}
                      placeholder='blur' 
                      blurDataURL="data:image/jpeg;base64,..."
                    />
                  </div>
                )}

                {/* Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>
                      <Calendar size={14} />
                      {formatDate(item?.updatedAt)}
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{item?.title}</h2>
                  
                  {item?.description && (
                    <div 
                      className={styles.cardDescription}
                      dangerouslySetInnerHTML={{ 
                        __html: item?.description?.length > 150 
                          ? item?.description?.substring(0, 150) + '...' 
                          : item?.description 
                      }} 
                    />
                  )}

                  <span className={styles.readMore}>
                    Read More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h2>No Blog Posts Yet</h2>
            <p>Check back soon for stories and inspiration from U n Me</p>
            <Link href="/" className={styles.emptyButton}>
              Return to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogsPage