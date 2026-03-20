"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./InstagramReels.module.css";
import { Play, Image as ImageIcon, ExternalLink, X, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Heading from "../../ui/Heading/Heading";

const INSTAGRAM_PROFILE = "https://www.instagram.com/unme.jewels/";

const InstagramReels = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [products, setProducts] = useState([]);
  const fetchInstagramMedia = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/home/instagram-reels", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch Instagram media`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch Instagram media");
      }

      setMedia(data.data || []);
      setProducts(data.latestProducts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setMedia([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalClosing(true);
    setTimeout(() => {
      setActiveMedia(null);
      setIsModalClosing(false);
    }, 200);
  }, []);

  const openInInstagram = useCallback(() => {
    if (activeMedia?.permalink) {
      window.open(activeMedia.permalink, "_blank", "noopener,noreferrer");
    }
  }, [activeMedia]);

  useEffect(() => {
    fetchInstagramMedia();
  }, [fetchInstagramMedia]);

  const handleRetry = () => {
    fetchInstagramMedia();
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape" && activeMedia) {
      closeModal();
    }
  }, [activeMedia, closeModal]);

  useEffect(() => {
    if (activeMedia) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMedia, handleKeyDown]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading Instagram content...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    if (media.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Instagram size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>No posts available yet</p>
          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
          >
            Visit our Instagram
          </a>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {media.map((item, index) => (
          <button
            key={item.id}
            className={styles.card}
            onClick={() => setActiveMedia(item)}
            style={{ animationDelay: `${index * 0.05}s` }}
            aria-label={`View ${item.media_type === "IMAGE" ? "image" : "video"} post`}
          >
            <div className={styles.imageContainer}>
              <video
                src={item.media_url}
                controls={false}
                autoPlay = {true}
                muted
                loop
                playsInline
                // className={styles.modalVideo}
                className={styles.image}
              />
              {/* <img
                src={item.thumbnail_url || item.media_url}
                alt={item.caption?.substring(0, 100) || "Instagram post"}
                className={styles.image}
                loading="lazy"
              /> */}
              <div className={styles.overlay}>
                <Link href={`/products/${products[index]?.handle}`}>
                <div className={styles.productWrapper}>
                 <Image src={products[index]?.images[0]?.url} alt={products[index]?.title} width={200} height={200} className={styles.productImage}/>
                 <div>
                  <p className={styles.productTitle}>{products[index]?.title}</p>
                  <p className={styles.productPrice}>₹{products[index]?.price}</p>
                 </div>
                </div>
                </Link>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className={styles.section} aria-label="Instagram Reels">
      <div className={styles.container}>
        <Heading title="Follow Our Journey" subtitle="Discover our latest creations and behind-the-scenes moments"/>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}></h2>
            <p className={styles.subtitle}>
              
            </p>
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramButton}
            >
              <Instagram size={20} />
              <span>@unme.jewels</span>
            </a>
          </div>

        </div>

        {renderContent()}
      </div>

      {/* Modal */}
      {activeMedia && (
        <div className={`${styles.modalBackdrop} ${isModalClosing ? styles.closing : ''}`}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalAccount}>
                <div className={styles.avatar}>
                  <Instagram size={20} />
                </div>
                <div>
                  <h3 id="modal-title" className={styles.modalUsername}>
                    unme.jewels
                  </h3>
                  <p className={styles.modalTimestamp}>Instagram</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className={styles.modalClose}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalMedia}>
                {activeMedia.media_type === "IMAGE" ? (
                  <img
                    src={activeMedia.media_url}
                    alt={activeMedia.caption || "Instagram image"}
                    className={styles.modalImage}
                  />
                ) : (
                  <video
                    src={activeMedia.media_url}
                    controls
                    autoPlay
                    className={styles.modalVideo}
                  />
                )}
              </div>

              {activeMedia.caption && (
                <div className={styles.modalCaption}>
                  <p>{activeMedia.caption}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button onClick={openInInstagram} className={styles.viewButton}>
                <ExternalLink size={16} />
                <span>View on Instagram</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramReels;