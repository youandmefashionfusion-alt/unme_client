import React from "react";
import SingleProduct from "../../../../components/SingleProduct";

export async function generateMetadata({ params }) {
  const { pid } = await params;

  try {
    const response = await fetch(`${process.env.API_PORT}single-product?productHandle=${pid}`);
    const data = await response.json();

    if (data.success && data.product) {
      const product = data.product;
      
      // Define the fallback title and description based on your format
      const fallbackTitle = `Buy ${product.title} at Best Price - unmejewels.com`;
      const fallbackDescription = `Buy ${product.title} - at Rs. ${product.price || 'Price not available'}. Id: ${product._id || 'N/A'} at unmejewels.com`;
      const fallbackKeywords = [
        product.title,
        `buy ${product.title}`,
        `buy ${product.title} online`,
        `best price ${product.title}`,
        "u n me jewels"
      ];

      return {
        // Use custom metaTitle if it exists, otherwise use the fallback title
        title: product?.metaTitle!=="" ? product?.metaTitle : fallbackTitle,
        // Use custom metaDesc if it exists, otherwise use the fallback description
        description: product?.metaDesc!=="" ? product?.metaDesc :fallbackDescription,
        keywords: product.metaKeywords ? product.metaKeywords.split(',') : fallbackKeywords,
        openGraph: {
          title: fallbackTitle,
          description: fallbackDescription,
          url: `https://unmejewels.com/products/${pid}`,
          images: product.images[0]?.url ? [
            {
              url: product.images[0].url,
              width: 1200,
              height: 630,
              alt: product.title,
            }
          ] : [],
        },
        alternates: {
          canonical: `https://unmejewels.com/products/${pid}`,
        },
        robots: {
          index: true,
          follow: true,
        },
        twitter: {
          card: "summary_large_image",
          title: fallbackTitle,
          description: fallbackDescription,
          images: product.images[0]?.url ? [product.images[0].url] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error.message);
  }

  // Fallback metadata if product fetch fails
  return {
    title: "Buy Luxury Jewelry at Best Price - unmejewels.com",
    description: "Buy handcrafted gold, silver, and diamond jewelry at best prices. Explore timeless collections at U n Me.",
    keywords: ["buy jewelry online", "best price jewelry", "U n Me jewels", "gold jewelry", "silver jewelry"],
  };
}

const Page = async ({ params }) => {
  const { pid } = await params;
  let productData = null;
  let noPrdt = false;
  
  try {
    const response = await fetch(
      `${process.env.API_PORT}single-product?productHandle=${pid}`,
    );
    const data = await response.json();

    if (data.success && data.product) {
      productData = {
        product: data.product,
        relatedProducts: data.relatedProducts || [],
        latestProducts: data.latestProducts || [],
      };
    } else {
      noPrdt = true;
    }
  } catch (error) {
    console.error("Error fetching product:", error.message);
    noPrdt = true;
  }

  if (noPrdt) {
    return (
      <div className="error-page">
        <h1>Product Not Found</h1>
        <p>We couldn't find the jewelry piece you're looking for.</p>
        <a href="/collections/all" className="btn-primary">
          Explore Collections
        </a>
      </div>
    );
  }

  return (
    <SingleProduct
      product={productData.product}
      products={productData.relatedProducts}
      latestProducts={productData.latestProducts}
    />
  );
};

export default Page;