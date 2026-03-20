// components/Home/Home.jsx
"use client";

import dynamic from 'next/dynamic';
import LazyLoader from '../LazyLoader';
import ReviewsList from './Reviews/ReviewsList';

// Dynamic imports with loading states
const BlogCarousel = dynamic(() => import("./BlogCarousel/BlogCarousel"), { ssr: false });
const Perks = dynamic(() => import("./Perks/Perks"), { ssr: false });
const PromoCards = dynamic(() => import("./PromoSection/PromoSection"), { ssr: false });

const Home = ({banner}) => {
  return (
    <>
      {/*<LazyLoader>
        <PromoCards />
      </LazyLoader>*/}

      <LazyLoader>
        <ReviewsList />
      </LazyLoader>

      {/* <LazyLoader>
        <BlogCarousel />
      </LazyLoader> */}

      <LazyLoader>
        <Perks banner={banner}/>
      </LazyLoader>
    </>
  );
}

export default Home;