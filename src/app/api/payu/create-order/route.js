// /api/order/create-payu-order
export async function POST(request) {

  try {
    const orderData = await request.json();
    
    // Generate unique transaction ID
    const generateUniqueId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
      const dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
      const randomElement = Math.random().toString(36).substring(2, 10);
      return `${dateTimeString}-${randomElement}`;
    };

    const transactionId = generateUniqueId();
    
    // Here you would typically save the order to your database
    // For now, we'll just return the transaction ID

    return new Response(JSON.stringify({
      success: true,
      transactionId: transactionId,
      message: 'Order created for PayU payment'
    }));
  } catch (error) {
    console.error('Error creating PayU order:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create order' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}