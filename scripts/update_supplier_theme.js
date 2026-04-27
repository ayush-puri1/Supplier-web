const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'website', 'src', 'app', 'dashboard', 'supplier'));

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the original and the intermediate dark theme colors to the new soft charcoal
  let newContent = content.replace(/#0F0F14|#0D0D12|#15151C|#0A0A0A|#050505|#111111/gi, (match) => {
    switch (match.toUpperCase()) {
      case '#0D0D12':
      case '#050505': return '#0A0A0A'; // Sidebar/Header
      
      case '#0F0F14':
      case '#0A0A0A': return '#141414'; // Main Body
      
      case '#15151C':
      case '#111111': return '#1E1E1E'; // Cards/Panels
      
      default: return match;
    }
  });
  
  // Also catch rgba if present
  newContent = newContent.replace(/rgba\(15,15,20/gi, 'rgba(20,20,20');
  newContent = newContent.replace(/rgba\(10,10,10/gi, 'rgba(20,20,20');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nSuccessfully applied brighter charcoal to ${updatedFiles} supplier files.`);
