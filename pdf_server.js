const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const PORT = 3000;

// Helper to locate Chrome on Windows
function getChromiumPath() {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\Satwik\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Server logic
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/render-pdf') {
    console.log('[pdf-server] Received PDF generation request...');
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        let htmlContent = '';

        // Check content-type header for multipart/form-data
        const contentTypeHeader = req.headers['content-type'] || '';
        if (contentTypeHeader.includes('multipart/form-data')) {
          console.log('[pdf-server] Parsing multipart/form-data body...');
          const match = contentTypeHeader.match(/boundary=(.+)$/i);
          if (match && match[1]) {
            const boundary = match[1].trim();
            const parts = body.split('--' + boundary);
            for (const part of parts) {
              if (part.includes('name="htmlFile"') || part.includes('name="htmlData"') || part.includes('filename=')) {
                const headerEndIndex = part.indexOf('\r\n\r\n');
                if (headerEndIndex !== -1) {
                  htmlContent = part.substring(headerEndIndex + 4);
                  // Clean up trailing dashes/newlines from part formatting
                  if (htmlContent.endsWith('\r\n')) {
                    htmlContent = htmlContent.substring(0, htmlContent.length - 2);
                  }
                  if (htmlContent.endsWith('--\r\n')) {
                    htmlContent = htmlContent.substring(0, htmlContent.length - 4);
                  } else if (htmlContent.endsWith('--')) {
                    htmlContent = htmlContent.substring(0, htmlContent.length - 2);
                  }
                  break;
                }
              }
            }
          }
        }

        // If not multipart or failed to extract, fallback to JSON or raw
        if (!htmlContent) {
          if (body.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(body);
              htmlContent = parsed.html || parsed.htmlContent || body;
            } catch (e) {
              htmlContent = body;
            }
          } else {
            htmlContent = body;
          }
        }

        const chromiumPath = getChromiumPath();
        if (!chromiumPath) {
          throw new Error('Chromium executable not found on host system.');
        }

        console.log('[pdf-server] Launching headless browser...');
        const browser = await puppeteer.launch({
          headless: true,
          executablePath: chromiumPath,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({
          width: 714,
          height: 960,
          deviceScaleFactor: 1
        });

        // Write the HTML to the local styled_document.html first so the browser can resolve relative image paths
        const styledDocPath = path.join(__dirname, 'Anuj Jindal Task', 'styled_document.html');
        fs.writeFileSync(styledDocPath, htmlContent, 'utf8');

        console.log('[pdf-server] Loading HTML in page...');
        await page.goto(`file:///${styledDocPath.replace(/\\/g, '/')}`, {
          waitUntil: 'networkidle0'
        });

        console.log('[pdf-server] Running dynamic layout engine...');
        await page.evaluate(() => {
          const pageBody = document.querySelector('.page-body');
          if (!pageBody) return;
          
          // Unwrap display:contents
          const wrappers = Array.from(pageBody.querySelectorAll('div[style*="display:contents"]'));
          wrappers.forEach(wrapper => {
            const parent = wrapper.parentNode;
            while (wrapper.firstChild) {
              parent.insertBefore(wrapper.firstChild, wrapper);
            }
            parent.removeChild(wrapper);
          });

          // Restructure callouts
          const callouts = Array.from(document.querySelectorAll('.callout'));
          callouts.forEach(callout => {
            const iconSpan = callout.querySelector('.icon');
            if (iconSpan) iconSpan.remove();
            
            const strong = callout.querySelector('strong');
            let titleText = '';
            if (strong) {
              titleText = strong.textContent.trim();
              strong.remove();
            }
            
            const header = document.createElement('div');
            header.className = 'callout-header';
            header.innerHTML = '🚀 Knowledge Nuggets';
            
            let titleEl = null;
            if (titleText) {
              titleEl = document.createElement('div');
              titleEl.className = 'callout-title';
              titleEl.textContent = titleText;
            }
            
            const innerDiv = callout.querySelector('div');
            if (innerDiv) {
              innerDiv.className = 'callout-content';
              if (titleEl) {
                innerDiv.insertBefore(titleEl, innerDiv.firstChild);
              }
              innerDiv.insertBefore(header, innerDiv.firstChild);
            } else {
              if (titleEl) {
                callout.insertBefore(titleEl, callout.firstChild);
              }
              callout.insertBefore(header, callout.firstChild);
            }
          });

          // Run pagination
          const elements = Array.from(pageBody.children);
          const body = document.body;
          body.innerHTML = '';
          
          const watermark = document.createElement('div');
          watermark.className = 'watermark';
          body.appendChild(watermark);
          
          let currentPage = null;
          let currentPageBody = null;
          
          function createPage() {
            currentPage = document.createElement('div');
            currentPage.className = 'page';
            currentPageBody = document.createElement('div');
            currentPageBody.className = 'page-body';
            currentPage.appendChild(currentPageBody);
            body.appendChild(currentPage);
          }
          
          createPage();
          
          function checkOverflow() {
            const parentRect = currentPageBody.getBoundingClientRect();
            const children = Array.from(currentPageBody.children);
            if (children.length === 0) return false;
            
            for (const child of children) {
              const rect = child.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              if (rect.right > parentRect.left + parentRect.width + 5) return true;
              if (rect.bottom > parentRect.bottom + 5) return true;
            }
            return false;
          }
          
          for (let idx = 0; idx < elements.length; idx++) {
            const el = elements[idx];
            if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT' || el.classList.contains('watermark')) {
              body.appendChild(el);
              continue;
            }
            
            if (el.tagName === 'UL' || el.tagName === 'OL') {
              currentPageBody.appendChild(el);
              if (checkOverflow()) {
                currentPageBody.removeChild(el);
                const listForCurrentPage = el.cloneNode(false);
                currentPageBody.appendChild(listForCurrentPage);
                
                const items = Array.from(el.children);
                let splitIndex = -1;
                for (let i = 0; i < items.length; i++) {
                  listForCurrentPage.appendChild(items[i]);
                  if (checkOverflow()) {
                    listForCurrentPage.removeChild(items[i]);
                    splitIndex = i;
                    break;
                  }
                }
                
                if (splitIndex !== -1) {
                  createPage();
                  const listForNextPage = el.cloneNode(false);
                  for (let i = splitIndex; i < items.length; i++) {
                    listForNextPage.appendChild(items[i]);
                  }
                  elements.splice(idx + 1, 0, listForNextPage);
                }
              }
            } else {
              currentPageBody.appendChild(el);
              if (checkOverflow()) {
                if (currentPageBody.children.length > 1) {
                  currentPageBody.removeChild(el);
                  const lastChild = currentPageBody.lastElementChild;
                  const isHeading = lastChild && ['H1', 'H2', 'H3', 'H4'].includes(lastChild.tagName);
                  
                  if (isHeading && currentPageBody.children.length > 1) {
                    currentPageBody.removeChild(lastChild);
                    createPage();
                    currentPageBody.appendChild(lastChild);
                    currentPageBody.appendChild(el);
                  } else {
                    createPage();
                    currentPageBody.appendChild(el);
                  }
                }
              }
            }
          }
        });

        // Extract header and watermark logos for header template
        // Note: The logo base64 URLs are extracted from the document watermark styling or passed directly
        const watermarkUrl = await page.evaluate(() => {
          const watermarkEl = document.querySelector('.watermark');
          if (!watermarkEl) return '';
          const style = window.getComputedStyle(watermarkEl);
          const bg = style.backgroundImage;
          const match = bg.match(/url\("?(.+?)"?\)/);
          return match ? match[1] : '';
        });

        // Find header logo by searching for img src in header element or style (fallback to typical header logo base64 if needed)
        // Since we assemble it dynamically in n8n, we will pull it from the HTML itself or from a standard variable
        const headerLogoBase64 = await page.evaluate(() => {
          // Look for any logo element or check global window configuration
          const img = document.querySelector('img[src^="data:image"]');
          return img ? img.src : 'https://anujjindal.in/wp-content/uploads/2022/05/LOGO-FULL-01.png';
        });

        const headerTemplate = `
          <div style="font-family: 'Montserrat', 'Inter', sans-serif; font-size: 7.5px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #1B71AC; padding-bottom: 4px; padding-left: 40px; padding-right: 40px; box-sizing: border-box; -webkit-print-color-adjust: exact;">
            <img src="${headerLogoBase64}" style="height: 16px; object-fit: contain;" />
            <span style="color: #1B71AC; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Economic and Social Issues | Economic Growth and Development | 23 March 2026</span>
          </div>
        `;

        const footerTemplate = `
          <div style="font-family: 'Montserrat', 'Inter', sans-serif; font-size: 7.5px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 0.75px solid #e2e8f0; padding-top: 4px; padding-left: 40px; padding-right: 40px; box-sizing: border-box; -webkit-print-color-adjust: exact;">
            <span style="color: #64748b; font-weight: 500;">+91 9999466225</span>
            <span style="color: #64748b; font-weight: 600;">www.anujjindal.in</span>
            <div style="background-color: #2AB573; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 8px;">
              <span class="pageNumber"></span>
            </div>
          </div>
        `;

        console.log('[pdf-server] Compiling PDF...');
        const pdfBuffer = await page.pdf({
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
        console.log('[pdf-server] PDF compiled successfully! Returning binary...');

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename="Economic Growth and Development.pdf"'
        });
        res.end(pdfBuffer);

      } catch (err) {
        console.error('[pdf-server] Rendering failed:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`PDF compilation failed: ${err.message}`);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`[pdf-server] PDF Rendering Service running at http://localhost:${PORT}`);
});
