const fs = require('fs');
const path = require('path');

// Simple 32x32 PNG with green invoice icon (base64 encoded minimal PNG)
// This is a minimal 32x32 green PNG with a white document icon
const pngData = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjZSBlYXNoLwAAABxSURBVFiEx7cxEQAgDMCwoQxzLz/FWlRUfRQT70/OQo4Mji7OzsAAGCCAQAcQoAAQIMABBiAwAEGIBAIIAABxAAgAgEGAADEKAAECDAAQYgAABBgAQCGA8W8CVOv8p0UAAAAASUVORK5CYII=',
  'base64'
);

const outputPath = path.join(__dirname, '..', 'app', 'icon.png');
fs.writeFileSync(outputPath, pngData);
console.log('✅ icon.png created successfully!');
console.log('📍 Location:', outputPath);
