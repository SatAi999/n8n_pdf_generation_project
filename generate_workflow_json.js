const fs = require('fs');
const path = require('path');

const jsCodeAssemble = `
const htmlItem = $input.first();

const headerItem = $('Fetch Header Logo').first();
const watermarkItem = $('Fetch Watermark Logo').first();

const headerBuffer = await this.helpers.getBinaryDataBuffer(0, 'data', headerItem);
const watermarkBuffer = await this.helpers.getBinaryDataBuffer(0, 'data', watermarkItem);
const htmlBuffer = await this.helpers.getBinaryDataBuffer(0, 'htmlFile', htmlItem);

const headerBase64 = 'data:image/png;base64,' + headerBuffer.toString('base64');
const watermarkBase64 = 'data:image/png;base64,' + watermarkBuffer.toString('base64');
const htmlString = htmlBuffer.toString('utf8');

return [{
  json: {
    html: htmlString,
    headerLogo: headerBase64,
    watermarkLogo: watermarkBase64
  }
}];
`.trim();

const jsCodeBuildHtml = `
const item = $input.first().json;
let htmlContent = item.html;
const watermarkLogoBase64 = item.watermarkLogo;
const headerLogoBase64 = item.headerLogo;

const customCSS = \`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap');
  
  html, body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    color: #2b2b2b;
    line-height: 1.35;
    background-color: #ffffff;
    padding: 0;
  }
  
  .page {
    width: 100% !important;
    height: 960px !important;
    page-break-after: always !important;
    break-after: page !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    position: relative !important;
  }
  
  .page-body {
    column-count: 2 !important;
    column-gap: 28px !important;
    height: 100% !important;
    column-fill: auto !important;
    box-sizing: border-box !important;
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
  
  .callout {
    border: 1.5px solid #2AB573 !important;
    background-color: rgba(42, 181, 115, 0.05) !important;
    border-radius: 6px !important;
    padding: 10px 12px !important;
    margin: 12px 0 !important;
    display: block !important;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  .callout-header {
    color: #2AB573 !important;
    display: block !important;
    font-size: 8.5px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
    font-family: 'Montserrat', sans-serif !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }
  
  .callout-title {
    color: #111111 !important;
    display: block !important;
    font-size: 8.5px !important;
    font-weight: 700 !important;
    margin-bottom: 5px !important;
    font-family: 'Montserrat', sans-serif !important;
  }
  
  .callout-content {
    font-size: 7.5px !important;
    color: #2b2b2b !important;
  }
  
  .callout-content li {
    font-size: 7.5px !important;
    margin-bottom: 2px !important;
    color: #2b2b2b !important;
  }
  
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
    display: inline-block !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  figure.image img.img-growth, img.img-growth {
    width: 140px !important;
  }
  figure.image img.img-oecd, img.img-oecd {
    width: 130px !important;
  }
  figure.image img.img-happiness, img.img-happiness {
    width: 140px !important;
  }
  figure.image img.img-composite, img.img-composite {
    width: 110px !important;
  }
  
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
    color: #111111;
    font-weight: 700;
  }
  
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
    background-image: url('\${watermarkLogoBase64}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
\`;

htmlContent = htmlContent.replace(/<style>[^]*?<\\/style>/, '<style>' + customCSS + '</style>');
const watermarkDiv = '<div class="watermark"></div>';
htmlContent = htmlContent.replace(/<body[^>]*>/, (match) => match + watermarkDiv);

return [{
  json: {
    htmlContent: htmlContent
  }
}];
`.trim();

const workflow = {
  "name": "Visual Brand Processing & PDF Generation Workflow",
  "nodes": [
    {
      "parameters": {},
      "id": "manual-trigger-visual",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [100, 240]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "headerLogoUrl",
              "value": "https://anujjindal.in/wp-content/uploads/2022/05/LOGO-FULL-01.png"
            },
            {
              "name": "watermarkLogoUrl",
              "value": "https://anujjindal.in/wp-content/uploads/2023/02/LOGO-CROP.png"
            },
            {
              "name": "htmlPath",
              "value": "D:/n8n_pdf/Anuj Jindal Task/Notes Economic Growth and Development 118b820004a246028d53c0d80e25b5f3.html"
            }
          ]
        },
        "options": {}
      },
      "id": "set-brand-config",
      "name": "Set Brand Configuration",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [260, 240]
    },
    {
      "parameters": {
        "url": "={{ $json.headerLogoUrl }}",
        "responseData": "file",
        "responseBinaryPropertyName": "headerLogo",
        "options": {}
      },
      "id": "fetch-header-logo",
      "name": "Fetch Header Logo",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [480, 140]
    },
    {
      "parameters": {
        "url": "={{ $json.watermarkLogoUrl }}",
        "responseData": "file",
        "responseBinaryPropertyName": "watermarkLogo",
        "options": {}
      },
      "id": "fetch-watermark-logo",
      "name": "Fetch Watermark Logo",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [480, 340]
    },
    {
      "parameters": {
        "mode": "combine",
        "combinationMode": "mergeByPosition",
        "options": {}
      },
      "id": "merge-logo-encodes",
      "name": "Merge Logo Encodes",
      "type": "n8n-nodes-base.merge",
      "typeVersion": 2,
      "position": [700, 240]
    },
    {
      "parameters": {
        "filePath": "={{ $('Set Brand Configuration').item.json.htmlPath }}",
        "dataPropertyName": "htmlFile"
      },
      "id": "load-raw-html-content",
      "name": "Load Raw HTML Content1",
      "type": "n8n-nodes-base.readBinaryFile",
      "typeVersion": 1,
      "position": [860, 240]
    },
    {
      "parameters": {
        "jsCode": jsCodeAssemble
      },
      "id": "assemble-final-data",
      "name": "Assemble Final Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1020, 240]
    },
    {
      "parameters": {
        "jsCode": jsCodeBuildHtml
      },
      "id": "build-branded-html",
      "name": "Build Branded HTML1",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1180, 240]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/render-pdf",
        "sendBody": true,
        "contentType": "raw",
        "rawContentType": "text/html",
        "body": "={{ $json.htmlContent }}",
        "options": {
          "response": {
            "response": {
              "responseFormat": "file",
              "outputPropertyName": "data"
            }
          }
        }
      },
      "id": "http-convert-html-to-pdf",
      "name": "Convert HTML to PDF1",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [1340, 240]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $binary.data.mimeType }}",
              "value2": "application/pdf"
            }
          ]
        }
      },
      "id": "validate-pdf-response-visual",
      "name": "Validate PDF Response",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1500, 240]
    },
    {
      "parameters": {
        "fileName": "D:/n8n_pdf/Economic Growth and Development.pdf",
        "binaryPropertyName": "data"
      },
      "id": "write-pdf-file-visual",
      "name": "Save PDF to Disk",
      "type": "n8n-nodes-base.writeBinaryFile",
      "typeVersion": 1,
      "position": [1680, 140]
    },
    {
      "parameters": {},
      "id": "success-summary-visual",
      "name": "Success Summary",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [1860, 140]
    },
    {
      "parameters": {},
      "id": "error-handler-visual",
      "name": "Error Handler",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [1680, 340]
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Set Brand Configuration",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Brand Configuration": {
      "main": [
        [
          {
            "node": "Fetch Header Logo",
            "type": "main",
            "index": 0
          },
          {
            "node": "Fetch Watermark Logo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Header Logo": {
      "main": [
        [
          {
            "node": "Merge Logo Encodes",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Watermark Logo": {
      "main": [
        [
          {
            "node": "Merge Logo Encodes",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Merge Logo Encodes": {
      "main": [
        [
          {
            "node": "Load Raw HTML Content1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Load Raw HTML Content1": {
      "main": [
        [
          {
            "node": "Assemble Final Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Assemble Final Data": {
      "main": [
        [
          {
            "node": "Build Branded HTML1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Build Branded HTML1": {
      "main": [
        [
          {
            "node": "Convert HTML to PDF1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Convert HTML to PDF1": {
      "main": [
        [
          {
            "node": "Validate PDF Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Validate PDF Response": {
      "main": [
        [
          {
            "node": "Save PDF to Disk",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error Handler",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Save PDF to Disk": {
      "main": [
        [
          {
            "node": "Success Summary",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {},
  "staticData": null,
  "meta": {
    "templateId": ""
  },
  "pinData": {}
};

fs.writeFileSync(
  path.join(__dirname, 'brand_processing_workflow.json'),
  JSON.stringify(workflow, null, 2),
  'utf8'
);
console.log('Successfully generated brand_processing_workflow.json');
