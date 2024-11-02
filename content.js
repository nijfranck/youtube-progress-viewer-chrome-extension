// Default settings
let settings = {
    opacity: 0.8,
    position: 'top-left',
    showText: false,
    fontSize: '12px',
    padding: '5px 7px',
    margin: '15px',
    bottomMargin: '60px',  // Extra margin for bottom positions
    roundTo: 1,
    hideWhenPaused: false,
    backgroundColor: '#000000',
    textColor: '#ffffff'
};

// Load saved settings
chrome.storage.sync.get('youtubePercentageSettings', (data) => {
    if (data.youtubePercentageSettings) {
        settings = { ...settings, ...data.youtubePercentageSettings };
    }
});

// Add some CSS to ensure the player container can show the overlay
const style = document.createElement('style');
style.textContent = `
    #movie_player {
        position: relative !important;
        overflow: visible !important;
    }
    #watched-percentage-container {
        position: absolute !important;
        z-index: 9999 !important;
    }
`;
document.head.appendChild(style);

// Create settings menu
function createSettingsMenu() {
    const menu = document.createElement('div');
    menu.id = 'yt-percentage-settings';
    
    Object.assign(menu.style, {
        position: 'absolute',
        zIndex: '10000',
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'none',
        width: '250px'
    });

    menu.innerHTML = `
        <style>
            #yt-percentage-settings {
                font-family: Roboto, Arial, sans-serif;
                font-size: 14px;
            }
            #yt-percentage-settings label {
                display: block;
                margin: 8px 0;
            }
            #yt-percentage-settings input[type="number"],
            #yt-percentage-settings input[type="text"],
            #yt-percentage-settings select {
                width: 100%;
                padding: 4px;
                margin: 4px 0;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            #yt-percentage-settings input[type="color"] {
                padding: 0;
                width: 50px;
                height: 25px;
                vertical-align: middle;
            }
            .settings-row {
                margin: 8px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .settings-button {
                background: #065fd4;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 8px;
            }
            .settings-button:hover {
                background: #0356c4;
            }
        </style>
        <div class="settings-row">
            <label>Opacity:</label>
            <input type="number" id="opacity-setting" min="0" max="1" step="0.1" value="${settings.opacity}">
        </div>
        <div class="settings-row">
            <label>Position:</label>
            <select id="position-setting">
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
            </select>
        </div>
        <div class="settings-row">
            <label>Show "Watched:" text:</label>
            <input type="checkbox" id="show-text-setting" ${settings.showText ? 'checked' : ''}>
        </div>
        <div class="settings-row">
            <label>Font Size:</label>
            <input type="text" id="font-size-setting" value="${settings.fontSize}">
        </div>
        <div class="settings-row">
            <label>Decimal Places:</label>
            <input type="number" id="round-to-setting" min="0" max="2" value="${settings.roundTo}">
        </div>
        <div class="settings-row">
            <label>Hide When Paused:</label>
            <input type="checkbox" id="hide-paused-setting" ${settings.hideWhenPaused ? 'checked' : ''}>
        </div>
        <div class="settings-row">
            <label>Background Color:</label>
            <input type="color" id="bg-color-setting" value="${settings.backgroundColor}">
        </div>
        <div class="settings-row">
            <label>Text Color:</label>
            <input type="color" id="text-color-setting" value="${settings.textColor}">
        </div>
        <button class="settings-button" id="save-settings">Save Settings</button>
    `;

    return menu;
}

// Save settings to Chrome storage
function saveSettings() {
    chrome.storage.sync.set({
        'youtubePercentageSettings': settings
    }, () => {
        console.log('Settings saved');
    });
}

// Create or update the display element
function createDisplayElement() {
    let displayContainer = document.getElementById('watched-percentage-container');
    let displayDiv = document.getElementById('watched-percentage-display');
    let settingsIcon = document.getElementById('watched-percentage-settings-icon');
    
    if (!displayContainer) {
        displayContainer = document.createElement('div');
        displayContainer.id = 'watched-percentage-container';
        
        displayDiv = document.createElement('div');
        displayDiv.id = 'watched-percentage-display';
        
        settingsIcon = document.createElement('button');
        settingsIcon.id = 'watched-percentage-settings-icon';
        settingsIcon.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke-width="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .55.45 1 1 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke-width="2"/>
            </svg>
        `;
        
        // Create a wrapper for display and settings icon
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '4px';
        
        wrapper.appendChild(displayDiv);
        wrapper.appendChild(settingsIcon);
        displayContainer.appendChild(wrapper);
    }

    // Style the container
    Object.assign(displayContainer.style, {
        position: 'absolute',
        zIndex: '9999',
        pointerEvents: 'auto',
        width: 'auto',
        height: 'auto',
        minWidth: 'fit-content',
        minHeight: 'fit-content'
    });

    // Style the display div
    Object.assign(displayDiv.style, {
        backgroundColor: `${settings.backgroundColor}${Math.round(settings.opacity * 255).toString(16).padStart(2, '0')}`,
        color: settings.textColor,
        padding: settings.padding,
        fontSize: settings.fontSize,
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        display: 'inline-block'
    });

    // Style the settings icon
    Object.assign(settingsIcon.style, {
        backgroundColor: 'transparent',
        border: 'none',
        padding: '2px',
        cursor: 'pointer',
        color: settings.textColor,
        opacity: '0',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px'
    });

    // Add hover effects
    displayContainer.addEventListener('mouseenter', () => {
        settingsIcon.style.opacity = '1';
    });

    displayContainer.addEventListener('mouseleave', () => {
        settingsIcon.style.opacity = '0';
    });

    // Add settings icon hover effect
    settingsIcon.addEventListener('mouseenter', () => {
        settingsIcon.style.transform = 'rotate(30deg)';
    });

    settingsIcon.addEventListener('mouseleave', () => {
        settingsIcon.style.transform = 'rotate(0deg)';
    });

    // Add click handler for settings icon
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = settingsIcon.getBoundingClientRect();
        showSettingsMenu(rect.right + 5, rect.top);
    });

    return { container: displayContainer, display: displayDiv };
}

// Show settings menu at specified position
function showSettingsMenu(x, y) {
    const menu = document.getElementById('yt-percentage-settings') || createSettingsMenu();
    document.body.appendChild(menu);
    
    // Position menu
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';

    // Update select value
    menu.querySelector('#position-setting').value = settings.position;

    // Add click outside listener to close menu
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && 
            !e.target.closest('#watched-percentage-container')) { // Updated check
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Slight delay to prevent immediate closing
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);

    // Add save button listener
    menu.querySelector('#save-settings').onclick = () => {
        settings = {
            ...settings,
            opacity: parseFloat(menu.querySelector('#opacity-setting').value),
            position: menu.querySelector('#position-setting').value,
            showText: menu.querySelector('#show-text-setting').checked,
            fontSize: menu.querySelector('#font-size-setting').value,
            roundTo: parseInt(menu.querySelector('#round-to-setting').value),
            hideWhenPaused: menu.querySelector('#hide-paused-setting').checked,
            backgroundColor: menu.querySelector('#bg-color-setting').value,
            textColor: menu.querySelector('#text-color-setting').value
        };
        
        saveSettings();
        menu.style.display = 'none';
        
        // Refresh display
        showWatchedPercentage();
    };
}

// Position the display element
function updatePosition(container, display) {
    const margin = settings.margin;
    const bottomMargin = '80px'; // Fixed bottom margin to clear controls
    
    // Reset all positions
    container.style.top = 'auto';
    container.style.bottom = 'auto';
    container.style.left = 'auto';
    container.style.right = 'auto';
    container.style.transform = 'none';
    
    // Ensure the container is positioned correctly
    container.style.position = 'absolute';
    container.style.zIndex = '9999';
    
    switch (settings.position) {
        case 'top-left':
            container.style.top = margin;
            container.style.left = margin;
            break;
        case 'top-right':
            container.style.top = margin;
            container.style.right = margin;
            break;
        case 'bottom-left':
            container.style.bottom = bottomMargin;
            container.style.left = margin;
            // Ensure it's visible
            container.style.zIndex = '9999';
            break;
        case 'bottom-right':
            container.style.bottom = bottomMargin;
            container.style.right = margin;
            // Ensure it's visible
            container.style.zIndex = '9999';
            break;
    }
}


function formatPercentage(percentage) {
    const roundedPercentage = percentage.toFixed(settings.roundTo);
    return settings.showText ? `Watched: ${roundedPercentage}%` : `${roundedPercentage}%`;
}

// Update showWatchedPercentage to ensure proper container positioning
function showWatchedPercentage() {
    const video = document.querySelector('video');
    // Try to get the player container instead of just the video container
    const playerContainer = document.querySelector('#movie_player');
    
    if (!video || !playerContainer) {
        console.log("Video or player container not found");
        return;
    }

    // Ensure proper positioning context
    playerContainer.style.position = 'relative';

    const { container, display } = createDisplayElement();
    
    // Remove existing container if it exists
    const existingContainer = document.getElementById('watched-percentage-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Append to player container instead of video container
    playerContainer.appendChild(container);
    
    // Update percentage and position
    const updateDisplay = () => {
        if (video.duration) {
            const percentageWatched = (video.currentTime / video.duration) * 100;
            display.textContent = formatPercentage(percentageWatched);
            updatePosition(container, display);
        }
    };

    video.addEventListener('timeupdate', updateDisplay);
    
    // Update on video size changes
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateDisplay);
    });
    resizeObserver.observe(playerContainer);

    // Initial update
    updateDisplay();

    // Handle video state changes
    handleVideoState(video, container);
}


// Update the handleVideoState function to work with the container
function handleVideoState(video, container) {
    if (settings.hideWhenPaused) {
        video.addEventListener('play', () => {
            container.style.opacity = settings.opacity.toString();
        });
        
        video.addEventListener('pause', () => {
            container.style.opacity = '0';
        });
    } else {
        container.style.opacity = settings.opacity.toString();
    }
}

// Function to handle mutations
function handleMutations(mutations, observer) {
    for (const mutation of mutations) {
        if (mutation.target.nodeName === 'VIDEO') {
            showWatchedPercentage();
        }
    }
}

// Mutation observer to monitor changes in the video element
const observer = new MutationObserver(handleMutations);

// Options for the observer
const observerOptions = {
    childList: true,
    attributes: true,
    subtree: true
};

// Start observing the body
observer.observe(document.body, observerOptions);