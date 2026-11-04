// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.querySelector('.progress-bar');
const uploadStatus = document.getElementById('uploadStatus');
const gallery = document.getElementById('gallery');
const galleryStatus = document.getElementById('galleryStatus');
const refreshBtn = document.getElementById('refreshBtn');

// Transform elements
const publicIdInput = document.getElementById('publicId');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const effectSelect = document.getElementById('effect');
const qualitySelect = document.getElementById('quality');
const transformBtn = document.getElementById('transformBtn');
const transformResult = document.getElementById('transformResult');
const transformedImage = document.getElementById('transformedImage');
const transformUrl = document.getElementById('transformUrl');
const copyUrlBtn = document.getElementById('copyUrlBtn');

// Analysis elements
const analyzePublicIdInput = document.getElementById('analyzePublicId');
const analyzeBtn = document.getElementById('analyzeBtn');
const analysisResult = document.getElementById('analysisResult');
const assetInfo = document.getElementById('assetInfo');
const transformationGrid = document.getElementById('transformationGrid');

async function parseApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();

    if (!contentType.includes('application/json')) {
        const reason = response.status === 404
            ? 'The API endpoint is unavailable. Redeploy the project with its Vercel serverless functions.'
            : 'The server returned a non-JSON response.';
        throw new Error(`${reason} (HTTP ${response.status})`);
    }

    let data;
    try {
        data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
        throw new Error(`The server returned invalid JSON. (HTTP ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(data.error || `Request failed. (HTTP ${response.status})`);
    }

    return data;
}

// Upload handlers
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#f0f0ff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    handleFileUpload(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
    }
});

async function handleFileUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.classList.remove('hidden');
    uploadStatus.classList.remove('success', 'error');

    try {
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 30;
                progressBar.style.width = Math.min(progress, 90) + '%';
            }
        }, 200);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        clearInterval(interval);
        progressBar.style.width = '100%';

        const data = await parseApiResponse(response);

        if (data.success) {
            uploadStatus.classList.add('success');
            uploadStatus.textContent = `✓ Uploaded successfully! Public ID: ${data.public_id}`;
            fileInput.value = '';
            
            // Refresh gallery
            setTimeout(() => {
                loadGallery();
                uploadProgress.classList.add('hidden');
                progressBar.style.width = '0%';
            }, 500);
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        uploadProgress.classList.add('hidden');
        uploadStatus.classList.add('error');
        uploadStatus.textContent = `✗ Upload failed: ${error.message}`;
    }
}

// Gallery functions
async function loadGallery() {
    try {
        galleryStatus.classList.remove('success', 'error');
        galleryStatus.textContent = 'Loading gallery...';
        
        const response = await fetch('/api/assets');
        
        const data = await parseApiResponse(response);

        if (!data.success) {
            throw new Error(data.error || 'Failed to load gallery');
        }

        gallery.innerHTML = '';

        if (!data.assets || data.assets.length === 0) {
            galleryStatus.classList.add('success');
            galleryStatus.textContent = data.message || '📸 No images yet. Upload one to get started!';
            return;
        }

        data.assets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const publicIdWithoutFolder = asset.public_id.replace('mediavault/', '');
            
            item.innerHTML = `
                <img src="${asset.secure_url}" alt="Gallery item" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2214%22 fill=%22%23999%22%3EImage Error%3C/text%3E%3C/svg%3E'">
                <div class="gallery-item-info">
                    <div class="gallery-item-id">${publicIdWithoutFolder}</div>
                    <div class="gallery-item-actions">
                        <button class="btn-select">Select</button>
                        <button class="btn-delete">Delete</button>
                    </div>
                </div>
            `;

            const selectBtn = item.querySelector('.btn-select');
            const deleteBtn = item.querySelector('.btn-delete');

            selectBtn.addEventListener('click', () => {
                publicIdInput.value = publicIdWithoutFolder;
                analyzePublicIdInput.value = publicIdWithoutFolder;
            });

            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this image?')) {
                    await deleteAsset(publicIdWithoutFolder);
                }
            });

            gallery.appendChild(item);
        });

        galleryStatus.classList.add('success');
        galleryStatus.textContent = `✓ Loaded ${data.assets.length} image(s)`;
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryStatus.classList.add('error');
        galleryStatus.textContent = `✗ Error: ${error.message}`;
    }
}

async function deleteAsset(publicId) {
    try {
        const response = await fetch(`/api/assets?public_id=${encodeURIComponent(publicId)}`, {
            method: 'DELETE'
        });

        await parseApiResponse(response);

        galleryStatus.classList.remove('error');
        galleryStatus.classList.add('success');
        galleryStatus.textContent = '✓ Image deleted successfully';
        loadGallery();
    } catch (error) {
        galleryStatus.classList.remove('success');
        galleryStatus.classList.add('error');
        galleryStatus.textContent = `✗ Delete failed: ${error.message}`;
    }
}

refreshBtn.addEventListener('click', loadGallery);

// Transform functions
transformBtn.addEventListener('click', async () => {
    const publicId = publicIdInput.value.trim();

    if (!publicId) {
        alert('Please enter a public ID');
        return;
    }

    try {
        const response = await fetch('/api/transform', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                public_id: publicId,
                width: widthInput.value || null,
                height: heightInput.value || null,
                effect: effectSelect.value || null,
                quality: qualitySelect.value
            })
        });

        const data = await parseApiResponse(response);

        transformedImage.src = data.url;
        transformUrl.textContent = data.url;
        transformResult.classList.remove('hidden');
    } catch (error) {
        alert(`Transform error: ${error.message}`);
    }
});

copyUrlBtn.addEventListener('click', () => {
    const url = transformUrl.textContent;
    navigator.clipboard.writeText(url).then(() => {
        const originalText = copyUrlBtn.textContent;
        copyUrlBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyUrlBtn.textContent = originalText;
        }, 2000);
    });
});

// Analysis functions
analyzeBtn.addEventListener('click', async () => {
    const publicId = analyzePublicIdInput.value.trim();

    if (!publicId) {
        alert('Please enter a public ID to analyze');
        return;
    }

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_id: publicId })
        });

        const report = await parseApiResponse(response);
        displayAnalysisReport(report);
    } catch (error) {
        alert(`Analysis error: ${error.message}`);
    }
});

function displayAnalysisReport(report) {
    const asset = report.asset;

    // Display asset info
    assetInfo.innerHTML = `
        <div class="info-item">
            <strong>Public ID</strong>
            <span>${asset.public_id}</span>
        </div>
        <div class="info-item">
            <strong>Format</strong>
            <span>${asset.format.toUpperCase()}</span>
        </div>
        <div class="info-item">
            <strong>Dimensions</strong>
            <span>${asset.width} × ${asset.height}px</span>
        </div>
        <div class="info-item">
            <strong>File Size</strong>
            <span>${(asset.bytes / 1024).toFixed(2)} KB</span>
        </div>
        <div class="info-item">
            <strong>Created</strong>
            <span>${new Date(asset.created_at).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
            <strong>Type</strong>
            <span>${asset.type}</span>
        </div>
    `;

    // Display transformations
    transformationGrid.innerHTML = `
        <div class="transformation-item">
            <img src="${report.transformations.thumbnail}" alt="Thumbnail">
            <div class="transformation-item-label">Thumbnail (300×300)</div>
        </div>
        <div class="transformation-item">
            <img src="${report.transformations.medium}" alt="Medium">
            <div class="transformation-item-label">Medium (600×600)</div>
        </div>
        <div class="transformation-item">
            <img src="${report.transformations.large}" alt="Large">
            <div class="transformation-item-label">Large (1200×1200)</div>
        </div>
        <div class="transformation-item">
            <img src="${report.transformations.grayscale}" alt="Grayscale">
            <div class="transformation-item-label">Grayscale</div>
        </div>
        <div class="transformation-item">
            <img src="${report.transformations.sepia}" alt="Sepia">
            <div class="transformation-item-label">Sepia</div>
        </div>
    `;

    analysisResult.classList.remove('hidden');
}

// Load gallery on page load
window.addEventListener('load', () => {
    loadGallery();
});
