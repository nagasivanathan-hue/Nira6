const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public', 'assets', 'logos');
const outputDir = path.join(__dirname, 'public', 'assets', 'logos-webp');

async function convertLogos() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read all files in the input directory
    const files = fs.readdirSync(inputDir);

    for (const file of files) {
      if (file.toLowerCase().endsWith('.png')) {
        const inputPath = path.join(inputDir, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(outputDir, `${fileNameWithoutExt}.webp`);

        // Convert to WebP
        await sharp(inputPath)
          .webp({ quality: 90 }) // Adjust quality as needed
          .toFile(outputPath);
        
        console.log(`Converted: ${file} -> ${fileNameWithoutExt}.webp`);
      }
    }
    console.log('✅ WebP conversion complete!');
  } catch (error) {
    console.error('❌ Error converting logos:', error);
  }
}

convertLogos();
