const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
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

const files = walkSync(path.join(__dirname, 'website', 'src', 'app', 'dashboard', 'admin'));

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Use a map function to avoid double replacements
  let newContent = content.replace(/#0A0A0A|#050505|#111111|rgba\(10,10,10/gi, (match) => {
    switch (match.toUpperCase()) {
      case '#050505': return '#0A0A0A'; // Sidebar/Header
      case '#0A0A0A': return '#141414'; // Main Body
      case '#111111': return '#1E1E1E'; // Cards/Panels
      case 'RGBA(10,10,10': return 'rgba(20,20,20'; // Gradients
      default: return match;
    }
  });
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nSuccessfully brightened ${updatedFiles} files.`);
