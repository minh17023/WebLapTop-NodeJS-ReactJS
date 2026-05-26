const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
    { search: /#E30019/g, replace: '#0071E3' },
    { search: /\bto-red-400\b/g, replace: 'to-blue-400' },
    { search: /\bto-red-500\b/g, replace: 'to-blue-500' },
    { search: /\bfrom-red-500\b/g, replace: 'from-blue-500' },
    { search: /\bfrom-red-600\b/g, replace: 'from-blue-600' },
    { search: /\btext-red-400\b/g, replace: 'text-blue-400' },
    { search: /\btext-red-500\b/g, replace: 'text-blue-500' },
    { search: /\btext-red-600\b/g, replace: 'text-blue-600' },
    { search: /\bbg-red-50\b/g, replace: 'bg-blue-50' },
    { search: /\bbg-red-100\b/g, replace: 'bg-blue-100' },
    { search: /\bbg-red-500\b/g, replace: 'bg-blue-500' },
    { search: /\bbg-red-600\b/g, replace: 'bg-blue-600' },
    { search: /\bborder-red-100\b/g, replace: 'border-blue-100' },
    { search: /\bborder-red-200\b/g, replace: 'border-blue-200' },
    { search: /\bborder-red-500\b/g, replace: 'border-blue-500' },
    { search: /\bring-red-500\b/g, replace: 'ring-blue-500' },
    { search: /\bshadow-red-500\/20\b/g, replace: 'shadow-blue-500/20' },
    { search: /\bshadow-red-500\/30\b/g, replace: 'shadow-blue-500/30' },
    { search: /rgba\(227,0,25/g, replace: 'rgba(0,113,227' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + file);
    }
});

console.log('Done replacing theme colors!');
