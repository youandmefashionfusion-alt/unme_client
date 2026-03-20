"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "../src/app/collections/[cid]/collections.module.css";
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCard from "./ui/productCard/ProductCard";
import { GTM } from "@/lib/gtm";

// ── Skeleton card for loading state ─────────────────────────────────────────
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLineShort} />
      <div className={styles.skeletonPrice} />
    </div>
  </div>
);

const SearchProducts = ({ data, searchQuery }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [products, setProducts]           = useState(data?.products || []);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(data?.pagination?.totalPages > 1);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    genders: [], colors: [], materials: [], types: [],
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [sort, setSort]               = useState("-createdAt");
  const [expandedSections, setExpandedSections] = useState(["genders", "colors", "materials", "types"]);

  // ── Refs ───────────────────────────────────────────────────────────────────
  // Use a ref for the fetching guard so it's never stale inside callbacks
  const isFetchingRef = useRef(false);
  const loaderRef     = useRef(null);
  // Keep live copies of state for use inside the IntersectionObserver callback
  const hasMoreRef    = useRef(hasMore);
  const pageRef       = useRef(page);

  useEffect(() => { hasMoreRef.current  = hasMore; }, [hasMore]);
  useEffect(() => { pageRef.current     = page;    }, [page]);

  // ── Initialise filters from URL ────────────────────────────────────────────
  useEffect(() => {
    const newFilters = {
      genders:   (searchParams.get("gender")   || "").split(",").filter(Boolean),
      colors:    (searchParams.get("color")    || "").split(",").filter(Boolean),
      materials: (searchParams.get("material") || "").split(",").filter(Boolean),
      types:     (searchParams.get("type")     || "").split(",").filter(Boolean),
    };
    setFilters(newFilters);
    setTempFilters(newFilters);
    setSort(searchParams.get("sort") || "-createdAt");
  }, [searchParams]);

  // ── Reset when server data changes (filter/sort navigation) ───────────────
  useEffect(() => {
    setProducts(data?.products || []);
    setPage(1);
    setHasMore(data?.pagination?.totalPages > 1);
    isFetchingRef.current = false; // always reset guard on fresh data
  }, [data]);

  // ── Build API URL ──────────────────────────────────────────────────────────
  const buildApiUrl = useCallback((nextPage) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_PORT}products/search`);
    url.searchParams.set("search",  searchQuery);
    url.searchParams.set("page",    nextPage);
    url.searchParams.set("state",   "active");
    if (sort)                  url.searchParams.set("sort",      sort);
    if (filters.genders.length)   url.searchParams.set("gender",    filters.genders.join(","));
    if (filters.colors.length)    url.searchParams.set("color",     filters.colors.join(","));
    if (filters.materials.length) url.searchParams.set("material",  filters.materials.join(","));
    if (filters.types.length)     url.searchParams.set("type",      filters.types.join(","));
    return url.toString();
  }, [searchQuery, sort, filters]);

  // ── Load next page ─────────────────────────────────────────────────────────
  // IMPORTANT: does NOT list hasMore/loadingMore as deps — reads from refs instead
  // This prevents the stale-closure / double-fetch race condition
  const loadMoreProducts = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const res  = await fetch(buildApiUrl(nextPage));
      const json = await res.json();

      if (json.success) {
        setProducts(prev => {
          // Deduplicate by _id in case of race conditions
          const ids = new Set(prev.map(p => p._id));
          const fresh = json.products.filter(p => !ids.has(p._id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        setHasMore(nextPage < json.pagination.totalPages);
      }
    } catch (err) {
      console.error("Infinite scroll fetch failed:", err);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [buildApiUrl]);

  // ── Intersection Observer ──────────────────────────────────────────────────
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting + guard ref (not state) = no stale closure
        if (entry.isIntersecting && !isFetchingRef.current) {
          loadMoreProducts();
        }
      },
      {
        threshold:  0.1,        // fire as soon as 10 % of the div is visible
        rootMargin: "300px",    // start loading 300 px before the user reaches the bottom
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // Re-create observer whenever loadMoreProducts (which deps on filters/sort) changes
  }, [loadMoreProducts]);

  // ── URL helpers ────────────────────────────────────────────────────────────
  const updateURL = (f, s) => {
    const params = new URLSearchParams();
    params.set("search", searchQuery);
    if (f.genders.length)   params.set("gender",   f.genders.join(","));
    if (f.colors.length)    params.set("color",    f.colors.join(","));
    if (f.materials.length) params.set("material", f.materials.join(","));
    if (f.types.length)     params.set("type",     f.types.join(","));
    if (s && s !== "-createdAt") params.set("sort", s);
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    updateURL(tempFilters, sort);
    setShowMobileFilters(false);
  };

  const resetFilters = () => {
    const reset = { genders: [], colors: [], materials: [], types: [] };
    setFilters(reset);
    setTempFilters(reset);
    setSort("-createdAt");
    updateURL(reset, "-createdAt");
  };

  const handleSortChange = (e) => {
    const s = e.target.value;
    setSort(s);
    updateURL(filters, s);
  };

  const toggleFilter = (type, value) => {
    setTempFilters(prev => {
      const list = prev[type];
      return {
        ...prev,
        [type]: list.includes(value) ? list.filter(v => v !== value) : [...list, value],
      };
    });
  };

  const removeFilter = (type, value) => {
    const next = { ...filters, [type]: filters[type].filter(v => v !== value) };
    setFilters(next);
    setTempFilters(next);
    updateURL(next, sort);
  };

  const toggleSection = (s) =>
    setExpandedSections(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeFilterCount = filters.genders.length + filters.colors.length +
    filters.materials.length + filters.types.length;
  const totalResults = data?.pagination?.totalProducts || 0;

  // ── GTM ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (data?.products) {
      GTM.viewItemList(searchQuery, data.products.map(p => ({
        item_id: p._id, item_name: p.title,
        item_category: p.collectionName?.title || "Search", price: p.price,
      })));
    }
  }, [data, searchQuery]);

  // ── Shared filter panel markup ─────────────────────────────────────────────
  const FilterSections = ({ isMobile = false }) => (
    <>
      {[
        { key: "genders",   label: "Gender",   items: data?.filters?.genders   },
        { key: "colors",    label: "Color",    items: data?.filters?.colors    },
        { key: "materials", label: "Material", items: data?.filters?.materials },
        { key: "types",     label: "Type",     items: data?.filters?.types     },
      ].map(({ key, label, items }) =>
        items?.length > 0 ? (
          <div key={key} className={styles.filterSection}>
            <button
              className={styles.filterSectionHeader}
              onClick={() => !isMobile && toggleSection(key)}
            >
              <span>{label}</span>
              {!isMobile && (
                expandedSections.includes(key)
                  ? <ChevronUp size={13} />
                  : <ChevronDown size={13} />
              )}
            </button>
            {(isMobile || expandedSections.includes(key)) && (
              <div className={styles.filterSectionContent}>
                {items.map(item => (
                  <label key={item} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={tempFilters[key].includes(item)}
                      onChange={() => toggleFilter(key, item)}
                    />
                    <span className={styles.checkboxLabel}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : null
      )}
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.collectionPage}>
      <div className={styles.container}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <a href="/">Home</a>
          <span>/</span>
          <a href="/search">Search</a>
          <span>/</span>
          <span>{searchQuery}</span>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Search Results</h1>
            <p className={styles.stats}>
              <span className={styles.productCount}>{totalResults}</span>
              {" "}results for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        </div>

        {/* Mobile filter bar */}
        <div className={styles.mobileFilterBar}>
          <button
            className={styles.mobileFilterButton}
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>

          <select
            value={sort}
            onChange={handleSortChange}
            className={styles.mobileSortSelect}
          >
            <option value="-createdAt">Recommended</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="title">Name: A → Z</option>
            <option value="-title">Name: Z → A</option>
          </select>
        </div>

        {/* Main layout */}
        <div className={styles.mainLayout}>

          {/* ── Desktop sidebar ── */}
          <aside className={styles.filtersSidebar}>
            <div className={styles.filtersHeader}>
              <h3>Filter</h3>
              {activeFilterCount > 0 && (
                <button className={styles.resetButton} onClick={resetFilters}>
                  Clear all
                </button>
              )}
            </div>
            <FilterSections />
          </aside>

          {/* ── Products column ── */}
          <main className={styles.productsMain}>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.activeFilters}>
                {(["genders","colors","materials","types"]).map(type =>
                  filters[type].map(val => (
                    <span key={`${type}-${val}`} className={styles.filterPill}>
                      {val}
                      <button onClick={() => removeFilter(type, val)} aria-label={`Remove ${val}`}>
                        <X size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className={styles.sortWrapper}>
                <span className={styles.sortLabel}>Sort:</span>
                <select value={sort} onChange={handleSortChange} className={styles.sortSelect}>
                  <option value="-createdAt">Recommended</option>
                  <option value="price">Price: Low → High</option>
                  <option value="-price">Price: High → Low</option>
                  <option value="title">Name: A → Z</option>
                  <option value="-title">Name: Z → A</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {products.length > 0 ? (
              <>
                <div className={`${styles.productsGrid} ${styles.gridView}`}>
                  {products.map((product, i) => (
                    <div key={`${product._id}-${i}`} className={styles.productCardWrapper}>
                      <ProductCard product={product} />
                    </div>
                  ))}

                  {/* Skeleton cards shown inline while loading more */}
                  {loadingMore && Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={`skel-${i}`} />
                  ))}
                </div>

                {/*
                  CRITICAL FIX: The trigger element must ALWAYS be in the DOM when
                  hasMore=true, with guaranteed height, so IntersectionObserver can
                  fire. It must NOT be conditionally hidden or zero-height.
                */}
                {hasMore && (
                  <div ref={loaderRef} className={styles.scrollTrigger} aria-hidden="true" />
                )}

                {!hasMore && products.length > 0 && (
                  <div className={styles.endMessage}>
                    <span>You&apos;ve seen everything ✨</span>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noData}>
                <div className={styles.noDataIcon}>🔍</div>
                <p>No results for &ldquo;{searchQuery}&rdquo;</p>
                <p className={styles.noDataSub}>Try different keywords or clear your filters</p>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className={styles.clearAllBtn}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showMobileFilters && (
        <div className={styles.overlay} onClick={() => setShowMobileFilters(false)} />
      )}
      <div className={`${styles.mobileFilters} ${showMobileFilters ? styles.open : ""}`}>
        <div className={styles.mobileFiltersHeader}>
          <h3>Filters</h3>
          <button onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>
        <div className={styles.mobileFiltersContent}>
          <FilterSections isMobile />
        </div>
        <div className={styles.mobileFiltersFooter}>
          <button className={styles.resetButton} onClick={resetFilters}>Reset</button>
          <button className={styles.applyButton} onClick={applyFilters}>
            View {totalResults} Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchProducts;