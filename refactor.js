import fs from 'fs';
import path from 'path';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Button Styles (bg-green-600 or bg-blue-600 to btn-primary)
    // Matches patterns like `bg-green-600 hover:bg-green-700 text-white ...`
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(bg-(?:green|blue)-600[^"'\}`]*text-white[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/bg-(?:green|blue)-\d+\s*|hover:bg-(?:green|blue)-\d+\s*|text-white\s*|focus:\S+\s*|rounded-\w+\s*|py-[\d\.]+\s*|px-[\d\.]+\s*|border-transparent\s*|shadow-sm\s*|transition-colors\s*/g, '');
        return `className=${p1}${classes.trim()} btn-primary${p4}`;
    });

    // Secondary buttons (white bg with green border)
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(bg-white[^"'\}`]*border-(?:green|blue)-600[^"'\}`]*text-(?:green|blue)-600[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/bg-white\s*|border-(?:green|blue)-600\s*|text-(?:green|blue)-600\s*|hover:bg-(?:green|blue)-50\s*|rounded-\w+\s*|py-[\d\.]+\s*|px-[\d\.]+\s*/g, '');
        return `className=${p1}${classes.trim()} btn-secondary${p4}`;
    });

    // Destructive buttons (red)
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(text-red-600[^"'\}`]*hover:bg-red-50[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/text-red-600\s*|hover:bg-red-50\s*|px-[\d\.]+\s*|py-[\d\.]+\s*|rounded-\w+\s*/g, '');
        return `className=${p1}${classes.trim()} btn-destructive${p4}`;
    });

    // Cards (bg-white shadow border)
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(bg-white[^"'\}`]*rounded-\w+[^"'\}`]*shadow\S*[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/bg-white\s*|rounded-\w+\s*|shadow\S*\s*|border(-gray-\d+)?\s*/g, '');
        return `className=${p1}ledger-card ${classes.trim()}${p4}`;
    });
    
    // Form Inputs
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(border border-gray-300[^"'\}`]*focus:ring-green-500[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/border border-gray-300\s*|rounded-\w+\s*|focus:ring-green-500\s*|focus:border-green-500\s*|placeholder-gray-400\s*|text-gray-900\s*|sm:text-sm\s*|px-\d+\s*|py-\d+\s*|focus:outline-none\s*|appearance-none\s*/g, '');
        return `className=${p1}form-input px-3 py-2 w-full ${classes.trim()}${p4}`;
    });

    // Status Pills
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(bg-green-100 text-green-800[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/bg-green-100 text-green-800\s*|text-xs\s*|px-\d+\s*|py-\d+\s*|rounded\s*|font-medium\s*/g, '');
        return `className=${p1}status-pill status-pill-success ${classes.trim()}${p4}`;
    });

    // Text overrides for headers
    content = content.replace(/className=(["'\{`])([^"'\}`]*)(text-(?:2|3)xl font-(?:bold|extrabold)[^"'\}`]*)(["'\}])/g, (match, p1, p2, p3, p4) => {
        let classes = (p2 + p3).replace(/text-(?:2|3)xl\s*|font-(?:bold|extrabold)\s*|text-gray-900\s*/g, '');
        return `className=${p1}text-headline-lg ${classes.trim()}${p4}`;
    });

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

traverseDir('./src');
console.log('Refactoring complete.');
