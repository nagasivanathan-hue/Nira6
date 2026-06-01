/* eslint-disable */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
  // Backgrounds
  { regex: /bg-white/g, replacement: 'bg-[#111111]' },
  { regex: /bg-gray-50(?![0-9])/g, replacement: 'bg-[#0A0A0A]' },
  { regex: /bg-gray-100/g, replacement: 'bg-[#0A0A0A]' },
  
  // Text
  { regex: /text-nira-dark/g, replacement: 'text-white' },
  { regex: /text-gray-900/g, replacement: 'text-white' },
  { regex: /text-black/g, replacement: 'text-white' },
  { regex: /text-gray-800/g, replacement: 'text-neutral-200' },
  { regex: /text-gray-700/g, replacement: 'text-neutral-300' },
  { regex: /text-gray-600/g, replacement: 'text-[#555555]' },
  { regex: /text-gray-500/g, replacement: 'text-[#555555]' },
  
  // Borders
  { regex: /border-gray-100/g, replacement: 'border-[#1E1E1E]' },
  { regex: /border-gray-200/g, replacement: 'border-[#1E1E1E]' },
  { regex: /border-gray-300/g, replacement: 'border-[#1E1E1E]' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let changedFilesCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      changedFilesCount += processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        changedFilesCount++;
        // console.log(`Updated: ${fullPath}`);
      }
    }
  }
  
  return changedFilesCount;
}

const count = processDirectory(srcDir);
console.log(`✅ Color correction complete! Updated ${count} files.`);
/* eslint-disable */
