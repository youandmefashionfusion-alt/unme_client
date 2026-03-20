import React from "react";
import Image from "next/image";
import styles from "./Footer.module.css";
import { Facebook, Instagram, Youtube, Mail, ArrowRight } from "lucide-react";
import logo from "../../images/logow.png";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* ===== Left Section ===== */}
        <div className={styles.left}>
          <div className={styles.logoBox}>
            <Link href="/">
              <Image
                src={logo}
                alt="U n Me Logo"
                title="UnMe Logo"
                width={180}
                height={80}
                className={styles.logo}
                priority={false}
              />
            </Link>
          </div>
          
          <div className={styles.contact}>
            <h3>Let's Connect</h3>
            <p>
              <Link href="mailto:unmejewels@gmail.com">
                unmejewels@gmail.com
              </Link>
            </p>
          </div>

          {/* Optional Newsletter Section */}
          <div className={styles.newsletter}>
            <p>Subscribe to get updates on new arrivals and exclusive offers</p>
            <div className={styles.newsletterInput}>
              <input 
                type="email" 
                placeholder="Your email address"
                aria-label="Email for newsletter"
              />
              <button className={styles.newsletterButton} aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ===== Center Section ===== */}
        <div className={styles.center}>
          {/* Collection */}
          <div className={styles.column}>
            <h4>Collection</h4>
            <ul>
              <li><Link href="/collections/earrings">Earrings</Link></li>
              <li><Link href="/collections/necklaces">Necklaces</Link></li>
              <li><Link href="/collections/hair-accessories">Hair Accessories</Link></li>
              <li><Link href="/collections/bracelets">Bracelets</Link></li>
            </ul>
          </div>

          {/* All Pages */}
          <div className={styles.column}>
            <h4>All Pages</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/blogs">Blogs</Link></li>
              <li><Link href="/collections">Collections</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/policies/terms-of-service">Terms & Condition</Link></li>
              <li><Link href="/policies/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/policies/refund-and-return-policy">Refund Policy</Link></li>
              <li><Link href="/policies/shipping-policy">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* ===== Right Section ===== */}
        <div className={styles.right}>
          <h4>Follow Us</h4>
          <div className={styles.socials}>
            <Link
              href="https://www.facebook.com/unme.jewels"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Facebook"
            >
              <Facebook className={styles.icon} />
            </Link>
            <Link
              href="https://www.youtube.com/@Unme.jewels"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="YouTube"
            >
              <Youtube className={styles.icon} />
            </Link>
            <Link
              href="https://www.instagram.com/unme.jewels"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <Instagram className={styles.icon} />
            </Link>
          </div>

          {/* Optional Payment Methods */}
          <div className={styles.paymentMethods}>
            <span className={styles.paymentIcon}>VISA</span>
            <span className={styles.paymentIcon}>MC</span>
            <span className={styles.paymentIcon}>UPI</span>
          </div>
        </div>
      </div>

      {/* ===== Bottom Copyright ===== */}
      <div className={styles.bottom}>
        <p>© Copyright {currentYear} U n Me. All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;