# ☁️ Cloudinary Creator Portfolio

A full-featured media portfolio platform built with Cloudinary APIs, demonstrating upload, transformation, optimization, and asset management capabilities. Perfect for joining the Cloudinary Creator Community!

## 🌟 Features

### ✅ Core Features Demonstrated

1. **Upload API**
   - Drag-and-drop file uploads
   - Eager transformations (automatic thumbnail generation)
   - Organized storage with folders
   - Asset tagging and metadata

2. **Transformation Engine**
   - Real-time image resizing and cropping
   - Effects: grayscale, sepia, blur, cartoonify
   - Quality and format optimization
   - Responsive image generation (multiple sizes)

3. **Auto Optimization**
   - `f_auto` for format detection
   - `q_auto` for quality optimization
   - Automatic responsive image delivery

4. **Asset Management**
   - Browse all uploaded media
   - Search and filter assets
   - Delete/organize assets
   - View asset details and metadata

5. **Advanced Analysis**
   - Asset information retrieval
   - Transformation preview
   - File size and dimension analysis
   - Multiple variant generation

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Cloudinary Account (free tier available at https://cloudinary.com)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd /path/to/cloudinary-creator-portfolio
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and add your Cloudinary credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

### Running the Project

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The application will be available at `http://localhost:5000`

## 📱 Usage Guide

### 1. Upload Media

1. Click the upload area or drag and drop images
2. Images are automatically stored in the `creator-portfolio` folder
3. Eager transformations create thumbnails (300×300, 600×600, 1200×1200)
4. View uploaded images in the gallery

### 2. Transform Media

1. Select an image from the gallery or enter the public ID
2. Adjust transformation parameters:
   - **Width/Height**: Resize dimensions
   - **Effect**: Apply visual effects
   - **Quality**: Set compression level
3. View the transformation result with URL

### 3. Analyze Media

1. Enter a public ID or select from gallery
2. View asset information:
   - File size and dimensions
   - Format and creation date
   - Upload metadata
3. Preview multiple transformation variants:
   - Different sizes (responsive)
   - Different effects

### 4. Delete Assets

- Click the delete button on any gallery item
- Confirm deletion
- Asset is permanently removed from Cloudinary

## 🛠️ API Endpoints

### Upload

**POST** `/api/upload`
- Upload images with eager transformations
- Supports drag-and-drop
- Returns: public_id, URL, dimensions

### Transform

**POST** `/api/transform`
- Apply transformations to existing assets
- Parameters:
  - `public_id`: Asset to transform
  - `width`, `height`: Dimensions
  - `effect`: Visual effect
  - `quality`: Quality level
- Returns: transformation URL

### Assets

**GET** `/api/assets`
- List all assets in portfolio
- Returns: Array of assets with URLs

**DELETE** `/api/assets/:public_id`
- Delete an asset
- Returns: Deletion confirmation

### Analysis

**POST** `/api/analyze`
- Get detailed asset information
- Generate transformation variants
- Returns: Asset info and transformation URLs

## 🌐 Cloudinary APIs Used

### Upload API
```javascript
cloudinary.uploader.upload_stream({
  folder: 'creator-portfolio',
  eager: [transformations],
  tags: ['creator-portfolio']
})
```

### Admin API
```javascript
cloudinary.api.resources()  // List assets
cloudinary.api.resource()   // Get asset details
cloudinary.uploader.destroy() // Delete asset
```

### URL Generation
```javascript
cloudinary.url(public_id, {
  transformation: [
    { width, height, crop },
    { quality: 'auto', fetch_format: 'auto' }
  ]
})
```

## 📊 Project Structure

```
.
├── server.js              # Express server & API routes
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── README.md             # This file
└── public/
    ├── index.html        # Frontend UI
    ├── app.js            # JavaScript logic
    └── styles.css        # Styling
```

## 🎯 Perfect For

✅ Cloudinary Creator Community Application  
✅ Portfolio & Resume Projects  
✅ Demonstrating Cloudinary Skills  
✅ Learning Cloudinary APIs  
✅ Building on Top (extend with database, auth, etc.)

## 💡 Extension Ideas

- **User Authentication**: Add login/signup
- **Persistent Storage**: Save favorites with database
- **AI Analysis**: Use Cloudinary AI add-ons
- **Batch Operations**: Upload multiple files
- **Custom Presets**: Save transformation presets
- **Social Sharing**: Generate social media previews
- **Admin Dashboard**: Manage multiple portfolios
- **Analytics**: Track asset performance

## 🔐 Security Best Practices

✅ **Environment Variables**: Never commit credentials to Git  
✅ **HTTPS URLs**: All delivery URLs use secure HTTPS  
✅ **API Secret**: Used server-side only, never exposed to client  
✅ **CORS**: Configure as needed for production  

## 📚 Learning Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload API Guide](https://cloudinary.com/documentation/upload_api_reference)
- [Transformation Reference](https://cloudinary.com/documentation/image_transformation_reference)
- [Admin API Reference](https://cloudinary.com/documentation/admin_api)
- [JavaScript SDK](https://cloudinary.com/documentation/javascript_integration)

## 🚀 Deployment

### Option 1: Heroku

```bash
heroku create your-app-name
git push heroku main
heroku config:set CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx
```

### Option 2: Vercel

```bash
vercel deploy
```

### Option 3: Any Node.js Host

- Set environment variables
- Run `npm install && npm start`

## 📝 API Key Configuration

Your credentials are already provided:
- Cloud Name: `kw8z8fok`
- API Key: `881328589738888`
- API Secret: See `.env` file

⚠️ **IMPORTANT**: Keep API Secret private! Never commit to Git or expose in client-side code.

## 🎨 UI Features

- **Modern Design**: Gradient background with clean interface
- **Responsive**: Works on desktop and mobile
- **Real-time Feedback**: Status messages and progress indicators
- **Gallery Grid**: Visual asset browsing
- **Drag & Drop**: Easy file uploads
- **Interactive Controls**: Transformation parameters

## 🐛 Troubleshooting

### Issue: "Cloudinary credentials not configured"
**Solution**: Check `.env` file has correct values

### Issue: Upload fails
**Solution**: Ensure file is an image, check file size

### Issue: Transformation doesn't apply
**Solution**: Verify public_id is correct, check effect spelling

### Issue: "403 Forbidden" errors
**Solution**: Verify API credentials and network connectivity

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Feel free to fork, modify, and create your own version. Share your improvements!

## 📞 Support

- **Cloudinary Support**: https://support.cloudinary.com
- **Documentation**: https://cloudinary.com/documentation
- **Community**: https://support.cloudinary.com/hc/en-us

---

**Built with ❤️ for the Cloudinary Creator Community**

Happy creating! 🚀
