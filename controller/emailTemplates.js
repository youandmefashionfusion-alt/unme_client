// Email templates with modern, editorial design

// Order Confirmation Email Template
export const orderConfirmationEmail = (orderData) => {
  const { 
    orderNumber, 
    shippingInfo, 
    orderItems, 
    totalPrice, 
    finalAmount, 
    shippingCost, 
    discount 
  } = orderData;

  const orderItemsHtml = orderItems?.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E6E0D6;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="padding-right: 8px;">
              <img 
                src="${item.product.images?.[0]?.url || 'https://via.placeholder.com/80'}" 
                alt="${item.product.title}"
                style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #E6E0D6;"
              />
            </td>
            <td>
              <h4 style="margin: 0 0 3px; font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-weight: 500; color: #1A1612;">
                ${item.product.title}
              </h4>
              <p style="margin: 0 0 4px; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #7A7067;">
                Quantity: ${item.quantity}
              </p>
              <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #B5293F;">
                ₹${item.product.price.toLocaleString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - U n Me</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: 'DM Sans', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #FAF8F4;">
        <tr>
            <td align="center" style="padding: 10px 5px;">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E6E0D6;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 20px; text-align: center; border-bottom: 1px solid #E6E0D6;">
                            <h1 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 400; color: #1A1612; letter-spacing: -0.02em;">
                                U n Me
                            </h1>
                            <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067; text-transform: uppercase; letter-spacing: 1.5px;">
                                Fine Jewelry
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Success Icon -->
                    <tr>
                        <td style="padding: 30px 10px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto 24px; background-color: #f0fdf4; border: 1px solid #15803d; border-radius: 50%; display: flex; align-items: center !important; justify-content: center !important;">
                                <span style="font-size: 40px;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1612;">
                                Thank You, ${shippingInfo.firstname}
                            </h2>
                            <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 16px; color: #7A7067;">
                                Your order has been confirmed
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Order Number -->
                    <tr>
                        <td style="padding: 20px 10px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; border: 1px solid #E6E0D6;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0 0 8px; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Order Number
                                        </p>
                                        <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 500; color: #B5293F;">
                                            #${orderNumber}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Order Items -->
                    <tr>
                        <td style="padding: 20px 10px;">
                            <h3 style="margin: 0 0 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; color: #1A1612;">
                                Order Summary
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${orderItemsHtml}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Price Breakdown -->
                    <tr>
                        <td style="padding: 20px 10px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #E6E0D6; padding-top: 20px;">
                                <tr>
                                    <td style="padding: 6px 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #7A7067;">
                                        Subtotal
                                    </td>
                                    <td style="padding: 6px 0; text-align: right; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #1A1612;">
                                        ₹${totalPrice.toLocaleString()}
                                    </td>
                                </tr>
                                ${discount > 0 ? `
                                <tr>
                                    <td style="padding: 6px 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #7A7067;">
                                        Discount
                                    </td>
                                    <td style="padding: 6px 0; text-align: right; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #15803d;">
                                        -₹${discount.toLocaleString()}
                                    </td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 6px 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #7A7067;">
                                        Shipping
                                    </td>
                                    <td style="padding: 6px 0; text-align: right; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: ${shippingCost === 0 ? '#15803d' : '#1A1612'};">
                                        ${shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 0; border-top: 1px solid #E6E0D6; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; color: #1A1612;">
                                        Total
                                    </td>
                                    <td style="padding: 15px 0 0; border-top: 1px solid #E6E0D6; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: #B5293F;">
                                        ₹${finalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Shipping Address -->
                    <tr>
                        <td style="padding: 20px 10px;">
                            <h3 style="margin: 0 0 15px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; color: #1A1612;">
                                Shipping Address
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; border: 1px solid #E6E0D6;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 5px; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #1A1612;">
                                            ${shippingInfo.firstname} ${shippingInfo.lastname}
                                        </p>
                                        <p style="margin: 0 0 5px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #4A4540;">
                                            ${shippingInfo.address}
                                        </p>
                                        <p style="margin: 0 0 5px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #4A4540;">
                                            ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}
                                        </p>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; color: #4A4540;">
                                            Phone: ${shippingInfo.phone}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 20px 10px 40px; text-align: center;">
                            <a href="https://unmejewels.com/profile" style="display: inline-block; padding: 14px 32px; background-color: #1A1612; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s ease;">
                                Track Your Order
                            </a>
                            <p style="margin: 20px 0 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #7A7067;">
                                We'll notify you when your order ships
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px 10px; background-color: #1A1612;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Instagram</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Facebook</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Pinterest</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">
                                            Questions? Contact us at 
                                            <a href="mailto:unmejewels@gmail.com" style="color: #B5293F; text-decoration: none; border-bottom: 1px solid #B5293F;">
                                                unmejewels@gmail.com
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 20px;">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #4A4540;">
                                            © ${new Date().getFullYear()} U n Me Jewelry. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Order Dispatched Email Template
export const orderDispatchedEmail = (orderData) => {
  const { 
    orderNumber, 
    firstname, 
    email, 
    orderItems, 
    finalAmount,
    trackingNumber = `TR${orderNumber}IN`
  } = orderData;

  const orderItemsHtml = orderItems?.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #E6E0D6;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="60" style="padding-right: 12px;">
              <img 
                src="${item.product.images?.[0]?.url || 'https://via.placeholder.com/60'}" 
                alt="${item.product.title}"
                style="width: 50px; height: 50px; object-fit: cover; border: 1px solid #E6E0D6;"
              />
            </td>
            <td>
              <p style="margin: 0 0 4px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #1A1612;">
                ${item.product.title}
              </p>
              <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #7A7067;">
                Qty: ${item.quantity}
              </p>
            </td>
            <td align="right">
              <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #B5293F;">
                ₹${item.product.price.toLocaleString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order is on the Way - U n Me</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: 'DM Sans', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #FAF8F4;">
        <tr>
            <td align="center" style="padding: 40px 5px;">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E6E0D6;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E6E0D6;">
                            <h1 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 400; color: #1A1612; letter-spacing: -0.02em;">
                                U n Me
                            </h1>
                            <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067; text-transform: uppercase; letter-spacing: 1.5px;">
                                Fine Jewelry
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Shipping Icon -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto 24px; background-color: #dbeafe; border: 1px solid #1E40AF; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;">📦</span>
                            </div>
                            <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1612;">
                                On Its Way, ${firstname}!
                            </h2>
                            <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 16px; color: #7A7067;">
                                Your order #${orderNumber} has been dispatched
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Tracking Info -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F4; border: 1px solid #E6E0D6;">
                                <tr>
                                    <td style="padding: 24px; text-align: center;">
                                        <p style="margin: 0 0 10px; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Tracking Number
                                        </p>
                                        <p style="margin: 0 0 20px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 500; color: #B5293F; letter-spacing: 1px;">
                                            ${trackingNumber}
                                        </p>
                                        <p style="margin: 0 0 5px; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #7A7067;">
                                            Estimated Delivery
                                        </p>
                                        <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; color: #1A1612;">
                                            3-5 Business Days
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Timeline -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="33.33%" align="center" style="padding: 0 5px;">
                                        <div style="width: 40px; height: 40px; margin: 0 auto 10px; background-color: #15803d; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">✓</div>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #15803d; font-weight: 600;">Confirmed</p>
                                    </td>
                                    <td width="33.33%" align="center" style="padding: 0 5px;">
                                        <div style="width: 40px; height: 40px; margin: 0 auto 10px; background-color: #1E40AF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">→</div>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #1E40AF; font-weight: 600;">In Transit</p>
                                    </td>
                                    <td width="33.33%" align="center" style="padding: 0 5px;">
                                        <div style="width: 40px; height: 40px; margin: 0 auto 10px; background-color: #E6E0D6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #7A7067; font-size: 18px;">📍</div>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #7A7067;">Delivered</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h3 style="margin: 0 0 15px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; color: #1A1612;">
                                Order Summary
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${orderItemsHtml}
                                <tr>
                                    <td colspan="3" style="padding: 15px 0 0; border-top: 1px solid #E6E0D6;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; color: #1A1612; font-weight: 500;">
                                                    Total Amount
                                                </td>
                                                <td align="right" style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: #B5293F;">
                                                    ₹${finalAmount.toLocaleString()}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 20px 40px 40px; text-align: center;">
                            <a href="https://unmejewels.com/track-order?number=${orderNumber}" style="display: inline-block; padding: 14px 32px; background-color: #1A1612; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s ease;">
                                Track Package
                            </a>
                            <p style="margin: 20px 0 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #7A7067;">
                                You'll receive updates at every step
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #1A1612;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Instagram</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Facebook</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Pinterest</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">
                                            Need help? 
                                            <a href="mailto:unmejewels@gmail.com" style="color: #B5293F; text-decoration: none; border-bottom: 1px solid #B5293F;">
                                                unmejewels@gmail.com
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 20px;">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #4A4540;">
                                            © ${new Date().getFullYear()} U n Me Jewelry. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Welcome Email Template
export const welcomeEmail = (userData) => {
  const { firstname, email } = userData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to U n Me</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F4; font-family: 'DM Sans', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #FAF8F4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E6E0D6;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E6E0D6;">
                            <h1 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 400; color: #1A1612; letter-spacing: -0.02em;">
                                U n Me
                            </h1>
                            <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067; text-transform: uppercase; letter-spacing: 1.5px;">
                                Fine Jewelry
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Welcome Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto 24px; background-color: #FAF8F4; border: 1px solid #B5293F; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;">✨</span>
                            </div>
                            <h2 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1612;">
                                Welcome, ${firstname}!
                            </h2>
                            <p style="margin: 0 0 24px; font-family: 'DM Sans', Arial, sans-serif; font-size: 16px; color: #4A4540; line-height: 1.6;">
                                We're so glad you're here. At U n Me, every piece of jewelry tells a story — yours and ours, woven together in timeless sparkle.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Features -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="33.33%" align="center" style="padding: 0 10px;">
                                        <div style="font-size: 32px; margin-bottom: 12px;">✨</div>
                                        <h4 style="margin: 0 0 6px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1A1612;">Timeless Craftsmanship</h4>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">Handcrafted with care</p>
                                    </td>
                                    <td width="33.33%" align="center" style="padding: 0 10px;">
                                        <div style="font-size: 32px; margin-bottom: 12px;">💫</div>
                                        <h4 style="margin: 0 0 6px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1A1612;">Anti-Tarnish</h4>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">Stays radiant forever</p>
                                    </td>
                                    <td width="33.33%" align="center" style="padding: 0 10px;">
                                        <div style="font-size: 32px; margin-bottom: 12px;">❤️</div>
                                        <h4 style="margin: 0 0 6px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1A1612;">Skin-Friendly</h4>
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">Hypoallergenic materials</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 20px 40px 40px; text-align: center;">
                            <a href="https://unmejewels.com/collections" style="display: inline-block; padding: 14px 32px; background-color: #1A1612; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s ease;">
                                Explore Collections
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #1A1612;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Instagram</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Facebook</a>
                                        <a href="#" style="margin: 0 10px; color: #FFFFFF; text-decoration: none; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px;">Pinterest</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #7A7067;">
                                            Questions? 
                                            <a href="mailto:unmejewels@gmail.com" style="color: #B5293F; text-decoration: none; border-bottom: 1px solid #B5293F;">
                                                unmejewels@gmail.com
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 20px;">
                                        <p style="margin: 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #4A4540;">
                                            © ${new Date().getFullYear()} U n Me Jewelry. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};