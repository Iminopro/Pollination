// js/audio.js - Logic for the audio generation page
document.addEventListener('DOMContentLoaded', () => {
    const audioForm = document.getElementById('audio-form');
    const voiceSelect = document.getElementById('audio-voice');
    const audioPlayer = document.getElementById('generated-audio-player');
    const audioErrorDiv = document.getElementById('audio-error');
    const audioLoadingP = document.getElementById('audio-loading');
    const generateButton = document.getElementById('generate-audio-btn');

    // Populate voice options (using SUPPORTED_AUDIO_VOICES from main.js)
    if (voiceSelect && SUPPORTED_AUDIO_VOICES && SUPPORTED_AUDIO_VOICES.length > 0) {
        populateSelect(voiceSelect, SUPPORTED_AUDIO_VOICES, DEFAULT_AUDIO_VOICE);
    } else if (voiceSelect) {
        // Fallback if SUPPORTED_AUDIO_VOICES is not available or empty
        const defaultVoices = {'echo': 'Echo', 'alloy': 'Alloy', 'fable': 'Fable', 'onyx': 'Onyx', 'nova': 'Nova', 'shimmer': 'Shimmer'};
        populateSelect(voiceSelect, defaultVoices, 'echo');
        console.warn("SUPPORTED_AUDIO_VOICES not found or empty in main.js, using minimal fallback voices.");
    }


    if (audioForm) {
        audioForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearError(audioErrorDiv);
            audioPlayer.classList.add('hidden');
            audioPlayer.src = ''; // Clear previous audio
            audioLoadingP.classList.remove('hidden');
            showLoading(generateButton);

            const formData = new FormData(audioForm);
            let prompt = formData.get('prompt');
            const voice = formData.get('voice');
            const mode = formData.get('audio_mode');

            if (!prompt) {
                displayError(audioErrorDiv, "Prompt cannot be empty.");
                audioLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }
            if (!voice) {
                displayError(audioErrorDiv, "Please select a voice.");
                audioLoadingP.classList.add('hidden');
                hideLoading(generateButton);
                return;
            }

            // Modify prompt based on mode, as per Python script logic
            if (mode === 'read') {
                prompt = `For a documentary preparation Read only between [] be natural reading it [${prompt}]`;
            }

            // API uses the TEXT endpoint for audio with specific model
            const params = new URLSearchParams();
            params.append('model', 'openai-audio');
            params.append('voice', voice);
            // Prompt is part of the path for this API structure

            const apiUrl = `${API_BASE_TEXT}/${encodeURIComponent(prompt)}?${params.toString()}`;
            console.log("Requesting audio from:", apiUrl);

            try {
                // The audio data is directly streamed to the audio player's src
                audioPlayer.src = apiUrl;
                audioPlayer.classList.remove('hidden');

                audioPlayer.onloadeddata = () => {
                    audioLoadingP.classList.add('hidden');
                    hideLoading(generateButton);
                    clearError(audioErrorDiv);
                    // audioPlayer.play(); // Optional: auto-play
                };

                audioPlayer.onerror = () => {
                    console.error("Error loading audio. URL was:", audioPlayer.src);
                    // Try to fetch the error text if the API returns a text-based error for audio
                    fetch(apiUrl)
                        .then(res => res.text())
                        .then(errorText => {
                            if (errorText.length > 500) errorText = errorText.substring(0,500) + "... (truncated)"; // Avoid huge error messages
                            displayError(audioErrorDiv, `Error loading audio. API might be down, voice invalid, or prompt too long/complex. Server says: ${errorText}`);
                        })
                        .catch(() => {
                             displayError(audioErrorDiv, "Error loading audio. Check parameters, voice, or API status. The prompt might be too long or contain unsupported characters for the selected voice.");
                        });
                    audioPlayer.classList.add('hidden');
                    audioLoadingP.classList.add('hidden');
                    hideLoading(generateButton);
                };

            } catch (error) { // This catch might not be hit for src-loading errors, onerror handles those.
                displayError(audioErrorDiv, `Client-side error before fetching: ${error.message}`);
                audioPlayer.classList.add('hidden');
                audioLoadingP.classList.add('hidden');
                hideLoading(generateButton);
            }
        });
    } else {
        console.error("#audio-form not found.");
    }
    console.log("audio.js event listeners configured.");
});
