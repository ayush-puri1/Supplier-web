const fs = require('fs');
const file = 'd:/Study/Development/delraw/supWeb/website/src/app/dashboard/super-admin/config/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove AdminSidebar
content = content.replace(/\/\* ══════════════════════════════════════════════[\s\S]*?function DarkToggle/g, "import { SuperAdminSidebar } from '../page';\n\nfunction DarkToggle");

// 2. Fix imports
content = content.replace(/import \{ ArrowLeft, LayoutDashboard, Users, Package, Shield, LogOut, BarChart3, ShieldOff, Check, AlertCircle, History, Settings , Crown \} from 'lucide-react';/g, "import { ArrowLeft, ShieldOff, Check, AlertCircle, Settings } from 'lucide-react';");

// 3. Replace <AdminSidebar /> usage
content = content.replace(/<AdminSidebar \/>/g, '<SuperAdminSidebar active="config" />');

// 4. Update the background colors to match Super Admin
content = content.replace(/background: '#141414'/g, "background: '#0C1220'");

fs.writeFileSync(file, content);
console.log('Fixed config page');
