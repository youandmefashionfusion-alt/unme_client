import { NextResponse } from 'next/server';
import ProductModel from '../../../../../models/productModel';
import connectDb from '../../../../../config/connectDb';
export async function GET(request) {
  try {
    // Get Instagram credentials from environment variables
    const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

    // Validate credentials
    if (!ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: 'Instagram access token not configured. Please add INSTAGRAM_ACCESS_TOKEN to your environment variables.'
        },
        { status: 500 }
      );
    }

    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      return NextResponse.json(
        {
          success: false,
          message: 'Instagram Business Account ID not configured.'
        },
        { status: 500 }
      );
    }

    // Optional: Get limit from query params (default 8)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 8;

    // Fetch media from Instagram Graph API
    const instagramApiUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`;
    const params = new URLSearchParams({
      fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp,caption',
      access_token: ACCESS_TOKEN
    });

    const response = await fetch(`${instagramApiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour (3600 seconds)
      next: { revalidate: 3600 }
    });

    // Check if Instagram API request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Instagram API Error:', errorData);

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch data from Instagram API',
          error: errorData.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate response data
    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid data format received from Instagram'
        },
        { status: 500 }
      );
    }

    // Filter and format reels
    const reels = data.data
      // Filter only VIDEO and REELS media types
      .filter(item => {
        const mediaType = item.media_type?.toUpperCase();
        return mediaType === 'VIDEO' || mediaType === 'REELS';
      })
      // Take only the requested limit
      .slice(0, limit)
      // Format the data
      .map(reel => ({
        id: reel.id,
        media_type: reel.media_type,
        media_url: reel.media_url,
        thumbnail_url: reel.thumbnail_url || reel.media_url, // Fallback to media_url if no thumbnail
        permalink: reel.permalink,
        timestamp: reel.timestamp,
        caption: reel.caption || '',
        // Format date for better readability
        formatted_date: reel.timestamp
          ? new Date(reel.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
          : null
      }));
      await connectDb();
    const latestProducts = await ProductModel.find({
      state: "active"
    })
      .sort({ updatedAt: -1 })
      .limit(8);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: reels,
        latestProducts: latestProducts,
        total: reels.length,
        fetched_at: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
        }
      }
    );

  } catch (error) {
    console.error('Error in Instagram Reels API:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while fetching Instagram reels',
        error: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST method handler - not allowed
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use GET to fetch reels.'
    },
    { status: 405 }
  );
}

/**
 * OPTIONS method handler - for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}