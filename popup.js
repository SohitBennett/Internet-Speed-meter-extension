// // popup.js (updated - add floating window toggle functionality)
// document.addEventListener('DOMContentLoaded', function() {
//     // Get speed data when popup opens
//     updateSpeedDisplay();
    
//     // Set up refresh button
//     document.getElementById('refresh-btn').addEventListener('click', function() {
//       this.textContent = 'Testing...';
//       this.disabled = true;
      
//       // Show that we're testing
//       document.getElementById('download-speed').textContent = '...';
//       document.getElementById('upload-speed').textContent = '...';
      
//       chrome.runtime.sendMessage({action: 'runTest'}, function(response) {
//         updateSpeedDisplayWithData(response);
//         document.getElementById('refresh-btn').textContent = 'Test Speed Now';
//         document.getElementById('refresh-btn').disabled = false;
//       });
//     });
    
//     // timeout handel code ----------------------
//     let testButtonTimeout;
//     document.getElementById('refresh-btn').addEventListener('click', function() {
//     this.textContent = 'Testing...';
//     this.disabled = true;
    
//     // Show that we're testing
//     document.getElementById('download-speed').textContent = '...';
//     document.getElementById('upload-speed').textContent = '...';
    
//     // Set a timeout to re-enable the button if no response
//     clearTimeout(testButtonTimeout);
//     testButtonTimeout = setTimeout(() => {
//         document.getElementById('refresh-btn').textContent = 'Test Speed Now';
//         document.getElementById('refresh-btn').disabled = false;
//         document.getElementById('download-speed').textContent = '0.00';
//         document.getElementById('upload-speed').textContent = '0.00';
//         document.getElementById('last-update').textContent = 'Update failed. Try again.';
//     }, 3000); // 20 second timeout for UI
    
//     chrome.runtime.sendMessage({action: 'runTest'}, function(response) {
//         clearTimeout(testButtonTimeout);
//         updateSpeedDisplayWithData(response);
//         document.getElementById('refresh-btn').textContent = 'Test Speed Now';
//         document.getElementById('refresh-btn').disabled = false;
//     });
//     });

//     // Set up floating display toggle
//     const toggleButton = document.getElementById('toggle-floating');
    
//     // Check current state
//     chrome.runtime.sendMessage({action: 'getFloatingWindowState'}, function(response) {
//       updateToggleButton(response.active);
//     });
    
//     toggleButton.addEventListener('click', function() {
//       chrome.runtime.sendMessage({action: 'toggleFloatingWindow'}, function(response) {
//         updateToggleButton(response.active);
//       });
//     });
    
//     function updateToggleButton(isActive) {
//       if (isActive) {
//         toggleButton.textContent = 'Disable Floating Display';
//         toggleButton.classList.remove('off');
//       } else {
//         toggleButton.textContent = 'Enable Floating Display';
//         toggleButton.classList.add('off');
//       }
//     }
    
//     // Auto-refresh the display every 2 seconds
//     setInterval(updateSpeedDisplay, 2000);
//   });
  
//   function updateSpeedDisplay() {
//     chrome.runtime.sendMessage({action: 'getSpeed'}, function(response) {
//       updateSpeedDisplayWithData(response);
//     });
//   }
  
//   function updateSpeedDisplayWithData(data) {
//     const downloadSpeedElement = document.getElementById('download-speed');
//     const uploadSpeedElement = document.getElementById('upload-speed');
//     const lastUpdateElement = document.getElementById('last-update');
//     const refreshBtn = document.getElementById('refresh-btn');
    
//     if (data && data.testRunning) {
//       downloadSpeedElement.textContent = '...';
//       uploadSpeedElement.textContent = '...';
//       refreshBtn.disabled = true;
//       refreshBtn.textContent = 'Testing...';
//       return;
//     }
    
//     if (data && data.downloadSpeed !== undefined) {
//       downloadSpeedElement.textContent = data.downloadSpeed.toFixed(2);
//       uploadSpeedElement.textContent = data.uploadSpeed.toFixed(2);
      
//       const date = new Date(data.timestamp);
//       lastUpdateElement.textContent = `Last updated: ${date.toLocaleTimeString()}`;
      
//       refreshBtn.textContent = 'Test Speed Now';
//       refreshBtn.disabled = false;
//     } else {
//       downloadSpeedElement.textContent = '0.00';
//       uploadSpeedElement.textContent = '0.00';
//       lastUpdateElement.textContent = 'Last updated: Never';
//     }
//   }


// popup.js (updated with instant UI updates)
document.addEventListener('DOMContentLoaded', function() {
    // Get speed data when popup opens
    updateSpeedDisplay();

    // Listen for instant updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "updatePopup") {
            updateSpeedDisplay();
        }
    });

    // Listen for changes in storage and update UI instantly
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.downloadSpeed || changes.uploadSpeed) {
            updateSpeedDisplay(); // Refresh UI immediately when speed updates
        }
    });

    // Set up refresh button
    let testButtonTimeout;
    document.getElementById('refresh-btn').addEventListener('click', function() {
        this.textContent = 'Testing...';
        this.disabled = true;

        // Show that we're testing
        // document.getElementById('download-speed').textContent = '...';
        // document.getElementById('upload-speed').textContent = '...';

        // Keep showing old values instead of "..."
        chrome.runtime.sendMessage({ action: 'runTest' }, function(response) {
            clearTimeout(testButtonTimeout);
            updateSpeedDisplayWithData(response);
            document.getElementById('refresh-btn').textContent = 'Test Speed Now';
            document.getElementById('refresh-btn').disabled = false;
        });

        // Set a timeout to reset UI only if the test actually fails
        clearTimeout(testButtonTimeout);
        testButtonTimeout = setTimeout(() => {
            chrome.storage.local.get(['testRunning'], (data) => {
                if (data.testRunning) return; // Don't reset if test is still running
                document.getElementById('refresh-btn').textContent = 'Test Speed Now';
                document.getElementById('refresh-btn').disabled = false;
                document.getElementById('download-speed').textContent = '0.00';
                document.getElementById('upload-speed').textContent = '0.00';
                document.getElementById('last-update').textContent = 'Update failed. Try again.';
            });
        }, 5000); // 5 second timeout for UI reset

        chrome.runtime.sendMessage({ action: 'runTest' }, function(response) {
            clearTimeout(testButtonTimeout);
            updateSpeedDisplayWithData(response);
            document.getElementById('refresh-btn').textContent = 'Test Speed Now';
            document.getElementById('refresh-btn').disabled = false;
        });
    });

    // Set up floating display toggle
    const toggleButton = document.getElementById('toggle-floating');
    
    // Check current state
    chrome.runtime.sendMessage({ action: 'getFloatingWindowState' }, function(response) {
        updateToggleButton(response.active);
    });

    toggleButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'toggleFloatingWindow' }, function(response) {
            updateToggleButton(response.active);
        });
    });

    function updateToggleButton(isActive) {
        if (isActive) {
            toggleButton.textContent = 'Disable Floating Display';
            toggleButton.classList.remove('off');
        } else {
            toggleButton.textContent = 'Enable Floating Display';
            toggleButton.classList.add('off');
        }
    }

    // Auto-refresh the display every 2 seconds (backup in case storage event fails)
    setInterval(updateSpeedDisplay, 15000);
});

function updateSpeedDisplay() {
    chrome.runtime.sendMessage({ action: 'getSpeed' }, function(response) {
        updateSpeedDisplayWithData(response);
    });
}

function updateSpeedDisplayWithData(data) {
    const downloadSpeedElement = document.getElementById('download-speed');
    const uploadSpeedElement = document.getElementById('upload-speed');
    const lastUpdateElement = document.getElementById('last-update');
    const refreshBtn = document.getElementById('refresh-btn');

    if (data && data.testRunning) {
        downloadSpeedElement.textContent = '...';
        uploadSpeedElement.textContent = '...';
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Testing...';
        return;
    }

    if (data && data.downloadSpeed !== undefined) {
        downloadSpeedElement.textContent = data.downloadSpeed.toFixed(2);
        uploadSpeedElement.textContent = data.uploadSpeed.toFixed(2);

        const date = new Date(data.timestamp);
        lastUpdateElement.textContent = `Last updated: ${date.toLocaleTimeString()}`;

        refreshBtn.textContent = 'Test Speed Now';
        refreshBtn.disabled = false;
    } else {
        downloadSpeedElement.textContent = '0.00';
        uploadSpeedElement.textContent = '0.00';
        lastUpdateElement.textContent = 'Last updated: Never';
    }
}

function animateTextChange(element, newValue) {
    if (element.textContent !== newValue) {
        element.style.opacity = 0.5;
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = 1;
        }, 200); // Smooth fade-in effect
    }
}