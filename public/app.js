document.addEventListener('DOMContentLoaded', () => {
    const imageForm = document.getElementById('imageForm');
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const loadingSection = document.querySelector('.loading-section');
    const resultImage = document.getElementById('resultImage');
    const errorMessage = document.getElementById('errorMessage');
    const referenceSelect = document.getElementById('referenceSelect');
    const referencePreview = document.getElementById('referencePreview');
    const resultContainer = document.getElementById('resultContainer');
    
    // Show error message function
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    };

    // Load available reference images
    async function loadReferenceImages() {
        try {
            console.log('Loading reference images...');
            const response = await fetch('/reference-images');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const images = await response.json();
            console.log('Loaded images:', images);
            
            // Clear existing options except the first one
            while (referenceSelect.options.length > 1) {
                referenceSelect.remove(1);
            }
            
            // Add new options
            images.forEach(image => {
                const option = document.createElement('option');
                option.value = image.name;
                option.textContent = image.name;
                referenceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading reference images:', error);
            showError('Failed to load reference images');
        }
    }

    // Handle reference image selection
    referenceSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
            referencePreview.src = `/reference/${selectedValue}`;
            referencePreview.style.display = 'block';
        } else {
            referencePreview.style.display = 'none';
        }
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showError('Please enter a prompt');
            return;
        }

        // Show loading state
        loadingSection.style.display = 'block';
        resultImage.style.display = 'none';
        errorMessage.style.display = 'none';
        generateBtn.disabled = true;

        try {
            // Build the URL with query parameters
            const params = new URLSearchParams({ prompt });
            const selectedReference = referenceSelect.value;
            if (selectedReference) {
                params.append('reference', selectedReference);
            }

            const response = await fetch(`/generate-image?${params.toString()}`);
            const data = await response.json();

            if (data.error) {
                showError(data.error);
                return;
            }

            // Display the generated image
            resultImage.src = data.imageUrl + '?t=' + new Date().getTime(); // Add timestamp to prevent caching
            resultImage.style.display = 'block';
        } catch (error) {
            console.error('Error generating image:', error);
            showError('Failed to generate image. Please try again.');
        } finally {
            // Hide loading state
            loadingSection.style.display = 'none';
            generateBtn.disabled = false;
        }
    };

    // Event listeners
    imageForm.addEventListener('submit', handleSubmit);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    });

    // Load reference images when the page loads
    loadReferenceImages();

    // Add keyboard accessibility
    generateBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            generateBtn.click();
        }
    });
}); 