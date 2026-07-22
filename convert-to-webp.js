/**
 * convert-to-webp.js
 * แปลง PNG ทั้งหมดเป็น WebP เพื่อลดขนาดไฟล์
 * รัน: npm install sharp  แล้ว  node convert-to-webp.js
 */

const fs = require('fs');
const path = require('path');
let sharp;

try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ กรุณาติดตั้ง sharp ก่อน:');
  console.error('   npm install sharp');
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, 'assets', 'images');

// Settings per folder
const FOLDER_SETTINGS = {
  'backgrounds': { quality: 80, maxWidth: 1920 },
  'char':        { quality: 85, maxWidth: 1024 },
  'characters':  { quality: 85, maxWidth: 1024 },
  'credit':      { quality: 80, maxWidth: 1024 },
};

async function convertFile(filePath, settings) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') return null;

  const outPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');

  try {
    let pipeline = sharp(filePath);

    // Get metadata to check if resize is needed
    const meta = await pipeline.metadata();

    if (meta.width > settings.maxWidth) {
      pipeline = pipeline.resize(settings.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    await pipeline
      .webp({ quality: settings.quality, effort: 6 })
      .toFile(outPath);

    const origSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(outPath).size;
    const saved = ((1 - newSize / origSize) * 100).toFixed(1);

    return { file: path.basename(filePath), origSize, newSize, saved };
  } catch (err) {
    console.error(`   ❌ Error: ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🖼️  แปลงภาพ PNG → WebP\n');

  let totalOrig = 0;
  let totalNew = 0;
  let count = 0;

  const folders = fs.readdirSync(IMAGES_DIR).filter(f =>
    fs.statSync(path.join(IMAGES_DIR, f)).isDirectory()
  );

  for (const folder of folders) {
    const folderPath = path.join(IMAGES_DIR, folder);
    const settings = FOLDER_SETTINGS[folder] || { quality: 80, maxWidth: 1920 };

    const files = fs.readdirSync(folderPath).filter(f =>
      /\.(png|jpe?g)$/i.test(f)
    );

    if (files.length === 0) continue;

    console.log(`📁 ${folder}/ (${files.length} files, quality: ${settings.quality}, maxWidth: ${settings.maxWidth}px)`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      process.stdout.write(`   ⚙️  ${file} → `);

      const result = await convertFile(filePath, settings);
      if (result) {
        totalOrig += result.origSize;
        totalNew += result.newSize;
        count++;
        console.log(`${(result.newSize / 1024 / 1024).toFixed(2)} MB (ลด ${result.saved}%)`);
      }
    }
    console.log('');
  }

  console.log('─'.repeat(50));
  console.log(`✅ แปลงเสร็จ ${count} ไฟล์`);
  console.log(`📊 ขนาดเดิม: ${(totalOrig / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 ขนาดใหม่: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎉 ลดลง: ${((1 - totalNew / totalOrig) * 100).toFixed(1)}%`);
}

main().catch(console.error);
