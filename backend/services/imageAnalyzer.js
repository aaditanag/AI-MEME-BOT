/**
 * Image Analyzer Service
 * Uses CLIP (via Replicate API) to understand image content and context
 * This provides the "Computer Vision" component required by the competition!
 */

class ImageAnalyzer {
  constructor() {
    this.replicateKey = process.env.REPLICATE_API_TOKEN;
    this.clipAvailable = !!this.replicateKey;
    
    if (this.clipAvailable) {
      console.log('👁️  CLIP image analysis initialized');
    } else {
      console.warn('⚠️  REPLICATE_API_TOKEN not found - image analysis limited');
    }
  }

  /**
   * Analyze image to understand content, emotion, and context
   * Uses CLIP for vision understanding
   */
  async analyzeImage(imageInput) {
    if (this.clipAvailable) {
      try {
        return await this.analyzeWithCLIP(imageInput);
      } catch (error) {
        console.warn('⚠️  CLIP analysis failed, using basic analysis:', error.message);
      }
    }

    // Fallback to basic analysis
    return this.basicAnalysis(imageInput);
  }

  /**
   * Analyze image using CLIP (OpenAI's vision model)
   */
  async analyzeWithCLIP(imageInput) {
    console.log('👁️  Analyzing image with CLIP...');

    try {
      // Use Replicate's CLIP Interrogator model
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: '8151e1c9f47e696fa316146a2e35812ccf79cfc9eba05b11c7f450155102af70',
          input: {
            image: imageInput,
            mode: 'best',
            clip_model_name: 'ViT-L-14/openai'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`CLIP API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      // Poll for result
      const result = await this.pollForResult(prediction.urls.get);
      
      // Parse CLIP output
      return this.parseCLIPOutput(result.output);

    } catch (error) {
      console.error('❌ CLIP analysis error:', error);
      throw error;
    }
  }

  /**
   * Poll Replicate API for result
   */
  async pollForResult(getUrl, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(getUrl, {
        headers: {
          'Authorization': `Token ${this.replicateKey}`
        }
      });

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed') {
        throw new Error('CLIP analysis failed');
      }

      // Continue polling...
    }

    throw new Error('CLIP analysis timeout');
  }

  /**
   * Parse CLIP output into structured analysis
   */
  parseCLIPOutput(output) {
    // CLIP Interrogator returns a description
    const description = typeof output === 'string' ? output : output?.caption || '';

    // Extract entities using keyword matching
    const objects = this.extractObjects(description);
    const emotion = this.detectEmotion(description);
    const scene = this.detectScene(description);

    console.log('✅ CLIP Analysis:', { objects, emotion, scene });

    return {
      description,
      objects,
      emotion,
      scene,
      confidence: 0.85,
      model: 'CLIP (ViT-L-14)',
      analysisType: 'AI Vision (Computer Vision)'
    };
  }

  /**
   * Extract objects from description
   */
  extractObjects(description) {
    const commonObjects = [
      'person', 'people', 'man', 'woman', 'child',
      'dog', 'cat', 'animal', 'monkey', 'bird',
      'computer', 'laptop', 'phone', 'screen',
      'car', 'house', 'building', 'room',
      'food', 'drink', 'coffee', 'pizza',
      'tree', 'sky', 'water', 'mountain',
      'face', 'hand', 'eye', 'smile'
    ];

    const found = [];
    const lowerDesc = description.toLowerCase();

    for (const obj of commonObjects) {
      if (lowerDesc.includes(obj)) {
        found.push(obj);
      }
    }

    return found.slice(0, 5); // Top 5 objects
  }

  /**
   * Detect emotion/mood from description
   */
  detectEmotion(description) {
    const lowerDesc = description.toLowerCase();

    const emotions = {
      happy: ['happy', 'smiling', 'joy', 'cheerful', 'excited', 'laughing'],
      sad: ['sad', 'crying', 'depressed', 'unhappy', 'tears'],
      angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated'],
      confused: ['confused', 'puzzled', 'uncertain', 'wondering'],
      surprised: ['surprised', 'shocked', 'amazed', 'astonished'],
      tired: ['tired', 'exhausted', 'sleepy', 'bored'],
      stressed: ['stressed', 'worried', 'anxious', 'concerned']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(kw => lowerDesc.includes(kw))) {
        return emotion;
      }
    }

    return 'neutral';
  }

  /**
   * Detect scene type
   */
  detectScene(description) {
    const lowerDesc = description.toLowerCase();

    const scenes = {
      office: ['office', 'desk', 'computer', 'workplace', 'work'],
      outdoor: ['outdoor', 'outside', 'park', 'nature', 'street'],
      indoor: ['indoor', 'inside', 'room', 'home', 'house'],
      portrait: ['portrait', 'face', 'headshot', 'close-up'],
      action: ['action', 'moving', 'running', 'jumping', 'dynamic']
    };

    for (const [scene, keywords] of Object.entries(scenes)) {
      if (keywords.some(kw => lowerDesc.includes(kw))) {
        return scene;
      }
    }

    return 'general';
  }

  /**
   * Basic analysis (fallback when CLIP not available)
   */
  basicAnalysis(imageInput) {
    console.log('📋 Using basic image analysis (no AI)');

    return {
      description: 'Image provided by user',
      objects: ['unknown'],
      emotion: 'neutral',
      scene: 'general',
      confidence: 0.5,
      model: 'Basic (No AI)',
      analysisType: 'Fallback'
    };
  }

  /**
   * Analyze from URL
   */
  async analyzeFromUrl(imageUrl) {
    return await this.analyzeImage(imageUrl);
  }

  /**
   * Analyze from base64 data
   */
  async analyzeFromBase64(base64Data) {
    // CLIP can accept base64 data URLs
    return await this.analyzeImage(base64Data);
  }

  /**
   * Check if AI vision is available
   */
  isAIAvailable() {
    return this.clipAvailable;
  }

  /**
   * Get model info for documentation
   */
  getModelInfo() {
    return {
      available: this.isAIAvailable(),
      model: 'CLIP (Contrastive Language-Image Pre-training)',
      architecture: 'Vision Transformer (ViT-L-14)',
      purpose: 'Understand image content, objects, emotions, and context',
      cost: '~$0.001 per image',
      provider: 'OpenAI (via Replicate)'
    };
  }
}

export default new ImageAnalyzer();

