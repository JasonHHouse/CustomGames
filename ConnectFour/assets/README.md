# Application Icons

To build the application with proper icons, you'll need to add icon files to this directory:

- **macOS**: `icon.icns` - 1024x1024 icon in ICNS format
- **Windows**: `icon.ico` - Multi-resolution ICO file (at least 256x256)
- **Linux**: `icon.png` - PNG file (512x512 or 1024x1024 recommended)

## Creating Icons

You can create icons from a single PNG image using online tools or command-line utilities:

### Using electron-icon-builder (recommended)
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./source-icon.png --output=./assets
```

### Manual creation
1. Create a 1024x1024 PNG image with your game design
2. Use online converters:
   - For ICNS: https://cloudconvert.com/png-to-icns
   - For ICO: https://icoconvert.com/
3. Place the converted files in this directory

## Temporary Workaround

For now, the app will build without custom icons and use Electron's default icon. To add your own icons later, simply place them in this directory and rebuild the application.
