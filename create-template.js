const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a canvas for our template
const width = 2480;
const height = 3508;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill background with green
ctx.fillStyle = '#4CAF50';
ctx.fillRect(0, 0, width, height);

// Create white content area with rounded corners
ctx.beginPath();
ctx.moveTo(60, 140);
ctx.lineTo(width - 60, 140);
ctx.lineTo(width - 60, height - 40);
ctx.lineTo(60, height - 40);
ctx.closePath();
ctx.fillStyle = '#FFFFFF';
ctx.fill();

// Add header text
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 80px Arial';
ctx.fillText('INSTORE', 60, 100);
ctx.fillStyle = '#FFEB3B'; // Yellow color for "PROMOTION"
ctx.fillText('PROMOTION', 320, 100);

// Save the template
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('template.png', buffer);

console.log('Template image created successfully!');
