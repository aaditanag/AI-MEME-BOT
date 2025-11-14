/**
 * Meme JSON Orchestrator Service
 * Converts user prompts into fully specified meme JSON schemas
 */

export class MemeOrchestrator {
  constructor() {
    this.positionMapping = {
      top: {
        position_norm: { x: 0.5, y: 0.07 },
        bbox_norm: { x: 0.05, y: 0.02, w: 0.90, h: 0.20 }
      },
      bottom: {
        position_norm: { x: 0.5, y: 0.93 },
        bbox_norm: { x: 0.05, y: 0.78, w: 0.90, h: 0.20 }
      },
      center: {
        position_norm: { x: 0.5, y: 0.5 },
        bbox_norm: { x: 0.10, y: 0.35, w: 0.80, h: 0.30 }
      },
      'top-left': {
        position_norm: { x: 0.10, y: 0.10 },
        bbox_norm: { x: 0.05, y: 0.05, w: 0.45, h: 0.25 }
      },
      'center-left': {
        position_norm: { x: 0.20, y: 0.50 },
        bbox_norm: { x: 0.05, y: 0.35, w: 0.35, h: 0.30 }
      }
    };
  }

  /**
   * Generate complete meme JSON from idea and optional captions
   */
  generateMemeSpec(idea, captions = [], positions = []) {
    const now = new Date().toISOString();
    
    // Analyze idea to determine meme type and style
    const analysis = this.analyzeIdea(idea);
    
    // Generate text overlays (max 3)
    const textOverlays = this.generateTextOverlays(captions, positions, analysis);
    
    // Create complete JSON spec
    const spec = {
      version: "1.0",
      canvas: {
        width_px: 1024,
        height_px: 1024,
        aspect_ratio: "1:1",
        background_color: "#000000"
      },
      style: {
        meme_family: analysis.memeFamily,
        visual_style: analysis.visualStyle,
        references: analysis.references,
        safety: {
          nsfw_allowed: false,
          violence_allowed: "none"
        }
      },
      source_image: {
        mode: "generate",
        prompt: this.generateImagePrompt(idea, analysis),
        negative_prompt: "blurry, distorted, low quality, text, watermark, violence, graphic content, nsfw",
        seed: null
      },
      layout: {
        panels: analysis.panels,
        grid: {
          rows: analysis.gridRows,
          cols: analysis.gridCols,
          gutter_norm: 0.02,
          panel_order: Array.from({ length: analysis.panels }, (_, i) => i)
        },
        safe_margins_norm: {
          top: 0.05,
          right: 0.05,
          bottom: 0.05,
          left: 0.05
        }
      },
      text_overlays: textOverlays,
      branding: {
        watermark_text: "",
        watermark_opacity: 0.0,
        watermark_position: "bottom-right"
      },
      accessibility: {
        alt_text: this.generateAltText(idea, captions),
        long_desc: `Meme: ${analysis.ideaSummary}`
      },
      generation: {
        engine: "generic",
        cfg_scale: 7.0,
        steps: 30,
        sampler: "default",
        upscale: {
          enabled: false,
          target_px: null
        }
      },
      metadata: {
        idea_summary: analysis.ideaSummary,
        inferred_emotion: analysis.emotion,
        color_palette: ["#FFFFFF", "#000000"],
        created_at: now
      }
    };

    return spec;
  }

  /**
   * Analyze the idea to determine meme characteristics
   */
  analyzeIdea(idea) {
    const lowerIdea = idea.toLowerCase();
    
    // Detect known templates
    const templates = {
      drake: ['drake', 'no yes', 'reject accept'],
      distracted: ['distracted boyfriend', 'looking back'],
      button: ['two buttons', 'sweating'],
      brain: ['expanding brain', 'galaxy brain'],
      wojak: ['wojak', 'doomer', 'chad'],
      doge: ['doge', 'cheems', 'buff doge'],
      monkey: ['monkey', 'ape', 'monke', 'return to']
    };

    let detectedTemplate = null;
    let references = [];

    for (const [key, keywords] of Object.entries(templates)) {
      if (keywords.some(kw => lowerIdea.includes(kw))) {
        detectedTemplate = key;
        references.push(`${key} meme template`);
        break;
      }
    }

    // Determine panels
    let panels = 1;
    let gridRows = 1;
    let gridCols = 1;
    
    if (lowerIdea.includes('two panel') || lowerIdea.includes('before after') || 
        lowerIdea.includes('vs') || detectedTemplate === 'drake') {
      panels = 2;
      gridRows = 2;
    } else if (lowerIdea.includes('four panel') || lowerIdea.includes('expanding brain')) {
      panels = 4;
      gridRows = 2;
      gridCols = 2;
    }

    // Determine visual style
    let visualStyle = 'photo-realistic';
    if (lowerIdea.includes('cartoon') || lowerIdea.includes('animated')) {
      visualStyle = 'cartoon';
    } else if (lowerIdea.includes('screenshot')) {
      visualStyle = 'screenshot';
    } else if (detectedTemplate) {
      visualStyle = 'template';
    }

    // Determine emotion
    let emotion = 'deadpan';
    if (lowerIdea.includes('excited') || lowerIdea.includes('hype')) {
      emotion = 'hype';
    } else if (lowerIdea.includes('wholesome') || lowerIdea.includes('cute')) {
      emotion = 'wholesome';
    } else if (lowerIdea.includes('cringe')) {
      emotion = 'cringe';
    } else if (lowerIdea.includes('sarcastic')) {
      emotion = 'sarcastic';
    } else if (lowerIdea.includes('absurd') || lowerIdea.includes('weird')) {
      emotion = 'absurd';
    }

    // Determine meme family
    let memeFamily = 'classic';
    if (panels === 2) {
      memeFamily = 'two-panel';
    } else if (panels === 4) {
      memeFamily = 'four-panel';
    } else if (detectedTemplate) {
      memeFamily = 'template';
    }

    return {
      memeFamily,
      visualStyle,
      references,
      emotion,
      panels,
      gridRows,
      gridCols,
      ideaSummary: idea.substring(0, 150),
      detectedTemplate
    };
  }

  /**
   * Generate image prompt for AI generation
   */
  generateImagePrompt(idea, analysis) {
    const basePrompt = idea;
    
    // Add style modifiers
    let stylePrompt = '';
    if (analysis.visualStyle === 'photo-realistic') {
      stylePrompt = 'high quality photograph, clear lighting, sharp focus';
    } else if (analysis.visualStyle === 'cartoon') {
      stylePrompt = 'cartoon style, clean lines, vibrant colors';
    } else if (analysis.visualStyle === 'screenshot') {
      stylePrompt = 'screenshot, UI elements, digital display';
    }

    // Template-specific prompts
    if (analysis.detectedTemplate === 'monkey') {
      return 'close-up photo of a monkey looking directly at camera, neutral expression, clear face, naturalistic lighting, sharp focus, professional wildlife photography';
    } else if (analysis.detectedTemplate === 'doge') {
      return 'close-up photo of a shiba inu dog, side profile, looking at camera, natural lighting, clean background';
    }

    return `${basePrompt}, ${stylePrompt}, meme format, clean composition, space for text`;
  }

  /**
   * Generate text overlays from captions
   */
  generateTextOverlays(captions, positions, analysis) {
    const overlays = [];
    const maxOverlays = Math.min(captions.length, 3);

    // Default positions if not provided
    const defaultPositions = ['top', 'bottom', 'center'];

    for (let i = 0; i < maxOverlays; i++) {
      const caption = captions[i];
      const position = positions[i] || defaultPositions[i] || 'center';
      
      const positionData = this.positionMapping[position] || this.positionMapping.center;

      overlays.push({
        id: `caption${i + 1}`,
        text: caption,
        case: 'uppercase',
        font_family: 'Impact',
        font_weight: 900,
        font_style: 'normal',
        font_size_norm: 0.08,
        letter_spacing_em: 0,
        line_height_em: 1.05,
        fill_color: '#FFFFFF',
        stroke: {
          color: '#000000',
          width_norm: 0.006,
          join: 'round'
        },
        shadow: {
          color: '#000000',
          blur_norm: 0.01,
          dx_norm: 0,
          dy_norm: 0,
          opacity: 0.5
        },
        position_norm: positionData.position_norm,
        anchor: 'center',
        bbox_norm: positionData.bbox_norm,
        align: 'center',
        wrap: 'balance',
        max_lines: 3,
        rotation_deg: 0,
        opacity: 1.0,
        z_index: 10,
        panel_index: 0
      });
    }

    return overlays;
  }

  /**
   * Generate accessibility alt text
   */
  generateAltText(idea, captions) {
    const captionText = captions.slice(0, 2).join(' ');
    const altText = `Meme: ${captionText}`.substring(0, 180);
    return altText || idea.substring(0, 180);
  }

  /**
   * Validate generated spec
   */
  validateSpec(spec) {
    const errors = [];

    // Check all required fields exist
    if (!spec.version || !spec.canvas || !spec.style || !spec.source_image) {
      errors.push('Missing required top-level fields');
    }

    // Validate normalized values
    const checkNorm = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes('_norm') && typeof value === 'number') {
          if (value < 0 || value > 1) {
            errors.push(`${path}.${key} out of [0,1] range: ${value}`);
          }
        } else if (typeof value === 'object' && value !== null) {
          checkNorm(value, path ? `${path}.${key}` : key);
        }
      }
    };
    checkNorm(spec);

    // Check text overlays
    if (spec.text_overlays && spec.text_overlays.length > 3) {
      errors.push('Too many text overlays (max 3)');
    }

    spec.text_overlays?.forEach((overlay, i) => {
      if (!overlay.text) {
        errors.push(`Text overlay ${i} has empty text`);
      }
    });

    // Check alt text
    if (!spec.accessibility?.alt_text) {
      errors.push('Missing alt_text');
    } else if (spec.accessibility.alt_text.length > 180) {
      errors.push('Alt text exceeds 180 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new MemeOrchestrator();

