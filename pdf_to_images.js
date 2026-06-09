const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\Satwik\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function convertPdfToImages(pdfPath, outputDir, prefix) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let executablePath = undefined;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js' });

  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

  const pageCount = await page.evaluate(async (base64Data) => {
    const pdfData = atob(base64Data);
    const uint8Array = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      uint8Array[i] = pdfData.charCodeAt(i);
    }

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    window._pdfDoc = pdf;
    return pdf.numPages;
  }, pdfBase64);

  console.log(`PDF ${path.basename(pdfPath)} has ${pageCount} pages. Rendering...`);

  for (let i = 1; i <= pageCount; i++) {
    const dimensions = await page.evaluate(async (pageNum) => {
      const page = await window._pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const width = Math.round(viewport.width);
      const height = Math.round(viewport.height);

      const canvas = document.createElement('canvas');
      canvas.id = `canvas-page-${pageNum}`;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      document.body.appendChild(canvas);

      const context = canvas.getContext('2d');
      try {
        await page.render({ canvasContext: context, viewport: viewport }).promise;
      } catch (err) {
        console.error('Rendering page warning: ', err.message);
      }

      return { width, height };
    }, i);

    await page.setViewport({ width: dimensions.width, height: dimensions.height });

    const canvasSelector = `#canvas-page-${i}`;
    const canvasElement = await page.$(canvasSelector);
    const imgPath = path.join(outputDir, `${prefix}_page_${i}.png`);
    await canvasElement.screenshot({ path: imgPath });

    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) el.remove();
    }, canvasSelector);

    console.log(`Saved page ${i} to ${imgPath}`);
  }

  await browser.close();
}

async function main() {
  const outputDir = 'd:\\n8n_pdf\\comparison_images';
  
  console.log('Rendering Economic Growth and Development.pdf...');
  await convertPdfToImages('d:\\n8n_pdf\\Economic Growth and Development.pdf', outputDir, 'gen');
  
  console.log('Copying images to artifact directory...');
  const artifactDir = 'C:\\Users\\Satwik\\.gemini\\antigravity\\brain\\7f8d6859-92f1-4324-94f8-e9f3508a3e97';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      fs.copyFileSync(path.join(outputDir, file), path.join(artifactDir, file));
    }
  }
  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
