export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🧪 Test endpoint called:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    query: req.query,
    body: req.body
  });

  res.status(200).json({
    success: true,
    message: 'API endpoint is working correctly',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: {
      nodeVersion: process.version,
      platform: process.platform
    }
  });
}