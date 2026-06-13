const fs = require('fs');
const path = require('path');

const files = [
    'c:\\weblaptop\\frontend\\src\\pages\\admin\\ManageCategories.jsx',
    'c:\\weblaptop\\frontend\\src\\pages\\admin\\ManageOrders.jsx',
    'c:\\weblaptop\\frontend\\src\\pages\\admin\\ManagePosts.jsx',
    'c:\\weblaptop\\frontend\\src\\pages\\admin\\ManageProducts.jsx',
    'c:\\weblaptop\\frontend\\src\\pages\\admin\\ManageReviews.jsx',
    'c:\\weblaptop\\frontend\\src\\pages\\user\\MyOrders.jsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('ConfirmModal')) continue;

    // 1. Add import
    const lastImportIndex = content.lastIndexOf('import');
    const importEndIndex = content.indexOf('\n', lastImportIndex);
    
    // Check if it's admin or user to adjust path
    const importPath = file.includes('admin') ? '../../components/common/ConfirmModal' : '../../components/common/ConfirmModal';
    content = content.slice(0, importEndIndex) + `\nimport ConfirmModal from '${importPath}';` + content.slice(importEndIndex);

    // 2. Add confirmDialog state
    const matchComponentStart = content.match(/const [A-Za-z]+ = \(\) => {/);
    if (!matchComponentStart) {
        console.log('Could not find component start in', file);
        continue;
    }
    const componentStartIdx = matchComponentStart.index + matchComponentStart[0].length;
    content = content.slice(0, componentStartIdx) + `\n    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null, message: '', additionalData: null });\n` + content.slice(componentStartIdx);
    
    // Check if useState needs importing
    if (!content.includes('useState')) {
        content = `import { useState } from 'react';\n` + content;
    }

    // 3. Find handle functions with window.confirm
    const confirmRegex = /if \(!window\.confirm\(`([^`]+)`\)\) return;/g;
    
    // We'll replace the entire function where confirm is used with a two-step confirm
    content = content.replace(/const (handle[A-Za-z]+) = async \((.*?)\) => {([\s\S]*?)if \(!window\.confirm\(`([^`]+)`\)\) return;([\s\S]*?)(};|\n    };)/g, (match, funcName, args, beforeConfirm, message, afterConfirm, endFunc) => {
        // extract the actual action (e.g. productService.delete)
        
        let confirmFuncName = `confirm${funcName.replace('handle', '')}`;
        if (confirmFuncName === 'confirmAction') confirmFuncName = 'executeConfirmAction';

        return `const ${funcName} = (${args}) => {${beforeConfirm}setConfirmDialog({
            isOpen: true,
            id: ${args.split(',')[0].trim()}, // typically the first arg is ID
            additionalData: [${args}],
            message: \`${message}\`
        });
    };

    const ${confirmFuncName} = async () => {
        const [${args}] = confirmDialog.additionalData;${afterConfirm}${endFunc}`;
    });

    // 4. Inject <ConfirmModal> at the end of the JSX
    const returnRegex = /return \([\s\S]*?(\n    \);\n};\n\nexport default)/;
    content = content.replace(returnRegex, (match, suffix) => {
        // match everything before suffix
        const body = match.replace(suffix, '');
        // find last closing div wrapper
        const lastDivMatch = body.lastIndexOf('</div>');
        if (lastDivMatch === -1) return match; // fallback
        
        // Find the confirm function name
        const matchConfirmFunc = content.match(/const (confirm[A-Za-z]+|executeConfirmAction) = async/);
        const confirmFunc = matchConfirmFunc ? matchConfirmFunc[1] : '() => {}';

        const modalJSX = `
            <ConfirmModal
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={${confirmFunc}}
                message={confirmDialog.message}
            />\n        `;
        return body.slice(0, lastDivMatch) + modalJSX + '</div>' + suffix;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${path.basename(file)}`);
}
