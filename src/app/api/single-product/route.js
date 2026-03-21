import mongoose from "mongoose";
import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";

export const config = {
  maxDuration: 20,
};

const PRODUCT_FIELDS = {
  _id: 1,
  title: 1,
  handle: 1,
  price: 1,
  crossPrice: 1,
  images: 1,
  description: 1,
  sku: 1,
  quantity: 1,
  material: 1,
  sizes: 1,
  ringSize: 1,
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
  metaTitle: 1,
  metaDesc: 1,
  saleCollections: 1,
};

const CARD_FIELDS = {
  _id: 1,
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
  sizes: 1,
  ringSize: 1,
};

function normalizeProductShape(product) {
  if (!product) return product;

  const normalizedProduct = { ...product };

  if (!Array.isArray(normalizedProduct.sizes) && Array.isArray(normalizedProduct.ringSize)) {
    normalizedProduct.sizes = normalizedProduct.ringSize;
  }

  if (Object.prototype.hasOwnProperty.call(normalizedProduct, "ringSize")) {
    delete normalizedProduct.ringSize;
  }

  if (Object.prototype.hasOwnProperty.call(normalizedProduct, "weight")) {
    delete normalizedProduct.weight;
  }

  return normalizedProduct;
}

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

    const productQuery = mongoose.Types.ObjectId.isValid(productHandle)
      ? { state: "active", $or: [{ _id: productHandle }, { handle: productHandle }] }
      : { handle: productHandle, state: "active" };

    let productQueryBuilder = ProductModel.findOne(productQuery, PRODUCT_FIELDS)
      .populate("collectionName", "title handle");

    if (mongoose.models.SaleCollection) {
      productQueryBuilder = productQueryBuilder.populate("saleCollections");
    }

    const product = await productQueryBuilder.lean();

    if (!product) {
      return Response.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const relatedQuery = {
      state: "active",
      _id: { $ne: product._id },
    };

    if (product.collectionHandle) {
      relatedQuery.collectionHandle = product.collectionHandle;
    }

    const [relatedProducts, latestProducts] = await Promise.all([
      ProductModel.find(relatedQuery, CARD_FIELDS)
        .sort({ quantity: -1, updatedAt: -1 })
        .limit(4)
        .lean(),
      ProductModel.find({ state: "active" }, CARD_FIELDS)
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean(),
    ]);

    return Response.json(
      {
        success: true,
        product: normalizeProductShape(product),
        relatedProducts: relatedProducts.map(normalizeProductShape),
        latestProducts: latestProducts.map(normalizeProductShape),
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
