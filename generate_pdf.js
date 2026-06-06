const fs = require('fs');
const path = require('path');
const https = require('https');
const puppeteer = require('puppeteer-core');

// Configurations
const INPUT_HTML = path.join(__dirname, 'Anuj Jindal Task', 'Notes Economic Growth and Development 118b820004a246028d53c0d80e25b5f3.html');
const OUTPUT_HTML = path.join(__dirname, 'Anuj Jindal Task', 'styled_document.html');
const OUTPUT_PDF = path.join(__dirname, 'Economic Growth and Development.pdf');

const HEADER_LOGO_URL = 'https://anujjindal.in/wp-content/uploads/2022/05/LOGO-FULL-01.png';
const WATERMARK_LOGO_URL = 'https://anujjindal.in/wp-content/uploads/2023/02/LOGO-CROP.png';

const LOCAL_HEADER_LOGO = path.join(__dirname, 'Anuj Jindal Task', 'header_logo.png');
const LOCAL_WATERMARK_LOGO = path.join(__dirname, 'Anuj Jindal Task', 'watermark_logo.png');

// Helper to fetch an image as base64
function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const mimeType = res.headers['content-type'] || 'image/png';
        const base64 = buffer.toString('base64');
        resolve(`data:${mimeType};base64,${base64}`);
      });
    }).on('error', (err) => reject(err));
  });
}

// Download image if not exists, and get Base64
async function getLocalOrRemoteBase64(localPath, remoteUrl) {
  if (fs.existsSync(localPath)) {
    const buffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).substring(1);
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }
  
  console.log(`Downloading ${remoteUrl}...`);
  try {
    const base64 = await getBase64Image(remoteUrl);
    const base64Data = base64.split(';base64,').pop();
    fs.writeFileSync(localPath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved logo to local path: ${localPath}`);
    return base64;
  } catch (err) {
    console.error(`Error downloading ${remoteUrl}:`, err.message);
    throw err;
  }
}

async function main() {
  try {
    console.log("Starting PDF generation pipeline...");
    
    // 1. Get Base64 Logos
    const headerLogoBase64 = await getLocalOrRemoteBase64(LOCAL_HEADER_LOGO, HEADER_LOGO_URL);
    const watermarkLogoBase64 = await getLocalOrRemoteBase64(LOCAL_WATERMARK_LOGO, WATERMARK_LOGO_URL);
    
    // 2. Read the raw HTML
    let htmlContent = fs.readFileSync(INPUT_HTML, 'utf8');
    
    // 3. Define the Custom CSS
    const customCSS = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap');
      
      html, body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        color: #333333;
        line-height: 1.35;
        background-color: #ffffff;
        padding: 0;
      }
      
      .page {
        padding: 0px;
        max-width: 100% !important;
        margin: 0 auto !important;
      }
      
      .page-body {
        margin-top: 0px;
        column-count: 2;
        column-gap: 28px;
        column-fill: auto;
      }
      
      .page-title-banner {
        background-color: #2AB573;
        color: #ffffff;
        padding: 8px 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 12px;
        border-radius: 4px;
        column-span: all;
        -webkit-column-span: all;
      }
      
      .index-box {
        background-color: rgba(42, 181, 115, 0.03);
        border: 1px solid rgba(42, 181, 115, 0.15);
        border-radius: 6px;
        padding: 10px 14px;
        margin-bottom: 18px;
        column-span: all;
        -webkit-column-span: all;
        box-sizing: border-box;
        break-before: page;
        -webkit-column-break-before: always;
        page-break-before: always;
      }
      
      .index-title {
        font-family: 'Montserrat', sans-serif;
        font-size: 9px;
        font-weight: 700;
        color: #2AB573;
        text-transform: uppercase;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }
      
      .index-list {
        column-count: 2;
        column-gap: 24px;
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      
      .index-item {
        font-size: 7.5px;
        line-height: 1.35;
        margin-bottom: 3px;
        color: #333333;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
      }
      
      .index-link {
        text-decoration: none;
        color: inherit;
        font-weight: 500;
      }
      
      .index-link:hover {
        color: #1B71AC;
      }
      
      .index-item-sub {
        padding-left: 10px;
        color: #555555;
      }
      
      h1, h2, h3 {
        font-family: 'Montserrat', sans-serif;
        color: #1B71AC;
        font-weight: 700;
        margin-top: 15px;
        margin-bottom: 8px;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
        page-break-after: avoid;
        break-after: avoid;
      }
      
      h1 {
        font-size: 12px;
        text-transform: uppercase;
      }
      
      h2 {
        font-size: 11px;
      }
      
      h3 {
        font-size: 9.5px;
        margin-top: 10px;
        margin-bottom: 6px;
      }
      
      p, li {
        font-size: 8.5px;
        color: #333333;
        margin-top: 0;
        margin-bottom: 5px;
      }
      
      .bulleted-list, .numbered-list {
        padding-left: 14px;
        margin-top: 3px;
        margin-bottom: 6px;
      }
      
      li {
        margin-bottom: 3px;
      }
      
      li ul {
        list-style-type: circle !important;
        padding-left: 10px;
      }
      
      /* Callouts (Knowledge Nuggets) */
      .callout {
        border: 1.5px solid #2AB573 !important;
        background-color: rgba(42, 181, 115, 0.05) !important;
        border-radius: 6px !important;
        padding: 8px 10px !important;
        margin: 10px 0 !important;
        display: flex !important;
        align-items: flex-start !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .callout .icon {
        margin-right: 8px !important;
        font-size: 13px !important;
        display: inline-block !important;
        margin-top: 1px !important;
      }
      
      .callout div {
        font-size: 7.5px !important;
        color: #333333 !important;
      }
      
      .callout div strong {
        color: #2AB573 !important;
        display: block;
        font-size: 8.5px;
        margin-bottom: 3px;
        font-family: 'Montserrat', sans-serif;
      }
      
      /* Tables */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 12px 0 !important;
        font-size: 7.5px !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      th {
        background-color: #1B71AC !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        text-align: left !important;
        padding: 5px 6px !important;
        border: 1px solid #1B71AC !important;
        font-family: 'Montserrat', sans-serif;
      }
      
      td {
        padding: 5px 6px !important;
        border: 1px solid #e0e0e0 !important;
      }
      
      tr:nth-child(even) {
        background-color: #f7fafc !important;
      }
      
      /* Images */
      figure.image {
        margin: 10px 0 !important;
        text-align: center !important;
        break-inside: avoid !important;
        -webkit-column-break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      figure.image img, img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        object-fit: contain !important;
        border-radius: 4px !important;
        border: 1px solid #e0e0e0 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
      }
      
      /* Highlights */
      mark.highlight-orange_background {
        background-color: rgba(27, 113, 172, 0.08) !important;
        color: #1B71AC !important;
        font-weight: 600;
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      mark.highlight-red {
        color: #eb5757 !important;
        background-color: rgba(235, 87, 87, 0.06) !important;
        font-weight: 600;
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      mark.highlight-blue {
        color: #1B71AC !important;
        background: none !important;
        font-weight: 700;
      }
      
      mark.highlight-teal {
        color: #2AB573 !important;
        background: none !important;
        font-weight: 700;
      }
      
      strong {
        color: #222222;
        font-weight: 700;
      }
      
      /* Watermark styling */
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 550px;
        height: 550px;
        opacity: 0.15;
        z-index: -1000;
        pointer-events: none;
        background-image: url('${watermarkLogoBase64}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
    `;
    
    // Replace style block
    htmlContent = htmlContent.replace(/<style>[\s\S]*?<\/style>/, `<style>${customCSS}</style>`);
    
    // Inject watermark div immediately after <body> tag
    const watermarkDiv = `<div class="watermark"></div>`;
    htmlContent = htmlContent.replace(/<body[^>]*>/, (match) => `${match}\n${watermarkDiv}`);
    
    // Make sure callout boxes have "Knowledge Nuggets" text properly structured
    // In our HTML: <div style="width:100%"><strong>List of Important...</strong></div>
    // Let's replace emoji 📌 with 🚀 and bold prefix if needed, or style it as is.
    // The requirement says: Knowledge Nuggets box has green border, light green background, rocket icon.
    // Let's replace pushpin 📌 with rocket 🚀 inside callouts
    htmlContent = htmlContent.replaceAll('📌', '🚀');
    
    // Write styled HTML out
    fs.writeFileSync(OUTPUT_HTML, htmlContent, 'utf8');
    console.log(`Saved styled HTML to: ${OUTPUT_HTML}`);
    
    // 4. Launch Puppeteer to render PDF
    console.log("Launching Puppeteer...");
    
    // Find local chrome or edge
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\Satwik\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    let executablePath = undefined;
    for (const p of chromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        console.log(`Found system browser for PDF rendering: ${p}`);
        break;
      }
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Load local HTML
    console.log("Loading HTML in page...");
    await page.goto(`file:///${OUTPUT_HTML.replace(/\\/g, '/')}`, {
      waitUntil: 'networkidle0'
    });
    
    console.log("Restructuring DOM...");
    await page.evaluate(() => {
      const pageBody = document.querySelector('.page-body');
      if (!pageBody) return;
      
      // Unwrap all display:contents wrapper divs to make DOM flat
      const wrappers = Array.from(pageBody.querySelectorAll('div[style*="display:contents"]'));
      wrappers.forEach(wrapper => {
        const parent = wrapper.parentNode;
        while (wrapper.firstChild) {
          parent.insertBefore(wrapper.firstChild, wrapper);
        }
        parent.removeChild(wrapper);
      });
    });

    // Save restructured HTML back to disk for debugging/verifying
    const restructuredHtml = await page.content();
    fs.writeFileSync(OUTPUT_HTML, restructuredHtml, 'utf8');
    
    // Header template with base64 logo
    const headerTemplate = `
      <div style="font-family: 'Montserrat', 'Inter', sans-serif; font-size: 7.5px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #1B71AC; padding-bottom: 4px; padding-left: 40px; padding-right: 40px; box-sizing: border-box; -webkit-print-color-adjust: exact;">
        <img src="${headerLogoBase64}" style="height: 16px; object-fit: contain;" />
        <span style="color: #1B71AC; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Economic and Social Issues | Economic Growth and Development | 23 March 2026</span>
      </div>
    `;
    
    // Footer template
    const footerTemplate = `
      <div style="font-family: 'Montserrat', 'Inter', sans-serif; font-size: 7.5px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 0.75px solid #e2e8f0; padding-top: 4px; padding-left: 40px; padding-right: 40px; box-sizing: border-box; -webkit-print-color-adjust: exact;">
        <span style="color: #64748b; font-weight: 500;">+91 9999466225</span>
        <span style="color: #64748b; font-weight: 600;">www.anujjindal.in</span>
        <div style="background-color: #2AB573; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 8px;">
          <span class="pageNumber"></span>
        </div>
      </div>
    `;
    
    console.log("Generating PDF file...");
    await page.pdf({
      path: OUTPUT_PDF,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      margin: {
        top: '65px',
        bottom: '65px',
        left: '40px',
        right: '40px'
      }
    });
    
    await browser.close();
    console.log(`SUCCESS! Beautiful PDF generated at: ${OUTPUT_PDF}`);

    // Print generated page count
    const pdfBuffer = fs.readFileSync(OUTPUT_PDF);
    const pdfText = pdfBuffer.toString('binary');
    const matches = pdfText.match(/\/Type\s*\/Page\b/g);
    const pageCount = matches ? matches.length : 0;
    console.log(`Generated PDF Page Count: ${pageCount}`);
    
  } catch (err) {
    console.error("Pipeline failed:", err);
    process.exit(1);
  }
}

main();
