const { cloudinary, requireCloudinary } = require('../lib/cloudinary');
const { formidable } = require('formidable');
const fs = require('fs');

async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!requireCloudinary(res)) return;

  try {
    const form = formidable({ multiples: false, keepExtensions: true });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // formidable v3 returns arrays; v2 returns single objects
    let file = files.file;
    if (Array.isArray(file)) file = file[0];

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = file.filepath || file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'mediavault',
      resource_type: 'auto',
      eager: [
        { width: 300, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
        { width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 1200, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
      ],
      tags: ['mediavault']
    });

    // Clean up temp file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

    res.status(200).json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
