"""
Cloudinary Creator Portfolio - Python Example
Alternative implementation using Flask and Python SDK
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Routes

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload():
    """Upload an image to Cloudinary"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Upload to Cloudinary with eager transformations
        result = cloudinary.uploader.upload(
            file,
            folder='creator-portfolio',
            resource_type='auto',
            eager=[
                {'width': 300, 'height': 300, 'crop': 'fill', 
                 'quality': 'auto', 'fetch_format': 'auto'},
                {'width': 600, 'height': 600, 'crop': 'fill', 
                 'quality': 'auto', 'fetch_format': 'auto'},
                {'width': 1200, 'height': 1200, 'crop': 'fill', 
                 'quality': 'auto', 'fetch_format': 'auto'}
            ],
            tags=['creator-portfolio']
        )
        
        return jsonify({
            'success': True,
            'public_id': result['public_id'],
            'url': result['secure_url'],
            'width': result['width'],
            'height': result['height'],
            'format': result['format']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets', methods=['GET'])
def get_assets():
    """Get all uploaded assets"""
    try:
        resources = cloudinary.api.resources(
            type='upload',
            prefix='creator-portfolio/',
            max_results=100,
            resource_type='image'
        )
        
        assets = []
        for resource in resources['resources']:
            assets.append({
                'public_id': resource['public_id'],
                'url': cloudinary.CloudinaryResource(
                    resource['public_id']
                ).build_url(
                    width=300, height=300, crop='fill',
                    quality='auto', fetch_format='auto'
                ),
                'secure_url': cloudinary.CloudinaryResource(
                    resource['public_id']
                ).build_url(
                    width=300, height=300, crop='fill',
                    quality='auto', fetch_format='auto',
                    secure=True
                ),
                'created_at': resource['created_at']
            })
        
        return jsonify({
            'success': True,
            'assets': assets
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transform', methods=['POST'])
def transform():
    """Apply transformations to an asset"""
    try:
        data = request.json
        public_id = data.get('public_id')
        
        if not public_id:
            return jsonify({'error': 'public_id is required'}), 400
        
        transformations = []
        
        if data.get('width') or data.get('height'):
            transformations.append({
                'width': data.get('width') or 'auto',
                'height': data.get('height') or 'auto',
                'crop': 'fill',
                'gravity': 'auto'
            })
        
        if data.get('effect'):
            transformations.append({'effect': data.get('effect')})
        
        transformations.append({
            'quality': data.get('quality', 'auto'),
            'fetch_format': 'auto'
        })
        
        url = cloudinary.CloudinaryResource(public_id).build_url(
            transformation=transformations,
            secure=True
        )
        
        return jsonify({
            'url': url,
            'public_id': public_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assets/<public_id>', methods=['DELETE'])
def delete_asset(public_id):
    """Delete an asset"""
    try:
        full_public_id = f"creator-portfolio/{public_id}"
        result = cloudinary.uploader.destroy(full_public_id)
        
        return jsonify({
            'success': True,
            'message': 'Asset deleted',
            'result': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze an asset"""
    try:
        data = request.json
        public_id = data.get('public_id')
        
        if not public_id:
            return jsonify({'error': 'public_id is required'}), 400
        
        # Get asset details
        asset = cloudinary.api.resource(public_id)
        
        # Build transformation URLs
        report = {
            'asset': {
                'public_id': public_id,
                'type': asset.get('type'),
                'format': asset.get('format'),
                'width': asset.get('width'),
                'height': asset.get('height'),
                'bytes': asset.get('bytes'),
                'created_at': asset.get('created_at')
            },
            'transformations': {
                'thumbnail': cloudinary.CloudinaryResource(public_id).build_url(
                    width=300, height=300, crop='fill',
                    quality='auto', fetch_format='auto'
                ),
                'medium': cloudinary.CloudinaryResource(public_id).build_url(
                    width=600, height=600, crop='fill',
                    quality='auto', fetch_format='auto'
                ),
                'large': cloudinary.CloudinaryResource(public_id).build_url(
                    width=1200, height=1200, crop='fill',
                    quality='auto', fetch_format='auto'
                ),
                'grayscale': cloudinary.CloudinaryResource(public_id).build_url(
                    effect='grayscale',
                    quality='auto', fetch_format='auto'
                ),
                'sepia': cloudinary.CloudinaryResource(public_id).build_url(
                    effect='sepia',
                    quality='auto', fetch_format='auto'
                )
            }
        }
        
        return jsonify(report)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'cloudinary_configured': bool(os.getenv('CLOUDINARY_CLOUD_NAME'))
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)
