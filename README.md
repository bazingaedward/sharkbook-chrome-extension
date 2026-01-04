# Sharkbook Chrome Extension

A basic Chrome Extension for Sharkbook.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" in the top left corner.
4. Select the `sharkbook-chrome-extension` directory (the folder containing `manifest.json`).

## Structure

- `manifest.json`: The configuration file for the extension.
- `popup.html` & `popup.js`: The popup interface when you click the extension icon.
- `background.js`: The service worker script.
- `content.js`: The script that runs on web pages.
- `icons/`: Directory for extension icons.

## Usage

- Click the extension icon to see the popup.
- The content script will log a message to the console on every page load.

