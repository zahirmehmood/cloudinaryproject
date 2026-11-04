const express = require('express');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// Routes

// Home - Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Upload Image
app.post('/api/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'creator-portfolio',
        resource_type: 'auto',
        eager: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
          { width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
          { width: 1200, height: 1200, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
        ],
        tags: ['creator-portfolio']
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json({
          success: true,
          public_id: result.public_id,
          url: result.secure_url,
          eager: result.eager,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    ).end(file.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Optimized URL
app.post('/api/transform', (req, res) => {
  try {
    const { public_id, width, height, effect, quality } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
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

    res.json({ url, public_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get all assets from folder
app.get('/api/assets', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'creator-portfolio/',
      max_results: 100,
      resource_type: 'image'
    });

    res.json({
      success: true,
      assets: result.resources.map(asset => ({
        public_id: asset.public_id,
        url: cloudinary.url(asset.public_id, {
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        }),
        secure_url: cloudinary.url(asset.public_id, {
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          secure: true
        }),
        created_at: asset.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete asset
app.delete('/api/assets/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    const fullPublicId = `creator-portfolio/${decodeURIComponent(public_id)}`;

    const result = await cloudinary.uploader.destroy(fullPublicId);

    res.json({
      success: true,
      message: 'Asset deleted',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Optimization Report
app.post('/api/analyze', async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

    const asset = await cloudinary.api.resource(public_id);

    const originalUrl = cloudinary.url(public_id);
    const optimizedUrl = cloudinary.url(public_id, {
      quality: 'auto',
      fetch_format: 'auto'
    });

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
        original: originalUrl,
        optimized: optimizedUrl
      },
      transformations: {
        thumbnail: cloudinary.url(public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        medium: cloudinary.url(public_id, {
          width: 600,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        large: cloudinary.url(public_id, {
          width: 1200,
          height: 1200,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        grayscale: cloudinary.url(public_id, {
          effect: 'grayscale',
          quality: 'auto',
          fetch_format: 'auto'
        }),
        sepia: cloudinary.url(public_id, {
          effect: 'sepia',
          quality: 'auto',
          fetch_format: 'auto'
        })
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', cloudinary_configured: !!process.env.CLOUDINARY_CLOUD_NAME });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Cloudinary Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
