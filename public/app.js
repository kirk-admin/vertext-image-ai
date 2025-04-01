document.addEventListener('DOMContentLoaded', () => {
    const imageForm = document.getElementById('imageForm');
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const imageContainer = document.getElementById('imageContainer');
    const generatedImage = document.getElementById('generatedImage');
    
    // Error message element to display errors to the user
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.style.display = 'none';
    errorContainer.style.color = '#e74c3c';
    errorContainer.style.marginTop = '1rem';
    errorContainer.style.padding = '0.75rem';
    errorContainer.style.borderRadius = '4px';
    errorContainer.style.backgroundColor = '#ffeaea';
    document.getElementById('resultContainer').prepend(errorContainer);

    // Hide the image container initially
    imageContainer.style.display = 'none';
    loadingIndicator.style.display = 'none';
    
    // Show error message function
    const showError = (message) => {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Get the prompt value
        const promptValue = promptInput.value.trim();
        
        if (!promptValue) {
            showError('Please enter a description for the image you want to generate.');
            return;
        }
        
        try {
            // Hide any previous error
            errorContainer.style.display = 'none';
            
            // Show loading indicator and disable button
            loadingIndicator.style.display = 'flex';
            imageContainer.style.display = 'none';
            generateBtn.disabled = true;
            
            // Make the API request with the prompt
            const response = await fetch(`/generate-image?prompt=${encodeURIComponent(promptValue)}`);
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image');
            }
            
            if (!data.imageUrl) {
                throw new Error('No image URL received from server');
            }
            
            // Display the generated image
            generatedImage.src = data.imageUrl + '?t=' + new Date().getTime(); // Add timestamp to prevent caching
            imageContainer.style.display = 'block';
            
            // Handle image loading error
            generatedImage.onerror = () => {
                throw new Error('Failed to load the generated image');
            };
            
        } catch (error) {
            console.error('Error:', error);
            showError('Error: ' + error.message);
            imageContainer.style.display = 'none';
        } finally {
            // Hide loading indicator and re-enable button
            loadingIndicator.style.display = 'none';
            generateBtn.disabled = false;
        }
    };

    imageForm.addEventListener('submit', handleSubmit);

    // Add keyboard accessibility
    generateBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            generateBtn.click();
        }
    });
}); 