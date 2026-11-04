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

        const data = await response.json();

        if (response.ok) {
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
            throw new Error(data.error);
        }
    } catch (error) {
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
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error);
        }

        gallery.innerHTML = '';

        if (data.assets.length === 0) {
            galleryStatus.textContent = 'No images uploaded yet. Upload one to get started!';
            return;
        }

        data.assets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const publicIdWithoutFolder = asset.public_id.replace('creator-portfolio/', '');
            
            item.innerHTML = `
                <img src="${asset.secure_url}" alt="Gallery item">
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
        galleryStatus.classList.add('error');
        galleryStatus.textContent = `✗ Failed to load gallery: ${error.message}`;
    }
}

async function deleteAsset(publicId) {
    try {
        const response = await fetch(`/api/assets/${encodeURIComponent(publicId)}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            galleryStatus.classList.remove('error');
            galleryStatus.classList.add('success');
            galleryStatus.textContent = '✓ Image deleted successfully';
            loadGallery();
        } else {
            throw new Error(data.error);
        }
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

        const data = await response.json();

        if (response.ok) {
            transformedImage.src = data.url;
            transformUrl.textContent = data.url;
            transformResult.classList.remove('hidden');
        } else {
            alert(`Transform failed: ${data.error}`);
        }
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

        const report = await response.json();

        if (response.ok) {
            displayAnalysisReport(report);
        } else {
            alert(`Analysis failed: ${report.error}`);
        }
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
