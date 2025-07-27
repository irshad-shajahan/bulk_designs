const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class PosterGenerator {
    constructor(templatesDir) {
        // A4 size at 300 DPI: 2480 x 3508 pixels
        this.width = 2480;
        this.height = 3508;
        this.templatesDir = templatesDir;
        this.templates = new Map(); // Cache for loaded templates
        
        // Load template configurations
        const configPath = path.join(templatesDir, '../template-config.json');
        if (!fs.existsSync(configPath)) {
            throw new Error('Template configuration file not found');
        }
        this.templateConfigs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    async loadTemplate(templateName) {
        if (!this.templates.has(templateName)) {
            const templatePath = path.join(this.templatesDir, templateName);
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templateName}`);
            }
            const template = await loadImage(templatePath);
            this.templates.set(templateName, template);
        }
        return this.templates.get(templateName);
    }

    async generatePoster(productData) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Load and draw the specified template
        const template = await this.loadTemplate(productData.template);
        ctx.drawImage(template, 0, 0, this.width, this.height);

        // Get configuration for this template
        const config = this.templateConfigs[productData.template];
        if (!config) {
            throw new Error(`No configuration found for template: ${productData.template}`);
        }

        ctx.fillStyle = 'black';

        // Add SKU
        ctx.font = config.sku.font;
        ctx.fillText(productData.sku, config.sku.x, config.sku.y);

        // Draw actual price with strikethrough
        ctx.font = config.actualPrice.font;
        const actualPriceText = `${productData.actual_price}.00 SAR`;
        const metrics = ctx.measureText(actualPriceText);
        ctx.fillText(actualPriceText, config.actualPrice.x, config.actualPrice.y);
        
        // Add strikethrough
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(config.actualPrice.x, config.actualPrice.y - 5);
        ctx.lineTo(config.actualPrice.x + metrics.width, config.actualPrice.y - 5);
        ctx.stroke();

        // Draw offer price
        ctx.font = config.offerPrice.font;
        ctx.fillText(productData.offer_price, config.offerPrice.x, config.offerPrice.y);
        
        // Draw decimal part
        ctx.font = config.offerPrice.decimal.font;
        const decimalY = config.offerPrice.y + (config.offerPrice.decimal.yOffset || 0);
        ctx.fillText('.95', 
            config.offerPrice.x + ctx.measureText(productData.offer_price).width,
            decimalY
        );

        // Draw product name in both Arabic and English
        ctx.font = config.name.font;
        const lines = productData.name.split('\n');
        let y = config.name.y;
        for (const line of lines) {
            ctx.fillText(line, config.name.x, y);
            y += config.name.lineHeight;
        }

        return canvas;
    }

    async processCSV(inputFile, outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const results = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(inputFile)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        for (const product of results) {
            try {
                const canvas = await this.generatePoster(product);
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync(path.join(outputDir, `${product.sku}.png`), buffer);
                console.log(`Generated poster for SKU: ${product.sku}`);
            } catch (error) {
                console.error(`Error generating poster for SKU ${product.sku}:`, error.message);
            }
        }
    }
}

// Main execution
if (require.main === module) {
    const [,, templatesDir, inputFile, outputDir] = process.argv;
    if (!templatesDir || !inputFile || !outputDir) {
        console.error('Usage: node index.js <templates-directory> <input-csv> <output-directory>');
        process.exit(1);
    }

    const generator = new PosterGenerator(templatesDir);
    generator.processCSV(inputFile, outputDir)
        .then(() => console.log('Processing complete!'))
        .catch(error => console.error('Error:', error));
}
