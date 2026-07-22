const fs = require('fs');
const path = require('path');
let JavaScriptObfuscator;

try {
  JavaScriptObfuscator = require('javascript-obfuscator');
} catch (e) {
  console.error('❌ กรุณาติดตั้ง javascript-obfuscator ก่อน:');
  console.error('   npm install javascript-obfuscator');
  process.exit(1);
}

const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

const IGNORE = ['.git', 'node_modules', 'dist', 'package.json', 'package-lock.json', 'build-obfuscate.js'];

const JS_DIR = 'js';

const OBFUSCATOR_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDir(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (IGNORE.includes(entry)) continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const result = JavaScriptObfuscator.obfuscate(code, OBFUSCATOR_OPTIONS);
  fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf-8');
}


console.log('🔨 เริ่ม build...\n');

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  console.log('🗑️  ลบ dist/ เก่าแล้ว');
}

console.log('📂 กำลัง copy ไฟล์...');
copyRecursive(SRC_DIR, DIST_DIR);
console.log('✅ Copy ไฟล์เสร็จ\n');

const jsDistDir = path.join(DIST_DIR, JS_DIR);
if (fs.existsSync(jsDistDir)) {
  const jsFiles = fs.readdirSync(jsDistDir).filter(f => f.endsWith('.js'));
  console.log(`🔒 กำลัง obfuscate ${jsFiles.length} ไฟล์ JS...\n`);

  for (const file of jsFiles) {
    const filePath = path.join(jsDistDir, file);
    process.stdout.write(`   ⚙️  ${file} ... `);
    try {
      obfuscateFile(filePath);
      console.log('✅');
    } catch (err) {
      console.log('❌');
      console.error(`      Error: ${err.message}`);
    }
  }
}

console.log('\n🎉 Build เสร็จสมบูรณ์!');
console.log(`📁 ผลลัพธ์อยู่ที่: ${DIST_DIR}`);
console.log('\n💡 วิธี deploy:');
console.log('   1. Push โฟลเดอร์ dist/ ไปยัง branch gh-pages');
console.log('   2. หรือตั้งค่า GitHub Pages ให้ชี้ไปที่ /dist');
