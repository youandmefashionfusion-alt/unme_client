import connectDb from "../../../../config/connectDb";
import ProductModel from "../../../../models/productModel";
import CollectionModel from "../../../../models/collectionModel";
/* ------------------ Fetch all collections with their product types ------------------ */
async function getHeaderMenuData() {
  try {
    // Step 1: Fetch all active collections
    const collections = await CollectionModel.find({ 
      status: 'active' // Adjust based on your status values
    })
    .select('title handle images status')
    .sort({ order: 1 }) // Or any order you prefer
    .lean();

    if (!collections.length) {
      return [];
    }

    // Step 2: For each collection, fetch distinct product types
    const collectionsWithTypes = await Promise.all(
      collections.map(async (collection) => {
        try {
          // Get distinct types for this collection's products
          const typeResults = await ProductModel.aggregate([
            {
              $match: {
                state: "active",
                collectionHandle: collection.handle
              }
            },
            {
              $group: {
                _id: null,
                allTypes: { $addToSet: "$type" }
              }
            }
          ]);

          let types = [];
          if (typeResults.length > 0 && typeResults[0].allTypes) {
            // Flatten and clean the types array
            types = [...new Set(
              typeResults[0].allTypes
                .flat()
                .map(type => type?.toString().trim())
                .filter(type => type && type.length > 0)
            )].sort();
          }

          // If no types found, try to categorize based on common jewelry types
          if (types.length === 0) {
            types = getDefaultTypesForCollection(collection.title);
          }

          // Also get product count for this collection
          const productCount = await ProductModel.countDocuments({
            state: "active",
            collectionHandle: collection.handle
          });

          return {
            title: collection.title,
            handle: collection.handle,
            image: collection.images?.[0] || null,
            types: types.slice(0, 8), // Limit to 8 types max for dropdown
            productCount: productCount,
            hasProducts: productCount > 0
          };
        } catch (error) {
          console.error(`Error fetching types for collection ${collection.handle}:`, error.message);
          return {
            title: collection.title,
            handle: collection.handle,
            image: collection.images?.[0] || null,
            types: getDefaultTypesForCollection(collection.title),
            productCount: 0,
            hasProducts: false
          };
        }
      })
    );

    // Filter out collections with no products (optional)
    const activeCollections = collectionsWithTypes.filter(collection => collection.hasProducts);

    return activeCollections;

  } catch (error) {
    console.error("Error fetching header menu data:", error.message);
    throw error;
  }
}

/* ------------------ Helper: Get default types based on collection name ------------------ */
function getDefaultTypesForCollection(collectionTitle) {
  const title = collectionTitle.toLowerCase();
  
  if (title.includes('earring')) {
    return [];
  } else if (title.includes('necklace')) {
    return [];
  } else if (title.includes('bracelet')) {
    return [];
  } else if (title.includes('ring')) {
    return [];
  } else if (title.includes('hair')) {
    return [];
  } else {
    // Generic types for other collections
    return ["New Arrivals", "Best Sellers", "Trending", "Sale", "Limited Edition"];
  }
}

/* ------------------ Main API handler ------------------ */
export async function GET() {
  try {
    await connectDb();

    const menuData = await getHeaderMenuData();

    return Response.json(
      {
        success: true,
        data: menuData,
        timestamp: new Date().toISOString()
      },
      {
        status: 200
      }
    );
  } catch (error) {
    console.error("API Error:", error.message);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch menu data",
        message: error.message
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}

/* ------------------ Alternative optimized version with single aggregation ------------------ */
export async function GET_optimized() {
  try {
    await connectDb();

    const result = await CollectionModel.aggregate([
      {
        $match: {
          status: { $ne: "inactive" } // adjust as needed
        }
      },
      {
        $lookup: {
          from: "products",
          let: { collectionHandle: "$handle" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$collectionHandle", "$$collectionHandle"] },
                    { $eq: ["$state", "active"] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                allTypes: { $addToSet: "$type" },
                productCount: { $sum: 1 }
              }
            }
          ],
          as: "productsData"
        }
      },
      {
        $unwind: {
          path: "$productsData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          title: 1,
          handle: 1,
          image: { $arrayElemAt: ["$images", 0] },
          order: 1,                   // 👈 include order field
          productCount: { $ifNull: ["$productsData.productCount", 0] },
          rawTypes: { $ifNull: ["$productsData.allTypes", []] }
        }
      },
      {
        $addFields: {
          types: {
            $let: {
              vars: {
                cleanedTypes: {
                  $reduce: {
                    input: "$rawTypes",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] }
                  }
                }
              },
              in: {
                $slice: [
                  {
                    $setDifference: [
                      {
                        $map: {
                          input: "$$cleanedTypes",
                          as: "type",
                          in: {
                            $trim: {
                              input: { $toString: "$$type" }
                            }
                          }
                        }
                      },
                      [null, ""]
                    ]
                  },
                  8
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          productCount: { $gt: 0 }
        }
      },
      {
        $sort: { order: 1 }           // 👈 sort by order ascending
      },
      {
        $project: {
          _id: 0,
          title: 1,
          handle: 1,
          image: 1,
          types: 1,
          productCount: 1,
          hasProducts: { $gte: ["$productCount", 1] }
        }
      }
    ]);

    // Fallback to default types if none found
    const enhancedResult = result.map(collection => {
      if (!collection.types || collection.types.length === 0) {
        collection.types = getDefaultTypesForCollection(collection.title);
      }
      return collection;
    });

    return Response.json(
      {
        success: true,
        data: enhancedResult,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Optimized API Error:", error.message);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch menu data",
        message: error.message
      },
      { status: 500 }
    );
  }
}