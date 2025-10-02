const fs = require('fs');
const path = require('path');

// Get all JS/JSX files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Analyze unused imports in a file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const imports = [];
    const usages = new Set();
    
    // Extract imports
    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        if (importMatch[1]) {
          // Named imports
          const namedImports = importMatch[1].split(',').map(imp => imp.trim());
          namedImports.forEach(imp => {
            imports.push({ name: imp, line: index + 1, type: 'named' });
          });
        } else if (importMatch[2]) {
          // Default import
          imports.push({ name: importMatch[2], line: index + 1, type: 'default' });
        }
      }
    });
    
    // Check usage of imports
    imports.forEach(imp => {
      const regex = new RegExp(`\\b${imp.name}\\b`, 'g');
      const matches = content.match(regex);
      if (matches && matches.length > 1) { // More than just the import line
        usages.add(imp.name);
      }
    });
    
    const unused = imports.filter(imp => !usages.has(imp.name));
    
    if (unused.length > 0) {
      console.log(`\n📁 ${filePath}:`);
      unused.forEach(imp => {
        console.log(`  ❌ Line ${imp.line}: ${imp.name} (${imp.type})`);
      });
    }
    
    return { total: imports.length, unused: unused.length };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return { total: 0, unused: 0 };
  }
}

// Main analysis
console.log('🔍 ANALYZING UNUSED IMPORTS...\n');

const files = getAllFiles('src');
let totalImports = 0;
let totalUnused = 0;

files.forEach(file => {
  const result = analyzeFile(file);
  totalImports += result.total;
  totalUnused += result.unused;
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total imports: ${totalImports}`);
console.log(`Unused imports: ${totalUnused}`);
console.log(`Efficiency: ${((totalImports - totalUnused) / totalImports * 100).toFixed(1)}%`);
