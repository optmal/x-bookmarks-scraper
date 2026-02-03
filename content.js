// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportBookmarks') {
    const bookmarks = extractBookmarks();
    sendResponse({ bookmarks: bookmarks });
  } else if (request.action === 'exportAllBookmarks') {
    // Auto-scroll to load all bookmarks, then extract
    autoScrollAndExtract().then(bookmarks => {
      sendResponse({ bookmarks: bookmarks });
    });
    return true; // Keep channel open for async response
  }
});

function extractBookmarks() {
  const bookmarks = [];
  
  // X uses article elements for tweets
  const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
  
  tweetElements.forEach((tweet, index) => {
    try {
      const bookmark = extractTweetData(tweet);
      if (bookmark) {
        bookmarks.push(bookmark);
      }
    } catch (error) {
      console.error('Error extracting tweet:', error);
    }
  });
  
  return bookmarks;
}

function extractTweetData(tweetElement) {
  const data = {};
  
  // Extract username and handle
  const userLink = tweetElement.querySelector('a[role="link"][href*="/"]');
  if (userLink) {
    const href = userLink.getAttribute('href');
    if (href) {
      data.username = href.split('/').filter(Boolean)[0];
    }
  }
  
  // Extract display name
  const displayNameElement = tweetElement.querySelector('[data-testid="User-Name"]');
  if (displayNameElement) {
    data.displayName = displayNameElement.textContent.split('@')[0].trim();
  }
  
  // Extract tweet text
  const tweetTextElement = tweetElement.querySelector('[data-testid="tweetText"]');
  if (tweetTextElement) {
    data.text = tweetTextElement.textContent;
  }
  
  // Extract timestamp
  const timeElement = tweetElement.querySelector('time');
  if (timeElement) {
    data.timestamp = timeElement.getAttribute('datetime');
    data.displayTime = timeElement.textContent;
  }
  
  // Extract tweet link (to get tweet ID)
  const tweetLinks = tweetElement.querySelectorAll('a[href*="/status/"]');
  for (const link of tweetLinks) {
    const href = link.getAttribute('href');
    if (href && href.includes('/status/')) {
      data.tweetUrl = 'https://x.com' + href.split('?')[0];
      const tweetId = href.split('/status/')[1]?.split('?')[0];
      if (tweetId) {
        data.tweetId = tweetId;
      }
      break;
    }
  }
  
  // Extract images
  const images = tweetElement.querySelectorAll('img[src*="media"]');
  if (images.length > 0) {
    data.images = Array.from(images).map(img => img.src);
  }
  
  // Extract video thumbnail if present
  const videoThumb = tweetElement.querySelector('[data-testid="videoPlayer"]');
  if (videoThumb) {
    data.hasVideo = true;
  }
  
  // Extract metrics (likes, retweets, etc)
  const metrics = {};
  const replyButton = tweetElement.querySelector('[data-testid="reply"]');
  const retweetButton = tweetElement.querySelector('[data-testid="retweet"]');
  const likeButton = tweetElement.querySelector('[data-testid="like"]');
  
  if (replyButton) {
    const replyCount = replyButton.querySelector('[data-testid="app-text-transition-container"]');
    if (replyCount) metrics.replies = replyCount.textContent;
  }
  
  if (retweetButton) {
    const retweetCount = retweetButton.querySelector('[data-testid="app-text-transition-container"]');
    if (retweetCount) metrics.retweets = retweetCount.textContent;
  }
  
  if (likeButton) {
    const likeCount = likeButton.querySelector('[data-testid="app-text-transition-container"]');
    if (likeCount) metrics.likes = likeCount.textContent;
  }
  
  if (Object.keys(metrics).length > 0) {
    data.metrics = metrics;
  }
  
  // Add extraction timestamp
  data.extractedAt = new Date().toISOString();
  
  return Object.keys(data).length > 0 ? data : null;
}

async function autoScrollAndExtract() {
  const scrollDelay = 1500; // Wait 1.5 seconds between scrolls
  const maxScrolls = 100; // Maximum scrolls to prevent infinite loop
  let scrollCount = 0;
  let previousHeight = 0;
  let unchangedCount = 0;
  
  // Use a Map to store unique bookmarks by tweet ID
  const bookmarksMap = new Map();
  
  while (scrollCount < maxScrolls) {
    // Extract bookmarks at current scroll position
    const currentBookmarks = extractBookmarks();
    
    // Add new bookmarks to our map (using tweetId as key to avoid duplicates)
    currentBookmarks.forEach(bookmark => {
      if (bookmark.tweetId) {
        bookmarksMap.set(bookmark.tweetId, bookmark);
      } else {
        // If no tweetId, use a combination of other fields as key
        const key = `${bookmark.username}-${bookmark.text?.substring(0, 50)}`;
        bookmarksMap.set(key, bookmark);
      }
    });
    
    // Scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, scrollDelay));
    
    const currentHeight = document.body.scrollHeight;
    
    // Check if we've reached the end (height hasn't changed)
    if (currentHeight === previousHeight) {
      unchangedCount++;
      // If height hasn't changed for 3 consecutive scrolls, we're done
      if (unchangedCount >= 3) {
        break;
      }
    } else {
      unchangedCount = 0;
    }
    
    previousHeight = currentHeight;
    scrollCount++;
  }
  
  // Extract one final time at the bottom
  const finalBookmarks = extractBookmarks();
  finalBookmarks.forEach(bookmark => {
    if (bookmark.tweetId) {
      bookmarksMap.set(bookmark.tweetId, bookmark);
    } else {
      const key = `${bookmark.username}-${bookmark.text?.substring(0, 50)}`;
      bookmarksMap.set(key, bookmark);
    }
  });
  
  // Scroll back to top
  window.scrollTo(0, 0);
  
  // Convert Map to array
  return Array.from(bookmarksMap.values());
}
