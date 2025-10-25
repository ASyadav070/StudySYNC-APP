# Migration from pdf-parse to pdfjs-dist

## Issue
The `pdf-parse` library was corrupted and needed to be replaced.

## Solution
Migrated to `pdfjs-dist`, a more robust and actively maintained PDF parsing library from Mozilla.

## Changes Made

### 1. Package Dependencies (`server/package.json`)
- **Removed**: `pdf-parse@^1.1.1`
- **Added**: `pdfjs-dist@^4.7.76`

### 2. Import Statement (`server/routes/materials.js`)
**Before:**
```javascript
import pdfParse from 'pdf-parse';
```

**After:**
```javascript
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
```

### 3. PDF Parsing Implementation (`server/routes/materials.js`)

**Before:**
```javascript
if (fileExt === '.pdf') {
  const buffer = await fs.promises.readFile(filePath);
  const data = await pdfParse(buffer);
  rawText = data.text;
}
```

**After:**
```javascript
if (fileExt === '.pdf') {
  const dataBuffer = await fs.promises.readFile(filePath);
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(dataBuffer),
    useSystemFonts: true,
    standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/'
  });
  
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  
  // Extract text from all pages
  const textPromises = [];
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    textPromises.push(
      pdfDocument.getPage(pageNum).then(page => {
        return page.getTextContent().then(textContent => {
          return textContent.items.map(item => item.str).join(' ');
        });
      })
    );
  }
  
  const pageTexts = await Promise.all(textPromises);
  rawText = pageTexts.join('\n');
}
```

## Key Differences

### pdfjs-dist Advantages:
1. **Actively Maintained**: Official Mozilla project with regular updates
2. **More Robust**: Better handling of various PDF formats
3. **Page-by-Page Processing**: Allows for more control over text extraction
4. **Better Error Handling**: More detailed error messages
5. **Industry Standard**: Used in Firefox and many production applications

### Implementation Details:
- Uses `Uint8Array` for binary data handling
- Processes each page individually for better memory management
- Extracts text content from each page's text items
- Joins page texts with newlines to preserve document structure

## Testing
✅ Server starts successfully with new dependency
✅ No breaking changes to API interface
✅ Text extraction functionality maintained
✅ All existing endpoints continue to work

## Installation
To install the new dependency:
```bash
cd server
npm install pdfjs-dist
npx prisma generate
```

## Notes
- The text extraction process is now slightly more verbose but more reliable
- Memory usage may be more efficient with page-by-page processing
- Better support for complex PDF formats and encodings
