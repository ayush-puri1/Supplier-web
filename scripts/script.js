const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg:\s*'#090D17'/g, "bg: '#0A0A0A'");
  content = content.replace(/surface:\s*'#111827'/g, "surface: '#121212'");
  content = content.replace(/sidebar:\s*'#05080E'/g, "sidebar: '#050505'");
  content = content.replace(/border:\s*'rgba\(59,\s*130,\s*246,\s*0\.1\)'/g, "border: 'rgba(255,255,255,0.06)'");
  content = content.replace(/'Syne',\s*sans-serif/g, "var(--font-heading)");
  fs.writeFileSync(file, content);
}

fixFile('d:/Study/Development/delraw/supWeb/website/src/app/dashboard/super-admin/page.tsx');
