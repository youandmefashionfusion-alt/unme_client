import CarouselSectionServer from "../../components/Home/CarouselSection/CarouselSectionServer";
import CategoriesServer from "../../components/Home/Categories/CategoriesServer";
import FeaturedCollectionServer from "../../components/Home/FeaturedCollection/FeaturedCollectionServer";
import FeaturesRibbon from "../../components/Home/FeaturedRibbon/FeaturesRibbon";
import HeroSection from "../../components/Home/HeroSection/HeroSection";
import Home from "../../components/Home/Home";
import ImageBannerSection from "../../components/Home/ImageBanner/ImageBannerSection";
import StatementPiece from "../../components/Home/StatementPiece/StatementPiece";
import InstagramReels from "../../components/Home/InstagramReels/InstagramReels";
import SaleProductsServer from "../../components/Home/SaleComponent/SaleProductsServer";
import DealsByBudget from "../../components/Home/BudgetDeals/DealsofBudget";
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";
export const metadata = {
  title: "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
  description:
    "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
  keywords: [
    "Jewelry Online India",
    "Gold Necklace",
    "Silver Earrings",
    "Diamond Rings",
    "Luxury Jewelry",
    "Men's Jewelry",
    "Women's Jewelry",
    "Couple Rings",
    "U n Me Jewelry",
  ],
  openGraph: {
    title: "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
    description:
      "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
    url: "https://unmejewels.com/",
    images: [
      {
        url: "https://res.cloudinary.com/dkfkwavmc/image/upload/v1764335143/ltdeffqpngw1punwn9o4.png",
        width: 1200,
        height: 630,
        alt: "U n Me Jewelry Collection",
      },
    ],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://unmejewels.com/" },
  twitter: {
    card: "summary_large_image",
    title: "U n Me | Handcrafted Jewelry for Modern Elegance",
    description:
      "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
    images: [
      "https://res.cloudinary.com/dkfkwavmc/image/upload/c_limit,f_auto,q_40/v1766037888/bjbn8iindgznair1zgxz.png",
    ],
  },
};

const page = async () => {
 let mobileBanners =[]
  let desktopBanners = []
  let otherBanners = []
  let budgetBanners = []
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${process.env.API_PORT}home/banners`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        mobileBanners = data?.banners[0]?.mobileBanners || [];
        desktopBanners = data?.banners[0]?.desktopBanners || [];
        otherBanners = data?.banners[0]?.otherBanners || [];
        budgetBanners = data?.banners[0]?.budgetBanners || [];


      }
    } catch (err) {
      if (!isDynamicServerUsageError(err)) {
        console.error('Error fetching banners:', err);
      }
    } finally {
      // Add a minimum loading time for better UX
    }
  };
  await fetchBanners()

  return (
    <>
      <HeroSection mobileBanners={mobileBanners} desktopBanners={desktopBanners} />
      <FeaturesRibbon />
      <CategoriesServer />
      <FeaturedCollectionServer />
      <CarouselSectionServer title="Our Latest Products" type="latest" />
      {/* <SaleProductsServer type='999' /> */}
      <ImageBannerSection banner={otherBanners[0]} />
      <SaleProductsServer type='999' />
      <DealsByBudget banners={budgetBanners}/>
      <SaleProductsServer type='1499' />
      <StatementPiece banner={otherBanners[1]} />
      {/* <CarouselSectionServer title="Moments That Matter" type="featured" /> */}
      <CarouselSectionServer title="Boss Babe Picks" type="boss-picks" />
      <ImageBannerSection banner={otherBanners[2]} contentLeft={true} />
      {/* <CarouselSectionServer title="Jewels for Gateways" type="gateway-jewels" /> */}
      <ImageBannerSection banner={otherBanners[3]} textWhite={true} />
      <InstagramReels/>
      <Home banner={otherBanners[4]}/>
    </>
  );
}

export default page
