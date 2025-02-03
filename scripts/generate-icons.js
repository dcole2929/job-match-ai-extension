/*global process */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [16, 48, 128];
const inputSvg = 'public/icons/icon.svg';
const outputDir = 'public/icons';

async function generateIcons() {
  try {
    await mkdir(outputDir, { recursive: true });
    
    for (const size of sizes) {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(join(outputDir, `icon${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 