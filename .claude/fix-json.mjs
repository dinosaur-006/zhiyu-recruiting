import fs from 'fs';

let text = fs.readFileSync('.claude/inbox-simulation-design.json', 'utf-8');

// Replace each occurrence of [ ... ].join('\n') with the actual joined string
// We'll do this by finding "].join('\\n')" and working backwards character by character
// to find the matching '[' that starts an array, being aware of JSON string boundaries

function findArrayStart(str, closeBracketPos) {
  // closeBracketPos is the position of ']' that ends the array
  let depth = 1;
  let pos = closeBracketPos - 1;
  let inString = false;
  let escaped = false;

  while (pos >= 0 && depth > 0) {
    const ch = str[pos];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === ']') {
        depth++;
      } else if (ch === '[') {
        depth--;
      }
    }

    if (depth > 0) pos--;
  }

  return depth === 0 ? pos : -1;
}

// Find all ].join('\n') patterns
const pattern = /\]\s*\.join\s*\(\s*'\\n'\s*\)/g;
const replacements = [];
let m;
while ((m = pattern.exec(text)) !== null) {
  const closeBracket = m.index;
  const openBracket = findArrayStart(text, closeBracket);
  if (openBracket >= 0) {
    const arrContent = text.substring(openBracket + 1, closeBracket);
    try {
      const arr = JSON.parse('[' + arrContent + ']');
      const joined = JSON.stringify(arr.join('\n'));
      replacements.push({
        start: openBracket,
        end: closeBracket + m[0].length,
        replacement: joined
      });
      console.log('Will fix array of', arr.length, 'items at pos', openBracket);
    } catch(e) {
      console.error('Parse error at pos', openBracket, ':', e.message);
    }
  } else {
    console.error('Could not find matching [ at pos', closeBracket);
  }
}

// Apply replacements in reverse order
for (let i = replacements.length - 1; i >= 0; i--) {
  const r = replacements[i];
  text = text.substring(0, r.start) + r.replacement + text.substring(r.end);
}

if (text.includes('.join(')) {
  console.log('WARNING: .join() patterns remain');
  const idx = text.indexOf('.join(');
  console.log('First remaining at:', text.substring(idx - 5, idx + 20));
}

try {
  JSON.parse(text);
  console.log('SUCCESS: Valid JSON!');
  fs.writeFileSync('.claude/inbox-simulation-design-fixed.json', text, 'utf-8');
  const d = JSON.parse(text);
  console.log('Top keys:', Object.keys(d).join(', '));
} catch(e) {
  console.error('Invalid JSON:', e.message);
  const posMatch = e.message.match(/position (\d+)/);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    console.error('Around error:', JSON.stringify(text.substring(Math.max(0,pos-50), pos+50)));
  }
}
