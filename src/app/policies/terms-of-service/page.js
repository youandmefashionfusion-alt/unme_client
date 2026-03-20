import React from 'react'
import styles from '../policy.module.css'

export const metadata = {
  title: "Terms of Service | U n Me Jewelry",
  description: "Read U n Me Jewelry's Terms of Service. Learn about our policies for purchasing luxury handcrafted jewelry and using our online boutique.",
  keywords: [
    "Jewelry Terms of Service",
    "U n Me Jewelry Terms",
    "Luxury Jewelry Policies",
    "Jewelry Purchase Terms",
    "Gold Jewelry Policies",
    "Diamond Jewelry Terms",
    "Jewelry Boutique Policies"
  ],
  openGraph: {
    title: "Terms of Service | U n Me Jewelry",
    description: "Read our Terms of Service for purchasing luxury handcrafted jewelry from U n Me Jewelry.",
    url: "https://unmejewels.com/policies/terms-of-service",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Terms of Service",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/policies/terms-of-service",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | U n Me Jewelry",
    description: "Read our Terms of Service for purchasing luxury handcrafted jewelry.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const page = () => {
  return (
    <div className={styles.policy}>
      <h1 data-aos="fade-right">Terms of Service</h1>
      
      <div className={styles.highlight} data-aos="fade-up">
        <p>Welcome to U n Me Jewelry, your destination for meaningful, handcrafted jewelry that tells your story. Please read these terms carefully before using our boutique. By accessing our website, you agree to comply with these terms.</p>
      </div>

      <p className={styles.bold} data-aos="fade-right">1. ACCEPTANCE OF TERMS</p>
      <p data-aos="fade-up">By accessing or using U n Me Jewelry, you agree to be bound by these terms and conditions. These terms apply to all users of our boutique, including browsers, customers, and content contributors.</p>

      <p className={styles.bold}>2. JEWELRY BOUTIQUE TERMS</p>
      <p>2.1. You confirm that you are at least the age of majority in your state or province of residence, or that you have given us consent to allow any minor dependents to use this site under your supervision.</p>
      <p>2.2. You may not use our jewelry products for any illegal or unauthorized purpose.</p>
      <p>2.3. You must not transmit any malicious code or engage in any activity that could harm our boutique or other customers.</p>
      <p>2.4. A breach of these terms will result in immediate termination of your access to our services.</p>

      <p className={styles.bold}>3. PERSONAL INFORMATION</p>
      <p>Your submission of personal information through our boutique is governed by our Privacy Policy, which ensures the protection of your data when purchasing our precious jewelry items.</p>

      <p className={styles.bold}>4. PRODUCT DESCRIPTIONS & IMAGES</p>
      <p>We make every effort to display our jewelry as accurately as possible. However, the colors and details you see depend on your monitor and may vary slightly. All jewelry weights and measurements are approximate.</p>

      <p className={styles.bold}>5. PRICING & AVAILABILITY</p>
      <p>Prices for our handcrafted jewelry are subject to change without notice. We reserve the right to modify or discontinue any jewelry collection without notice. Limited edition pieces are subject to availability.</p>

      <p className={styles.bold}>6. JEWELRY CARE & MAINTENANCE</p>
      <p>While we provide care instructions with each piece, proper jewelry maintenance is the responsibility of the owner. We are not liable for damage resulting from improper care, wear, or storage of jewelry items.</p>

      <p className={styles.bold}>7. GOVERNING LAW</p>
      <p>These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes shall be subject to the exclusive jurisdiction of the appropriate courts.</p>

      <div className={styles.contactInfo}>
        <p className={styles.bold}>8. CONTACT INFORMATION</p>
        <p>If you have any questions about these terms, please contact us at <a href="mailto:support@unmejewels.com">support@unmejewels.com</a>. We're here to ensure your U n Me Jewelry experience is as beautiful as our pieces.</p>
      </div>
    </div>
  )
}

export default page