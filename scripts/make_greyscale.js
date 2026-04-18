const fs = require('fs');

function makeGreyscale() {
  const file = 'd:/Study/Development/delraw/supWeb/website/src/app/dashboard/super-admin/page.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  const paletteReplacement = `const C = {
  bg:       '#0A0A0A',
  surface:  '#121212',
  sidebar:  '#050505',
  border:   'rgba(255,255,255,0.06)',
  accent:   '#FFFFFF',
  accentLt: '#A3A3A3',
  muted:    'rgba(255,255,255,0.1)',
  text:     '#FFFFFF',
  textDim:  '#A3A3A3',
  green:    '#E5E5E5',
  amber:    '#CCCCCC',
  red:      '#737373',
  purple:   '#FFFFFF',
  teal:     '#E5E5E5',
};`;

  content = content.replace(/const C = \{[\s\S]*?\};/, paletteReplacement);
  
  // Update the gradient on the logo to match greyscale
  content = content.replace(/background: `linear-gradient\(135deg, #2A4E80, \$\{C\.accent\}\)`,/g, "background: `linear-gradient(135deg, #262626, ${C.accent})`,");
  
  // Simplify system colors for pure monochrome (since we replaced variables, we might need to adjust alpha values)
  content = content.replace(/rgba\(79,127,186,/g, "rgba(255,255,255,");
  content = content.replace(/rgba\(74,202,141,/g, "rgba(255,255,255,");
  content = content.replace(/rgba\(224,120,120,/g, "rgba(255,255,255,");
  content = content.replace(/rgba\(232,184,109,/g, "rgba(255,255,255,");

  fs.writeFileSync(file, content);
  console.log('Super admin made greyscale');
}

makeGreyscale();
