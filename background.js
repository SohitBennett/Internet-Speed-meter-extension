// background.js (keep the existing background.js and add these lines at the end)
// Add the following lines to the end of your existing background.js file



// background.js
let testInProgress = false;
let lastTestTime = 0;
const TEST_INTERVAL = 2000; // 5 seconds between tests

// Improved download speed measurement
async function measureDownloadSpeed() {
  const fileSize = 10000000; // 10MB test file
  const url = `https://speed.cloudflare.com/__down?bytes=${fileSize}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.arrayBuffer();
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000; 
    
    // Calculate speed in Mbps (megabits per second)
    // Note: 1 byte = 8 bits, and 1 Mbps = 1,000,000 bits per second
    const fileSizeInBits = data.byteLength * 8;
    const speedMbps = fileSizeInBits / durationInSeconds / 1000000;
    
    console.log(`Download: ${data.byteLength} bytes in ${durationInSeconds}s = ${speedMbps.toFixed(2)} Mbps`);
    return speedMbps;
  } catch (error) {
    console.error('Error measuring download speed:', error);
    // Fallback method if the first one fails
    return measureDownloadSpeedAlternative();
  }
}

// Alternative download speed measurement as fallback
async function measureDownloadSpeedAlternative() {
  try {
    // Use a larger test file (5MB) from a different CDN
    // const testFileUrl = 'https://cdn.jsdelivr.net/gh/mathiasbynens/small/empty.js';
    const repetitions = 10; // Download multiple times for better accuracy
    const testFileUrl = 'https://speed.hetzner.de/100MB.bin';
    const startTime = Date.now();
    
    for (let i = 0; i < repetitions; i++) {
      // Add cache buster to prevent caching
      const cacheBuster = `?t=${Date.now()}-${i}`;
      const response = await fetch(`${testFileUrl}${cacheBuster}`);
      await response.text(); // Make sure to consume the response
    }
    
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    
    // Estimate file size (average small JS file from this CDN is about 100KB)
    const estimatedKilobytes = 100 * repetitions;
    const estimatedBits = estimatedKilobytes * 8 * 1000; // Convert KB to bits
    
    const speedMbps = estimatedBits / durationInSeconds / 1000000;
    console.log(`Alternative download: ~${estimatedKilobytes}KB in ${durationInSeconds}s = ${speedMbps.toFixed(2)} Mbps`);
    return speedMbps;
  } catch (error) {
    console.error('Error in alternative download speed measurement:', error);
    return 0.01; // Return a minimal value instead of zero
  }
}

// Function to simulate upload speed (improved)
// async function measureUploadSpeed() {
//   const startTime = Date.now();
//   const dataSize = 500000; // 500KB in bytes (smaller to be more reliable)
  
//   try {
//     // Create random data (more accurate than empty data)
//     const randomData = new Uint8Array(dataSize);
//     window.crypto.getRandomValues(randomData);
//     const blob = new Blob([randomData]);
    
//     const formData = new FormData();
//     formData.append('file', blob, 'speedtest.dat');
    
//     const response = await fetch('https://httpbin.org/post', {
//       method: 'POST',
//       body: formData
//     });
    
//     await response.json(); // Make sure the upload completes
//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000; // seconds
    
//     // Calculate in Mbps
//     const speedBps = (dataSize * 8) / duration;
//     const speedMbps = speedBps / 1000000;
    
//     console.log(`Upload: ${dataSize} bytes in ${duration}s = ${speedMbps.toFixed(2)} Mbps`);
//     return speedMbps;
//   } catch (error) {
//     console.error('Error measuring upload speed:', error);
//     return 0.01; // Return a minimal value instead of zero
//   }
// }

// working upload funciton --------- chatgpt 
// async function measureUploadSpeed() {
//     const startTime = Date.now();
//     const dataSize = 2 * 1024 * 1024; // 2MB for better accuracy
    
//     try {
//       // Generate random data
//       const randomData = new Uint8Array(dataSize).fill(255);
//       const blob = new Blob([randomData]);
  
//       const formData = new FormData();
//       formData.append('file', blob, 'speedtest.dat');
  
//       const response = await fetch('https://httpbin.org/post', {
//         method: 'POST',
//         body: formData
//       });
  
//       await response.text(); // Ensure full upload is completed before calculating speed
  
//       const endTime = Date.now();
//       const duration = (endTime - startTime) / 1000; // seconds
  
//       // Calculate speed in Mbps
//       const speedBps = (dataSize * 8) / duration;
//       const speedMbps = speedBps / 1000000;
  
//       console.log(`Upload: ${dataSize} bytes in ${duration}s = ${speedMbps.toFixed(2)} Mbps`);
//       return speedMbps;
//     } catch (error) {
//       console.error('Error measuring upload speed:', error);
//       return 0.01; // Return a minimal value instead of zero
//     }
//   }
  
//working upload ----------- claude 

// Function to measure upload speed (service worker compatible)

async function measureUploadSpeed() {
    const startTime = Date.now();
    const dataSize = 500000; // 500KB in bytes
    
    try {
      // Create a simple ArrayBuffer instead of using window.crypto
      const data = new ArrayBuffer(dataSize);
      const blob = new Blob([data]);
      
      const formData = new FormData();
      formData.append('file', blob, 'speedtest.dat');
      
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: formData
      });
      
      await response.json(); // Make sure the upload completes
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // seconds
      
      // Calculate in Mbps
      const speedBps = (dataSize * 8) / duration;
      const speedMbps = speedBps / 1000000;
      
      console.log(`Upload: ${dataSize} bytes in ${duration}s = ${speedMbps.toFixed(2)} Mbps`);
      return speedMbps;
    } catch (error) {
      console.error('Error measuring upload speed:', error);
      return 0.01; // Return a minimal value instead of zero
    }
  }


// Run speed test and update storage -- laggye ui update
// async function runSpeedTest() {
//   if (testInProgress) return;
  
//   const currentTime = Date.now();
//   if (currentTime - lastTestTime < TEST_INTERVAL) return;
  
//   testInProgress = true;
//   lastTestTime = currentTime;
  
//   try {
//     console.log("Starting speed test...");
//     chrome.storage.local.set({ testRunning: true });

//     //gpt - code 
//     // chrome.storage.local.get(['downloadSpeed', 'uploadSpeed'], (data) => {
//     //     chrome.storage.local.set({ 
//     //       downloadSpeed: data.downloadSpeed || "Updating...",
//     //       uploadSpeed: data.uploadSpeed || "Updating...",
//     //       testRunning: true
//     //     });
//     //   });
    
//     const downloadSpeed = await measureDownloadSpeed();
//     const uploadSpeed = await measureUploadSpeed();
    
//     // Only update if we got valid results
//     if (downloadSpeed > 0 || uploadSpeed > 0) {
//       chrome.storage.local.set({
//         downloadSpeed,
//         uploadSpeed,
//         timestamp: Date.now(),
//         testRunning: false
//       });
//       console.log(`Test complete: ${downloadSpeed.toFixed(2)} down / ${uploadSpeed.toFixed(2)} up`);
//     }
//   } catch (error) {
//     console.error('Speed test failed:', error);
//     chrome.storage.local.set({ testRunning: false });
//   } finally {
//     testInProgress = false;
//   }
// }

//updated runspeedtest
async function runSpeedTest() {
    if (testInProgress) return;
    
    const currentTime = Date.now();
    if (currentTime - lastTestTime < TEST_INTERVAL) return;
    
    testInProgress = true;
    lastTestTime = currentTime;
    
    // Set a timeout to ensure we don't get stuck
    const testTimeout = setTimeout(() => {
      if (testInProgress) {
        console.log("Speed test timed out - resetting state");
        testInProgress = false;
        chrome.storage.local.set({ testRunning: false });
      }
    }, 15000); // 15 second timeout
    
    try {
      console.log("Starting speed test...");
      chrome.storage.local.set({ testRunning: true });
      
      // Wrap both tests in Promise.race with timeouts
      const downloadSpeed = await Promise.race([
        measureDownloadSpeed(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Download test timeout')), 3000))
      ]).catch(err => {
        console.warn("Download test failed or timed out:", err.message);
        return 0.01; // Return minimal value
      });
      
      const uploadSpeed = await Promise.race([
        measureUploadSpeed(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload test timeout')), 3000))
      ]).catch(err => {
        console.warn("Upload test failed or timed out:", err.message);
        return 0.01; // Return minimal value
      });
      
      // Only update if we got valid results or tests timed out
      chrome.storage.local.set({
        downloadSpeed,
        uploadSpeed,
        timestamp: Date.now(),
        testRunning: false
      }, () => {
        chrome.runtime.sendMessage({ action: "updatePopup"});
      });
      console.log(`Test complete: ${downloadSpeed.toFixed(2)} down / ${uploadSpeed.toFixed(2)} up`);
    } catch (error) {
      console.error('Speed test failed:', error);
      chrome.storage.local.set({ 
        testRunning: false,
        // Save last known values if available
        downloadSpeed: 0.01,
        uploadSpeed: 0.01,
        timestamp: Date.now()
      });
    } finally {
      testInProgress = false;
      clearTimeout(testTimeout);
    }
  }
  


// Run a speed test immediately when extension loads
runSpeedTest();

// Set up periodic testing
setInterval(runSpeedTest, TEST_INTERVAL);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSpeed') {
    chrome.storage.local.get(['downloadSpeed', 'uploadSpeed', 'timestamp', 'testRunning'], (data) => {
      sendResponse(data);
    });
    return true; // Keeps the message channel open for async response
  } else if (message.action === 'runTest') {
    // Clear old data to show we're starting fresh
    chrome.storage.local.set({ testRunning: true }, () => {
      runSpeedTest().then(() => {
        chrome.storage.local.get(['downloadSpeed', 'uploadSpeed', 'timestamp', 'testRunning'], (data) => {
          sendResponse(data);
        });
      });
    });
    return true; // Keeps the message channel open for async response
  }
});

//----------trying new flaoting window --------

// let floatingWindowActive = false;

// // Listen for messages from popup to toggle floating window
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   // Keep your existing message listeners and add:
//   if (message.action === 'toggleFloatingWindow') {
//     floatingWindowActive = !floatingWindowActive;
//     chrome.storage.local.set({ floatingWindowActive });
    
//     // Notify all tabs about the change
//     chrome.tabs.query({}, (tabs) => {
//       tabs.forEach(tab => {
//         try {
//           chrome.tabs.sendMessage(tab.id, { action: 'updateFloatingWindow', active: floatingWindowActive });
//         } catch (e) {
//           // Ignore errors for inactive tabs
//         }
//       });
//     });
    
//     sendResponse({ active: floatingWindowActive });
//     return true;
//   } else if (message.action === 'getFloatingWindowState') {
//     chrome.storage.local.get(['floatingWindowActive'], (data) => {
//       floatingWindowActive = data.floatingWindowActive || false;
//       sendResponse({ active: floatingWindowActive });
//     });
//     return true;
//   }
// });

// // Check initial state on startup
// chrome.storage.local.get(['floatingWindowActive'], (data) => {
//   floatingWindowActive = data.floatingWindowActive || false;
// });

let floatingWindowActive = false;

// Ensure floating meter is injected into all tabs
function injectFloatingWindowIntoAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'updateFloatingWindow', active: floatingWindowActive });
    });
  });
}

// Listen for tab updates (e.g., switching tabs)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (floatingWindowActive && changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'updateFloatingWindow', active: true });
  }
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  if (floatingWindowActive) {
    chrome.tabs.sendMessage(tab.id, { action: 'updateFloatingWindow', active: true });
  }
});

// Listen for messages from popup to toggle floating window
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleFloatingWindow') {
    floatingWindowActive = !floatingWindowActive;
    chrome.storage.local.set({ floatingWindowActive });

    // Notify all tabs
    injectFloatingWindowIntoAllTabs();

    sendResponse({ active: floatingWindowActive });
    return true;
  } else if (message.action === 'getFloatingWindowState') {
    chrome.storage.local.get(['floatingWindowActive'], (data) => {
      floatingWindowActive = data.floatingWindowActive || false;
      sendResponse({ active: floatingWindowActive });
    });
    return true;
  }
});

// Check initial state on startup
chrome.storage.local.get(['floatingWindowActive'], (data) => {
  floatingWindowActive = data.floatingWindowActive || false;
  if (floatingWindowActive) {
    injectFloatingWindowIntoAllTabs();
  }
});
