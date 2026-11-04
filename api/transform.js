const { cloudinary, requireCloudinary } = require('../lib/cloudinary');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireCloudinary(res)) return;

  try {
    const body = req.body || {};
    let { public_id, width, height, effect, quality } = body;

    if (!public_id) {
      res.status(400).json({ error: 'public_id is required' });
      return;
    }

    // Prepend folder if not already present
    if (!public_id.startsWith('mediavault/')) {
      public_id = `mediavault/${public_id}`;
    }

    const transformations = [];

    if (width || height) {
      transformations.push({
        width: width || 'auto',
        height: height || 'auto',
        crop: 'fill',
        gravity: 'auto'
      });
    }

    if (effect) {
      transformations.push({ effect });
    }

    transformations.push({
      quality: quality || 'auto',
      fetch_format: 'auto'
    });

    const url = cloudinary.url(public_id, {
      transformation: transformations,
      secure: true
    });

    res.status(200).json({ url, public_id });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: error.message });
  }
};
