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
    let { public_id } = body;

    if (!public_id) {
      res.status(400).json({ error: 'public_id is required' });
      return;
    }

    // Prepend folder if not already present
    if (!public_id.startsWith('mediavault/')) {
      public_id = `mediavault/${public_id}`;
    }

    const asset = await cloudinary.api.resource(public_id);

    const report = {
      asset: {
        public_id,
        type: asset.type,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        created_at: asset.created_at
      },
      urls: {
        original: cloudinary.url(public_id, { secure: true }),
        optimized: cloudinary.url(public_id, {
          quality: 'auto',
          fetch_format: 'auto',
          secure: true
        })
      },
      transformations: {
        thumbnail: cloudinary.url(public_id, {
          width: 300, height: 300, crop: 'fill',
          quality: 'auto', fetch_format: 'auto', secure: true
        }),
        medium: cloudinary.url(public_id, {
          width: 600, height: 600, crop: 'fill',
          quality: 'auto', fetch_format: 'auto', secure: true
        }),
        large: cloudinary.url(public_id, {
          width: 1200, height: 1200, crop: 'fill',
          quality: 'auto', fetch_format: 'auto', secure: true
        }),
        grayscale: cloudinary.url(public_id, {
          effect: 'grayscale',
          quality: 'auto', fetch_format: 'auto', secure: true
        }),
        sepia: cloudinary.url(public_id, {
          effect: 'sepia',
          quality: 'auto', fetch_format: 'auto', secure: true
        })
      }
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
};
