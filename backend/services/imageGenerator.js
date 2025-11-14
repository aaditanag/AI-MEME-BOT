/**
 * Image Generation Service
 * Priority: FREE services first, then paid options
 * 1. Pollinations.AI (FREE, no API key!) ✅
 * 2. Replicate Free Tier ($0.10 credits)
 * 3. NanoBanana (₹3/image - paid)
 */

export class ImageGenerator {
  constructor() {
    // FREE Option - Pollinations.AI (no API key needed!)
    this.pollinationsUrl = 'https://image.pollinations.ai/prompt';
    
    // Replicate API (Free tier: $0.10 credits = 10-20 images)
    this.replicateKey = process.env.REPLICATE_API_TOKEN;
    this.replicateUrl = 'https://api.replicate.com/v1';
    
    // NanoBanana API (Paid - Indian service, ₹3/image)
    this.nanoBananaKey = process.env.NANOBANANA_API_KEY;
    this.nanoBananaUrl = 'https://api.nanobanana.com/v1';
    
    console.log('🎨 Image Generator initialized');
    console.log('  ✅ Pollinations.AI: FREE (always available)');
    console.log(`  ${this.replicateKey ? '✅' : '⚠️ '} Replicate: ${this.replicateKey ? 'Available (free tier)' : 'No API key'}`);
    console.log(`  ${this.nanoBananaKey ? '✅' : '⚠️ '} NanoBanana: ${this.nanoBananaKey ? 'Available (paid)' : 'No API key'}`);
  }

  /**
   * Generate image from meme spec
   * Priority: FREE → Replicate Free Tier → Paid → Placeholder
   */
  async generateImage(spec) {
    const { source_image, canvas, generation } = spec;

    // 1️⃣ Try Pollinations.AI first (100% FREE, no API key!)
    try {
      console.log('🌸 Using Pollinations.AI (FREE) for image generation...');
      return await this.generateWithPollinations(source_image, canvas);
    } catch (error) {
      console.warn('⚠️  Pollinations generation failed:', error.message);
    }

    // 2️⃣ Try Replicate (Free tier: $0.10 credits)
    if (this.replicateKey) {
      try {
        console.log('🔄 Trying Replicate API (free tier)...');
        return await this.generateWithReplicate(source_image, canvas, generation);
      } catch (error) {
        console.warn('⚠️  Replicate generation failed:', error.message);
      }
    }

    // 3️⃣ Try NanoBanana (Paid - ₹3/image)
    if (this.nanoBananaKey) {
      try {
        console.log('🍌 Trying NanoBanana API (paid)...');
        return await this.generateWithNanoBanana(source_image, canvas, generation);
      } catch (error) {
        console.warn('⚠️  NanoBanana generation failed:', error.message);
      }
    }

    // 4️⃣ Fallback to placeholder
    console.log('📐 All services unavailable, using placeholder image');
    return this.generatePlaceholder(source_image.prompt, canvas);
  }

  /**
   * Generate with Pollinations.AI (100% FREE!)
   * No API key needed, instant generation
   */
  async generateWithPollinations(sourceImage, canvas) {
    console.log('🌸 Generating with Pollinations.AI...');
    
    // Pollinations uses URL-based generation (super simple!)
    const prompt = encodeURIComponent(sourceImage.prompt);
    const width = canvas.width_px || 1024;
    const height = canvas.height_px || 1024;
    
    // Construct Pollinations URL
    // Format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&model=flux
    const imageUrl = `${this.pollinationsUrl}/${prompt}?width=${width}&height=${height}&model=flux&nologo=true&enhance=true`;
    
    console.log('✅ Pollinations image generated! (FREE, instant)');
    console.log('💰 Cost: $0.00 (100% FREE!)');
    
    return {
      url: imageUrl,
      type: 'url',
      provider: 'Pollinations.AI',
      cost: '$0.00',
      model: 'FLUX Schnell'
    };
  }

  /**
   * Generate with NanoBanana API (Paid - ₹3/image)
   */
  async generateWithNanoBanana(sourceImage, canvas, generation) {
    try {
      const response = await fetch(`${this.nanoBananaUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.nanoBananaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: sourceImage.prompt,
          negative_prompt: sourceImage.negative_prompt,
          width: canvas.width_px,
          height: canvas.height_px,
          steps: generation.steps,
          guidance_scale: generation.cfg_scale,
          model: 'sdxl-1.0', // or 'sd-1.5', 'flux-schnell'
          seed: sourceImage.seed || Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`NanoBanana API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      // NanoBanana returns image directly or job ID
      if (data.image_url) {
        // Direct URL
        console.log('✅ NanoBanana image generated successfully!');
        return {
          url: data.image_url,
          type: 'url',
          cost: data.cost || 3 // ₹3 per image
        };
      } else if (data.job_id) {
        // Async generation - poll for result
        return await this.pollNanoBanana(data.job_id);
      } else {
        throw new Error('Invalid response from NanoBanana API');
      }
    } catch (error) {
      console.error('❌ NanoBanana API error:', error.message);
      throw error;
    }
  }

  /**
   * Poll NanoBanana for job completion
   */
  async pollNanoBanana(jobId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Check every 2 seconds

      try {
        const response = await fetch(`${this.nanoBananaUrl}/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${this.nanoBananaKey}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to check job status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'completed' || data.status === 'success') {
          console.log('✅ NanoBanana image generated successfully!');
          return {
            url: data.image_url || data.output_url,
            type: 'url',
            cost: data.cost || 3
          };
        } else if (data.status === 'failed' || data.status === 'error') {
          throw new Error(`Image generation failed: ${data.error || 'Unknown error'}`);
        }

        // Still processing...
        console.log(`⏳ NanoBanana job ${jobId} - Status: ${data.status} (${i + 1}/${maxAttempts})`);
      } catch (error) {
        console.warn(`⚠️  Error polling job ${jobId}:`, error.message);
      }
    }

    throw new Error('Image generation timeout after 2 minutes');
  }

  /**
   * Generate with Replicate API (Fallback)
   */
  async generateWithReplicate(sourceImage, canvas, generation) {
    const response = await fetch(`${this.replicateUrl}/predictions`, {
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
          seed: sourceImage.seed || Math.floor(Math.random() * 1000000)
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

      const response = await fetch(`${this.replicateUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.replicateKey}`
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

  /**
   * Get model info for documentation
   */
  getModelInfo() {
    return {
      available: true, // Pollinations is always available!
      primaryModel: 'FLUX Schnell (via Pollinations.AI)',
      fallbackModels: [
        this.replicateKey ? 'SDXL (Replicate)' : null,
        this.nanoBananaKey ? 'SDXL (NanoBanana)' : null
      ].filter(Boolean),
      type: 'Diffusion Model',
      purpose: 'Generate high-quality meme images from text prompts',
      resolution: '1024×1024 pixels',
      cost: 'FREE (Pollinations.AI)',
      provider: 'Pollinations.AI (Primary - FREE)',
      note: 'No API key needed for Pollinations.AI!'
    };
  }
}

export default new ImageGenerator();

