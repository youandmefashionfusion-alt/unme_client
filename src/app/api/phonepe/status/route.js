import crypto from "crypto";
import axios from "axios";

export const config = {
  maxDuration: 30,
};

const SHA256 = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const merchantTransactionId = searchParams.get("merchantTransactionId");

  if (!merchantTransactionId) {
    return Response.json(
      { success: false, error: "Merchant Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    // Validate environment variables
    if (!process.env.PMID || !process.env.PSALT || !process.env.PSALTINDEX) {
      throw new Error("PhonePe environment variables are not configured");
    }

    const statusEndpoint = `/pg/v1/status/${process.env.PMID}/${merchantTransactionId}`;
    const stringToHash = statusEndpoint + process.env.PSALT;
    const xVerify = SHA256(stringToHash) + "###" + process.env.PSALTINDEX;

    console.log("Status Check:", {
      merchantTransactionId,
      statusEndpoint,
      xVerify
    });

    const options = {
      method: "GET",
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox${statusEndpoint}`,
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": process.env.PMID,
      },
    };

    const response = await axios.request(options);
    console.log("PhonePe Status Response:", response.data);

    const paymentStatus = response.data.code;
    const successStatuses = ["PAYMENT_SUCCESS", "SUCCESS"];
    const pendingStatuses = ["PAYMENT_PENDING", "PENDING", "BANK_ACKNOWLEDGED"];

    if (successStatuses.includes(paymentStatus)) {
      // Redirect to success page
      const redirectUrl = `${'http://localhost:3000' || 'https://unmejewels.com'}/thankyou?status=success&transactionId=${merchantTransactionId}`;
      
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } else if (pendingStatuses.includes(paymentStatus)) {
      // Redirect to pending page
      const redirectUrl = `${'http://localhost:3000' || 'https://unmejewels.com'}/thankyou?status=pending&transactionId=${merchantTransactionId}`;
      
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } else {
      // Redirect to failure page
      const redirectUrl = `${'http://localhost:3000' || 'https://unmejewels.com'}/thankyou?status=failed&transactionId=${merchantTransactionId}&error=${response.data.message}`;
      
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    }

  } catch (error) {
    console.error("Status Check Error:", error.response?.data || error.message);
    
    const redirectUrl = `${'http://localhost:3000' || 'https://unmejewels.com'}/thankyou?status=error&transactionId=${merchantTransactionId}&error=${error.message}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  }
}