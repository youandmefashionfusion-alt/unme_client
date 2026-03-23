// DealsofBudget.js
import React from "react";
import Link from "next/link";
import Heading from "../../ui/Heading/Heading";

const modifyCloudinaryUrl = (url) => {
  if (!url) return "/images/fallback-banner.jpg";
  const cloudfront =
    process.env.NEXT_PUBLIC_CLOUDFRONT_URL || "https://d2gtpgxs0y565n.cloudfront.net";

  // S3 URL → CloudFront
  if (url.includes("s3.") || url.includes("amazonaws.com")) {
    try {
      const urlObj = new URL(url);
      return `${cloudfront}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  // Cloudinary URL → add transformations
  if (!url.includes("/upload/")) return url;
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/c_limit,h_1000,f_auto,q_50/${parts[1]}`;
  }
  return url;
};

const DealsByBudget = ({ banners }) => {
  const budgetCategories = [
    {
      link: "/search?priceRange=0-399",
      banner: modifyCloudinaryUrl(banners?.[0]?.url),
    },
    {
      link: "/search?priceRange=0-499",
      banner: modifyCloudinaryUrl(banners?.[1]?.url),
    },
    {
      link: "/search?priceRange=0-599",
      banner: modifyCloudinaryUrl(banners?.[2]?.url),
    },
  ];

  return (
    <section className="hidden md:block py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <Heading title="Timeless Picks by Range" />

        <div className="grid grid-cols-2 gap-3 mt-10">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3">
            {budgetCategories.slice(0, 2).map((category, index) => (
              <Link
                key={index}
                href={category.link}
                className="relative h-[230px] rounded-lg overflow-hidden group"
                style={{
                  backgroundImage: `url(${category.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
              </Link>
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <Link
            href={budgetCategories[2].link}
            className="relative h-[475px] rounded-lg overflow-hidden group"
            style={{
              backgroundImage: `url(${budgetCategories[2].banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default DealsByBudget;