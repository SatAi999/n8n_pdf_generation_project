const fs = require('fs');
const html = fs.readFileSync('d:/n8n_pdf/Anuj Jindal Task/Notes Economic Growth and Development 118b820004a246028d53c0d80e25b5f3.html', 'utf8');

// Find all <style> blocks
const styleBlocks = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
console.log('Number of <style> blocks in original HTML:', styleBlocks ? styleBlocks.length : 0);

if (styleBlocks) {
  styleBlocks.forEach((block, idx) => {
    console.log(`\nStyle block ${idx + 1} length:`, block.length);
    console.log(block.substring(0, 300) + '...');
  });
}

// Search for any callout-related CSS in the original HTML
const calloutCssIndex = html.indexOf('callout');
if (calloutCssIndex !== -1) {
  console.log('\nFound "callout" in original HTML at index:', calloutCssIndex);
  console.log(html.substring(calloutCssIndex - 100, calloutCssIndex + 500));
}
