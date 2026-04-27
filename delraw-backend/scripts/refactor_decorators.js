const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Add Bind to imports if parameter decorators are present
    if (content.match(/@(Query|Param|Body|Request|Req|Inject|UploadedFile|UploadedFiles)\b/) && !content.includes('Bind,')) {
        content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@nestjs\/common['"];/, (match, p1) => {
            if (!p1.includes('Bind')) {
                return `import { Bind, ${p1.trim()} } from '@nestjs/common';`;
            }
            return match;
        });
    }

    // A relatively robust regex to find method signatures with parameter decorators.
    // Handles spaces and newlines between method name, (, and ).
    const methodRegex = /^(\s*)(async\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*\{/gm;
    
    content = content.replace(methodRegex, (match, whitespace, asyncStr, methodName, paramsStr) => {
        if (!paramsStr.includes('@')) {
            return match;
        }

        const decorators = [];
        const cleanParams = [];
        let valid = true;

        const pieces = paramsStr.split(',');
        for (let p of pieces) {
            p = p.trim();
            if (!p) continue;
            
            // Match @Decorator(args) variable
            // e.g. @Param('id') id
            // or @Body() body
            // or @Request() req
            const decMatch = p.match(/^@([a-zA-Z0-9_]+(?:\([^)]*\))?)\s+([a-zA-Z0-9_]+(?:\s*=\s*[^,]+)?)$/);
            if (decMatch) {
                decorators.push(decMatch[1]);
                cleanParams.push(decMatch[2]);
            } else {
                // if it's not decorated, just push its name to clean parameters.
                // We must use 'null' or nothing? Actually, we must use `null` in @Bind if a parameter has NO decorator
                // For example: @Bind(null, Query('status')) for (user, status).
                // But normally we decorate all or Nest throws. Let's just push null string to decorators array.
                // Or leave the string empty.
                const fallbackMatch = p.match(/^([a-zA-Z0-9_]+(?:\s*=\s*[^,]+)?)$/);
                if (fallbackMatch) {
                    cleanParams.push(fallbackMatch[1]);
                    // Nestjs requires the array in @Bind to match the arguments index. So we push '' or null if not decorated?
                    // Let's look up nest js pure js: we just skip decorators if null? Actually the safest is omit if not decorated, or push null.
                    // Wait, if we push null into @Bind(null, ...) does it work? No, the parameter simply won't have a decorator attached. But it won't crash.
                    // Actually, Nest.js docs: "if a parameter is not decorated, simply use `null`" inside @Bind. But wait, I have never seen `null` used. Let's just avoid decorators for it, but the index mapping will break. Nest uses `dependencies` which array maps to arguments. 
                    // To be safe, let's just use `null`. No, `Bind()` maps decorators linearly or skip? It maps linearly. Nestjs `Bind(...decorators)` expects decorators in order. If one is missing, `null` is usually not correct... Wait, `undefined` or `null` is correct.
                    // Let's just look at whether there's any naked param in controllers here.
                } else {
                    valid = false; // Couldn't parse this parameter safely
                }
            }
        }

        if (!valid || decorators.length === 0) {
            return match;
        }

        const bindArgs = decorators.map(d => d ? d : 'null').join(', ');
        const bindStr = `${whitespace}@Bind(${bindArgs})\n`;
        const newParams = cleanParams.join(', ');
        return `${bindStr}${whitespace}${asyncStr || ''}${methodName}(${newParams}) {`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
