const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('d:\\Springboard\\frontend\\src', function(filePath) {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/process\.env\.REACT_APP_API_URL/g, 'import.meta.env.VITE_API_URL')
      .replace(/process\.env\.REACT_APP_API_BASE_URL/g, 'import.meta.env.VITE_API_BASE_URL')
      .replace(/process\.env\.NODE_ENV/g, 'import.meta.env.MODE');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated ' + filePath);
    }
  }
});
