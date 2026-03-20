import ProductModel from "../../../../models/productModel";
import connectDb from "../../../../config/connectDb";

export const config = {
  maxDuration: 20,
};

// ── Projection: only fields the frontend actually renders ─────────────────
// Excluded (not needed on product page):
//   metaDesc, metaTitle, bossPicks, gatawayJewels, isFeatured,
//   is999Sale, is1499Sale, order, necklaceType, ringDesign, ringSize
const PRODUCT_FIELDS = {
  title: 1,
  handle: 1,
  price: 1,
  crossPrice: 1,
  images: 1,
  description: 1,
  sku: 1,
  quantity: 1,
  material: 1,
  weight: 1,
  color: 1,
  gender: 1,
  type: 1,
  collectionHandle: 1,
  collectionName: 1,
  ratings: 1,
  totalRating: 1,
  sold: 1,
  state: 1,
  updatedAt: 1,
  metaTitle:1,
  metaDesc:1,
};

// Lighter projection for cards (related / latest) — skip description & ratings
const CARD_FIELDS = {
  title: 1,
  handle: 1,
  price: 1,
  crossPrice: 1,
  images: 1,
  quantity: 1,
  collectionHandle: 1,
  collectionName: 1,
  sold: 1,
  totalRating: 1,
  state: 1,
  updatedAt: 1,
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productHandle = searchParams.get("productHandle");

  if (!productHandle) {
    return Response.json(
      { success: false, error: "Product handle is required" },
      { status: 400 }
    );
  }

  try {
    await connectDb();

    // ── Step 1: fetch the main product (must be first — related needs collectionHandle) ──
    const product = await ProductModel.findOne(
      { handle: productHandle, state: "active" },
      PRODUCT_FIELDS
    )
      .populate("collectionName", "title handle")
      .lean();

    if (!product) {
      return Response.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // ── Step 2: fire related + latest queries IN PARALLEL ─────────────────
    const [relatedProducts, latestProducts] = await Promise.all([

      // Related: same collection, exclude self.
      // Sorting quantity:-1 bubbles in-stock items to the top —
      // eliminates the original double-query / fallback entirely.
      ProductModel.find(
        {
          state: "active",
          collectionHandle: product.collectionHandle,
          _id: { $ne: product._id },
        },
        CARD_FIELDS
      )
        .sort({ quantity: -1, updatedAt: -1 })
        .limit(4)
        .lean(),

      // Latest: most recently updated active products site-wide
      ProductModel.find(
        { state: "active" },
        CARD_FIELDS
      )
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean(),
    ]);

    return Response.json(
      {
        success: true,
        product,
        relatedProducts,
        latestProducts,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in single product API:", error.message);
    return Response.json(
      { success: false, error: "Failed to fetch product data" },
      { status: 500 }
    );
  }
}