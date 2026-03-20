'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import styles from './Header.module.css';
import { Heart, Menu, ShoppingCart, LogOut, X, Search, ChevronDown, ChevronUp, User } from 'lucide-react';
import { checkAuthStatus, logoutUser } from '../../src/lib/slices/authSlice';
import logo from '../../images/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, openCart } from '../../src/lib/slices/cartSlice';
import { fetchWishlist } from '../../src/lib/slices/wishlistSlice';
import CartDrawer from '../CartDrawer.js/CartDrawer';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import OfferPopup from '../OfferPopup/OfferPopup';

const Header = ({ collections }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);

  const cart = useSelector((state) => state.cart.items);
  const wishlist = useSelector((state) => state.wishlist.items);
  const { offerToast999, offerToast1499 } = useSelector(state => state.cart);
  const { showOfferPopup999, showOfferPopup1499 } = useSelector(state => state.cart);

  // Refs for handling outside clicks
  const dropdownRefs = useRef({});
  const mobileDropdownRefs = useRef({});

  useEffect(() => {
    if (offerToast1499) {
      toast.success(offerToast1499, { style: { background: '#333', color: '#fff' } });
    }
    if (offerToast999) {
      toast.success(offerToast999, { style: { background: '#333', color: '#fff' } });
    }
  }, [offerToast999, offerToast1499]);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Desktop dropdowns
      if (openDropdown) {
        const ref = dropdownRefs.current[openDropdown];
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null);
        }
      }

      // Mobile dropdowns
      if (mobileOpenDropdown) {
        const ref = mobileDropdownRefs.current[mobileOpenDropdown];
        if (ref && !ref.contains(event.target)) {
          setMobileOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, mobileOpenDropdown]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleDropdownHover = (index) => {
    if (window.innerWidth > 1024) {
      setOpenDropdown(openDropdown === index ? null : index);
    }
  };

  const handleMobileDropdownClick = (index) => {
    setMobileOpenDropdown(mobileOpenDropdown === index ? null : index);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleKeyDown = (event) => {
    if (event?.key === 'Enter') {
      window.location.href = `/search?search=${search}`;
      setSearch("");
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {showOfferPopup1499 && <OfferPopup type='1499' />}
        {showOfferPopup999 && <OfferPopup type='999' />}
        {/* Promo Banner */}
        <div className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <p className={styles.promoText}>
              Get 3 Items @999
            </p>
            <Link href="/collections" className={styles.shopNowLink}>
              Get Now →
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className={styles.mainNav}>
          <div className={styles.navContainer}>
            {/* Logo */}
            <div className={styles.logoWrapper}>
              {/* Mobile Navigation */}
              <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
                <X size={20} className={styles.closeIcon1} onClick={toggleMenu} />

                <div className={styles.mobileNavContent}>
                  {/* Collections */}
                  <div className={styles.mobileLinksSection}>
                    <h3 className={styles.mobileHeading}>Collections</h3>
                    <ul className={styles.mobileNavLinks}>
                      <li
                        className={`${styles.offerSaleNavItem}`}
                      >
                        <Link
                          href={'/valentines-sale'}
                          className={styles.navLink}
                          onClick={() => {
                            toggleMenu();
                            setMobileOpenDropdown(null);
                          }}
                        >
                          Women's Day Sale
                        </Link>
                      </li>
                      {collections?.map((collection, index) => (
                        <li
                          key={collection.handle}
                          ref={el => mobileDropdownRefs.current[index] = el}
                        >
                          <div className={styles.mobileMenuHeader}>
                            <Link
                              href={`/collections/${collection?.handle}`}
                              onClick={() => {
                                toggleMenu();
                                setMobileOpenDropdown(null);
                              }}
                              className={styles.mobileNavLink}
                            >
                              {collection.title}
                            </Link>
                            {collection.types && collection.types.length > 0 && (
                              <button
                                className={styles.mobileDropdownToggle}
                                onClick={() => handleMobileDropdownClick(index)}
                              >
                                {mobileOpenDropdown === index ? (
                                  <ChevronUp size={18} />
                                ) : (
                                  <ChevronDown size={18} />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Mobile Dropdown */}
                          {collection.types && collection.types.length > 0 && (
                            <div
                              className={`${styles.mobileDropdownMenu} ${mobileOpenDropdown === index ? styles.mobileDropdownOpen : ''}`}
                            >
                              {collection.types.map((item) => (
                                <Link
                                  key={item}
                                  href={`/collections/${collection?.handle}?type=${item}`}
                                  onClick={() => {
                                    toggleMenu();
                                    setMobileOpenDropdown(null);
                                  }}
                                  className={styles.mobileDropdownLink}
                                >
                                  {item}
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                      <li>
                        <Link href="/wishlist" onClick={toggleMenu} className={styles.mobileNavLink}>
                          Wishlist ({wishlist.length})
                        </Link>
                      </li>
                      <li className={styles.mobileLoginButton}>
                        <Link href="/profile" onClick={toggleMenu} className={styles.mobileNavLink}>
                          Profile
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ''}`}
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X className={`${styles.iconButton} ${styles.closeIcon}`} /> : <Menu className={styles.iconButton} />}
              </button>

              {isMenuOpen && <div className={styles.mobileOverlay} onClick={toggleMenu} />}
              <Link href="/">
                <Image className={styles.logo} src={logo} alt="U & Me Logo" title='UnMe Logo' width={140} height={56} priority />
              </Link>
            </div>
            <div className={`${styles.searchBar} ${isSearchOpen ? styles.searchOpen : ''}`}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search for jewelry, collections..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button style={{ opacity: search?.length > 0 ? "1" : "0" }} className={styles.searchClose} onClick={() => setIsSearchOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}


            {/* Desktop Icons */}
            <div className={styles.navActions}>
              {/* <button
                className={styles.searchButton}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className={styles.iconButton} />
              </button> */}

              <Link href="/wishlist" className={styles.iconLink}>
                <div className={styles.iconWrapper}>
                  <Heart className={styles.iconButton} />
                  {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
                </div>
              </Link>

              <button
                className={styles.iconLink}
                onClick={() => dispatch(openCart())}
              >
                <div className={styles.iconWrapper}>
                  <ShoppingCart className={styles.iconButton} />
                  {totalCartItems > 0 && <span className={styles.badge}>{totalCartItems}</span>}
                </div>
              </button>

              <Link href="/profile" className={styles.iconWrapper}>
                <User className={styles.iconButton} />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className={styles.mobileActions}>

              <Link href="/wishlist" className={styles.iconLink}>
                <div className={styles.iconWrapper}>
                  <Heart className={styles.iconButton} />
                  {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
                </div>
              </Link>

              <button
                className={styles.iconLink}
                onClick={() => dispatch(openCart())}
              >
                <div className={styles.iconWrapper}>
                  <ShoppingCart className={styles.iconButton} />
                  {totalCartItems > 0 && <span className={styles.badge}>{totalCartItems}</span>}
                </div>
              </button>
              <Link href="/profile" className={styles.iconWrapper}>
                <User className={styles.iconButton} />
              </Link>


            </div>
          </div>
          <ul className={styles.navLinks}>
            {collections?.map((collection, index) => (
              <li
                key={collection.handle}
                className={styles.navItem}
                onMouseEnter={() => handleDropdownHover(index)}
                onMouseLeave={() => setOpenDropdown(null)}
                ref={el => dropdownRefs.current[index] = el}
              >
                <Link
                  href={`/collections/${collection?.handle}`}
                  className={styles.navLink}
                >
                  {collection.title}
                  {collection.types && collection.types.length > 0 && (
                    <ChevronDown className={styles.chevronIcon} size={16} />
                  )}
                </Link>

                {/* Desktop Dropdown */}
                {collection.types && collection.types.length > 0 && (
                  <div
                    className={`${styles.dropdownMenu} ${openDropdown === index ? styles.dropdownOpen : ''}`}
                  >
                    <div className={styles.dropdownContent}>
                      {collection.types.map((item) => (
                        <Link
                          key={item}
                          href={`/collections/${collection?.handle}?type=${item}`}
                          className={styles.dropdownLink}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>

            ))}
            {/* <li
                className={styles.navItem}
              >
                <Link
                  href={'/collections'}
                  className={styles.navLink}
                >
                  Collections
                </Link>
              </li> */}
            <li
              className={`${styles.navItem} ${styles.offerSaleNavItem}`}
            >
              <Link
                href={'/valentines-sale'}
                className={styles.navLink}
              >
                Women's Day Sale
              </Link>
            </li>
          </ul>

          {/* Search Bar */}
          <div className={`${styles.searchBar} ${styles.searchBarMobile}`}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for jewelry, collections..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button style={{ opacity: search?.length > 0 ? "1" : "0" }} className={styles.searchClose} onClick={() => setIsSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>


        </nav>

        <CartDrawer />
      </header>

      {/* 📱 Mobile Bottom Navigation */}
      {/* <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex justify-around items-center py-2">
            <button
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <span className="text-xs mt-1 font-medium">Search</span>
            </button>

            <Link
              href="/cart"
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors duration-200 relative"
            >
              <span className="absolute -top-1 right-2 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
               0
              </span>
              <span className="text-xs mt-1 font-medium">Cart</span>
            </Link>

            <Link
              href="/"
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <span className="text-xs mt-1 font-medium">Home</span>
            </Link>

            <Link
              href="/blogs"
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <span className="text-xs mt-1 font-medium">Blogs</span>
            </Link>

             <Link
                href="/user-profile"
                className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <span className="text-xs mt-1 font-medium">Profile</span>
              </Link>
          </div>
        </div> */}

    </>
  );
};

export default Header;