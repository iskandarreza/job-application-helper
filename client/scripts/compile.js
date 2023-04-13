require('dotenv').config(); // Load environment variables from .env file

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const inputFile = path.join(__dirname, '..', 'src', 'worker.js');
const outputFile = path.join(__dirname, '..', 'public', 'service-worker.js');

let lastInputCode = null;

function compile() {
  const inputCode = fs.readFileSync(inputFile, 'utf8');

  if (inputCode === lastInputCode) {
    // The input code hasn't changed, so there's no need to recompile
    return;
  }

  const { code } = babel.transformSync(inputCode, {
    presets: ['@babel/preset-env'],
  });

  fs.writeFileSync(outputFile, code, 'utf8');

  lastInputCode = inputCode;
}

compile(); // Compile the file once on startup

// Watch the inputFile for changes and recompile it whenever it changes
fs.watch(inputFile, { recursive: false }, (eventType, filename) => {
  if (eventType === 'change' && filename === path.basename(inputFile)) {
    console.log(`File ${filename} changed. Recompiling...`);
    compile();
  }
});
