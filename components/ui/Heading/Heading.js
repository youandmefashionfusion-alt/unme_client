// components/ui/Heading/Heading.jsx
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './Heading.module.css';

const Heading = ({ 
  title, 
  subtitle, 
  align = 'center', // 'left', 'center', 'right'
  viewAllLink, 
  viewAllText = 'View All',
  underline = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.headingWrapper} ${styles[`heading${align}`]} ${className}`} {...props}>
      <div className={styles.titleContainer}>
        <h2 className="text-black text-center text-[20px] font-bold">{title}</h2>
        {/* {underline && <div className={styles.titleUnderline} />} */}
      </div>
      
      {subtitle && (
        <p className="text-black text-center text-[15px]">{subtitle}</p>
      )}
      
      {viewAllLink && (
        <Link href={viewAllLink} className={styles.viewAllLink}>
          <span>{viewAllText}</span>
          <ChevronRight size={16} className={styles.viewAllIcon} />
        </Link>
      )}
    </div>
  );
};

export default Heading;