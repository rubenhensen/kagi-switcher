// Global variables to prevent double execution
let isHandlingSearch = false;
let redirecting = false;

// Helper function to check if a URL is a search URL
function isSearchURL(url) {
    return url.includes('/search') || (url.includes('kagi.com') && url.includes('?q='));
}

// Helper function to extract query
function getSearchQuery(url) {
    try {
        const params = new URLSearchParams(new URL(url).search);
        return params.get('q');
    } catch (e) {
        console.error('Failed to parse URL:', e);
        return null;
    }
}

// Main search handling function
async function handleSearch() {
    if (isHandlingSearch || redirecting) {
        console.log('Already handling search or redirecting');
        return;
    }

    isHandlingSearch = true;
    console.log('Starting search handler');
    console.log('Current URL:', window.location.href);

    try {
        // Check if this is a search URL
        if (!isSearchURL(window.location.href)) {
            console.log('Not a search URL');
            return;
        }

        const query = getSearchQuery(window.location.href);
        if (!query) {
            console.log('No query found');
            return;
        }

        console.log('Processing query:', query);

        // Get current count
        const storage = await chrome.storage.local.get(['searchCount']);
        const count = storage.searchCount || 0;
        console.log('Current count:', count);

        // Check if over limit
        if (count >= 100) {
            console.log('Over limit, preparing to redirect');
            redirecting = true;

            const fallback = await chrome.storage.sync.get({
                fallbackEngine: 'https://duckduckgo.com/?q='
            });

            const redirectUrl = `${fallback.fallbackEngine}${encodeURIComponent(query)}`;
            console.log('Redirecting to:', redirectUrl);

            // Stop page load and redirect
            window.stop();
            window.location.replace(redirectUrl);
            return;
        } else if (window.location.pathname.includes('/search')) {
            // Only increment if on actual search page
            console.log('Incrementing count');
            await chrome.storage.local.set({
                searchCount: count + 1,
                lastResetDate: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error in handleSearch:', error);
    } finally {
        isHandlingSearch = false;
    }
}

// Start up
console.log('Initializing content script');
handleSearch();
