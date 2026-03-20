// components/Pagination.js
"use client";
import React from "react";
import styles from "./Pagination.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxVisiblePages = 5 
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={styles.pagination}>
      {/* Previous Button */}
      <button
        className={`${styles.pageButton} ${styles.navButton}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft/>
      </button>

      {/* First Page + Ellipsis */}
      {!visiblePages.includes(1) && (
        <>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {/* Page Numbers */}
      {visiblePages.map(page => (
        <button
          key={page}
          className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {/* Last Page + Ellipsis */}
      {!visiblePages.includes(totalPages) && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className={styles.ellipsis}>...</span>
          )}
          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        className={`${styles.pageButton} ${styles.navButton}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight/>
      </button>
    </div>
  );
};

export default Pagination;