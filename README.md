# X Bookmarks Exporter

A simple Chrome extension to export your X (Twitter) bookmarks to a JSON file for analysis.

## Installation

1. Download/clone all files to a folder on your computer
2. Create simple icon files (or the extension will use default icons):
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
   - You can create these with any image editor or just remove the icon references from manifest.json
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the folder containing these files

## Usage

1. Go to https://x.com/i/bookmarks (make sure you're logged in)
2. Click the extension icon in your Chrome toolbar
3. Choose one of two options:
   - **Export Bookmarks**: Exports only the bookmarks currently visible on the page
   - **Export All (Auto-scroll)**: Automatically scrolls through all your bookmarks and exports everything

4. Save the JSON file when prompted

## What Data is Exported?

For each bookmark, the extension captures:
- Tweet text
- Author username and display name
- Timestamp
- Tweet URL and ID
- Images (if any)
- Video indicator
- Engagement metrics (likes, retweets, replies)
- Extraction timestamp

## Example Output

```json
[
  {
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "text": "Tweet text here...",
    "timestamp": "2024-01-15T12:30:00.000Z",
    "displayTime": "Jan 15",
    "tweetUrl": "https://x.com/elonmusk/status/1234567890",
    "tweetId": "1234567890",
    "images": ["https://pbs.twimg.com/media/..."],
    "metrics": {
      "replies": "42",
      "retweets": "123",
      "likes": "456"
    },
    "extractedAt": "2024-02-01T10:15:30.000Z"
  }
]
```

## Analyzing Your Bookmarks

Once you have the JSON file, you can:
- Upload it to Claude and ask for analysis, summaries, categorization, etc.
- Use Python/JavaScript to process it programmatically
- Import into Excel/Google Sheets (convert JSON to CSV first)
- Build your own analysis tools

## Notes

- The extension only works when you're logged into X
- It only reads data visible in your browser - no API calls
- All data stays local until you decide what to do with it
- The auto-scroll feature may take a few minutes if you have many bookmarks
- X's page structure may change over time, which could require updates to the selectors

## Privacy

This extension:
- Does NOT send any data anywhere
- Does NOT use any external services
- Only accesses x.com when you're on that site
- All processing happens locally in your browser
