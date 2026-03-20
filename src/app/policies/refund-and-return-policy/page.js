import React from 'react'
import styles from '../policy.module.css'

export const metadata = {
  title: "Return & Exchange Policy | U n Me Jewelry",
  description: "Learn about U n Me Jewelry's return and exchange policy for luxury jewelry. We ensure your complete satisfaction with our handcrafted pieces.",
  keywords: [
    "Jewelry Return Policy",
    "U n Me Jewelry Returns",
    "Luxury Jewelry Exchange",
    "Jewelry Warranty",
    "Gold Jewelry Returns",
    "Diamond Jewelry Exchange",
    "Jewelry Repair Policy"
  ],
  openGraph: {
    title: "Return & Exchange Policy | U n Me Jewelry",
    description: "Learn about our return and exchange policy for luxury handcrafted jewelry at U n Me Jewelry.",
    url: "https://unmejewels.com/policies/refund-and-return-policy",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Return Policy",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/policies/refund-and-return-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Return & Exchange Policy | U n Me Jewelry",
    description: "Learn about our return and exchange policy for luxury handcrafted jewelry.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const page = () => {
  return (
    <div className={styles.policy}>
      <h1 data-aos="fade-right">Return & Exchange Policy</h1>
      
      <div className={styles.highlight} data-aos="fade-up">
        <p>At U n Me Jewelry, your satisfaction with our handcrafted pieces is our highest priority. Each jewelry item is crafted with love and attention to detail, and we want you to be completely delighted with your purchase.</p>
      </div>

      <p className={styles.bold} data-aos="fade-right">RETURNS & EXCHANGES</p>
      <p data-aos="fade-up">We offer exchanges within 14 days of receiving your order. If you are not completely satisfied with your jewelry piece, please contact us to arrange for an exchange for another item of equal value.</p>
      
      <p className={styles.bold} data-aos="fade-right">DEFECTIVE PRODUCTS</p>
      <p data-aos="fade-up">In the rare event that you receive a defective jewelry item, we will arrange for a replacement at no additional cost. All our pieces undergo strict quality control, but if any issue arises, we're here to make it right.</p>
      
      <p className={styles.bold}>CONDITION REQUIREMENTS</p>
      <p>All returns must be authorized by U n Me Jewelry and must be returned in their original, unworn condition with all tags, certificates, and packaging intact. Jewelry that shows signs of wear or damage cannot be accepted for exchange.</p>
      
      <p className={styles.bold}>CUSTOM & PERSONALIZED JEWELRY</p>
      <p>Custom-made, engraved, or personalized jewelry pieces cannot be exchanged or returned due to their unique nature. We ensure thorough communication during the customization process to guarantee your complete satisfaction.</p>
      
      <p className={styles.bold}>JEWELRY WARRANTY</p>
      <p>All our jewelry comes with a 1-year warranty against manufacturing defects. This warranty covers issues related to craftsmanship but does not cover normal wear and tear, loss, or damage due to improper care.</p>

      <div className={styles.contactInfo}>
        <p className={styles.bold}>CONTACT US</p>
        <p>If you have any questions about our return policy or need assistance with an exchange, please contact our customer care team at <a href="mailto:support@unmejewels.com">support@unmejewels.com</a>. We're here to ensure your U n Me Jewelry experience is exceptional.</p>
      </div>
    </div>
  )
}

export default page