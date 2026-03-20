import React from 'react'
import { User, Mail, Phone, MapPin, Clock, Send, Heart } from 'lucide-react';
import styles from './contact.module.css'
import Link from 'next/link';

export const metadata = {
  title: "Contact Us | U n Me Jewelry",
  description: "Get in touch with U n Me Jewelry. Contact us for custom jewelry inquiries, customer support, or visit our store. We're here to help you find the perfect piece.",
  keywords: [
    "Contact U n Me Jewelry",
    "Jewelry Customer Support",
    "Custom Jewelry Inquiry",
    "Jewelry Store Contact",
    "Gold Jewelry Consultation",
    "Diamond Jewelry Help",
    "Jewelry Repair Contact"
  ],
  openGraph: {
    title: "Contact Us | U n Me Jewelry",
    description: "Get in touch with U n Me Jewelry. Contact us for custom jewelry inquiries, customer support, or visit our store.",
    url: "https://unmejewels.com/contact",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "Contact U n Me Jewelry",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | U n Me Jewelry",
    description: "Get in touch with U n Me Jewelry for custom inquiries and customer support.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const Contact = () => {
  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent} data-aos="fade-up">
            <h1 className={styles.heroTitle}>Get in Touch</h1>
            <p className={styles.heroText}>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.mainLayout}>
          {/* Left Side - Contact Info */}
          <div className={styles.infoSection} data-aos="fade-right">
            <div className={styles.infoCard}>
              <h2>Contact Information</h2>
              <p>Reach out to us through any of the following channels</p>
              
              <div className={styles.contactItems}>
                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Mail className={styles.icon} />
                  </div>
                  <div className={styles.contactText}>
                    <h3>Email Us</h3>
                    <p>youandmefashionfusion@gmail.com</p>
                    <span>We'll reply within 24 hours</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Phone className={styles.icon} />
                  </div>
                  <div className={styles.contactText}>
                    <h3>Call Us</h3>
                    <p>+91 9891565936</p>
                    <p>Owner: Divya Katiyar</p>
                    <span>Mon-Fri from 9am to 6pm</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <MapPin className={styles.icon} />
                  </div>
                  <div className={styles.contactText}>
                    <h3>Visit Us</h3>
                    <p>G-65, Sector 63</p>
                    <p>Noida, UP 201301</p>
                    <span>Showroom available by appointment</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.iconWrapper}>
                    <Clock className={styles.icon} />
                  </div>
                  <div className={styles.contactText}>
                    <h3>Store Hours</h3>
                    <p>Monday - Friday: 10AM - 7PM</p>
                    <p>Saturday: 11AM - 6PM</p>
                    <p>Sunday: 12PM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Message */}
            <div className={styles.brandMessage}>
              <Heart className={styles.heartIcon} />
              <h3>Your Story, Our Craft</h3>
              <p>At U n Me Jewelry, every piece tells a story. Whether you're looking for a custom design, need assistance with an existing piece, or just want to learn more about our collections, we're here to help bring your vision to life.</p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className={styles.formSection} data-aos="fade-left">
            <div className={styles.formCard}>
              <h2>Send us a Message</h2>
              <form className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <Phone className={styles.inputIcon} />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.textareaWrapper}>
                    <Mail className={styles.inputIcon} />
                    <textarea 
                      placeholder="Your Message..." 
                      className={styles.formTextarea}
                      rows="5"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <select className={styles.formSelect}>
                    <option value="">Select Inquiry Type</option>
                    <option value="custom">Custom Jewelry</option>
                    <option value="repair">Jewelry Repair</option>
                    <option value="support">Customer Support</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button type="submit" className={styles.submitButton}>
                  <Send className={styles.buttonIcon} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className={styles.mapSection} data-aos="fade-up">
        <div className={styles.container}>
          <div className={styles.mapContainer}>
            <h2>Visit Our Store</h2>
            <div className={styles.mapPlaceholder}>
              <MapPin className={styles.mapIcon} />
              <p>Interactive Map Would Appear Here</p>
              <span>G-65, Sector 63, Noida, UP 201301</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact