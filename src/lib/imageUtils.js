const DEFAULT_CLOUDFRONT_URL = 'https://d2gtpgxs0y565n.cloudfront.net';

export const getCloudFrontBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || process.env.CLOUDFRONT_URL || DEFAULT_CLOUDFRONT_URL;
  return fromEnv.replace(/\/+$/, '');
};

export const normalizeImageUrl = (url, options = {}) => {
  if (!url) {
    return '/placeholder.jpg';
  }

  const cloudfront = getCloudFrontBaseUrl();

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // S3 URL => CloudFront
    if (host.includes('s3.') || host.includes('amazonaws.com')) {
      return `${cloudfront}${parsed.pathname}`;
    }

    // Cloudinary URL => CloudFront with transformation path
    if (host.includes('res.cloudinary.com')) {
      const path = parsed.pathname;
      const uploadIndex = path.indexOf('/upload/');
      if (uploadIndex >= 0) {
        const transformation = options.transformation || 'c_limit,h_1000,f_auto,q_80';
        const rem = path.slice(uploadIndex + '/upload/'.length);
        return `${cloudfront}${path.slice(0, uploadIndex + '/upload/'.length)}${transformation}/${rem}`;
      }
      return `${cloudfront}${path}`;
    }

    // CloudFront (or already target host)
    if (host === new URL(cloudfront).hostname) {
      return url;
    }

    // Fallback to same URL for other hosts
    return url;
  } catch (error) {
    // Not a parsable URL (relative path or malformed), return as-is
    return url;
  }
};
