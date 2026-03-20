import React from "react";
import Products from "../../../../components/Products";
import Button from "../../../../components/ui/button/Button";

// Function to generate dynamic metadata
export async function generateMetadata({ params }) {
  const { cid } = await params;

  try {
    // Use the combined API for metadata
    const response = await fetch(`${process.env.API_PORT}collections?collectionHandle=${cid}&page=1&limit=1`);
    const data = await response.json();

    if (data.success && data.collection) {
      return {
        title: data.collection.metaTitle || "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
        description: data.collection.metaDesc || "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
        keywords: [data.collection.title, data.collection.category, "Jewelry Online India",
          "Gold Necklace",
          "Silver Earrings",
          "Diamond Rings",
          "Luxury Jewelry",
          "Men's Jewelry",
          "Women's Jewelry",
          "Couple Rings",
          "U n Me Jewelry"],
        openGraph: {
          title: data.collection.metaTitle || "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
          description: data.collection.metaDesc || "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
          url: `https://unmejewels.com/collections/${cid}`,
          images: data.collection.images?.[0]?.url || [],
        },
        alternates: {
          canonical: `https://unmejewels.com/collections/${cid}`,
        },
        robots: {
          index: true,
          follow: true,
        },
        icons: {
          icon: "https://unmejewels.com/favicon-32x32.png",
          apple: "https://unmejewels.com/apple-touch-icon.png",
          shortcut: "https://unmejewels.com/favicon.ico",
        },
        other: {
          title: data.collection.metaTitle || "U n Me | Handcrafted Jewelry for Modern Elegance",
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
  }

  return {
    title: "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
    description:
      "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
    keywords: [
      "U n Me",
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
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://unmejewels.com/collections/${cid}`,
    },
  };
}

// Page component
const Page = async ({ params, searchParams }) => {
  const { cid } = await params;
  const { page, sort, color, gender, material, type } = await searchParams;

  let collectionData = null;
  let noData = false;

  try {
    const apiUrl = new URL(`${process.env.API_PORT}collections`);
    apiUrl.searchParams.append("collectionHandle", cid);
    apiUrl.searchParams.append("page", page || 1);
    apiUrl.searchParams.append("state", "active");
    
    // Add filters - they will be handled as comma-separated values by the API
    if (gender) apiUrl.searchParams.append("gender", gender);
    if (sort) apiUrl.searchParams.append("sort", sort);
    if (color) apiUrl.searchParams.append("color", color);
    if (material) apiUrl.searchParams.append("material", material);
    if (type) apiUrl.searchParams.append("type", type);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success) {
      collectionData = {
        collection: data.collection,
        products: data.products,
        pagination: data.pagination,
        filters: data.filters
      };
    } else {
      noData = true;
    }

  } catch (error) {
    noData = true;
  }

  return (
    <>
      {noData ? (
        <div className="error-page">
          <h1>404 Page Not Found</h1>
          <Button link="/" label="Return to Home"/>
        </div>
      ) : (
        <Products
          data={{
            products: collectionData?.products || [],
            pagination: collectionData?.pagination || {}
          }}
          initialFilterData={collectionData?.filters || { colors: [], materials: [], types: [], genders: [] }}
          collectionInfo={collectionData?.collection}
        />
      )}
    </>
  );
};

export default Page;