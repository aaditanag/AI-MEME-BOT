/**
 * Browser-based Meme Text Compositor
 * Uses HTML5 Canvas API to render text overlays on images
 * No server-side dependencies needed!
 */

class MemeCompositor {
  /**
   * Compose meme with text overlays
   * @param {string} imageUrl - Base image URL or data URL
   * @param {object} memeSpec - Meme specification with text_overlays
   * @returns {Promise<string>} - Data URL of final meme
   */
  async composeMeme(imageUrl, memeSpec) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = memeSpec.canvas.width_px;
          canvas.height = memeSpec.canvas.height_px;
          const ctx = canvas.getContext('2d');

          // Draw base image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw text overlays
          if (memeSpec.text_overlays) {
            for (const overlay of memeSpec.text_overlays) {
              this.drawTextOverlay(ctx, overlay, canvas.width, canvas.height);
            }
          }

          // Return as data URL
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  /**
   * Draw single text overlay
   */
  drawTextOverlay(ctx, overlay, canvasWidth, canvasHeight) {
    // Calculate absolute values from normalized coordinates
    const fontSize = Math.round(overlay.font_size_norm * canvasHeight);
    const strokeWidth = overlay.stroke.width_norm * canvasHeight;
    const x = overlay.position_norm.x * canvasWidth;
    const y = overlay.position_norm.y * canvasHeight;

    // Set font (try Impact, fallback to Arial Black/Arial)
    const fontFamily = overlay.font_family === 'Impact' 
      ? 'Impact, "Arial Black", Arial, sans-serif'
      : overlay.font_family;
    
    ctx.font = `${overlay.font_weight} ${fontSize}px ${fontFamily}`;

    // Handle text case
    let text = overlay.text;
    if (overlay.case === 'uppercase') {
      text = text.toUpperCase();
    } else if (overlay.case === 'lowercase') {
      text = text.toLowerCase();
    } else if (overlay.case === 'title') {
      text = this.toTitleCase(text);
    }

    // Text alignment
    ctx.textAlign = overlay.anchor === 'center' ? 'center' : 
                    overlay.anchor && overlay.anchor.includes('left') ? 'left' : 'right';
    ctx.textBaseline = 'middle';

    // Word wrap if needed
    const bboxWidth = overlay.bbox_norm.w * canvasWidth;
    const lines = this.wrapText(ctx, text, bboxWidth, overlay.max_lines || 3);

    // Calculate line height
    const lineHeight = fontSize * overlay.line_height_em;
    const totalHeight = lines.length * lineHeight;
    let currentY = y - (totalHeight / 2) + (lineHeight / 2);

    // Draw each line
    for (const line of lines) {
      // Draw shadow if specified
      if (overlay.shadow && overlay.shadow.opacity > 0) {
        ctx.shadowColor = overlay.shadow.color;
        ctx.shadowBlur = overlay.shadow.blur_norm * canvasHeight;
        ctx.shadowOffsetX = (overlay.shadow.dx_norm || 0) * canvasWidth;
        ctx.shadowOffsetY = (overlay.shadow.dy_norm || 0) * canvasHeight;
      }

      // Draw stroke (outline)
      if (overlay.stroke && overlay.stroke.width_norm > 0) {
        ctx.strokeStyle = overlay.stroke.color;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = overlay.stroke.join || 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, x, currentY);
      }

      // Reset shadow for fill
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw fill (main text)
      ctx.fillStyle = overlay.fill_color;
      ctx.globalAlpha = overlay.opacity || 1.0;
      ctx.fillText(line, x, currentY);
      ctx.globalAlpha = 1.0;

      currentY += lineHeight;
    }
  }

  /**
   * Wrap text to fit within width
   */
  wrapText(ctx, text, maxWidth, maxLines = 3) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;

        if (lines.length >= maxLines - 1) {
          // Last line, add remaining words
          const remaining = words.slice(i);
          currentLine = remaining.join(' ');
          break;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, maxLines);
  }

  /**
   * Convert to title case
   */
  toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  /**
   * Download meme as file
   */
  downloadMeme(dataUrl, filename = 'meme.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}

// Export for use
window.MemeCompositor = MemeCompositor;

