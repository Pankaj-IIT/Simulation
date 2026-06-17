# Build & Protect

Extract inline JavaScript from HTML files, obfuscate them, and update HTML references automatically.

## Prerequisites

- Node.js installed
- npm installed

## Usage

```bash
node build-protect.cjs
```

This will:
1. Extract all inline `<script>` blocks from HTML files
2. Obfuscate them with javascript-obfuscator (control flow flattening, dead code injection, string array encoding)
3. Place obfuscated files in `js/obfuscated/` with proper subdirectories
4. Update all HTML files to reference the obfuscated JS files

## Configuration

Edit `build-protect.cjs` to change obfuscation settings. Available options include:
- `controlFlowFlattening` - Makes code harder to follow
- `deadCodeInjection` - Injects fake code
- `stringArrayEncoding` - Encodes strings
- `debugProtection` - Prevents debugger access
- `disableConsoleOutput` - Disables console.log

## Notes

- `js/extracted/` and `js/obfuscated/` are gitignored
- Run this script after editing any HTML files with inline scripts
- The `node_modules/` directory is gitignored
