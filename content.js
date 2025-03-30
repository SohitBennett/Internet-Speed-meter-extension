
// content.js (new file)
let speedMeterElement = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let positionX = 20;
let positionY = 20;

// Create the floating speed meter
function createFloatingSpeedMeter() {
  if (speedMeterElement) return;
  
  // Create the container
  speedMeterElement = document.createElement('div');
  speedMeterElement.id = 'speed-meter-floating';
  speedMeterElement.className = 'speed-meter-container';
  
  // Load saved position
  chrome.storage.local.get(['positionX', 'positionY'], (data) => {
    if (data.positionX !== undefined) {
      positionX = data.positionX;
      positionY = data.positionY;
      speedMeterElement.style.left = positionX + 'px';
      speedMeterElement.style.top = positionY + 'px';
    }
  });
  
  // Add content
  speedMeterElement.innerHTML = `
    <div class="speed-meter-header">
      <span class="speed-meter-title">Speed Meter</span>
      <div class="speed-meter-controls">
        <button class="speed-meter-minimize">_</button>
        <button class="speed-meter-close">×</button>
      </div>
    </div>
    <div class="speed-meter-body">
      <div class="speed-meter-row">
        <span class="speed-meter-label">↓</span>
        <span class="speed-meter-value download-speed">0.00</span>
        <span class="speed-meter-unit">Mbps</span>
      </div>
      <div class="speed-meter-row">
        <span class="speed-meter-label">↑</span>
        <span class="speed-meter-value upload-speed">0.00</span>
        <span class="speed-meter-unit">Mbps</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(speedMeterElement);
  
  // Make it draggable
  setupDraggable();
  
  // Set up control buttons
  speedMeterElement.querySelector('.speed-meter-close').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleFloatingWindow' });
  });
  
  speedMeterElement.querySelector('.speed-meter-minimize').addEventListener('click', () => {
    toggleMinimized();
  });
  
  // Start updating the speed
  updateSpeedDisplay();
  
  // Load minimized state
//   chrome.storage.local.get(['minimized'], (data) => {
//     if (data.minimized) {
//       toggleMinimized(true);
//     }
//   });

    //new load minimised state code 
    // Load minimized state
    chrome.storage.local.get(['minimized'], (data) => {
        const wasMinimized = data.minimized ?? false;
        toggleMinimized(wasMinimized);
    });
  

}

function setupDraggable() {
  const header = speedMeterElement.querySelector('.speed-meter-header');
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - speedMeterElement.getBoundingClientRect().left;
    dragOffsetY = e.clientY - speedMeterElement.getBoundingClientRect().top;
    speedMeterElement.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffsetX;
    const newY = e.clientY - dragOffsetY;
    
    // Keep the speed meter within the viewport
    const maxX = window.innerWidth - speedMeterElement.offsetWidth;
    const maxY = window.innerHeight - speedMeterElement.offsetHeight;
    
    positionX = Math.max(0, Math.min(newX, maxX));
    positionY = Math.max(0, Math.min(newY, maxY));
    
    speedMeterElement.style.left = positionX + 'px';
    speedMeterElement.style.top = positionY + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      speedMeterElement.style.cursor = 'default';
      
      // Save position
      chrome.storage.local.set({ positionX, positionY });
    }
  });
}

//----working old minimised-------
// function toggleMinimized(setMinimized = null) {
//   const body = speedMeterElement.querySelector('.speed-meter-body');
//   const isMinimized = setMinimized !== null ? setMinimized : body.style.display === 'none';
  
//   if (isMinimized) {
//     body.style.display = '';
//     speedMeterElement.classList.remove('minimized');
//   } else {
//     body.style.display = 'none';
//     speedMeterElement.classList.add('minimized');
//   }
  
//   chrome.storage.local.set({ minimized: !isMinimized });
// }

// trying new minimised ---------------

// function toggleMinimized(setMinimized = null) {
//     const body = speedMeterElement.querySelector('.speed-meter-body');
//     const title = speedMeterElement.querySelector('.speed-meter-title');
//     const controls = speedMeterElement.querySelector('.speed-meter-controls');
    
//     const downloadSpeed = speedMeterElement.querySelector('.speed-meter-row:first-child'); // Download speed row
//     const uploadSpeed = speedMeterElement.querySelector('.speed-meter-row:last-child'); // Upload speed row
  
//     const isMinimized = setMinimized !== null ? setMinimized : body.style.display === 'none';
  
//     if (isMinimized) {
//       // Expand: Show full UI
//       body.style.display = '';
//       title.style.display = '';
//       controls.style.display = '';
//       uploadSpeed.style.display = ''; 
//       speedMeterElement.classList.remove('minimized');
//     } else {
//       // Minimize: Hide everything except download speed
//       body.style.display = 'none';
//       title.style.display = 'none';
//       controls.style.display = 'none';
//       uploadSpeed.style.display = 'none'; 
//       speedMeterElement.classList.add('minimized');
  
//       // Show only the download speed
//       speedMeterElement.innerHTML = `<span class="speed-meter-value download-speed">0.00</span> <span class="speed-meter-unit">Mbps</span>`;
//     }
  
//     chrome.storage.local.set({ minimized: !isMinimized });
//   }


// claude new toggle minimised -- verdict - maximise is working, but speed is not visible 

// function toggleMinimized(setMinimized = null) {
//     const body = speedMeterElement.querySelector('.speed-meter-body');
//     const minimizeBtn = speedMeterElement.querySelector('.speed-meter-minimize');
//     const isMinimized = setMinimized !== null ? setMinimized : getComputedStyle(body).display === 'none';
    
//     if (isMinimized) {
//       // Expand: Show full UI
//       body.style.display = 'block';
//       speedMeterElement.classList.remove('minimized');
//       if (minimizeBtn) minimizeBtn.textContent = '_';
//     } else {
//       // Minimize: Hide body but keep header
//       body.style.display = 'none';
//       speedMeterElement.classList.add('minimized');
//       if (minimizeBtn) minimizeBtn.textContent = '□'; // Square symbol for maximize
//     }
    
//     chrome.storage.local.set({ minimized: !isMinimized });
//   }


//claude new toggle minimised with one more fucntion change 

function toggleMinimized(setMinimized = null) {
    const body = speedMeterElement.querySelector('.speed-meter-body');
    const title = speedMeterElement.querySelector('.speed-meter-title');
    const minimizeBtn = speedMeterElement.querySelector('.speed-meter-minimize');
    const closeBtn = speedMeterElement.querySelector('.speed-meter-close');
    
    const isMinimized = setMinimized !== null ? setMinimized : getComputedStyle(body).display === 'none';
    
    // Remove any previous minimized speed display
    const existingDisplay = speedMeterElement.querySelector('.minimized-speed');
    if (existingDisplay) {
      existingDisplay.remove();
    }

    if (isMinimized) {
      // Expand: Show full UI
      body.style.display = 'block';
      title.style.display = 'inline';
      speedMeterElement.classList.remove('minimized');
      if (minimizeBtn) minimizeBtn.textContent = '_';
    } else {
      // Minimize: Hide body and title but keep controls
      body.style.display = 'none';
      title.style.display = 'none';
      speedMeterElement.classList.add('minimized');
      if (minimizeBtn) minimizeBtn.textContent = '□'; // Square symbol for maximize
      
      // Make the download speed visible in the header
      const downloadSpeedValue = speedMeterElement.querySelector('.download-speed').textContent;
      const downloadSpeedDisplay = document.createElement('span');
      downloadSpeedDisplay.className = 'minimized-speed';
      downloadSpeedDisplay.textContent = downloadSpeedValue + ' Mbps';
      
      // Insert the speed display after the controls
      const header = speedMeterElement.querySelector('.speed-meter-header');
      const controls = speedMeterElement.querySelector('.speed-meter-controls');
      
      
      
      // Insert the new display
      header.insertBefore(downloadSpeedDisplay, controls);
    }
    
    chrome.storage.local.set({ minimized: isMinimized });
  }


  
  // Reattach control button event listeners
  function setupControls() {
    speedMeterElement.querySelector('.speed-meter-minimize').addEventListener('click', () => {
      toggleMinimized();
    });
  
    speedMeterElement.querySelector('.speed-meter-close').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'toggleFloatingWindow' });
    });
  }
  

function removeFloatingSpeedMeter() {
  if (speedMeterElement) {
    document.body.removeChild(speedMeterElement);
    speedMeterElement = null;
  }
}

// function updateSpeedDisplay() {
//   if (!speedMeterElement) return;
  
//   chrome.runtime.sendMessage({ action: 'getSpeed' }, (data) => {
//     if (chrome.runtime.lastError) {
//       // Handle any errors
//       return;
//     }
    
//     if (data && data.downloadSpeed !== undefined) {
//       speedMeterElement.querySelector('.download-speed').textContent = data.downloadSpeed.toFixed(2);
//       speedMeterElement.querySelector('.upload-speed').textContent = data.uploadSpeed.toFixed(2);
//     }
//   });
  
//   // Update every 2 seconds
//   setTimeout(updateSpeedDisplay, 2000);
// }

//working --
// function updateSpeedDisplay() {
//     if (!speedMeterElement) return;
    
//     let updateTimeout = setTimeout(() => {
//       if (speedMeterElement) {
//         speedMeterElement.querySelector('.download-speed').textContent = '0.00';
//         speedMeterElement.querySelector('.upload-speed').textContent = '0.00';
//       }
//     }, 3000); // 10 second timeout
    
//     chrome.runtime.sendMessage({ action: 'getSpeed' }, (data) => {
//       clearTimeout(updateTimeout);
      
//       if (chrome.runtime.lastError) {
//         // Handle any errors
//         return;
//       }
      
//       if (data && data.downloadSpeed !== undefined) {
//         speedMeterElement.querySelector('.download-speed').textContent = data.downloadSpeed.toFixed(2);
//         speedMeterElement.querySelector('.upload-speed').textContent = data.uploadSpeed.toFixed(2);
//       }
//     });
    
//     // Update every 2 seconds
//     setTimeout(updateSpeedDisplay, 2000);
//   }

//trying cluade updated function of updatespeeddisplay

function updateSpeedDisplay() {
    if (!speedMeterElement) return;
    
    let updateTimeout = setTimeout(() => {
      if (speedMeterElement) {
        speedMeterElement.querySelector('.download-speed').textContent = '0.00';
        speedMeterElement.querySelector('.upload-speed').textContent = '0.00';
        
        // Also update minimized display if it exists
        const minimizedDisplay = speedMeterElement.querySelector('.minimized-speed');
        if (minimizedDisplay) {
          minimizedDisplay.textContent = '0.00 Mbps';
        }
      }
    }, 3000);
    
    chrome.runtime.sendMessage({ action: 'getSpeed' }, (data) => {
      clearTimeout(updateTimeout);
      
      if (chrome.runtime.lastError) {
        // Handle any errors
        return;
      }
      
      if (data && data.downloadSpeed !== undefined) {
        const downloadSpeed = (data.downloadSpeed / 8).toFixed(2);
        const uploadSpeed = (data.uploadSpeed / 8).toFixed(2);
        
        speedMeterElement.querySelector('.download-speed').textContent = downloadSpeed;
        speedMeterElement.querySelector('.upload-speed').textContent = uploadSpeed;
        
        // Also update minimized display if it exists
        const minimizedDisplay = speedMeterElement.querySelector('.minimized-speed');
        if (minimizedDisplay) {
          minimizedDisplay.textContent = downloadSpeed + ' MBps';
        }
      }
    });
    
    // Update every 2 seconds
    setTimeout(updateSpeedDisplay, 2000);
  }


// Check if floating window should be active
chrome.runtime.sendMessage({ action: 'getFloatingWindowState' }, (response) => {
  if (response && response.active) {
    createFloatingSpeedMeter();
  }
});

// Listen for toggle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateFloatingWindow') {
    if (message.active) {
      createFloatingSpeedMeter();
    } else {
      removeFloatingSpeedMeter();
    }
  }
});