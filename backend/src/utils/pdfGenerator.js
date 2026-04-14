// PDF Generation Utilities
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

class PDFGenerator {
  /**
   * Create HTML template for PDF
   */
  static createPDFHTML(storyData, projectData, includeImages = true) {
    const pages = storyData.map(page => `
      <div class="page">
        <h1>${page.page_title}</h1>
        <p>${page.page_text}</p>
        ${includeImages && page.image_url ? `<img src="${page.image_url}" alt="Story illustration" />` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${projectData.child_name}'s Storybook - ${projectData.theme}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
          }

          .page {
            page-break-after: always;
            padding: 60px;
            background-color: white;
            min-height: 100vh;
            position: relative;
          }

          .page:last-child {
            page-break-after: avoid;
          }

          h1 {
            font-size: 32px;
            margin-bottom: 30px;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
          }

          p {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 20px;
            color: #34495e;
          }

          img {
            max-width: 100%;
            height: auto;
            margin-top: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .page-number {
            position: absolute;
            bottom: 30px;
            right: 30px;
            color: #95a5a6;
            font-size: 14px;
          }

          .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .cover-page h1 {
            font-size: 48px;
            border: none;
            margin-bottom: 20px;
          }

          .cover-page p {
            font-size: 24px;
            color: rgba(255,255,255,0.9);
            margin-bottom: 10px;
          }

          @media print {
            body { margin: 0; }
            .page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page cover-page">
          <h1>${projectData.child_name}'s Magical Storybook</h1>
          <p>Theme: ${projectData.theme}</p>
          <p>Created with AI Magic ✨</p>
        </div>
        ${pages}
      </body>
      </html>
    `;
  }

  /**
   * Generate PDF from HTML
   */
  static async generatePDFFromHTML(htmlContent, outputPath) {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent);

      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
        printBackground: true,
        scale: 1
      });

      return outputPath;
    } catch (err) {
      console.error('PDF generation failed:', err);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate complete PDF for story
   */
  static async generateStoryPDF(storyData, projectData, outputPath, withImages = true) {
    try {
      const htmlContent = this.createPDFHTML(storyData, projectData, withImages);
      const pdfPath = await this.generatePDFFromHTML(htmlContent, outputPath);
      
      const stats = await fs.stat(pdfPath);
      return {
        path: pdfPath,
        size: stats.size,
        pages: storyData.length + 1 // +1 for cover page
      };
    } catch (err) {
      console.error('Story PDF generation failed:', err);
      throw err;
    }
  }

  /**
   * Get PDF file size in MB
   */
  static async getPDFSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return (stats.size / (1024 * 1024)).toFixed(2);
    } catch (err) {
      console.error('Failed to get PDF size:', err);
      return 0;
    }
  }
}

module.exports = PDFGenerator;
