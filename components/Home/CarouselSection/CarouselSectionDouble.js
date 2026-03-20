"use client";

import React from "react";
import ProductCard from "../../ui/productCard/ProductCard";
import Heading from "../../ui/Heading/Heading";

const CarouselSectionDouble = ({
    data,
    title,
    subtitle,
    viewAllLink,
    viewAllText = "View All",
    headingAlign = "center",
}) => {

    if (!data || data.length === 0) return null;

    return (
        <section className="w-full py-10">
            <div className="max-w-7xl mx-auto px-4">

                <Heading
                    title={title}
                    subtitle={subtitle}
                    align={headingAlign}
                    viewAllLink={viewAllLink}
                    viewAllText={viewAllText}
                />

                {/* Horizontal Scroll Slider */}
                <div className="mt-8 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex gap-2 min-w-max">

                        {data?.map((product) => (
                            <div
                                key={product._id || product.id}
                                className="w-[220px] md:w-[260px] flex-shrink-0"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}

                    </div>
                </div>

            </div>
        </section>
    );
};

export default CarouselSectionDouble;