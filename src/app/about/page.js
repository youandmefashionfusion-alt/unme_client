import React from 'react'
import styles from './about.module.css'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: "About Us | U n Me",
  description: "Discover the story behind U n Me Jewelry. We create meaningful, handcrafted jewelry that tells your unique story through every sparkle and detail.",
  keywords: [
    "About U n Me Jewelry",
    "Jewelry Brand Story",
    "Handcrafted Jewelry",
    "Meaningful Jewelry",
    "Luxury Jewelry Brand",
    "Gold Jewelry",
    "Silver Jewelry",
    "Diamond Jewelry"
  ],
  openGraph: {
    title: "About Us | U n Me Jewelry",
    description: "Discover the story behind U n Me Jewelry. We create meaningful, handcrafted jewelry that tells your unique story through every sparkle and detail.",
    url: "https://unmejewels.com/about",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "About U n Me Jewelry",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://unmejewels.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | U n Me Jewelry",
    description: "Discover the story behind U n Me Jewelry. We create meaningful, handcrafted jewelry that tells your unique story.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
}

const AboutPage = () => {
  const values = [
    {
      icon: "✨",
      title: "Timeless Craftsmanship",
      description: "Every piece is meticulously handcrafted by skilled artisans who pour their heart into creating jewelry that lasts generations."
    },
    {
      icon: "💫",
      title: "Anti-Tarnish Promise",
      description: "Our jewelry is designed to stay radiant forever. No dullness, no fading — only shine that stays with you, season after season."
    },
    {
      icon: "❤️",
      title: "Skin-Friendly Materials",
      description: "We use hypoallergenic materials that are kind to your skin, so you can wear our pieces all day, every day, without worry."
    }
  ]

  const features = [
    {
      icon: "🌟",
      title: "Handcrafted Excellence",
      description: "Each piece is uniquely crafted"
    },
    {
      icon: "💎",
      title: "Premium Materials",
      description: "Only the finest metals and gems"
    },
    {
      icon: "🛡️",
      title: "Lifetime Shine",
      description: "Anti-tarnish guarantee"
    },
    {
      icon: "🎁",
      title: "Beautiful Packaging",
      description: "Gift-ready in elegant boxes"
    }
  ]

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent} data-aos="fade-up">
            <h1 className={styles.heroTitle}>About Us</h1>
            <h2 className={styles.heroSubtitle}>
              Stories in Every Sparkle
            </h2>
            <p className={styles.heroText}>
              At U n Me, we believe jewellery isn't just an accessory — it's a storyteller. 
              It holds your firsts, your farewells, your unspoken feelings, and your forever memories.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyContent} data-aos="fade-right">
              <h2 className={styles.storyTitle}>
                Welcome to <span>U n Me</span>
              </h2>
              <p className={styles.storyParagraph}>
                At U n Me, we believe every piece of jewelry should tell a story — yours and ours, 
                woven together in timeless sparkle. We craft elegant, anti-tarnish jewelry designed 
                to celebrate the everyday moments and the once-in-a-lifetime milestones.
              </p>
              <p className={styles.storyParagraph}>
                Our pieces are made to last — just like the memories they hold. No dullness, no fading — 
                only shine that stays with you, season after season. Because we know your jewelry isn't 
                just an accessory; it's a part of you, a whisper of love, a reminder of dreams, 
                a promise between U n Me.
              </p>
              <p className={styles.storyParagraph}>
                Born from the idea that luxury should be effortless and stories should never fade, 
                we create demi-fine jewelry that is beautiful, durable, and kind to your skin. 
                Whether it's a gift for someone special or a token of self-love, our designs are 
                made to be worn every day, without worry.
              </p>
            </div>
            <div className={styles.storyImageWrapper} data-aos="fade-left">
              <Image 
                src="https://cdn.shopify.com/s/files/1/0652/8542/3187/files/IMG_0480.heic?v=1752684373" 
                alt="U n Me Jewelry Collection" 
                title="U n Me About" 
                width={600}
                height={800}
                className={styles.storyImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">
            Our Promise to You
          </h2>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div 
                key={index} 
                className={styles.valueCard} 
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <span className={styles.valueIcon}>{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={styles.featureItem}
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent} data-aos="fade-up">
            <h2 className={styles.missionTitle}>Our Mission</h2>
            <p className={styles.missionText}>
              "To create jewelry that stays as radiant as your story. Because with U n Me, 
              there's a sparkle in every moment — and it never fades."
            </p>
            <p className={styles.missionSignature}>
              — The U n Me Team
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage