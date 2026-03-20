import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";
import CollectionModel from "../../../../models/collectionModel";

export const config = {
  maxDuration: 10,
};

/* ------------------ Fetch collection metadata ------------------ */
async function getCollectionMetadata(collectionHandle) {
  return CollectionModel.findOne({ handle: collectionHandle }).lean();
}

/* ------------------ Fetch filter options ------------------ */
async function getFilterOptions(collectionHandle) {
  try {
    const result = await ProductModel.aggregate([
      {
        $match: {
          state: "active",
          collectionHandle,
        },
      },
      {
        $group: {
          _id: null,
          colors: { $addToSet: "$color" },
          materials: { $addToSet: "$material" },
          types: { $addToSet: "$type" },
          genders: { $addToSet: "$gender" },
        },
      },
    ]);

    if (!result.length) return { colors: [], materials: [], types: [], genders: [] };

    // Helper function to clean and flatten arrays
    const cleanArray = (arr) => {
      const flattened = (arr || []).flat();
      return [...new Set(
        flattened
          .map(item => item?.toString().trim().toLowerCase())
          .filter(Boolean)
      )].sort();
    };

    return {
      colors: cleanArray(result[0].colors),
      materials: cleanArray(result[0].materials),
      types: cleanArray(result[0].types),
      genders: cleanArray(result[0].genders),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error.message);
    return { colors: [], materials: [], types: [], genders: [] };
  }
}

/* ------------------ Fetch products with filters & pagination ------------------ */
async function getProducts(collectionHandle, page, limit, filters = {}) {
  const skip = (page - 1) * limit;

  // Build match conditions based on your schema
  const matchStage = {
    state: "active",
    collectionHandle
  };

  // Gender filter - handle array of genders (OR logic)
  if (filters.gender) {
    const genderArray = Array.isArray(filters.gender) ? filters.gender : [filters.gender];
    matchStage.gender = { $in: genderArray.map(g => g.trim().toLowerCase()) };
  }

  // Color filter - handle array of colors (OR logic)
  if (filters.color) {
    const colorArray = Array.isArray(filters.color) ? filters.color : [filters.color];
    const colorRegexArray = colorArray.map(color =>
      new RegExp(color.trim().toLowerCase(), "i")
    );
    matchStage.color = { $in: colorRegexArray };
  }

  // Material filter - handle array of materials (OR logic)
  if (filters.material) {
    const materialArray = Array.isArray(filters.material) ? filters.material : [filters.material];
    const materialRegexArray = materialArray.map(material =>
      new RegExp(material.trim().toLowerCase(), "i")
    );
    matchStage.material = { $in: materialRegexArray };
  }

  // Type filter - handle array of types (OR logic)
  if (filters.type) {
    const typeArray = Array.isArray(filters.type) ? filters.type : [filters.type];
    const typeRegexArray = typeArray.map(type =>
      new RegExp(type.trim().toLowerCase(), "i")
    );
    matchStage.type = { $in: typeRegexArray };
  }

  // Sorting logic
  let sortCriteria = { order: 1, createdAt: -1 };

  if (filters.sort) {
    switch (filters.sort) {
      case "price":
        sortCriteria = { price: 1 };
        break;
      case "-price":
        sortCriteria = { price: -1 };
        break;
      case "title":
        sortCriteria = { title: 1 };
        break;
      case "-title":
        sortCriteria = { title: -1 };
        break;
      case "-createdAt":
        sortCriteria = { createdAt: -1 };
        break;
      case "createdAt":
        sortCriteria = { createdAt: 1 };
        break;
      default:
        sortCriteria = { order: 1, createdAt: -1 };
    }
  }

  const result = await ProductModel.aggregate([
    { $match: matchStage },
    {
      $facet: {
        data: [
          { $sort: sortCriteria },
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [{ $count: "count" }]
      }
    }
  ]);

  const products = result[0]?.data || [];
  const totalDocs = result[0]?.totalCount[0]?.count || 0;

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit) || 1,
      totalDocs,
    },
  };
}

/* ------------------ Main API handler ------------------ */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collectionHandle = searchParams.get("collectionHandle");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  // Collect filters - handle comma-separated values
  const genderParam = searchParams.get("gender");
  const colorParam = searchParams.get("color");
  const materialParam = searchParams.get("material");
  const typeParam = searchParams.get("type");

  const filters = {
    gender: genderParam ? genderParam.split(",") : null,
    color: colorParam ? colorParam.split(",") : null,
    material: materialParam ? materialParam.split(",") : null,
    type: typeParam ? typeParam.split(",") : null,
    sort: searchParams.get("sort"),
  };

  // Remove null/empty values from filters
  Object.keys(filters).forEach(key => {
    if (!filters[key] || (Array.isArray(filters[key]) && filters[key].length === 0)) {
      delete filters[key];
    }
  });

  if (!collectionHandle) {
    return Response.json(
      { success: false, message: "Collection handle is required" },
      { status: 400 }
    );
  }

  try {
    await connectDb();

    const [collectionData, productsData, filterData] = await Promise.all([
      getCollectionMetadata(collectionHandle),
      getProducts(collectionHandle, page, limit, filters),
      getFilterOptions(collectionHandle),
    ]);

    if (!collectionData) {
      return Response.json(
        { success: false, message: "Collection not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        collection: collectionData,
        products: productsData.products,
        pagination: productsData.pagination,
        filters: filterData,
      },
      {
        status: 200
      }
    );
  } catch (error) {
    console.error("Error in GET API:", error.message);
    return Response.json(
      { success: false, error: "Failed to fetch data", message: error.message },
      { status: 500 }
    );
  }
}