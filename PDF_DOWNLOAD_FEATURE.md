# PDF Download Feature - Implementation Guide

## Overview
Comprehensive PDF download feature with payment-based access control and image compression.

## Features Implemented

### 1. **PDF Settings Modal**
- [ ] Page size selection (A4, Letter)
- [ ] Image quality selection (High, Medium, Low)
- [ ] File size calculation and warnings
- [ ] Payment status display
- [ ] Upgrade prompt for free users

### 2. **Payment-Based Access Control**
#### Premium Users (isPremium = true)
✅ Full-quality PDF
- No watermark
- No image blur
- All compression options available
- High-resolution images

#### Free Users (isPremium = false)
⚠️ Preview PDF
- "PREVIEW - Upgrade to Download Full Quality" watermark
- Blurred images (3px blur)
- Still downloadable for preview
- Upgrade prompt in modal

### 3. **Image Compression**
- **High Quality**: 1.0 (no compression, 1200px max width)
- **Medium Quality**: 0.7 (70% compression, 900px max width)
- **Low Quality**: 0.4 (40% compression, 600px max width)
- Automatic file size calculation
- Warning when file > 5MB

### 4. **Components Created**

#### `PDFSettingsModal.jsx`
- Modal UI for PDF settings
- Page size selection
- Image quality selection
- File size display
- Payment status indicators
- Upgrade button

#### `usePDFGenerator.js` (Hook)
- PDF generation logic
- Payment checking
- Watermark application
- Image blur application
- Content preparation

#### `ImageCompressor.js` (Utility)
- Canvas-based image compression
- File size calculations
- Quality level mapping
- Batch compression

#### `PaymentChecker.js` (Utility)
- Check premium status
- Get payment information
- Verify order status

### 5. **Integration Points**

**StoryPreviewComponent.jsx** - Updated with:
- Download PDF button (top-right, green)
- PDF modal state management
- PDF generation handler
- Error display

## Installation Requirements

### 1. Install html2pdf.js
```bash
npm install html2pdf.js
```

### 2. Install optional dependencies (for alternative PDF generation)
```bash
npm install jspdf html2canvas
```

## Usage

### Basic Integration
```jsx
import StoryPreviewComponent from '@/components/wizard/StoryPreviewComponent';

export default function Page() {
  const story = {
    title: "My Story",
    pages: [
      {
        image: "/image.jpg",
        text: "Story text",
        title: "Page 1"
      }
    ]
  };

  return <StoryPreviewComponent story={story} />;
}
```

### PDF Generation
Automatically triggered when user:
1. Clicks "📥 PDF" button
2. Selects settings in modal
3. Clicks "✨ Generate PDF"

The system automatically:
- Checks payment status
- Applies restrictions if not premium
- Compresses images per settings
- Generates and downloads PDF

### Payment Status
The component automatically checks:
```javascript
// From authAPI.getCurrentUser()
user.isPremium // true or false
user.premium   // or this field
```

## PDF Layout

### First Page (Title Page)
- Story title centered
- Page size: A4 or Letter
- Centered layout

### Content Pages
- Image (top, contained)
- Story text (middle)
- Page number (bottom-right)

### Non-Premium Pages
- Watermark overlay (rotated, semi-transparent)
- Blurred images (3px blur, 0.8 opacity)
- Warning: "PREVIEW - Upgrade to Download Full Quality"

## File Structure
```
frontend/
├── components/
│   ├── wizard/
│   │   └── StoryPreviewComponent.jsx (UPDATED)
│   └── story/
│       └── PDFSettingsModal.jsx (NEW)
├── hooks/
│   └── usePDFGenerator.js (NEW)
└── utils/
    ├── ImageCompressor.js (NEW)
    └── PaymentChecker.js (NEW)
```

## Configuration

### Image Quality Thresholds
Modify in `usePDFGenerator.js`:
```javascript
const qualityMap = {
  high: 1,      // No compression
  medium: 0.7,  // 70% quality
  low: 0.4      // 40% quality
};
```

### Watermark Text
Edit in `usePDFGenerator.js`:
```javascript
watermarkDiv.textContent = 'PREVIEW - Upgrade to Download Full Quality';
```

### File Size Warning Threshold
Edit in `PDFSettingsModal.jsx`:
```javascript
const showWarning = estimatedSize > 5; // 5MB threshold
```

### Blur Amount
Edit in `usePDFGenerator.js`:
```javascript
img.style.filter = 'blur(3px)'; // Change blur amount
```

## API Integrations

### UserAPI
```javascript
authAPI.getCurrentUser() 
  // Returns: { isPremium, email, id, ... }
```

### PaymentAPI (Optional)
```javascript
paymentAPI.checkOrderStatus(orderId)
  // Returns: { paid: true/false, status: 'completed'|'pending' }
```

## Development Notes

### Testing Premium Features
1. Update user `isPremium` to `true` in database
2. Generate PDF - should NOT have watermark
3. Change to `false` - should have watermark

### Testing Image Compression
1. Upload large images (>5MB total)
2. Select different quality levels
3. Check file size estimates in modal
4. Verify compression in downloaded PDF

### Debugging
Enable console logs:
- `[PDF-GEN]` - PDF generation
- `[PAYMENT-CHECK]` - Payment status
- `[IMAGE-COMPRESS]` - Image compression
- `[PDF-MODAL]` - Modal interactions

## Performance Considerations

### Image Compression
- Canvas compression is CPU-heavy for large images
- Recommend limiting to 20 pages max per PDF
- Medium quality recommended for files > 5MB

### PDF Generation
- First PDF takes ~2-3 seconds
- Subsequent PDFs ~1-2 seconds
- Show loading indicator while generating

### Memory
- Large images may cause memory issues
- Cleanup after PDF generation implemented
- Consider adding page limit validation

## Browser Compatibility

Supported:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Not supported:
- IE 11 (no canvas support)
- Opera Mini (limited canvas)

## Troubleshooting

### PDF Not Downloading
- Check browser console for errors
- Verify `html2pdf.js` is installed
- Check user permissions
- Verify CORS headers if using external images

### Images Not Showing
- Verify image URLs are accessible
- Check CORS settings
- Use `img.crossOrigin = 'anonymous'`
- Convert to data URLs if needed

### Watermark Not Appearing
- Check if user.isPremium is true
- Verify CSS z-index values
- Check PDF viewer supports overlays
- Try different PDF viewers

### File Size Too Large
- Recommend Medium or Low quality
- Check original image sizes
- Increase compression ratio
- Limit pages per PDF

## Future Enhancements

### Planned Features
- [ ] Custom fonts in PDF
- [ ] Background colors/themes
- [ ] Page margins customization
- [ ] Header/footer options
- [ ] Multiple PDF templates
- [ ] Email PDF delivery
- [ ] PDF preview before download
- [ ] Batch PDF generation
- [ ] PDF encryption for premium

### Optimization
- [ ] WebWorker for compression
- [ ] Lazy load images
- [ ] Stream PDF generation
- [ ] Cloud PDF generation (backend)
- [ ] AVIF format support
- [ ] Progressive JPEG support

## Support

For issues:
1. Check browser console logs
2. Verify dependencies installed
3. Check payment API integration
4. Review file paths
5. Test with sample story

## Code Examples

### Custom Settings
```javascript
const customSettings = {
  pageSize: 'a4',
  imageQuality: 'medium',
  compression: true
};

await generatePDF(story, customSettings);
```

### Check Premium Status
```javascript
const { isPremium } = usePDFGenerator();
useEffect(() => {
  checkPremiumStatus();
}, []);
```

### Error Handling
```javascript
try {
  await handleGeneratePDF(settings);
} catch (err) {
  console.error('PDF failed:', err);
  alert('Failed to generate PDF: ' + err.message);
}
```
