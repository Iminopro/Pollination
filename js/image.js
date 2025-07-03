// js/image.js - Logic for the image generation page
document.addEventListener('DOMContentLoaded', () => {
    const imageForm = document.getElementById('image-form');
    const imageModelSelect = document.getElementById('img-model');
    const generatedImage = document.getElementById('generated-image');
    const imageErrorDiv = document.getElementById('image-error');
    const imageLoadingP = document.getElementById('image-loading'); // Added for loading message
    const generateButton = document.getElementById('generate-image-btn');

    // Populate image models - Using hardcoded list from main.js for now
    // In a real scenario, you might fetch this from API_BASE_IMAGE + "/models"
    populateSelect(imageModelSelect, SUPPORTED_IMAGE_MODELS, DEFAULT_IMAGE_MODEL);

    // Attempt to fetch live models and merge/update the select
    fetchModelsAndPopulate();

    async function fetchModelsAndPopulate() {
        try {
            const response = await fetch(`${API_BASE_IMAGE}/models`);
            if (!response.ok) {
                console.warn(`Could not fetch live image models: ${response.status}. Using defaults.`);
                // populateSelect is already called with SUPPORTED_IMAGE_MODELS
                // If that list is empty, this won't do much, but it's a fallback.
                if (SUPPORTED_IMAGE_MODELS.length === 0 && imageModelSelect.options.length === 0) {
                     displayError(imageErrorDiv, "No image models available. Cannot generate images.");
                }
                return;
            }
            const liveModels = await response.json(); // Assuming JSON response like { "model_name": "description", ... } or ["model1", "model2"]

            let modelNames;
            if (Array.isArray(liveModels)) {
                modelNames = liveModels;
            } else if (typeof liveModels === 'object' && liveModels !== null) {
                modelNames = Object.keys(liveModels);
            } else {
                console.warn("Unknown format for live image models. Using defaults.");
                return; // Keep existing default/hardcoded models
            }

            // Merge with hardcoded list, giving preference to live models if names match,
            // or simply use live models if they are abundant.
            // For simplicity here, we'll just use the live models if fetched successfully.
            if (modelNames.length > 0) {
                populateSelect(imageModelSelect, modelNames, DEFAULT_IMAGE_MODEL);
            } else if (SUPPORTED_IMAGE_MODELS.length === 0 && imageModelSelect.options.length === 0) {
                 displayError(imageErrorDiv, "No image models available (live or default). Cannot generate images.");
            }
            // If live models are empty but defaults exist, defaults are already populated.

        } catch (error) {
            console.warn(`Error fetching live image models: ${error}. Using defaults.`);
            // Ensure defaults are populated if fetch fails and select is empty
            if (SUPPORTED_IMAGE_MODELS.length > 0 && imageModelSelect.options.length === 0) {
                populateSelect(imageModelSelect, SUPPORTED_IMAGE_MODELS, DEFAULT_IMAGE_MODEL);
            } else if (imageModelSelect.options.length === 0) {
                 displayError(imageErrorDiv, "Failed to fetch image models and no defaults available.");
            }
        }
    }


    if (imageForm) {
        imageForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearError(imageErrorDiv);
            generatedImage.classList.add('hidden');
            generatedImage.src = "#"; // Clear previous image
            imageLoadingP.classList.remove('hidden'); // Show loading message
            showLoading(generateButton);


            const formData = new FormData(imageForm);
            const prompt = formData.get('prompt');
            const negativePrompt = formData.get('negative_prompt');
            const model = formData.get('model');
            const width = formData.get('width');
            const height = formData.get('height');
            const seed = formData.get('seed');
            const nologo = formData.get('nologo') === 'on'; // Checkbox value is 'on' or null
            const enhance = formData.get('enhance') === 'on';
            const safe = formData.get('safe') === 'on';
            const privateGen = formData.get('private') === 'on'; // 'private' is a reserved keyword

            if (!prompt) {
                displayError(imageErrorDiv, "Prompt cannot be empty.");
                imageLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }
            if (!model) {
                displayError(imageErrorDiv, "Please select an image model.");
                imageLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }


            const params = new URLSearchParams();
            // Prompt is part of the path
            if (negativePrompt) params.append('negative_prompt', negativePrompt);
            if (model) params.append('model', model);
            if (width) params.append('width', width);
            if (height) params.append('height', height);
            if (seed) params.append('seed', seed);
            if (nologo) params.append('nologo', 'true');
            if (enhance) params.append('enhance', 'true');
            if (safe) params.append('safe', 'true');
            if (privateGen) params.append('private', 'true'); // 'private' from form

            const API_URL_IMAGE_PROMPT = `${API_BASE_IMAGE}/prompt/${encodeURIComponent(prompt)}`;
            const fullUrl = `${API_URL_IMAGE_PROMPT}?${params.toString()}`;

            console.log("Requesting image from:", fullUrl);

            try {
                // No need to fetch, the image src will do the request
                generatedImage.src = fullUrl;
                generatedImage.classList.remove('hidden');

                generatedImage.onload = () => {
                    imageLoadingP.classList.add('hidden');
                    hideLoading(generateButton);
                    clearError(imageErrorDiv); // Clear any previous error
                };

                generatedImage.onerror = () => {
                    displayError(imageErrorDiv, "Error loading image. Check parameters or API might be down. The URL might be too long for a GET request if the prompt is very large.");
                    generatedImage.classList.add('hidden');
                    imageLoadingP.classList.add('hidden');
                    hideLoading(generateButton);
                };

            } catch (error) {
                displayError(imageErrorDiv, `Network error: ${error.message}`);
                generatedImage.classList.add('hidden');
                imageLoadingP.classList.add('hidden');
                hideLoading(generateButton);
            }
        });
    } else {
        console.error("#image-form not found.");
    }
    console.log("image.js event listeners configured.");
});
