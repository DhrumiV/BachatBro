/**
 * Health check endpoint
 * Tests that Netlify Functions are working correctly
 */

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'Netlify Functions are operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }),
  };
};
