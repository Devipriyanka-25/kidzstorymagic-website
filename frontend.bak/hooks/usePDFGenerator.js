/**
 * usePDFGenerator.js
 * 
 * Purpose: Custom hook for PDF generation with payment control
 * Features:
 * - Generate PDF with compression options
 * - Apply payment restrictions (watermark, blur)
 * - Handle PDF settings
 * - Auto-download
 */

import { useState } from 'react';
import { compressImages, calculateFileSize, formatFileSize } from '@/utils/ImageCompressor';
import { checkIsPremium } from '@/utils/PaymentChecker';

/**
 * Custom hook for PDF generation
 */
export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  /**
   * Check if user is premium before generating
   */
  const checkPremiumStatus = async () => {
    try {
      const premium = await checkIsPremium();
      setIsPremium(premium);
      return premium;
    } catch (err) {
      console.error('[PDF-GEN] Error checking premium status:', err);
      return false;
    }
  };

  /**
   * Apply watermark to PDF page
   */
  const applyWatermark = (pageElement) => {
    const watermarkDiv = document.createElement('div');
    watermarkDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 48px;
      font-weight: bold;
      color: rgba(255, 0, 0, 0.15);
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    watermarkDiv.textContent = 'PREVIEW - Upgrade to Download Full Quality';
    
    pageElement.style.position = 'relative';
    pageElement.appendChild(watermarkDiv);
  };

  /**
   * Apply blur effect to images
   */
  const applyBlurToImages = (pageElement) => {
    const images = pageElement.querySelectorAll('img');
    images.forEach(img => {
      img.style.filter = 'blur(3px)';
      img.style.opacity = '0.8';
    });
  };

  /**
   * Prepare content for PDF generation
   */
  const prepareContent = async (story, settings, isPrem) => {
    try {
      // Clone the story content
      const container = document.createElement('div');
      container.style.cssText = `
        width: 210mm;
        height: 297mm;
        padding: 20px;
        font-family: Arial, sans-serif;
        background: white;
      `;

      // Add title page
      const titlePage = document.createElement('div');
      titlePage.style.cssText = `
        width: 100%;
        height: 297mm;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border-bottom: 1px solid #ddd;
        margin-bottom: 20px;
        padding: 40px;
        box-sizing: border-box;
      `;
      
      const title = document.createElement('h1');
      title.textContent = story.title || 'Untitled Story';
      title.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #1F2937;
        margin: 0;
      `;
      titlePage.appendChild(title);
      container.appendChild(titlePage);

      // Get image quality setting
      const qualityMap = {
        high: 1,
        medium: 0.7,
        low: 0.4
      };
      const imageQuality = qualityMap[settings.imageQuality] || 1;

      // Add content pages
      for (let i = 0; i < story.pages.length; i++) {
        const page = story.pages[i];
        const pageDiv = document.createElement('div');
        pageDiv.style.cssText = `
          width: 100%;
          height: 297mm;
          page-break-after: always;
          padding: 20px;
          box-sizing: border-box;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
          position: relative;
        `;

        // Add image
        if (page.image) {
          const img = document.createElement('img');
          img.src = page.image;
          img.style.cssText = `
            width: 100%;
            max-height: 200px;
            object-fit: contain;
            margin-bottom: 20px;
            border-radius: 8px;
          `;
          pageDiv.appendChild(img);
        }

        // Add text
        if (page.text) {
          const textDiv = document.createElement('p');
          textDiv.textContent = page.text;
          textDiv.style.cssText = `
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
            margin: 0;
          `;
          pageDiv.appendChild(textDiv);
        }

        // Add page number
        const pageNum = document.createElement('p');
        pageNum.textContent = `Page ${i + 1}`;
        pageNum.style.cssText = `
          text-align: right;
          font-size: 12px;
          color: #999;
          margin-top: 20px;
        `;
        pageDiv.appendChild(pageNum);

        // Apply restrictions if not premium
        if (!isPrem) {
          applyWatermark(pageDiv);
          applyBlurToImages(pageDiv);
        }

        container.appendChild(pageDiv);
      }

      return container;
    } catch (err) {
      console.error('[PDF-PREP] Error preparing content:', err);
      throw err;
    }
  };

  /**
   * Generate and download PDF
   */
  const generatePDF = async (story, settings) => {
    try {
      setIsGenerating(true);
      setError('');

      // Check premium status
      const premium = await checkPremiumStatus();

      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;

      if (!html2pdf) {
        throw new Error('PDF library not available. Please install html2pdf.js');
      }

      // Prepare content
      const element = await prepareContent(story, settings, premium);
      document.body.appendChild(element);

      // PDF options
      const opt = {
        margin: 10,
        filename: `${story.title || 'story'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: 'mm',
          format: settings.pageSize === 'letter' ? 'letter' : 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();

      // Cleanup
      document.body.removeChild(element);

      setIsGenerating(false);
      return {
        success: true,
        isPremium: premium,
        message: premium 
          ? 'PDF downloaded successfully!' 
          : 'Preview PDF downloaded. Upgrade to remove watermark.'
      };

    } catch (err) {
      console.error('[PDF-GEN] Error generating PDF:', err);
      setError(err.message || 'Failed to generate PDF');
      setIsGenerating(false);
      throw err;
    }
  };

  return {
    isGenerating,
    error,
    isPremium,
    generatePDF,
    checkPremiumStatus
  };
};

export default usePDFGenerator;
