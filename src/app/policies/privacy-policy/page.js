import React from 'react'
import styles from '../policy.module.css'

export const metadata = {
  title: "Privacy Policy | U n Me Jewelry",
  description: "Learn how U n Me Jewelry protects your privacy. Our commitment to safeguarding your personal information and ensuring secure online shopping for luxury jewelry.",
  keywords: [
    "Jewelry Privacy Policy",
    "U n Me Jewelry Privacy",
    "Luxury Jewelry Data Protection",
    "Jewelry Website Privacy",
    "Gold Jewelry Privacy",
    "Diamond Jewelry Security",
    "Jewelry Personal Information"
  ],
  openGraph: {
    title: "Privacy Policy | U n Me Jewelry",
    description: "Learn how U n Me Jewelry protects your privacy and ensures secure online shopping for luxury jewelry.",
    url: "https://unmejewels.com/policies/privacy-policy",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Privacy Policy",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/policies/privacy-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | U n Me Jewelry",
    description: "Learn how U n Me Jewelry protects your privacy and ensures secure online shopping.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const page = () => {
  return (
    <div className={styles.policy}>
      <h1 data-aos="fade-right">Privacy Policy</h1>
      
      <div className={styles.highlight} data-aos="fade-up">
        <p>At U n Me Jewelry, we are committed to protecting your privacy and ensuring the security of your personal information. This policy outlines how we collect, use, and safeguard your data when you visit our jewelry boutique.</p>
      </div>

      <p className={styles.bold} data-aos="fade-right">SECTION 1 – WHAT DO WE DO WITH YOUR INFORMATION?</p>
      <p data-aos="fade-up">When you purchase jewelry from our boutique, we collect the personal information you provide, such as your name, address, email address, and jewelry preferences. This helps us create personalized experiences and ensure your precious pieces are delivered securely.</p>
      <p data-aos="fade-up">When you browse our collection, we automatically receive your device's internet protocol (IP) address to help us understand your browser and provide optimal shopping experience. With your permission, we may send you emails about new jewelry collections, exclusive offers, and jewelry care tips.</p>

      <p className={styles.bold} data-aos="fade-right">SECTION 2 – CONSENT</p>
      <p data-aos="fade-up">When you provide personal information to complete a jewelry purchase, verify your payment, arrange for secure delivery of your precious items, we imply that you consent to our collecting it for that specific purpose.</p>
      <p data-aos="fade-up">If we ask for your personal information for marketing purposes like sharing new jewelry collections or exclusive events, we will either ask you directly for your expressed consent or provide you with an opportunity to decline.</p>
      <p data-aos="fade-up">You may withdraw your consent for us to contact you at any time by contacting us at <a href="mailto:privacy@unmejewels.com">privacy@unmejewels.com</a>.</p>

      <p className={styles.bold} data-aos="fade-right">SECTION 3 – DISCLOSURE</p>
      <p data-aos="fade-up">We may disclose your personal information if required by law or if you violate our Terms of Service. Your trust is precious to us, and we treat your information with the same care we give to our fine jewelry.</p>

      <p className={styles.bold}>SECTION 4 – THIRD-PARTY SERVICES</p>
      <p>Our third-party providers (payment processors, shipping partners) only collect, use, and disclose your information to perform services they provide to us. We recommend reviewing their privacy policies to understand how they handle your personal information.</p>
      <p>Certain providers may be located in different jurisdictions. If you proceed with a transaction involving third-party services, your information may become subject to the laws of those jurisdictions.</p>

      <p className={styles.bold}>SECTION 5 – SECURITY</p>
      <p>We follow industry best practices to protect your personal information. All sensitive information, including credit card data, is encrypted using secure socket layer technology (SSL) and stored with AES-256 encryption. We adhere to all PCI-DSS requirements to ensure your data remains secure.</p>

      <p className={styles.bold}>SECTION 6 – COOKIES</p>
      <p>We use cookies to enhance your shopping experience. These help us remember your preferences, jewelry interests, and cart contents. You can choose to opt-out of cookies through your browser settings.</p>

      <p className={styles.bold}>SECTION 7 – AGE OF CONSENT</p>
      <p>By using our boutique, you represent that you are at least the age of majority in your state or province of residence, or that you have given us consent to allow any minor dependents to use this site under your supervision.</p>

      <p className={styles.bold}>SECTION 8 – CHANGES TO THIS PRIVACY POLICY</p>
      <p>We reserve the right to modify this privacy policy at any time. Changes take effect immediately upon posting. We will notify you of significant changes to ensure you're aware of what information we collect and how we use it.</p>

      <div className={styles.contactInfo}>
        <p className={styles.bold}>QUESTIONS AND CONTACT INFORMATION</p>
        <p>If you would like to access, correct, amend, or delete any personal information we have about you, register a complaint, or simply want more information, contact our Privacy Compliance Officer at <a href="mailto:privacy@unmejewels.com">privacy@unmejewels.com</a>.</p>
      </div>
    </div>
  )
}

export default page