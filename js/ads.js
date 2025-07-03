// js/ads.js - Ad Banner Configuration and Injection Logic

/**
 * Ad Slot Configuration
 * ---------------------
 * For each ad slot you want to define:
 * 1. Key: This should match the ID of the HTML placeholder element (e.g., "ad-placeholder-top-banner").
 * 2. Properties:
 *    - enabled: (boolean) Set to true to display this ad, false to disable.
 *    - adNetwork: (string) Name of the ad network (for your reference, e.g., "AdSense", "Adsterra").
 *    - adCode: (string) The EXACT ad tag or script provided by the ad network.
 *              IMPORTANT: Ensure this code is correctly copied and pasted.
 *                         JavaScript within this string will be executed.
 *
 * Example Ad Codes (Illustrative - REPLACE WITH YOUR ACTUAL CODES):
 *
 * AdSense:
 * '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-YOUR_CLIENT_ID" data-ad-slot="YOUR_SLOT_ID" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});<\/script>'
 *
 * Adsterra (Banner Example - their codes vary):
 * '<script async="async" data-cfasync="false" src="//pl22961025.highcpmgate.com/YOUR_ADSTERRA_KEY/invoke.js"><\/script><div id="container-YOUR_ADSTERRA_KEY"></div>'
 * (Note: Adsterra often uses a loader script and a div container. You might need to adjust how this is injected or ensure their script targets the correct placeholder ID if it creates its own div).
 *
 * PropellerAds (Smart Link / OnClick - Banners might be different):
 * '<script data-cfasync="false" async="async" type="text/javascript" src="//thubanoa.com/apu.php?zoneid=YOUR_ZONE_ID"><\/script>'
 *
 * PopAds (Popunder - Banners might be different):
 * '<script type="text/javascript" data-cfasync="false" src="//c.popads.net/pop.js?uid=YOUR_UID"><\/script>'
 *
 */
const adSlotsConfig = {
    "ad-placeholder-top-banner": {
        enabled: false, // Set to true to enable this ad slot
        adNetwork: "YourAdNetwork1", // e.g., "AdSense"
        adCode: `<!-- Paste Ad Code for Top Banner Here -->
                 <!-- Example: <img src="https://via.placeholder.com/728x90.png?text=Top+Ad+Banner+Slot" alt="Top Ad Placeholder"> -->`
    },
    "ad-placeholder-bottom-banner": {
        enabled: false, // Set to true to enable this ad slot
        adNetwork: "YourAdNetwork2", // e.g., "Adsterra"
        adCode: `<!-- Paste Ad Code for Bottom Banner Here -->
                 <!-- Example: <img src="https://via.placeholder.com/728x90.png?text=Bottom+Ad+Banner+Slot" alt="Bottom Ad Placeholder"> -->`
    },
    // Add more ad slots here if needed, e.g.:
    // "ad-placeholder-sidebar": {
    //     enabled: false,
    //     adNetwork: "YourAdNetwork3",
    //     adCode: "<!-- Paste Ad Code for Sidebar Here -->"
    // },
};

/**
 * Injects ad codes into their respective placeholders in the HTML.
 */
function loadAds() {
    console.log("Attempting to load ads...");
    for (const placeholderId in adSlotsConfig) {
        if (adSlotsConfig.hasOwnProperty(placeholderId)) {
            const config = adSlotsConfig[placeholderId];
            const placeholderElement = document.getElementById(placeholderId);

            if (placeholderElement) {
                if (config.enabled && config.adCode && config.adCode.trim() !== "" && !config.adCode.startsWith("<!-- Paste")) {
                    console.log(`Loading ad for: ${placeholderId} from ${config.adNetwork}`);
                    placeholderElement.innerHTML = config.adCode;

                    // Some ad scripts (like AdSense or scripts that use document.write)
                    // might need to be re-evaluated after being injected via innerHTML.
                    // This is a common technique to execute scripts inserted this way.
                    const scripts = placeholderElement.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        const newScript = document.createElement('script');
                        // Copy attributes
                        for (let j = 0; j < script.attributes.length; j++) {
                            newScript.setAttribute(script.attributes[j].name, script.attributes[j].value);
                        }
                        if (script.src) {
                            newScript.src = script.src; // Keep external scripts as is
                        } else {
                            newScript.textContent = script.textContent; // For inline scripts
                        }
                        // Replace the old script tag with the new one to trigger execution
                        script.parentNode.replaceChild(newScript, script);
                    }
                    placeholderElement.style.display = 'block'; // Ensure placeholder is visible
                } else {
                    placeholderElement.style.display = 'none'; // Hide disabled or unconfigured placeholders
                    if(config.enabled && (config.adCode.trim() === "" || config.adCode.startsWith("<!-- Paste"))){
                        console.warn(`Ad slot ${placeholderId} is enabled but no valid ad code is provided.`);
                    }
                }
            } else {
                console.warn(`Ad placeholder element with ID "${placeholderId}" not found.`);
            }
        }
    }
}

// Load ads when the DOM is fully ready
document.addEventListener('DOMContentLoaded', loadAds);
