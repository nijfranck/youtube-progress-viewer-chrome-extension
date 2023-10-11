// Function to handle mutations
function handleMutations(mutations, observer) {
    for(const mutation of mutations) {
      if (mutation.target.nodeName === 'VIDEO') {
        showWatchedPercentage();
      }
    }
}

function showWatchedPercentage() {
    let video = document.querySelector('video');
    if (!video) {
        console.log("No video found");
        return;
    }

    // Create percentage display once
    let displayDiv = document.getElementById('watched-percentage-display') || document.createElement('div');
    displayDiv.id = 'watched-percentage-display';
    displayDiv.style.position = 'absolute';
    displayDiv.style.zIndex = '1000';
    displayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    displayDiv.style.color = 'white';
    displayDiv.style.padding = '5px';

    let controlBar = document.querySelector('.ytp-chrome-bottom');
    if (!controlBar) {
        console.log("Control bar not found");
        return;
    }
    controlBar.appendChild(displayDiv);

    // Update percentage display on timeupdate
    video.addEventListener('timeupdate', function() {
        let totalDuration = video.duration;
        let currentTime = video.currentTime;
        let percentageWatched = ((currentTime / totalDuration) * 100).toFixed(2);
        displayDiv.innerText = `Watched: ${percentageWatched}%`;

        // Adjust the position based on window size
        let distanceFromBottom = window.innerHeight * 0.08; // 10% of window height
        displayDiv.style.bottom = `${distanceFromBottom}px`;
        displayDiv.style.right = '10px';
    });
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