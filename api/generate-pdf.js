/**
 * Next.js Serverless API Route / Node.js Express Middleware Template
 * File: api/generate-pdf.js
 * 
 * Description:
 * This endpoint accepts a POST request containing the South African CV JSON structure,
 * encodes it into a URL-safe Base64 string, loads the DocStudio application in a headless
 * browser using Puppeteer, waits for the A4 document layout to render, prints it to a PDF,
 * and returns the binary stream as a downloadable attachment.
 * 
 * Dependencies to install:
 *   npm install puppeteer-core @sparticuz/chromium (for serverless environments like Vercel)
 *   OR
 *   npm install puppeteer (for standard Node.js environments)
 */

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async function handler(req, res) {
  // 1. Allow only POST requests containing the JSON payload
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Please use POST.` });
  }

  const cvData = req.body;

  // Validate that at least the fullName is present
  if (!cvData || !cvData.fullName) {
    return res.status(400).json({ error: "Missing required fields. 'fullName' is mandatory in the CV schema." });
  }

  let browser = null;
  try {
    // 2. Encode the JSON payload into a URL-safe Base64 string
    const jsonString = JSON.stringify(cvData);
    
    // Support UTF-8 chars safely by using encodeURIComponent -> escape sequence conversion
    const base64Data = Buffer.from(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    ).toString('base64');

    // 3. Resolve the target deployment URL (fallback to localhost or production domain)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL}` 
      : 'http://localhost:3000'; // local dev server

    const targetUrl = `${baseUrl}?cvData=${base64Data}`;

    // 4. Configure Puppeteer for Serverless (or standard local chromium)
    // Vercel serverless environment uses chromium path, locally fallback to standard launcher
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;
    
    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
      executablePath: isLocal 
        ? (process.platform === 'win32' 
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // common path on Windows
            : '/usr/bin/google-chrome') // common path on Linux
        : await chromium.executablePath(),
      headless: isLocal ? 'new' : chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // 5. Navigate to the page with URL-injected CV data
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0', // Wait until no more network requests are active for 500ms
      timeout: 30000,
    });

    // 6. Wait for the A4 document layout to be rendered and visible in DOM
    await page.waitForSelector('#document-preview-page', { visible: true, timeout: 10000 });

    // Give an extra 300ms for animations or font rendering to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // 7. Generate standard A4 PDF stream
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial to preserve background colors and styling borders
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      },
      preferCSSPageSize: true
    });

    // 8. Stream the binary PDF buffer back in the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${cvData.fullName.replace(/\s+/g, '_')}_CV.pdf"`);
    
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Server Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF document programmatically.', 
      details: error.message 
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
