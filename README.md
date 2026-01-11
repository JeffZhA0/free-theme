[中文](https://github.com/JeffZhA0/free-theme/blob/main/README_zh_CN.md)

# Free Theme

A fully customizable SiYuan note theme with light and dark modes, allowing you to freely customize your own note-taking style.

## ✨ Features

- 🎨 **Dual Mode Support**: Perfect support for both light and dark theme modes
- 🎯 **Visual Configuration**: Easily configure all colors and styles through a graphical interface
- 🎲 **Random Color Scheme**: Generate random color schemes with one click
- 🔧 **Rich Configuration Options**: Support for configuring primary colors, backgrounds, text colors, borders, code blocks, selection, shadows, etc.
- 🔤 **Font Configuration**: Monospace fonts for English, Source Han Sans for Chinese
- 💾 **Persistent Configuration**: Configurations are automatically saved and remain effective after refresh
- 🔄 **Real-time Preview**: Changes take effect immediately, WYSIWYG

## 🚀 Quick Start

### Installation

#### Method 1: Install from Marketplace

1. Open `Settings` → `Marketplace` → `Theme` in SiYuan
2. Search for `Free Theme` and click Install
3. Open `Settings` → `Appearance` → `Theme` in SiYuan
4. Select `Free Theme` from the theme list

#### Method 2: Manual Installation

1. Download the theme files from the GitHub repository
2. Place the theme folder in the `{workspace}/conf/appearance/themes/` directory
3. Open `Settings` → `Appearance` → `Theme` in SiYuan
4. Select `Free Theme` from the theme list

### Configuration Entry

After installing the theme, a configuration button (gear icon) will appear on the SiYuan toolbar. Click it to open the configuration window.

## 📖 Configuration Guide

### Configuration Window

The configuration window is divided into the following sections:

#### 1. Fixed Action Bar (Top)
- **Random Color Scheme**: Generate a random color scheme with one click
- **Refresh Configuration**: Reload the configuration file
- **Reset to Default**: Restore default configuration

#### 2. Color Configuration (Grouped)

**🎨 Primary Colors**
- Primary color
- Primary light color
- Primary dark color
- Primary hover color

**🖼️ Background Colors**
- Background
- Light background
- Dark background
- Surface color
- Surface hover

**📝 Text Colors**
- Primary text
- Secondary text
- Disabled text
- Text on background
- Text on surface
- Text on primary

**🔲 Border Colors**
- Border color
- Border hover
- Border light

**💻 Code Blocks**
- Code background
- Code border
- Code text

**✨ Selection**
- Selection background
- Selection text

**🌑 Shadows**
- Shadow
- Light shadow
- Medium shadow

#### 3. Other Settings

**🔤 Fonts**
- English font: Monospace font configuration
- Chinese font: Chinese font configuration

**📏 Font Sizes**
- Small, Normal, Medium, Large, XLarge

**📐 Line Heights**
- Tight, Normal, Relaxed

**📊 Spacing**
- XS, SM, MD, LG, XL

**🔘 Border Radius**
- Small, Medium, Large

**⚡ Transitions**
- Default transition: For most element transitions
- Fast transition: For quick-response interactions

## 🎨 Usage Tips

### Random Color Scheme

Click the "Random Color Scheme" button to quickly generate a random color scheme. If you're not satisfied, you can continue clicking to generate new schemes.

### Color Format

- **Color values**: Support hexadecimal format, e.g., `#ff6b6b`, `#1e1e1e`
- **Shadow values**: Support rgba format, e.g., `rgba(0, 0, 0, 0.1)`

### Configuration Sync

Configurations are automatically saved to `/conf/free-theme-config.json`. You can:
- Manually edit the configuration file
- Sync configuration files between devices
- Backup and restore configurations

## 💻 Programming Interface

The theme provides a JavaScript API that can be used in the browser console:

```javascript
// Get current configuration
const config = await window.FreeThemeConfig.getConfig();

// Update configuration
await window.FreeThemeConfig.updateConfig({
    light: {
        primary: '#007bff',
        background: '#ffffff',
    }
});

// Reset to default configuration
await window.FreeThemeConfig.resetConfig();

// Generate random color scheme
await window.FreeThemeConfig.generateRandomColors('light');
```

## 📁 Configuration File

Configuration file location: `/conf/free-theme-config.json`

Configuration file structure:

```json
{
  "light": {
    "primary": "#d23f31",
    "background": "#ffffff",
    "textPrimary": "#212529",
    ...
  },
  "dark": {
    "primary": "#ff6b6b",
    "background": "#1e1e1e",
    "textPrimary": "#d4d4d4",
    ...
  },
  "fontFamily": {
    "english": "'Consolas', 'Monaco', 'Courier New', 'JetBrains Mono'",
    "chinese": "'Source Han Sans SC', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Microsoft YaHei'"
  },
  "fontSize": {
    "small": "12px",
    "normal": "14px",
    ...
  }
}
```

## 🔧 Development

### File Structure

```
free-theme/
├── theme.json          # Theme configuration file
├── theme.css          # Theme stylesheet
├── theme.js           # Theme script file
├── icon.png           # Theme icon
├── preview.png        # Theme preview image
├── README.md          # English documentation
└── README_zh_CN.md    # Chinese documentation
```

### Local Development

1. Place the theme folder in the `{workspace}/conf/appearance/themes/` directory
2. Modify `theme.css` or `theme.js` files
3. Refresh the theme in SiYuan or restart the application

## 📝 Changelog

### v1.0.0
- ✨ Initial release
- 🎨 Support for light and dark modes
- 🔧 Complete visual configuration system
- 🎲 Random color scheme feature
- 🔤 Font configuration (monospace for English, Source Han Sans for Chinese)

## 📄 License

See the [LICENSE](https://github.com/JeffZhA0/free-theme/blob/main/LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📮 Feedback

If you have questions or suggestions, please provide feedback through:
- GitHub Issues: [Submit an issue](https://github.com/JeffZhA0/free-theme/issues)
- Author: JeffZhA0

---

**Enjoy your personalized note-taking experience!** 🎉
