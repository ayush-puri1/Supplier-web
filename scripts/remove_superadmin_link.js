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
const files = walkSync(adminDir);
let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove everything between {/* Super Admin Access */} and the closing </Link> + )}
  // Match from the comment start to the closing )} of the conditional block
  content = content.replace(
    /[ \t]*\{\/\* Super Admin Access[^*]*\*\/\}\s*\n[\s\S]*?<\/Link>\s*\n\s*\{?\s*\)?\s*\}?\s*\n/g,
    ''
  );

  // Also handle the always-visible variant (no wrapper)
  content = content.replace(
    /[ \t]*\{\/\* Super Admin Access[^*]*\*\/\}\s*\n\s*<Link[^>]*super-admin[^>]*>[\s\S]*?<\/Link>\s*\n/g,
    ''
  );

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Cleaned: ${file}`);
  }
}

console.log(`\nRemoved Super Admin links from ${updatedFiles} admin pages.`);
