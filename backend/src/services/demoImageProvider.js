// Demo Image Generator - For Testing Before Setting Up Real AI Providers
// This generates realistic-looking image URLs pointing to public demo images
// Replace with real provider (DALLE, Stable Diffusion, etc.) when ready

class DemoImageProvider {
  /**
   * Generate demo image URLs that show children's book style illustrations
   * Uses CORS-enabled creative service - Picsum.photos with seeded variation
   */
  static generateDemoImageUrl(pageNumber, theme, childName) {
    // Generate a unique but deterministic seed for each page
    // This ensures the same page always gets the same image
    const seed = (theme || 'friends').charCodeAt(0) + pageNumber;
    
    // Use picsum.photos which has proper CORS headers and returns real images
    // Seed ensures variety while being deterministic
    // 400x500 is our target size
    return `https://picsum.photos/seed/${seed}/400/500?random=${Math.random()}`;
  }

  /**
   * Generate demo image with gradient and text overlay (Alternative approach)
   * Also provides CORS-safe fallback images
   */
  static generateBackupImageUrl(pageNumber, theme) {
    // Alternative: Use DiceBear Avatars API (100% CORS-safe, generates unique images)
    const seed = `${theme}-page-${pageNumber}`;
    return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}&size=400`;
  }
}

module.exports = DemoImageProvider;
