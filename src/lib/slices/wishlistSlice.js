// store/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const LOCAL_KEY = "localWishlist";

// ------------------------------
// Helpers
// ------------------------------
function loadWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWishlist(wishlist) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(wishlist));
  }
}

// ------------------------------
// Thunks
// ------------------------------
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    return loadWishlist();
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ product }) => {
    let wishlist = loadWishlist();

    const exists = wishlist.find(
      (item) => item.product._id === product._id
    );

    if (!exists) {
      wishlist.push({ product });
    }

    saveWishlist(wishlist);
    return wishlist;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId) => {
    let wishlist = loadWishlist();
    wishlist = wishlist.filter((i) => i.product._id !== productId);

    saveWishlist(wishlist);
    return wishlist;
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async () => {
    saveWishlist([]);
    return [];
  }
);

// ------------------------------
// Slice
// ------------------------------
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.loading = false;
      })

      // Add
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
      })

      // Clear
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
      });
  },
});

export default wishlistSlice.reducer;
