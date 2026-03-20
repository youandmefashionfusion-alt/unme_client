// store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ------------------------------
// Helpers
// ------------------------------
const LOCAL_KEY = "localCart";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
  }
}

// Count items in each sale type separately
const countSaleItems = (cart) => {
  const sale999Count = cart.filter(item => item?.product?.is999Sale).length;
  const sale1499Count = cart.filter(item => item?.product?.is1499Sale).length;
  return { sale999Count, sale1499Count, sale999Count };
};

// ------------------------------
// Thunks (async)
// ------------------------------
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  return loadCart();
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product, productId, quantity = 1 }) => {
    let cart = loadCart();

    const existing = cart.find((item) => item.product._id === productId);
    const fbclid = localStorage.getItem("fbclid");

    // Send AddToCart event with fbclid if available
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "AddToCart", {
        content_name: `${product?.title}`,
        content_category: "Product",
        content_ids: [`${productId}`],
        content_type: "product",
        value: product?.price,
        currency: "INR",
        ...(fbclid && { fbclid }),
      });
    }
    if (existing) {
      // Increase qty but not more than stock
      const max = existing.product.quantity || 1;
      existing.quantity = Math.min(existing.quantity + quantity, max);
    } else {
      cart.push({ product, quantity, productId });
    }

    saveCart(cart);
    return cart;
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, quantity }) => {
    let cart = loadCart();

    const item = cart.find((i) => i.product._id === productId);

    if (item) {
      if (quantity <= 0) {
        cart = cart.filter((i) => i.product._id !== productId);
      } else {
        const max = item.product.quantity || 1;
        item.quantity = Math.min(quantity, max);
      }
    }

    saveCart(cart);
    return cart;
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId) => {
    let cart = loadCart();
    cart = cart.filter((item) => item.product._id !== productId);

    saveCart(cart);
    return cart;
  }
);

export const clearCart = createAsyncThunk("cart/clearCart", async () => {
  saveCart([]);
  return [];
});

// ------------------------------
// Slice
// ------------------------------
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
    isOpen: false,
    sale999Count: 0,
    sale1499Count: 0,
    sale999Count: 0,
    offerToast999: null,
    offerToast999: null,
    offerToast1499: null,
    showOfferPopup999: false,
    showOfferPopup999: false,
    showOfferPopup1499: false,
  },
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearOfferToasts: (state) => {
      state.offerToast999 = null;
      state.offerToast1499 = null;
      state.offerToast999 = null;
    },
    hideOfferPopups: (state) => {
      state.showOfferPopup999 = false;
      state.showOfferPopup1499 = false;
      state.showOfferPopup999 = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        const { sale999Count, sale1499Count } = countSaleItems(action.payload);
        state.sale999Count = sale999Count;
        state.sale1499Count = sale1499Count;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })

      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        // Calculate sale counts
        const { sale999Count, sale1499Count } = countSaleItems(action.payload);
        state.sale999Count = sale999Count;
        state.sale1499Count = sale1499Count;

        // Reset UI flags
        state.offerToast999 = null;
        state.offerToast1499 = null;
        state.showOfferPopup999 = false;
        state.showOfferPopup1499 = false;

        // 🔥 999 Sale logic
        if (sale999Count > 0 && sale999Count < 3) {
          const remaining = 3 - sale999Count;
          state.offerToast999 = `Add ${remaining} more @₹999 item${remaining > 1 ? 's' : ''} to get 3 for ₹999`;
        }

        if (sale999Count >= 3) {
          state.showOfferPopup999 = true;
        }

        // 🔥 1499 Sale logic
        if (sale1499Count > 0 && sale1499Count < 3) {
          const remaining = 3 - sale1499Count;
          state.offerToast1499 = `Add ${remaining} more @₹1499 item${remaining > 1 ? 's' : ''} to get 3 for ₹1499`;
        }

        if (sale1499Count >= 3) {
          state.showOfferPopup1499 = true;
        }
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Cart
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        const { sale999Count, sale1499Count } = countSaleItems(action.payload);
        state.sale999Count = sale999Count;
        state.sale1499Count = sale1499Count;


        state.offerToast999 = null;
        state.offerToast1499 = null;
        state.showOfferPopup999 = sale999Count >= 3;
        state.showOfferPopup1499 = sale1499Count >= 3;

        // Update toasts if not enough items
        if (sale999Count > 0 && sale999Count < 3) {
          const remaining = 3 - sale999Count;
          state.offerToast999 = `Add ${remaining} more @₹999 item${remaining > 1 ? 's' : ''} to get 3 for ₹999`;
        }
        if (sale1499Count > 0 && sale1499Count < 3) {
          const remaining = 3 - sale1499Count;
          state.offerToast1499 = `Add ${remaining} more @₹1499 item${remaining > 1 ? 's' : ''} to get 3 for ₹1499`;
        }
      })

      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove From Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        const { sale999Count, sale1499Count } = countSaleItems(action.payload);
        state.sale999Count = sale999Count;
        state.sale1499Count = sale1499Count;

        // Reset popups
        state.showOfferPopup999 = false;
        state.showOfferPopup1499 = false;

        // Update toasts
        state.offerToast999 = null;
        state.offerToast1499 = null;

        if (sale999Count > 0 && sale999Count < 3) {
          const remaining = 3 - sale999Count;
          state.offerToast999 = `Add ${remaining} more @₹999 item${remaining > 1 ? 's' : ''} to get 3 for ₹999`;
        }

        if (sale1499Count > 0 && sale1499Count < 3) {
          const remaining = 3 - sale1499Count;
          state.offerToast1499 = `Add ${remaining} more @₹1499 item${remaining > 1 ? 's' : ''} to get 3 for ₹1499`;
        }
      })

      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
      })

      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.sale999Count = 0;
        state.sale1499Count = 0;
        state.offerToast999 = null;
        state.offerToast1499 = null;
        state.showOfferPopup999 = false;
        state.showOfferPopup1499 = false;
      });
  },
});

export const { openCart, closeCart, clearOfferToasts, hideOfferPopups } = cartSlice.actions;
export default cartSlice.reducer;