// Load current state
function loadCurrentState() {
    chrome.storage.local.get(['searchCount', 'lastResetDate'], (result) => {
        const currentCount = document.getElementById('currentCount');
        const searchCountInput = document.getElementById('searchCount');
        
        // Only update if the input is not focused
        if (document.activeElement !== searchCountInput) {
            currentCount.textContent = result.searchCount || 0;
            searchCountInput.value = result.searchCount || 0;
        }
        
        if (result.lastResetDate) {
            const date = new Date(result.lastResetDate);
            document.getElementById('lastReset').textContent = date.toLocaleDateString();
        }
    });

    chrome.storage.sync.get({
        fallbackEngine: 'https://duckduckgo.com/?q='
    }, (items) => {
        document.getElementById('fallbackEngine').value = items.fallbackEngine;
    });
}

// Save options
function saveOptions() {
    const fallbackEngine = document.getElementById('fallbackEngine').value;
    chrome.storage.sync.set({
        fallbackEngine: fallbackEngine
    }, () => showStatus('Settings saved.'));
}

// Update search counter
function updateCounter() {
    const newCount = parseInt(document.getElementById('searchCount').value);
    if (isNaN(newCount) || newCount < 0 || newCount > 300) {
        showStatus('Please enter a valid number (0-300)', false);
        return;
    }

    chrome.storage.local.set({
        searchCount: newCount,
        lastResetDate: new Date().toISOString()
    }, () => {
        showStatus('Counter updated.');
        loadCurrentState();
    });
}

// Reset counter to 0
function resetCounter() {
    if (confirm('Reset search counter to 0?')) {
        chrome.storage.local.set({
            searchCount: 0,
            lastResetDate: new Date().toISOString()
        }, () => {
            showStatus('Counter reset to 0.');
            loadCurrentState();
        });
    }
}

// Show status message
function showStatus(message, success = true) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.display = 'block';
    status.style.color = success ? '#008000' : '#cc0000';
    setTimeout(() => {
        status.style.display = 'none';
    }, 2000);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentState();
    
    // Add event listeners for UI elements
    document.getElementById('save').addEventListener('click', saveOptions);
    document.getElementById('updateCounter').addEventListener('click', updateCounter);
    document.getElementById('resetCounter').addEventListener('click', resetCounter);
    
    // Add storage change listener
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.searchCount && 
            document.activeElement !== document.getElementById('searchCount')) {
            loadCurrentState();
        }
    });
});