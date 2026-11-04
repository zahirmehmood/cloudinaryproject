const { cloudinary, requireCloudinary } = require('../lib/cloudinary');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (!requireCloudinary(res)) return;

  // Handle DELETE /api/assets?public_id=xxx
  if (req.method === 'DELETE') {
    try {
      const publicId = req.query.public_id;
      if (!publicId) {
        res.status(400).json({ error: 'public_id is required' });
        return;
      }
      const decodedPublicId = decodeURIComponent(publicId);
      const fullPublicId = decodedPublicId.startsWith('mediavault/')
        ? decodedPublicId
        : `mediavault/${decodedPublicId}`;
      const result = await cloudinary.uploader.destroy(fullPublicId, { invalidate: true });
      res.status(200).json({ success: true, message: 'Asset deleted', result });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let result;
    try {
      result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'mediavault/',
        max_results: 100,
        resource_type: 'image'
      });
    } catch (apiError) {
      console.error('Cloudinary API error:', apiError.message);
      res.status(502).json({
        error: 'Cloudinary could not load the media library. Verify the deployment credentials and try again.'
      });
      return;
    }

    const assets = (result.resources || []).map(asset => ({
      public_id: asset.public_id,
      secure_url: cloudinary.url(asset.public_id, {
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true
      }),
      created_at: asset.created_at
    }));

    res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error('Assets error:', error);
    res.status(500).json({ error: error.message });
  }
};
