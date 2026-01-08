# Sharkbook Chrome Extension

A powerful Chrome Extension for Sharkbook that integrates AI capabilities to assist with web page interactions, specifically designed for smart form analysis and auto-filling.

## 🚀 Key Features

### 1. 🤖 AI Form Assistant (Side Panel)
A "Monica AI" style sidebar assistant that stays with you while you browse.
- **Smart Analysis**: Scans the current web page to identify all interactive input fields (text inputs, textareas, etc.).
- **AI Auto-Fill**: Uses an LLM (currently integrated with a mock provider) to intelligently generate content based on field labels and context.
- **One-Click Fill**: Automatically populates form data back into the web page.

### 2. 📸 Screen Capture
- **Instant Screenshot**: Capture the visible area of your current tab with a single click.
- **Preview**: Logs the Base64 image data for development or further processing.

### 3. 🔍 Page Inspector
- **List Inputs**: specific developer tool to log detailed information about all input elements on the current page to the console.

## 🛠 Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"** in the top left corner.
5. Select the `sharkbook-chrome-extension` directory.

## 📖 Usage Guide

### Using the AI Assistant
1. Click the **Sharkbook Extension icon** in the toolbar.
2. Click **"Open AI Assistant"** to launch the Side Panel (or use Chrome's side panel menu).
3. Navigate to any page with a form (e.g., a contact form or signup page).
4. In the side panel, click **"Start Analysis"**.
5. The extension will identify fields and generate suggestions.
6. Click **"Fill Page Inputs"** to apply the changes.

## 📂 Project Structure

- `manifest.json`: Configuration (MV3) with Side Panel permissions.
- `sidepanel.html` & `sidepanel.js`: **[Core]** The AI Assistant sidebar interface and logic.
- `popup.html` & `popup.js`: The quick-access menu for screenshots and opening the assistant.
- `content.js`: Handles DOM interactions (scraping inputs and filling values).
- `background.js`: Service worker handling extension lifecycle.

## 🔧 Technology

- **Manifest V3**
- **Chrome Side Panel API** for persistent UI.
- **Scripting API** for page interaction.

