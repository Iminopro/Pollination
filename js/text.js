// js/text.js - Logic for the text generation page
document.addEventListener('DOMContentLoaded', () => {
    const textForm = document.getElementById('text-form');
    const textModelSelect = document.getElementById('text-model');
    const generatedTextContentDiv = document.getElementById('generated-text-content');
    const textErrorDiv = document.getElementById('text-error');
    const textLoadingP = document.getElementById('text-loading');
    const generateButton = document.getElementById('generate-text-btn');

    // Fetch and populate text models
    async function fetchAndPopulateTextModels() {
        try {
            const response = await fetch(`${API_BASE_TEXT}/models`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const models = await response.json(); // Expects an object or array

            let modelNames;
            if (Array.isArray(models)) {
                modelNames = models;
            } else if (typeof models === 'object' && models !== null) {
                modelNames = Object.keys(models);
            } else {
                throw new Error("Unknown format for text models list.");
            }

            if (modelNames.length > 0) {
                populateSelect(textModelSelect, modelNames, DEFAULT_TEXT_MODEL);
            } else {
                 displayError(textErrorDiv, "No text models available from API.");
            }
        } catch (error) {
            console.error("Error fetching text models:", error);
            displayError(textErrorDiv, `Failed to fetch text models: ${error.message}. You may not be able to generate text.`);
            // Fallback to a hardcoded default if API fails and select is empty
            if (textModelSelect.options.length === 0 && DEFAULT_TEXT_MODEL) {
                 populateSelect(textModelSelect, [DEFAULT_TEXT_MODEL], DEFAULT_TEXT_MODEL);
                 clearError(textErrorDiv); // Clear if we at least have a default.
                 displayError(textErrorDiv, `Using default model due to API error: ${DEFAULT_TEXT_MODEL}`);

            }
        }
    }

    fetchAndPopulateTextModels();

    if (textForm) {
        textForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearError(textErrorDiv);
            generatedTextContentDiv.innerHTML = ''; // Clear previous content
            textLoadingP.classList.remove('hidden');
            showLoading(generateButton);

            const formData = new FormData(textForm);
            const prompt = formData.get('prompt');
            const model = formData.get('model');
            // const isOpenAiCompatible = formData.get('text-openai-compatible') === 'on'; // For future use

            if (!prompt) {
                displayError(textErrorDiv, "Prompt cannot be empty.");
                textLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }
            if (!model) {
                displayError(textErrorDiv, "Please select a text model.");
                textLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }

            // Note: The Python script includes complex prompt structuring with [START RESPONSE] etc.
            // For client-side, this is harder to enforce on the API response parsing.
            // We will directly use the prompt as is for now.
            // Also, MAX_GET_LENGTH check and switching to POST is complex client-side without a proxy.
            // We'll warn if prompt is too long.
            if (prompt.length > 2000) { // Arbitrary limit for warning, Python script uses 2500
                console.warn("Prompt is very long, this might cause issues with a GET request.");
            }

            let apiUrl = `${API_BASE_TEXT}/${encodeURIComponent(prompt)}`;
            const queryParams = new URLSearchParams();
            if (model) {
                queryParams.append('model', model);
            }
            apiUrl += `?${queryParams.toString()}`;

            console.log("Requesting text from:", apiUrl);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }

                // Pollinations text API can return JSON { "text": "..." } or plain text
                const contentType = response.headers.get("content-type");
                let textOutput;
                if (contentType && contentType.includes("application/json")) {
                    const jsonData = await response.json();
                    textOutput = jsonData.text || JSON.stringify(jsonData, null, 2); // Fallback to stringify if no 'text' field
                } else {
                    textOutput = await response.text();
                }

                // Basic cleaning: convert \n to <br> for HTML display if not using <pre>
                // If using a div like generatedTextContentDiv:
                // generatedTextContentDiv.innerHTML = textOutput.replace(/\n/g, '<br>');
                // If using a pre tag, it handles newlines automatically:
                const pre = document.createElement('pre');
                pre.textContent = textOutput;
                generatedTextContentDiv.appendChild(pre);

            } catch (error) {
                console.error("Error generating text:", error);
                displayError(textErrorDiv, `Error: ${error.message}`);
            } finally {
                textLoadingP.classList.add('hidden');
                hideLoading(generateButton);
            }
        });
    } else {
        console.error("#text-form not found.");
    }
    console.log("text.js event listeners configured.");
});
