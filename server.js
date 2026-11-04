const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');

dotenv.config();

const { cloudinary, CLOUD_NAME, isConfigured, requireCloudinary } = require('./lib/cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Cloudinary configuration:', isConfigured ? `ready (${CLOUD_NAME})` : 'missing environment variables');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes

// Home - Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: isConfigured ? 'ok' : 'configuration_required',
    cloudinary_configured: isConfigured,
    cloud_name: CLOUD_NAME || null,
    port: PORT,
    node_env: process.env.NODE_ENV || 'development'
  });
});

// Reject media API calls cleanly when credentials are missing.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/debug') return next();
  if (!requireCloudinary(res)) return;
  next();
});

// API: Upload Image
app.post('/api/upload', async (req, res) => {
  try {
    console.log('Upload endpoint called');
    
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No files uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    console.log(`Uploading: ${file.name} (${file.size} bytes)`);

    if (!file || !file.data) {
      console.log('Invalid file data');
      return res.status(400).json({ error: 'Invalid file data' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mediavault',
          resource_type: 'auto',
          eager: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
            { width: 600, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
            { width: 1200, height: 1200, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
          ],
          tags: ['mediavault']
        },
        (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            reject(error);
          } else {
            console.log('Upload success:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(file.data);
    });

    const result = await uploadPromise;

    res.json({
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      eager: result.eager || [],
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      type: error.constructor.name
    });
  }
});

// API: Get Optimized URL
app.post('/api/transform', (req, res) => {
  try {
    let { public_id, width, height, effect, quality } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

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

    res.json({ url, public_id });
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get all assets from folder
app.get('/api/assets', async (req, res) => {
  try {
    console.log('Loading assets...');
    
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
      return res.status(502).json({
        error: 'Cloudinary could not load the media library. Verify the server credentials and try again.'
      });
    }

    const assets = (result.resources || []).map(asset => ({
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
    }));

    console.log(`Found ${assets.length} assets`);
    
    res.json({
      success: true,
      assets: assets
    });
  } catch (error) {
    console.error('Assets error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.constructor.name
    });
  }
});

// API: Delete asset
app.delete('/api/assets/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    const decodedPublicId = decodeURIComponent(public_id);
    const fullPublicId = decodedPublicId.startsWith('mediavault/')
      ? decodedPublicId
      : `mediavault/${decodedPublicId}`;

    console.log(`Deleting: ${fullPublicId}`);

    const result = await cloudinary.uploader.destroy(fullPublicId);

    res.json({
      success: true,
      message: 'Asset deleted',
      result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Analyze asset
app.post('/api/analyze', async (req, res) => {
  try {
    let { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

    if (!public_id.startsWith('mediavault/')) {
      public_id = `mediavault/${public_id}`;
    }

    console.log(`Analyzing: ${public_id}`);

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
        original: cloudinary.url(public_id),
        optimized: cloudinary.url(public_id, {
          quality: 'auto',
          fetch_format: 'auto'
        })
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
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(isConfigured ? 200 : 503).json({
    status: isConfigured ? 'ok' : 'configuration_required',
    cloudinary_configured: isConfigured,
    cloud_name: CLOUD_NAME || null,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: err.message,
    type: err.constructor.name
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 MediaVault Server Started');
  console.log('='.repeat(60));
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Cloudinary Cloud: ${CLOUD_NAME || 'NOT CONFIGURED'}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
  console.log(`✓ API Debug: http://localhost:${PORT}/api/debug`);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
