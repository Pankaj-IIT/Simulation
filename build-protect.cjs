const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname);
const HTML_FILES = [];
const JS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'js', 'extracted');
const OBFUSCATED_DIR = path.join(PROJECT_ROOT, 'js', 'obfuscated');

// Collect all HTML files recursively
function collectHTMLFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === 'js') continue;
            collectHTMLFiles(fullPath);
        } else if (entry.name.endsWith('.html')) {
            HTML_FILES.push(fullPath);
        }
    }
}

// Extract inline scripts from HTML
function extractInlineScripts(html, filePath) {
    const results = [];
    const relativePath = path.relative(PROJECT_ROOT, path.dirname(filePath));
    const baseName = path.basename(filePath, '.html');

    // Match <script>...</script> blocks (no src attribute)
    const scriptRegex = /<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIndex = 0;

    while ((match = scriptRegex.exec(html)) !== null) {
        const code = match[1].trim();
        if (!code) continue;
        // Skip Google Analytics gtag scripts
        if (code.includes('dataLayer') && code.includes('gtag')) continue;

        const scriptName = `${baseName}-inline${scriptIndex > 0 ? scriptIndex : ''}.js`;
        const scriptPath = path.join(JS_OUTPUT_DIR, relativePath, scriptName);
        const dir = path.dirname(scriptPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(scriptPath, code, 'utf8');

        // Create relative path from HTML file to JS file
        const relPath = path.relative(path.dirname(filePath), scriptPath).replace(/\\/g, '/');

        results.push({
            match: match[0],
            replacement: `<script src="${relPath}"></script>`,
            jsPath: scriptPath,
            jsRelativePath: relPath
        });

        scriptIndex++;
    }

    return results;
}

// Process all HTML files
function processHTMLFiles() {
    console.log('Creating output directories...');
    if (!fs.existsSync(JS_OUTPUT_DIR)) {
        fs.mkdirSync(JS_OUTPUT_DIR, { recursive: true });
    }
    if (!fs.existsSync(OBFUSCATED_DIR)) {
        fs.mkdirSync(OBFUSCATED_DIR, { recursive: true });
    }

    console.log(`Found ${HTML_FILES.length} HTML files to process.\n`);

    const allScripts = [];

    for (const htmlFile of HTML_FILES) {
        const html = fs.readFileSync(htmlFile, 'utf8');
        const scripts = extractInlineScripts(html, htmlFile);

        if (scripts.length > 0) {
            console.log(`Processing: ${path.relative(PROJECT_ROOT, htmlFile)}`);
            console.log(`  Found ${scripts.length} inline script(s)`);

            let updatedHTML = html;
            for (const script of scripts) {
                updatedHTML = updatedHTML.replace(script.match, script.replacement);
            }

            fs.writeFileSync(htmlFile, updatedHTML, 'utf8');
            allScripts.push(...scripts);
        }
    }

    console.log(`\nExtracted ${allScripts.length} script(s) to ${path.relative(PROJECT_ROOT, JS_OUTPUT_DIR)}\n`);
    return allScripts;
}

// Obfuscate all extracted JS files
function obfuscateScripts(scripts) {
    const jsFiles = scripts.map(s => s.jsPath);

    if (jsFiles.length === 0) {
        console.log('No scripts to obfuscate.');
        return;
    }

    console.log('Installing javascript-obfuscator...');
    try {
        execSync('npm install javascript-obfuscator --save-dev', {
            cwd: PROJECT_ROOT,
            stdio: 'inherit'
        });
    } catch (e) {
        console.log('npm install failed, checking if already installed...');
    }

    console.log('Obfuscating scripts...\n');

    const obfuscator = require('javascript-obfuscator');

    const config = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 0,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        renameGlobals: false,
        splitStrings: true,
        splitStringsChunkLength: 5
    };

    for (const jsFile of jsFiles) {
        try {
            const source = fs.readFileSync(jsFile, 'utf8');
            const result = obfuscator.obfuscate(source, config);

            const relDir = path.relative(JS_OUTPUT_DIR, path.dirname(jsFile));
            const obfuscatedDir = relDir ? path.join(OBFUSCATED_DIR, relDir) : OBFUSCATED_DIR;
            if (!fs.existsSync(obfuscatedDir)) fs.mkdirSync(obfuscatedDir, { recursive: true });
            const fileName = path.basename(jsFile);
            const obfuscatedPath = path.join(obfuscatedDir, fileName);
            fs.writeFileSync(obfuscatedPath, result.getObfuscatedCode(), 'utf8');

            console.log(`  Obfuscated: ${path.relative(PROJECT_ROOT, jsFile)} -> ${path.relative(PROJECT_ROOT, obfuscatedPath)}`);
        } catch (e) {
            console.error(`  Error obfuscating ${jsFile}:`, e.message);
        }
    }

    console.log('\nObfuscation complete!');
}

// Update HTML files to use obfuscated scripts
function updateHTMLReferences(scripts) {
    console.log('\nUpdating HTML files to use obfuscated scripts...\n');

    for (const htmlFile of HTML_FILES) {
        const html = fs.readFileSync(htmlFile, 'utf8');
        let updated = html;
        let changed = false;

        for (const script of scripts) {
            // Find the extracted JS path in this HTML file
            const extractedRelPath = script.jsRelativePath;
            const obfuscatedPath = extractedRelPath
                .replace(/extracted(\/|$)/g, 'obfuscated$1')
                .replace(/extracted\//g, 'obfuscated/');

            if (html.includes(extractedRelPath)) {
                updated = updated.replace(
                    new RegExp(extractedRelPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    obfuscatedPath
                );
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(htmlFile, updated, 'utf8');
            console.log(`  Updated: ${path.relative(PROJECT_ROOT, htmlFile)}`);
        }
    }

    console.log('\nAll HTML files updated!');
}

// Main execution
try {
    collectHTMLFiles(PROJECT_ROOT);
    const scripts = processHTMLFiles();
    obfuscateScripts(scripts);
    updateHTMLReferences(scripts);
    console.log('\n✅ Build complete! Your JS code is now extracted, obfuscated, and referenced in HTML files.');
} catch (e) {
    console.error('Build failed:', e.message);
    process.exit(1);
}
