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
  
  // Only update files that have AdminSidebar and don't already have super-admin link
  if (content.includes('function AdminSidebar()') && !content.includes('/dashboard/super-admin')) {
    
    // Add Crown to imports if not already there
    if (!content.includes('Crown')) {
      content = content.replace(
        /} from 'lucide-react';/,
        ", Crown } from 'lucide-react';"
      );
    }
    
    // Add the super admin link right before the </nav> closing in AdminSidebar
    // We'll add it after the nav items map, before the closing </nav>
    const navClosePattern = `      </nav>`;
    const superAdminLink = `        {/* Super Admin Access */}
        {user?.role === 'SUPER_ADMIN' && (
          <Link href="/dashboard/super-admin" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#FBBF24', background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(59,130,246,0.06))', border: '1px solid rgba(251,191,36,0.1)', marginTop: 12, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(251,191,36,0.25)'; e.currentTarget.style.background='linear-gradient(135deg, rgba(251,191,36,0.1), rgba(59,130,246,0.1))'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(251,191,36,0.1)'; e.currentTarget.style.background='linear-gradient(135deg, rgba(251,191,36,0.06), rgba(59,130,246,0.06))'; }}>
            <Crown size={14} color="#FBBF24" /> Super Admin
          </Link>
        )}
`;
    
    if (content.includes(navClosePattern)) {
      content = content.replace(navClosePattern, superAdminLink + navClosePattern);
      fs.writeFileSync(file, content, 'utf8');
      updatedFiles++;
      console.log(`Updated: ${file}`);
    }
  }
}

console.log(`\nAdded Super Admin link to ${updatedFiles} admin pages.`);
