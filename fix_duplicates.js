const fs = require('fs');
const problems = JSON.parse(fs.readFileSync('problems.json', 'utf8'));
const files = [...new Set(problems.map(p => p.path))];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');

  // Match any tag <tag ... >
  text = text.replace(/<([a-zA-Z0-9]+)(\s+[^>]+)>/g, (match, tag, attrs) => {
    // Collect attributes
    const attrRegex = /([a-zA-Z0-9-]+)=(['"{].*?['"}])/g;
    const seen = new Set();
    const newAttrs = attrs.replace(attrRegex, (attrMatch, attrName) => {
      if (seen.has(attrName)) {
        return ''; // remove duplicate
      }
      seen.add(attrName);
      return attrMatch;
    });
    return `<${tag}${newAttrs}>`;
  });

  fs.writeFileSync(file, text, 'utf8');
});
console.log('Robustly deduplicated attributes!');
