const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a canvas for our template
const width = 2480;  // A4 width at 300 DPI
const height = 3508; // A4 height at 300 DPI
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill background with green (matching the image)
ctx.fillStyle = '#7AB547';
ctx.fillRect(0, 0, width, height);

// Create white content area with rounded corners (90% of width)
const margin = width * 0.05;
const contentStartY = height * 0.15;
ctx.beginPath();
ctx.moveTo(margin + 40, contentStartY);
// Top edge with rounded corners
ctx.quadraticCurveTo(margin, contentStartY, margin, contentStartY + 40);
// Left edge
ctx.lineTo(margin, height - margin - 40);
// Bottom left corner
ctx.quadraticCurveTo(margin, height - margin, margin + 40, height - margin);
// Bottom edge
ctx.lineTo(width - margin - 40, height - margin);
// Bottom right corner
ctx.quadraticCurveTo(width - margin, height - margin, width - margin, height - margin - 40);
// Right edge
ctx.lineTo(width - margin, contentStartY + 40);
// Top right corner
ctx.quadraticCurveTo(width - margin, contentStartY, width - margin - 40, contentStartY);
ctx.closePath();
ctx.fillStyle = '#FFFFFF';
ctx.fill();

// Add diagonal white shape in header
ctx.beginPath();
ctx.moveTo(width * 0.45, 0);
ctx.lineTo(width * 0.65, 0);
ctx.lineTo(width * 0.55, contentStartY);
ctx.lineTo(width * 0.35, contentStartY);
ctx.closePath();
ctx.fillStyle = '#FFFFFF';
ctx.fill();

// Add "INSTORE" text
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 120px Arial';
ctx.fillText('INSTORE', margin, contentStartY * 0.7);

// Add "PROMOTION" text in yellow
ctx.fillStyle = '#FFE600';
ctx.fillText('PROMOTION', margin + ctx.measureText('INSTORE ').width, contentStartY * 0.7);

// Save the template
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('template.png', buffer);

console.log('Template image created successfully!');
