/**
 * Image Generation Service
 * Integrates with image generation APIs (Replicate, Stable Diffusion, etc.)
 */

export class ImageGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REPLICATE_API_KEY;
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  /**
   * Generate image from meme spec
   */
  async generateImage(spec) {
    const { source_image, canvas, generation } = spec;

    // If using Replicate API
    if (this.apiKey) {
      try {
        return await this.generateWithReplicate(source_image, canvas, generation);
      } catch (error) {
        console.warn('Replicate generation failed, falling back to placeholder:', error.message);
      }
    }

    // Fallback to placeholder
    return this.generatePlaceholder(source_image.prompt, canvas);
  }

  /**
   * Generate with Replicate API
   */
  async generateWithReplicate(sourceImage, canvas, generation) {
    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: sourceImage.prompt,
          negative_prompt: sourceImage.negative_prompt,
          width: canvas.width_px,
          height: canvas.height_px,
          num_inference_steps: generation.steps,
          guidance_scale: generation.cfg_scale,
          seed: sourceImage.seed
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    return await this.pollPrediction(prediction.id);
  }

  /**
   * Poll Replicate prediction until complete
   */
  async pollPrediction(predictionId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`
        }
      });

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return {
          url: prediction.output[0],
          type: 'url'
        };
      } else if (prediction.status === 'failed') {
        throw new Error('Image generation failed');
      }
    }

    throw new Error('Image generation timeout');
  }

  /**
   * Generate placeholder image URL
   */
  generatePlaceholder(prompt, canvas) {
    const encodedPrompt = encodeURIComponent(prompt.substring(0, 100));
    return {
      url: `https://placehold.co/${canvas.width_px}x${canvas.height_px}/1a1a1a/ffffff?text=${encodedPrompt}`,
      type: 'url'
    };
  }

  /**
   * Download image from URL to buffer
   */
  async downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }
}

export default new ImageGenerator();

