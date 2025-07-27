const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createCanvas, loadImage } = require('canvas');

class PosterGenerator {
    constructor(templatePath) {
        this.templatePath = templatePath;
        // Positions matching the retail offer style
        this.positions = {
            sku: { x: 60, y: 200 },
            productImage: { x: 400, y: 300 },
            actualPrice: { x: 100, y: 800 },
            offerPrice: { x: 100, y: 1000 },
            name: { x: 100, y: 1200 }
        };
    }

    async generatePoster(productData) {
        // Load the template image
        const template = await loadImage(this.templatePath);
        
        // Create canvas with template dimensions
        const canvas = createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        // Draw template background
        ctx.drawImage(template, 0, 0);

        // Draw SKU at the top
        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(productData.sku, this.positions.sku.x, this.positions.sku.y);

        // Draw product image (centered)
        if (productData.image) {
            try {
                const productImage = await loadImage(productData.image);
                const maxWidth = 600;
                const maxHeight = 400;
                const scale = Math.min(maxWidth / productImage.width, maxHeight / productImage.height);
                const width = productImage.width * scale;
                const height = productImage.height * scale;
                const x = (canvas.width - width) / 2;
                ctx.drawImage(productImage, x, this.positions.productImage.y, width, height);
            } catch (error) {
                console.error(`Failed to load product image for ${productData.sku}:`, error);
            }
        }

        // Draw actual price (struck through)
        ctx.font = '60px Arial';
        ctx.fillStyle = 'black';
        const actualPriceText = `SAR ${productData.actual_price}.00`;
        const metrics = ctx.measureText(actualPriceText);
        ctx.fillText(actualPriceText, this.positions.actualPrice.x, this.positions.actualPrice.y);
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(this.positions.actualPrice.x, this.positions.actualPrice.y - 5);
        ctx.lineTo(this.positions.actualPrice.x + metrics.width, this.positions.actualPrice.y - 5);
        ctx.stroke();

        // Draw offer price in large bold black
        ctx.font = 'bold 180px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(productData.offer_price, this.positions.offerPrice.x, this.positions.offerPrice.y);
        ctx.font = 'bold 60px Arial';
        ctx.fillText('SAR ريال', this.positions.offerPrice.x + 400, this.positions.offerPrice.y);

        // Draw product name at the bottom
        ctx.font = '36px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(productData.name, this.positions.name.x, this.positions.name.y);

        return canvas;
    }

    setPositions(positions) {
        this.positions = { ...this.positions, ...positions };
    }
}

async function processCSV(templatePath, csvPath, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const generator = new PosterGenerator(templatePath);

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', async (row) => {
            try {
                const canvas = await generator.generatePoster(row);
                const fileName = `${row.sku || row.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                const outputPath = path.join(outputDir, fileName);
                
                const out = fs.createWriteStream(outputPath);
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                
                out.on('finish', () => {
                    console.log(`Generated poster: ${fileName}`);
                });
            } catch (error) {
                console.error(`Failed to generate poster for ${row.sku || row.name}:`, error);
            }
        })
        .on('end', () => {
            console.log('Finished processing all rows');
        });
}

// Check if required arguments are provided
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node index.js <template.png> <data.csv> [output_dir]');
    process.exit(1);
}

const templatePath = args[0];
const csvPath = args[1];
const outputDir = args[2] || 'output';

// Validate files exist
if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
}

if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
}

processCSV(templatePath, csvPath, outputDir).catch(console.error);
