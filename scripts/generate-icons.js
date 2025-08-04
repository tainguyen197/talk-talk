const fs = require("fs");
const path = require("path");

// Create a simple canvas-based icon generator
const { createCanvas } = require("canvas");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(0, 0, size, size);

  // Draw a simple speech bubble
  ctx.fillStyle = "white";
  const bubbleSize = size * 0.6;
  const bubbleX = (size - bubbleSize) / 2;
  const bubbleY = (size - bubbleSize) / 2;

  // Main bubble
  ctx.beginPath();
  ctx.roundRect(bubbleX, bubbleY, bubbleSize, bubbleSize * 0.8, size * 0.1);
  ctx.fill();

  // Speech tail
  ctx.beginPath();
  ctx.moveTo(bubbleX + bubbleSize * 0.3, bubbleY + bubbleSize * 0.8);
  ctx.lineTo(bubbleX + bubbleSize * 0.4, bubbleY + bubbleSize);
  ctx.lineTo(bubbleX + bubbleSize * 0.5, bubbleY + bubbleSize * 0.8);
  ctx.fill();

  // Text dots
  ctx.fillStyle = "#3b82f6";
  const dotSize = size * 0.08;
  const dotSpacing = size * 0.15;
  const startX = bubbleX + bubbleSize * 0.2;
  const startY = bubbleY + bubbleSize * 0.3;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * dotSpacing, startY, dotSize, 0, 2 * Math.PI);
    ctx.fill();
  }

  return canvas.toBuffer("image/png");
}

// Generate icons
sizes.forEach((size) => {
  const iconBuffer = generateIcon(size);
  const iconPath = path.join(
    __dirname,
    "..",
    "public",
    "icons",
    `icon-${size}x${size}.png`
  );
  fs.writeFileSync(iconPath, iconBuffer);
  console.log(`Generated icon: ${size}x${size}`);
});

console.log("All icons generated successfully!");
