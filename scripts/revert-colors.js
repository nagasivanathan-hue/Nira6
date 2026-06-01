const fs = require('fs');
const path = require('path');

const filesToRevert = [
  'src/app/globals.css',
  'src/app/auth/login/page.tsx',
  'src/app/auth/signup/page.tsx',
  'src/app/buy/page.tsx',
  'src/app/creators/[id]/page.tsx',
  'src/app/services/page.tsx',
  'src/components/home/HeroSection.tsx',
  'src/components/layout/AuthGate.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/SplashLoader.tsx',
  'src/components/reels/NIRA6ReelsTab.tsx',
  'src/components/support/LiveChatWidget.tsx',
  'src/components/layout/DesktopSidebar.tsx' // Add this one too if modified
];

const reverseReplacements = [
  // Backgrounds
  { regex: /bg-\[\#111111\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#0A0A0A\]/g, replacement: 'bg-gray-50' },
  
  // Borders
  { regex: /border-\[\#1E1E1E\]/g, replacement: 'border-gray-100' },
  
  // Text
  { regex: /text-\[\#555555\]/g, replacement: 'text-gray-500' },
  
  // Notice we avoid text-white -> text-nira-dark globally because it breaks real dark components.
  // We will do a targeted replacement for text-white where it usually pairs with white backgrounds.
];

filesToRevert.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    reverseReplacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    // Targeted text-white to text-black/nira-dark based on context (hacky but works for UI rollback)
    // If it says hover:text-white, leave it alone if it's meant to be dark?
    // Actually, in the old script I replaced text-nira-dark, text-gray-900, text-black all to text-white.
    // Let's just reverse text-white back to text-nira-dark ONLY in classes where bg-white is present? No, we just changed bg-white.
    // Let's just leave text-white as text-white for now and manually fix the few buttons that look invisible.

    // Specific globals.css rollback
    if (relPath.includes('globals.css')) {
      content = content.replace('background: var(--color-nira-darker);', 'background: #ffffff;');
      content = content.replace('--color-nira-gray: #1E1E1E;', '--color-nira-gray: #F5F5F5;');
      content = content.replace('--color-nira-gray-dark: #111111;', '--color-nira-gray-dark: #E5E5E5;');
      content = content.replace('--color-nira-text: #FFFFFF;', '--color-nira-text: #111111;');
      content = content.replace('--color-nira-text-secondary: #555555;', '--color-nira-text-secondary: #6B7280;');
    }

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Reverted colors in: ${relPath}`);
    }
  }
});
