const fs = require('fs');

const filePath = 'src/pages/admin/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace standard colors with dark mode variants
content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-800');
content = content.replace(/bg-gray-100(?! dark:bg)/g, 'bg-gray-100 dark:bg-gray-900');
content = content.replace(/bg-gray-50(?! dark:bg)/g, 'bg-gray-50 dark:bg-gray-700/50');
content = content.replace(/text-gray-900(?! dark:text)/g, 'text-gray-900 dark:text-white');
content = content.replace(/text-gray-800(?! dark:text)/g, 'text-gray-800 dark:text-gray-200');
content = content.replace(/text-gray-700(?! dark:text)/g, 'text-gray-700 dark:text-gray-300');
content = content.replace(/text-gray-600(?! dark:text)/g, 'text-gray-600 dark:text-gray-400');
content = content.replace(/border-gray-100(?! dark:border)/g, 'border-gray-100 dark:border-gray-700');
content = content.replace(/border-gray-200(?! dark:border)/g, 'border-gray-200 dark:border-gray-700');
content = content.replace(/border-gray-300(?! dark:border)/g, 'border-gray-300 dark:border-gray-600');

// Fix any duplicated dark: classes if any
content = content.replace(/(dark:bg-gray-800 )+dark:bg-gray-800/g, 'dark:bg-gray-800');

// Add Sun/Moon icons to imports
if (!content.includes('Moon, Sun')) {
  content = content.replace(/Settings, Save } from 'lucide-react';/, 'Settings, Save, Moon, Sun } from \'lucide-react\';');
}

// Add state for dark mode
if (!content.includes('isDarkMode')) {
  content = content.replace(/const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/, 
`const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminDarkMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminDarkMode', isDarkMode);
  }, [isDarkMode]);`);
}

// Wrap the main return to support dark mode class
content = content.replace(/<div className="flex flex-col md:flex-row h-screen bg-gray-100/g, 
  `<div className={\`flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 \${isDarkMode ? 'dark' : ''}\`}`);

// Add the toggle button to the sidebar
const toggleBtn = `
        <div className="p-4 border-t border-gray-800 mt-auto flex justify-between items-center">
          <button onClick={handleLogout} className="flex items-center text-gray-400 hover:text-white transition-colors w-full px-4 py-3 md:py-2 font-medium">
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800" title="Alternar Modo Oscuro">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>`;
content = content.replace(/<div className="p-4 border-t border-gray-800 mt-auto">[\s\S]*?Cerrar Sesión\s*<\/button>\s*<\/div>/, toggleBtn);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Dark mode applied to Dashboard.jsx');
