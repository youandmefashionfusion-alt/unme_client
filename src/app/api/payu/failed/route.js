export const config = {
  maxDuration: 10,
};
export async function POST(request) {
    try {
            
          // Step 6: Construct the redirect URL with query parameters
          const redirectUrl = `https://unmejewels.com/checkout`;
    
          // Step 7: Redirect the user to the thank you page
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectUrl,  // Redirect user to the thank you page
            },
          });
       
      
      } catch (error) {
        console.error("Error in GET handler:", error.message);
        return Response.json(
          { success: false, error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }