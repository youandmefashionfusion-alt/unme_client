// Push events to dataLayer
export const pushToDataLayer = (eventData) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
  }
};

// Helper functions for each event type
export const GTM = {
  // 1. view_item_list - Package/tour listing page loads
  viewItemList: (itemListName, items) => {
    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: {
        item_list_name: itemListName,
        items
      }
    });
  },

  // 2. select_item - User clicks a package from a list
  selectItem: (itemListName, item) => {
    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        item_list_name: itemListName,
        items: [item]
      }
    });
  },

  // 3. view_item - Package detail page loads
  viewItem: (item, currency = 'INR') => {
    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency,
        value: item.price,
        items: [item]
      }
    });
  },

  // 4. add_to_cart - Click on "Book Now / Add to Cart"
  addToCart: (item, currency = 'INR') => {
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency,
        value: item.price * (item.quantity || 1),
        items: [{
          ...item,
          quantity: item.quantity || 1
        }]
      }
    });
  },

  // 5. remove_from_cart - User removes a package
  removeFromCart: (item, currency = 'INR') => {
    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: {
        currency,
        value: item.price,
        items: [item]
      }
    });
  },

  // 6. view_cart - Cart page loads
  viewCart: (items, totalValue, currency = 'INR') => {
    pushToDataLayer({
      event: 'view_cart',
      ecommerce: {
        currency,
        value: totalValue,
        items
      }
    });
  },

  // 7. begin_checkout - Checkout page starts
  beginCheckout: (items, totalValue, currency = 'INR') => {
    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency,
        value: totalValue,
        items
      }
    });
  },

  // 8. add_shipping_info - Shipping/address info added
  addShippingInfo: (
    items, 
    totalValue, 
    shippingTier = 'Standard', 
    currency = 'INR'
  ) => {
    pushToDataLayer({
      event: 'add_shipping_info',
      ecommerce: {
        currency,
        shipping_tier: shippingTier,
        value: totalValue,
        items: items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name
        }))
      }
    });
  },

  // 9. add_payment_info - Payment method selected
  addPaymentInfo: (
    items, 
    totalValue, 
    paymentType, 
    currency = 'INR'
  ) => {
    pushToDataLayer({
      event: 'add_payment_info',
      ecommerce: {
        currency,
        payment_type: paymentType,
        value: totalValue,
        items: items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name
        }))
      }
    });
  },

  // 10. purchase - Booking confirmed / Thank You page
  purchase: (
    transactionId,
    items,
    totalValue,
    coupon,
    currency = 'INR'
  ) => {
    pushToDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        affiliation: 'IVA Explorer',
        value: totalValue,
        tax: 0,
        shipping: 0,
        currency,
        coupon: coupon || '',
        items
      }
    });
  },

  // 11. refund - Booking cancelled / refunded
  refund: (transactionId, refundValue, currency = 'INR') => {
    pushToDataLayer({
      event: 'refund',
      ecommerce: {
        transaction_id: transactionId,
        value: refundValue,
        currency
      }
    });
  },

  // 12. view_promotion - Promotion banner shown
  viewPromotion: (promotionName, promotionId) => {
    pushToDataLayer({
      event: 'view_promotion',
      ecommerce: {
        promotion_name: promotionName,
        promotion_id: promotionId
      }
    });
  },

  // 13. select_promotion - User clicks promotion banner
  selectPromotion: (promotionName, promotionId) => {
    pushToDataLayer({
      event: 'select_promotion',
      ecommerce: {
        promotion_name: promotionName,
        promotion_id: promotionId
      }
    });
  },

  // 14. generate_lead - Enquiry form submitted
  generateLead: (leadType = 'Tour Enquiry', currency = 'INR') => {
    pushToDataLayer({
      event: 'generate_lead',
      ecommerce: {
        value: 1,
        currency,
        lead_type: leadType
      }
    });
  }
};