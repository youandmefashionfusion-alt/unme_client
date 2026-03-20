// DealsByBudget.tsx
import React from "react";
import Link from "next/link";
import Heading from "../../ui/Heading/Heading";

const DealsByBudget = ({ banners }) => {
  const budgetCategories = [
    {
      link: "/search?priceRange=0-399",
      banner: banners?.[0]?.url || "/images/fallback-banner.jpg",
    },
    {
      link: "/search?priceRange=0-499",
      banner: banners?.[1]?.url || "/images/fallback-banner.jpg",
    },
    {
      link: "/search?priceRange=0-599",
      banner: banners?.[2]?.url || "/images/fallback-banner.jpg",
    },
  ];

  return (
    <section className="hidden md:block py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <Heading title="Timeless Picks by Range" />

        <div className="grid grid-cols-2 gap-3 mt-10">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-3">

            {budgetCategories?.slice(0, 2)?.map((category, index) => (
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

                {/* Overlay */}
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