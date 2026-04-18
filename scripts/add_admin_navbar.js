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
  
  // 1. Find the <header> tag and make sure it has position: 'relative'
  if (content.includes('<header style={{')) {
    
    // Add position relative to the header style if it's not already there
    if (!content.includes("position: 'relative'") && content.includes('<header style={{')) {
      content = content.replace(/<header style=\{\{/g, "<header style={{ position: 'relative',");
    }
    
    // 2. Add the ADMIN text right after the opening <header ...> tag
    const headerRegex = /(<header[^>]*>)/g;
    const adminText = `\n             {/* CENTERED ADMIN TEXT */}\n             <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-num)', fontSize: 14, fontWeight: 800, letterSpacing: '0.15em', color: 'white' }}>ADMIN</div>`;
    
    if (!content.includes('CENTERED ADMIN TEXT')) {
      content = content.replace(headerRegex, `$1${adminText}`);
      fs.writeFileSync(file, content, 'utf8');
      updatedFiles++;
      console.log(`Updated ${file}`);
    }
  }
}

console.log(`\nSuccessfully added ADMIN text to ${updatedFiles} navbars.`);
