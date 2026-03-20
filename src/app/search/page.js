import React from "react";
import SearchProducts from "../../../components/SearchProducts";

// Function to generate dynamic metadata
export async function generateMetadata({ searchParams }) {
  const params=await searchParams;
  const search = params?.search || "";

  return {
    title: search ? `Search: ${search} | U n Me` : "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
    description: search ? `Search results for "${search}" - Discover premium jewelry collections at U n Me` : "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
    keywords: ["U n Me", search].filter(Boolean),
    openGraph: {
      title: search ? `Search: ${search} | U n Me` : "U n ME Jewels—Elegant 18K Gold-Plated Jewellery Online",
      description: search ? `Search results for "${search}"` : "U n ME Jewels provides premium anti-tarnish, 18k gold-plated jewelry with sophisticated rings, necklaces, earrings, and classic designs, perfect for everyday or special events.",
      url: `https://unmejewels.com/search`,
      images: [
        {
          url: "https://res.cloudinary.com/dqh6bd766/image/upload/c_limit,h_1000,f_auto,q_50/v1730799285/zcs4bd74xuruedy7lnyt.jpg",
        },
      ],
    },
    alternates: {
      canonical: `https://unmejewels.com/search`,
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
  };
}

// Page component
const Page = async ({ searchParams }) => {
    const params=await searchParams;
  const page = params?.page || 1;
  const sort = params?.sort || "-createdAt";
  const color = params?.color || "";
  const gender = params?.gender || "";
  const material = params?.material || "";
  const type = params?.type || "";
  const search = params?.search || "";

  let searchData = null;
  let noResults = false;

  try {
    const searchUrl = new URL(`${process.env.API_PORT}products/search`);
    searchUrl.searchParams.append("search", search);
    searchUrl.searchParams.append("page", page);
    searchUrl.searchParams.append("state", "active");
    
    // Add filters
    if (sort) searchUrl.searchParams.append("sort", sort);
    if (color) searchUrl.searchParams.append("color", color);
    if (gender) searchUrl.searchParams.append("gender", gender);
    if (material) searchUrl.searchParams.append("material", material);
    if (type) searchUrl.searchParams.append("type", type);

    const searchResponse = await fetch(searchUrl);
    const searchResult = await searchResponse.json();

    if (searchResult.success) {
      searchData = searchResult;
    } else {
      noResults = true;
    }
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    noResults = true;
  }

  return (
    <>
      {noResults ? (
        <div className="error-page">
          <h1>No Results Found</h1>
          <p>We couldn't find any products matching your search.</p>
          <a href="/">
            <button className="home-btn">
              Return to Home
            </button>
          </a>
        </div>
      ) : (
        <SearchProducts
          data={searchData}
          searchQuery={search}
        />
      )}
    </>
  );
};

export default Page;