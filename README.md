# Bulk Offer Poster Generator

A Node.js script that generates offer posters from a template PNG and CSV data.

## Features

- Uses a background PNG template
- Processes a CSV file with product information
- Overlays product details at configurable positions:
  - Product name
  - SKU
  - Actual price (struck through)
  - Offer price (in red)
  - Optional product image
- Saves output as PNG files named by SKU or product name

## Requirements

- Node.js
- The following NPM packages (installed automatically):
  - canvas
  - csv-parser

## CSV Format

The CSV file should have the following columns:
- `image` (optional): Path to product image
- `name`: Product name
- `sku`: Product SKU
- `actual_price`: Original price
- `offer_price`: Discounted price

Example:
```csv
image,name,sku,actual_price,offer_price
/path/to/image.jpg,Product Name,ABC123,1999,1499
```

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the script:
   ```bash
   node src/index.js <template.png> <data.csv> [output_dir]
   ```
   - `template.png`: Path to the background template image
   - `data.csv`: Path to the CSV file containing product data
   - `output_dir`: (Optional) Output directory for generated posters (default: 'output')

## Customizing Positions

You can modify the text and image positions by editing the `positions` object in the `PosterGenerator` class. The default positions are:

```javascript
{
    name: { x: 50, y: 100 },
    sku: { x: 50, y: 150 },
    actualPrice: { x: 50, y: 200 },
    offerPrice: { x: 150, y: 200 },
    productImage: { x: 400, y: 100 }
}
```

## Example

```bash
node src/index.js templates/background.png data/products.csv output/posters
```
