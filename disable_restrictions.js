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

const adminDir = path.join(__dirname, 'website', 'src', 'app', 'dashboard', 'admin');
const superAdminFile = path.join(__dirname, 'website', 'src', 'app', 'dashboard', 'super-admin', 'page.tsx');

const files = walkSync(adminDir);
if (fs.existsSync(superAdminFile)) files.push(superAdminFile);

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. FIX THE PREVIOUS BAD REPLACEMENT (if (false && if ( ... ))
  content = content.replace(/if\s*\(false\s*&&\s*if\s*\(/g, 'if (');

  // 2. APPLY CORRECT BYPASS (if (false && (!loading && ...)))
  // This version inserts "false &&" at the very beginning of the IF condition
  content = content.replace(/(if\s*\()(!loading\s*&&\s*(?:user|currentUser)\?\.role\s*!==\s*['"]SUPER_ADMIN['"])/g, '$1false && ($2)');

  // 3. Ensure Super Admin links in sidebar are always visible
  // Make sure we didn't duplicate "true &&" if the script runs twice
  if (!content.includes('{true && (')) {
    content = content.replace(/\{(?:user|currentUser)\?\.role\s*===\s*['"]SUPER_ADMIN['"]\s*&&\s*\(/g, '{true && (');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Fixed and Updated: ${file}`);
  }
}

console.log(`\nSuccessfully fixed syntax and disabled role restrictions in ${updatedFiles} files.`);
