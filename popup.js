document.getElementById('exportBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('x.com') && !tab.url.includes('twitter.com')) {
    showStatus('Please navigate to x.com/i/bookmarks first', 'error');
    return;
  }
  
  showStatus('Extracting bookmarks...', 'info');
  document.getElementById('exportBtn').disabled = true;
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'exportBookmarks' });
    
    if (response && response.bookmarks) {
      downloadBookmarks(response.bookmarks);
      showStatus(`Exported ${response.bookmarks.length} bookmarks!`, 'success');
    } else {
      showStatus('No bookmarks found', 'error');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  } finally {
    document.getElementById('exportBtn').disabled = false;
  }
});

document.getElementById('exportAllBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('x.com') && !tab.url.includes('twitter.com')) {
    showStatus('Please navigate to x.com/i/bookmarks first', 'error');
    return;
  }
  
  showStatus('Auto-scrolling and collecting bookmarks... (this may take a minute)', 'info');
  document.getElementById('exportAllBtn').disabled = true;
  document.getElementById('exportBtn').disabled = true;
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'exportAllBookmarks' });
    
    if (response && response.bookmarks) {
      downloadBookmarks(response.bookmarks);
      showStatus(`Exported ${response.bookmarks.length} bookmarks!`, 'success');
    } else {
      showStatus('No bookmarks found', 'error');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  } finally {
    document.getElementById('exportAllBtn').disabled = false;
    document.getElementById('exportBtn').disabled = false;
  }
});

function downloadBookmarks(bookmarks) {
  const dataStr = JSON.stringify(bookmarks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  
  chrome.downloads.download({
    url: url,
    filename: `x-bookmarks-${timestamp}.json`,
    saveAs: true
  });
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
}
