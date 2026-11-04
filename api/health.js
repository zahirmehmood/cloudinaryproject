const { CLOUD_NAME, isConfigured } = require('../lib/cloudinary');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(isConfigured ? 200 : 503).json({
    status: isConfigured ? 'ok' : 'configuration_required',
    cloudinary_configured: isConfigured,
    cloud_name: CLOUD_NAME || null,
    timestamp: new Date().toISOString()
  });
};
