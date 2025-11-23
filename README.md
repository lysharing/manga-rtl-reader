# 📖 Manga RTL Reader - Chrome Extension

Chrome extension for reading manga online with an optimized **Right-to-Left** reading interface.

## ✨ Features

### 🎯 Reading Modes
- **Single Page Mode**: One page at a time in fullscreen
- **Dynamic Double Page Mode**: Two pages side by side (like a real open manga)
  - Any page can be paired with its neighbor
  - Smooth navigation between all combinations

### 🚀 Performance
- **Smart image preloading** with progress bar
- **Smooth navigation** with scroll-snap
- **Real-time page indicator**

### ⌨️ Controls

#### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `←` / `A` | Next page (RTL) |
| `→` / `D` | Previous page |
| `Space` | Previous page |
| `Shift + Space` | Next page |
| `Esc` | Exit reading mode |

#### Interface
- **📖 Double**: Toggle between single/double page mode
- **Quit**: Exit and reload page

### 🎨 Design
- Black background for visual comfort
- Minimalist interface with custom colors
- Centered images with optimal margins (96vh × 98vw)

## 📦 Installation

### Method 1: Local Installation (Development)

1. **Download files**
```bash
   git clone [REPO_URL]
   cd manga-rtl-reader
```

2. **Project structure**
```
   manga-rtl-reader/
   ├── manifest.json
   ├── background.js
   ├── rtl.js
   ├── icon.png (128x128)
   └── README.md
```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top right corner)
   - Click **Load unpacked**
   - Select the `manga-rtl-reader` folder

### Method 2: Install from Chrome Web Store
*[Coming soon]*

## 🎮 Usage

1. **Navigate to a manga site**
   - Open a manga chapter on any compatible site

2. **Activate RTL mode**
   - Click the extension icon in the toolbar
   - Or use the shortcut (if configured)

3. **Enjoy reading**
   - Images load automatically
   - Navigate with arrow keys or mouse
   - Toggle double page mode if desired

## 🔧 Configuration

### Compatible Sites

The extension automatically detects the following image containers:
```javascript
#container, .container, .reader, .chapter-content,
.reading-content, #chapter, #chapter-body, .entry-content,
.page-break, .image-container, .vung-doc, .manga-images
```

**Fallback**: If no container is detected, the extension searches for all images larger than 200×200 pixels.

### Customization

To modify button colors, edit in `rtl.js`:
```javascript
// Double button (green)
background: #0dd794ff;

// Quit button (purple)
background: #b921d4ff;
```

## 📋 Project Files

### `manifest.json`
```json
{
  "manifest_version": 3,
  "name": "Manga RTL Reader",
  "version": "1.0",
  "description": "Optimized manga reader for Right-to-Left reading",
  "permissions": ["activeTab", "scripting"],
  "action": {
    "default_title": "Activate RTL mode"
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "128": "icon.png"
  }
}
```

### `background.js`
```javascript
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['rtl.js']
  });
});
```

## 🐛 Troubleshooting

### Extension doesn't detect images
- Verify the page contains `<img>` tags
- Try reloading the page before activating the extension
- Check the developer console (`F12`) for errors

### Double mode not working correctly
- Reload the extension via `chrome://extensions/`
- Verify you have at least 2 images on the page

### Keyboard shortcuts not working
- Verify no other page element has focus
- Try clicking on the image before using shortcuts

## 🎯 Roadmap / Future Improvements

- [ ] Zoom on area (click to zoom on a panel)
- [ ] Save reading position
- [ ] Customizable settings (background color, brightness)
- [ ] LTR mode for webtoons/comics
- [ ] Mini-map with page preview
- [ ] Bookmarks to mark favorite pages
- [ ] Reading history

## 📝 License

MIT License - Free to use and modify

## 👨‍💻 Author

Developed with ❤️ for manga lovers

---

**Version**: 1.0  
**Last Updated**: November 2024
