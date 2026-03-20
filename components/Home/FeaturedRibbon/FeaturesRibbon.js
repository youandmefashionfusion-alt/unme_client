// components/FeaturesRibbon.tsx
import React from 'react';
import styles from './FeaturesRibbon.module.css';

const FeaturesRibbon = ({ variant = 'default' }) => {
    const features = [
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
        '5k+ Happy Customers | Hypoallergenic | Ships in 24 hours',
    ];

    // Determine variant class
    const variantClass = 
        variant === 'dark' ? styles.darkVariant : 
        variant === 'minimal' ? styles.minimalVariant : 
        '';

    return (
        <section className={styles.ribbonSection}>
            <div className={`${styles.ribbonContainer} ${variantClass}`}>
                <div className={styles.scrollingContent}>
                    {/* First set */}
                    <div className={styles.featuresList}>
                        {features?.map((feature, index) => (
                            <div key={`first-${index}`} className={styles.featureItem}>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                    
                    {/* Duplicate set for seamless loop */}
                    <div className={styles.featuresList}>
                        {features?.map((feature, index) => (
                            <div key={`second-${index}`} className={styles.featureItem}>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesRibbon;