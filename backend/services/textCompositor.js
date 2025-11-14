/**
 * Text Compositor Service
 * Renders text overlays onto images according to meme spec
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TextCompositor {
  constructor() {
    // Try to register Impact font if available
    try {
      const fontPath = path.join(__dirname, '../fonts/impact.ttf');
      registerFont(fontPath, { family: 'Impact' });
    } catch (err) {
      console.warn('Impact font not found, using Arial as fallback');
    }
  }

  /**
   * Compose final meme image with text overlays
   */
  async composeMeme(baseImageBuffer, spec) {
    // Load base image
    const baseImage = await loadImage(baseImageBuffer);

    // Create canvas matching spec dimensions
    const canvas = createCanvas(spec.canvas.width_px, spec.canvas.height_px);
    const ctx = canvas.getContext('2d');

    // Draw base image
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Draw each text overlay
    for (const overlay of spec.text_overlays || []) {
      await this.drawTextOverlay(ctx, overlay, canvas.width, canvas.height);
    }

    // Return buffer
    return canvas.toBuffer('image/png');
  }

  /**
   * Draw single text overlay
   */
  async drawTextOverlay(ctx, overlay, canvasWidth, canvasHeight) {
    // Calculate absolute values from normalized coordinates
    const fontSize = Math.round(overlay.font_size_norm * canvasHeight);
    const strokeWidth = overlay.stroke.width_norm * canvasHeight;
    const x = overlay.position_norm.x * canvasWidth;
    const y = overlay.position_norm.y * canvasHeight;

    // Set font
    let fontFamily = overlay.font_family;
    // Fallback to Arial if Impact not available
    if (fontFamily === 'Impact') {
      try {
        ctx.font = `${overlay.font_weight} ${fontSize}px Impact`;
      } catch {
        fontFamily = 'Arial';
        ctx.font = `${overlay.font_weight} ${fontSize}px Arial`;
      }
    } else {
      ctx.font = `${overlay.font_weight} ${fontSize}px ${fontFamily}`;
    }

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
                    overlay.anchor.includes('left') ? 'left' : 'right';
    ctx.textBaseline = 'middle';

    // Word wrap if needed
    const bboxWidth = overlay.bbox_norm.w * canvasWidth;
    const lines = this.wrapText(ctx, text, bboxWidth, overlay.max_lines);

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
        ctx.shadowOffsetX = overlay.shadow.dx_norm * canvasWidth;
        ctx.shadowOffsetY = overlay.shadow.dy_norm * canvasHeight;
      }

      // Draw stroke
      if (overlay.stroke && overlay.stroke.width_norm > 0) {
        ctx.strokeStyle = overlay.stroke.color;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = overlay.stroke.join || 'round';
        ctx.strokeText(line, x, currentY);
      }

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw fill
      ctx.fillStyle = overlay.fill_color;
      ctx.globalAlpha = overlay.opacity;
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

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;

        if (lines.length >= maxLines - 1) {
          // Last line, add remaining words
          const remaining = words.slice(words.indexOf(word));
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
   * Create meme from URL
   */
  async composeMemeFromUrl(imageUrl, spec) {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    return this.composeMeme(buffer, spec);
  }
}

export default new TextCompositor();

