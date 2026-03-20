"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Categories = ({ collections }) => {
  const [loading, setLoading] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  const modifyCloudinaryUrl = (url) => {
    if (!url) return "/placeholder.jpg";
    const parts = url.split("/upload/");
    return parts.length === 2
      ? `${parts[0]}/upload/c_limit,h_800,f_auto,q_40/${parts[1]}`
      : url;
  };

  const handleImageLoad = (collectionId) => {
    setImageLoadStatus((prev) => ({ ...prev, [collectionId]: true }));
  };

  useEffect(() => {
    setLoading(false);
  }, [collections]);

  if (loading) {
    return (
      <div className="px-4 py-10">
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex flex-col items-center">
              <div className="w-40 h-40 rounded-3xl bg-gray-200"></div>
              <div className="w-24 h-4 bg-gray-200 mt-3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=" max-w-7xl mx-auto px-4 py-10 px-4">

      <h3 className="text-center text-black font-bold text-[20px] mb-8">
        EVERYDAY DEMIFINE JEWELLERY
      </h3>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide no-scrollbar scroll-smooth">

        {collections?.map((collection) => {
          const collectionId = collection._id;
          const isImageLoaded = imageLoadStatus[collectionId];

          return (
            <Link
              href={`/collections/${collection.handle}`}
              key={collection._id}
              className="flex-shrink-0 text-center"
            >
              <div className="relative w-[150px] md:w-[200px] lg:w-[220px] aspect-square rounded-3xl overflow-hidden">

                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                <Image
                  src={modifyCloudinaryUrl(
                    collection?.images?.[1]?.url || collection?.image
                  )}
                  alt={collection.title}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                  onLoad={() => handleImageLoad(collectionId)}
                  onError={() => handleImageLoad(collectionId)}
                />
              </div>

              <p className="mt-3 text-black text-[16px] md:text-[18px] font-medium">
                {collection.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;