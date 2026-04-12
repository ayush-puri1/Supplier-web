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
  let newContent = content
    .replace(/#0F0F14/g, '#0A0A0A')
    .replace(/#0D0D12/g, '#050505')
    .replace(/#15151C/g, '#111111')
    .replace(/rgba\(15,15,20/g, 'rgba(10,10,10'); // Also replace the rgba variant of 0F0F14 (15,15,20 -> 10,10,10)
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nSuccessfully updated ${updatedFiles} files to charcoal theme.`);
