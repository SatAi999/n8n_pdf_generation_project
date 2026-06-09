# Automated PDF Publishing Pipeline using n8n, Node.js and Puppeteer

## Executive Summary

This project implements a fully automated document publishing pipeline designed to transform raw HTML exports into professionally formatted, publication-ready PDF documents. The solution was developed to automate the generation of premium educational study material while ensuring strict adherence to organizational branding, typography standards, print formatting rules, and document structure guidelines.

The workflow is orchestrated using n8n and integrates custom Node.js processing with Puppeteer-based PDF rendering. The system automatically fetches document content, restructures and optimizes the HTML layout, applies custom print styles, injects branding assets, generates running headers and footers, inserts page numbers and watermarks, and finally compiles the content into a high-quality A4 PDF suitable for distribution, printing, or archival purposes.

The primary objective of this project is to eliminate manual document formatting while maintaining publication-grade visual quality and consistency across all generated study materials.

---

# Business Problem

Modern content authoring platforms such as Notion provide excellent collaboration and content creation capabilities. However, their exported HTML documents are optimized for web viewing rather than print publishing.

Typical exported HTML files suffer from multiple limitations:

* No page numbering
* No running headers and footers
* No print-specific styling
* No watermark support
* Poor handling of diagrams and tables
* Inconsistent spacing
* Lack of multi-column layouts
* Uncontrolled page breaks
* No branding compliance

As a result, significant manual effort is typically required to transform exported content into professionally formatted study material.

This project completely automates that transformation process.

---

# System Architecture

The complete solution consists of four major layers:

## Layer 1: Workflow Orchestration (n8n)

n8n acts as the central automation engine.

Responsibilities:

* Trigger workflow execution
* Receive source document
* Execute Node.js rendering script
* Manage workflow execution states
* Capture generated output
* Forward generated PDF to downstream systems

n8n serves as the control plane of the entire pipeline.

---

## Layer 2: Content Processing Engine

A custom Node.js application performs all document transformations.

Responsibilities:

* Parse HTML content
* Download branding assets
* Generate local asset cache
* Inject custom CSS
* Restructure document layout
* Optimize diagrams and images
* Prepare document for print rendering

This layer performs all content engineering operations before PDF generation begins.

---

## Layer 3: Browser Rendering Engine

Puppeteer launches a headless Chromium browser.

Responsibilities:

* Render HTML exactly as a browser would
* Execute DOM transformation scripts
* Apply print media CSS
* Generate headers and footers
* Insert page numbering
* Render watermark
* Compile final PDF

This layer acts as the rendering engine of the system.

---

## Layer 4: Output Distribution Layer

The generated PDF can be:

* Downloaded locally
* Sent through email
* Uploaded to cloud storage
* Delivered via APIs
* Archived in document management systems

This layer provides flexibility for future workflow extensions.

---

# Complete Process Flow

```text
Raw HTML Export
        │
        ▼
n8n Workflow Trigger
        │
        ▼
Node.js Processing Engine
        │
        ├── Download Logos
        ├── Convert Images to Base64
        ├── Inject Print CSS
        ├── Restructure DOM
        └── Optimize Layout
        │
        ▼
Puppeteer Browser Rendering
        │
        ├── Load HTML
        ├── Execute DOM Scripts
        ├── Apply Branding
        ├── Generate Headers
        ├── Generate Footers
        ├── Add Watermark
        └── Apply Pagination
        │
        ▼
PDF Compilation
        │
        ▼
Publication Ready PDF
        │
        ▼
n8n Output Node
```

---

# Understanding How n8n Works

## What is n8n?

n8n is an open-source workflow automation platform.

It works using interconnected nodes.

Each node performs a specific task:

* Receive data
* Transform data
* Execute scripts
* Call APIs
* Store files
* Send notifications

Nodes are connected together to form a workflow.

Data travels from one node to another as JSON objects.

---

## How n8n Executes This Project

### Step 1 – Workflow Trigger

Execution begins when the workflow is manually triggered or receives an external event.

The trigger node creates an execution instance and passes control to downstream nodes.

---

### Step 2 – Document Acquisition

The workflow obtains the source HTML file.

This file may originate from:

* Notion export
* Local storage
* Cloud storage
* API response

The document becomes the workflow input.

---

### Step 3 – Execute Node.js Script

n8n invokes the custom Node.js script.

This script performs all processing operations.

The workflow waits until execution completes.

---

### Step 4 – Receive Generated PDF

After processing finishes, the generated PDF is returned back into the workflow.

n8n stores the file as binary data.

---

### Step 5 – Post Processing

The PDF can then be:

* Downloaded
* Shared
* Uploaded
* Archived
* Emailed

without any additional manual intervention.

---

# Asset Fetching Mechanism

Before rendering begins, branding assets must be available locally.

The script:

1. Downloads company logos
2. Saves them locally
3. Converts them into Base64 Data URIs

Example:

```text
PNG File
   ↓
Binary Buffer
   ↓
Base64 Encoding
   ↓
Data URI
   ↓
Embedded in HTML
```

Benefits:

* No internet dependency during rendering
* Faster execution
* Consistent output
* Better reliability

---

# DOM Restructuring Engine

One of the most important components of the project is the DOM restructuring layer.

## Why DOM Restructuring is Required

Notion exports contain deeply nested HTML structures.

Example:

```html
<div>
   <div>
      <div>
         <p>Content</p>
      </div>
   </div>
</div>
```

These structures are difficult to format for print media.

The script flattens these nested structures before rendering.

---

# Hybrid Column Architecture

A traditional two-column layout causes major issues:

* Empty page regions
* Broken content flow
* Diagram displacement
* Unbalanced columns

To solve this problem, the project implements a Hybrid Column Model.

---

## How the Hybrid Model Works

### Text Blocks

Grouped into:

```html
<div class="two-columns">
```

These sections are rendered in newspaper-style columns.

---

### Full Width Elements

Elements such as:

* H1 Sections
* Diagrams
* Tables
* Flowcharts
* Figures

remain outside column containers.

Result:

* Better readability
* Better page utilization
* No excessive white space
* Stable pagination

---

# Styling Engine

A custom stylesheet replaces the default export styling.

The stylesheet controls:

## Page Layout

* A4 Size
* Margins
* Spacing
* Page breaks

## Typography

### Headings

Font:

```text
Montserrat
```

### Body Content

Font:

```text
Inter
```

---

# Branding Engine

The branding engine ensures every generated document follows organizational guidelines.

## Header

Contains:

* Organization Logo
* Subject Name
* Chapter Name

Displayed on every page.

---

## Footer

Contains:

* Support Number
* Website URL
* Page Number Badge

Displayed on every page.

---

## Watermark

The watermark is:

* Center aligned
* Fixed positioned
* Semi-transparent
* Rendered on every page

Purpose:

* Brand visibility
* Copyright protection
* Professional appearance

---

# Figure Optimization Engine

Large diagrams often break across pages.

The script automatically applies:

```css
max-height: 180mm;
object-fit: contain;
```

Benefits:

* Prevents page splitting
* Maintains readability
* Preserves layout consistency

---

# PDF Generation Process

Once all transformations are complete:

1. Puppeteer launches Chromium
2. HTML is loaded
3. DOM restructuring executes
4. Print stylesheet loads
5. Header template loads
6. Footer template loads
7. Watermark renders
8. Pagination applies
9. PDF compilation starts
10. Final PDF exports

The generated output is a publication-ready A4 PDF.

---

# Directory Structure

```text
Project Root
│
├── workflow.json
├── generate_pdf.js
│
├── Assets
│   ├── header_logo.png
│   └── watermark_logo.png
│
├── Input
│   └── source_document.html
│
├── Output
│   ├── styled_document.html
│   └── final_document.pdf
│
└── README.md
```

---

# Technology Stack

| Component           | Technology            |
| ------------------- | --------------------- |
| Workflow Automation | n8n                   |
| Backend Processing  | Node.js               |
| Browser Rendering   | Puppeteer             |
| Styling             | CSS3                  |
| Markup Processing   | HTML5                 |
| PDF Generation      | Chromium Print Engine |
| Asset Encoding      | Base64                |
| Automation Runtime  | JavaScript            |

---

# Key Features

* Fully automated PDF generation
* Production-ready architecture
* Dynamic page numbering
* Running headers and footers
* Brand-compliant formatting
* Watermark rendering
* Hybrid column layout
* Figure optimization
* Offline asset rendering
* n8n workflow integration
* Scalable and reusable design

---

# Getting Started & Running the Workflow

Follow these steps to run the n8n workflow locally on your system:

## Step 1: Start n8n with Required Permissions
By default, n8n restricts local command execution and blocks file system access outside of the user's home directory. To run this workflow, n8n must be started with environment variables that allow executing the PDF generation script and reading the resulting PDF.

Use one of the helper scripts in the project root to start n8n:
*   **On Command Prompt (cmd.exe):** Double-click or run `run_n8n.bat`
*   **On PowerShell:** Run `.\run_n8n.ps1`

Both scripts configure the environment and start n8n on port `5678`:
```cmd
set N8N_ENFORCE_SETTINGS_FILE_FOR_CAN_EXECUTE_COMMAND=false
set NODES_EXCLUDE=[]
set N8N_RESTRICT_FILE_ACCESS_TO=%~dp0;C:\Users\Satwik\.n8n-files
n8n
```

## Step 2: Open n8n in Your Browser
Open your browser and navigate to:
[http://localhost:5678/](http://localhost:5678/)

## Step 3: Import the Workflow
1. In the n8n UI, click on the **Workflows** tab or create a new empty workflow.
2. Click the **three dots menu** (top right corner of the canvas) and select **Import from File**.
3. Choose the [workflow.json](file:///d:/n8n_pdf/workflow.json) file located in this project directory.

## Step 4: Execute the Workflow
1. Click the **Execute workflow** button at the bottom of the screen.
2. Once execution finishes, click on the **Read Generated PDF** node.
3. Switch to the **Binary** tab in the output panel to view, download, or review the generated PDF binary file.

---

# Conclusion

This project demonstrates how workflow automation, browser rendering technology, and custom document engineering techniques can be combined to create a fully automated publishing solution.

By integrating n8n, Node.js, and Puppeteer, the pipeline transforms raw content exports into professionally formatted educational documents with minimal manual effort, consistent branding, reliable pagination, and publication-grade visual quality.

The solution is scalable, maintainable, and suitable for enterprise-level document generation workflows.

