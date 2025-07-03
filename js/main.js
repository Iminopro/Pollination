// js/main.js - Shared utility functions and constants

// API Base URLs (inspired by Pollinations.AI documentation)
const API_BASE_IMAGE = "https://image.pollinations.ai";
const API_BASE_TEXT = "https://text.pollinations.ai";

// Constants from Python Script (Defaults and configurations)
const DEFAULT_IMAGE_MODEL = 'Flux-anime';
const DEFAULT_TEXT_MODEL = 'openai'; // As per python script default
const DEFAULT_AUDIO_VOICE = 'echo';
const DEFAULT_IMAGE_WIDTH = 1024;
const DEFAULT_IMAGE_HEIGHT = 1024;

const SUPPORTED_IMAGE_MODELS = [ // From ImageParams in Python script
    'Flux-anime', 'Flux-realism', 'Flux-3d', 'Flux', 'Turbo',
    'Any-dark', 'Stable-diffusion', 'Stable-diffusion-xl',
    'Playground', 'Deliberate'
];

const SUPPORTED_AUDIO_VOICES = [ // From AudioParams in Python script
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer',
    'coral', 'verse', 'ballad', 'ash', 'sage', 'amuch',
    'aster', 'brook', 'clover', 'dan', 'elan', 'marilyn', 'meadow'
];

/**
 * Populates a select dropdown with options.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {Array<string>|Object} options - An array of string options, or an object where keys are values and values are text content.
 * @param {string} [defaultValue] - The default value to select.
 */
function populateSelect(selectElement, options, defaultValue) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options

    if (Array.isArray(options)) {
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            selectElement.appendChild(option);
        });
    } else if (typeof options === 'object' && options !== null) {
        for (const value in options) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = options[value];
            selectElement.appendChild(option);
        }
    }

    if (defaultValue) {
        selectElement.value = defaultValue;
    } else if (selectElement.options.length > 0) {
        selectElement.selectedIndex = 0; // Select the first option if no default
    }
}

/**
 * Displays an error message in a specified element.
 * @param {HTMLElement} errorElement - The HTML element to display the error in.
 * @param {string} message - The error message.
 */
function displayError(errorElement, message) {
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    errorElement.classList.add('error-message');
}

/**
 * Clears any error message from a specified element.
 * @param {HTMLElement} errorElement - The HTML element to clear the error from.
 */
function clearError(errorElement) {
    if (!errorElement) return;
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
    errorElement.classList.remove('error-message');
}

/**
 * Shows a loading indicator.
 * @param {HTMLElement} buttonElement - The button that triggered the loading.
 * @param {string} [originalButtonText] - The original text of the button.
 */
function showLoading(buttonElement, originalButtonText = "Generate") {
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.dataset.originalText = buttonElement.textContent;
        buttonElement.textContent = 'Loading...';
    }
}

/**
 * Hides a loading indicator.
 * @param {HTMLElement} buttonElement - The button that was showing loading.
 */
function hideLoading(buttonElement) {
    if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.textContent = buttonElement.dataset.originalText || "Generate";
    }
}


// Basic navigation active link highlighting (optional, can be expanded)
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('header nav a');
    const currentPath = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active'); // Assuming an 'active' class is defined in CSS
        }
    });
});

// Add a simple 'active' class style to css/style.css if you use the above:
// header nav a.active {
//     font-weight: bold;
//     color: #0779e4; /* Or your theme's highlight color */
// }
// (This is commented out here as it should be in the CSS file)

console.log("main.js loaded");
// Further shared utilities can be added here.
