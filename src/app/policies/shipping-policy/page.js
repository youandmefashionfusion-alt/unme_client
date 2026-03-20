import React from 'react'
import styles from '../policy.module.css'

export const metadata = {
  title: "Shipping Policy | U n Me Jewelry",
  description: "Learn about U n Me Jewelry's secure shipping methods for luxury jewelry. We ensure safe and insured delivery of your precious handcrafted pieces.",
  keywords: [
    "Jewelry Shipping",
    "U n Me Jewelry Delivery",
    "Luxury Jewelry Shipping",
    "Gold Jewelry Delivery",
    "Diamond Jewelry Shipping",
    "Secure Jewelry Transport",
    "Jewelry Insurance"
  ],
  openGraph: {
    title: "Shipping Policy | U n Me Jewelry",
    description: "Learn about our secure shipping methods for luxury handcrafted jewelry with insured delivery.",
    url: "https://unmejewels.com/policies/shipping-policy",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Shipping Policy",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/policies/shipping-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy | U n Me Jewelry",
    description: "Learn about our secure shipping methods for luxury handcrafted jewelry.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const page = () => {
  return (
    <div className={styles.policy}>
      <h1 data-aos="fade-right">Shipping Policy</h1>
      
      <div className={styles.highlight} data-aos="fade-up">
        <p>At U n Me Jewelry, we understand that your precious jewelry deserves the utmost care in handling and delivery. That's why we partner with trusted shipping providers to ensure your handcrafted pieces arrive safely and securely.</p>
      </div>

      <p className={styles.bold} data-aos="fade-right">ORDER PROCESSING</p>
      <p data-aos="fade-up">All jewelry orders are carefully processed within 1-2 business days. Each piece undergoes final quality inspection and is meticulously packaged in our signature jewelry boxes before shipping.</p>
      
      <p className={styles.bold}>DELIVERY TIMELINE</p>
      <p>Domestic orders are typically delivered within 3-7 business days. International shipping times vary by destination but generally take 7-14 business days. You will receive tracking information once your order ships.</p>
      
      <p className={styles.bold}>SECURE PACKAGING</p>
      <p>Every jewelry item is packaged in our discreet, secure boxes with protective padding to prevent damage during transit. High-value pieces are shipped with additional security measures and insurance.</p>
      
      <p className={styles.bold}>INSURANCE & SIGNATURE REQUIREMENT</p>
      <p>All jewelry shipments over $500 are automatically insured and require signature confirmation upon delivery to ensure your precious items are received safely.</p>
      
      <p className={styles.bold}>INTERNATIONAL SHIPPING</p>
      <p>We ship worldwide! International customers are responsible for any customs duties, taxes, or import fees that may apply in their country. These charges are not included in the shipping cost.</p>
      
      <p className={styles.bold}>ORDER TRACKING</p>
      <p>Once your order ships, you will receive a tracking number via email. You can use this to monitor your package's journey until it reaches your hands.</p>

      <div className={styles.contactInfo}>
        <p className={styles.bold}>NEED ASSISTANCE?</p>
        <p>If you have any questions about shipping or need to make special delivery arrangements, please contact us at <a href="mailto:shipping@unmejewels.com">shipping@unmejewels.com</a>. We're committed to ensuring your U n Me Jewelry arrives perfectly.</p>
      </div>
    </div>
  )
}

export default page