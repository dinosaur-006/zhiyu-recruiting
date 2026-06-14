const fs = require('fs');

let text = fs.readFileSync('.claude/inbox-simulation-design.json', 'utf-8');

// Find each occurrence of ].join('\n') and replace with actual joined string
function findMatchingBracket(str, closeBracketPos) {
  // closeBracketPos is the position of ']'
  let depth = 1;
  let pos = closeBracketPos - 1;
  while (pos > 0 && depth > 0) {
    const ch = str[pos];
    if (ch === ']') depth++;
    else if (ch === '[') depth--;
    pos--;
  }
  return depth === 0 ? pos : -1;
}

let joinPattern = /\]\s*\.join\s*\(\s*'\\n'\s*\)/g;
let matches = [];
let match;
while ((match = joinPattern.exec(text)) !== null) {
  matches.push({ index: match.index, length: match[0].length });
}

// Process in reverse order to preserve positions
for (let i = matches.length - 1; i >= 0; i--) {
  const m = matches[i];
  const closeBracket = m.index;
  const openBracket = findMatchingBracket(text, closeBracket);

  if (openBracket >= 0) {
    const arrContent = text.substring(openBracket + 1, closeBracket);
    try {
      const arr = JSON.parse('[' + arrContent + ']');
      const joined = JSON.stringify(arr.join('\n'));
      const before = text.substring(0, openBracket);
      const after = text.substring(closeBracket + m.length);
      text = before + joined + after;
      console.log('Fixed array of', arr.length, 'items');
    } catch(e) {
      console.error('Parse error at pos', openBracket, ':', e.message);
    }
  }
}

if (text.includes('.join(')) {
  console.log('WARNING: remaining .join() patterns');
}

try {
  JSON.parse(text);
  console.log('SUCCESS: JSON is valid!');
  fs.writeFileSync('.claude/inbox-simulation-design-fixed.json', text, 'utf-8');
  const d = JSON.parse(text);
  console.log('Top keys:', Object.keys(d).join(', '));
} catch(e) {
  console.error('Invalid JSON:', e.message);
  const posMatch = e.message.match(/position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    console.error('Around:', JSON.stringify(text.substring(Math.max(0,pos-40), pos+40)));
  }
}
