/**
 * AI Caption Generator Service
 * Priority: FREE AI → Paid AI → Template Fallback
 * 1. Google Gemini (FREE!) ✅
 * 2. OpenAI GPT (Paid)
 * 3. Template fallback
 */

import OpenAI from 'openai';

class AICaptionGenerator {
  constructor() {
    // Google Gemini (FREE - 1500 requests/day!)
    this.geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    // OpenAI (Paid fallback)
    this.openai = null;
    this.openaiKey = process.env.OPENAI_API_KEY;
    
    if (this.openaiKey) {
      this.openai = new OpenAI({ apiKey: this.openaiKey });
    }
    
    console.log('🤖 AI Caption Generator initialized');
    console.log(`  ${this.geminiKey ? '✅' : '⚠️ '} Google Gemini: ${this.geminiKey ? 'Available (FREE!)' : 'No API key'}`);
    console.log(`  ${this.openaiKey ? '✅' : '⚠️ '} OpenAI GPT: ${this.openaiKey ? 'Available (paid)' : 'No API key'}`);
    if (!this.geminiKey && !this.openaiKey) {
      console.warn('⚠️  No AI keys found - will use template fallback');
    }
  }

  /**
   * Generate AI-powered captions
   * Priority: Gemini (FREE) → OpenAI (Paid) → Templates
   */
  async generateCaptions(idea, imageAnalysis = null, count = 2) {
    // 1️⃣ Try Google Gemini first (FREE!)
    if (this.geminiKey) {
      try {
        return await this.generateWithGemini(idea, imageAnalysis, count);
      } catch (error) {
        console.warn('⚠️  Gemini generation failed, trying fallback:', error.message);
      }
    }

    // 2️⃣ Try OpenAI GPT (Paid)
    if (this.openai) {
      try {
        return await this.generateWithOpenAI(idea, imageAnalysis, count);
      } catch (error) {
        console.warn('⚠️  OpenAI generation failed, using templates:', error.message);
      }
    }

    // 3️⃣ Fallback to templates (no AI)
    console.log('📋 Using template-based captions (no AI)');
    return this.generateFallbackCaptions(idea, count);
  }

  /**
   * Generate captions using Google Gemini (FREE AI!)
   */
  async generateWithGemini(idea, imageAnalysis, count) {
    console.log('🤖 Generating captions with Google Gemini (FREE)...');

    // Build context
    let context = `Meme idea: ${idea}`;
    
    if (imageAnalysis) {
      context += `\n\nImage analysis:`;
      if (imageAnalysis.objects?.length > 0) {
        context += `\n- Objects: ${imageAnalysis.objects.join(', ')}`;
      }
      if (imageAnalysis.scene) {
        context += `\n- Scene: ${imageAnalysis.scene}`;
      }
      if (imageAnalysis.emotion) {
        context += `\n- Emotion: ${imageAnalysis.emotion}`;
      }
    }

    const prompt = `You are a meme caption expert. Generate ${count} funny, witty meme captions.

${context}

Requirements:
- Make it FUNNY and RELATABLE
- Use internet meme culture
- Keep it concise (max 10 words per caption)
- Use ALL CAPS
- Be creative and original

Generate ${count} caption${count > 1 ? 's' : ''} (one per line, no numbering):`;

    try {
      const response = await fetch(`${this.geminiUrl}?key=${this.geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text.trim();
      
      // Parse and clean captions (remove all Gemini formatting)
      const captions = generatedText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Remove numbers, bullets, asterisks, quotes, markdown
          return line
            .replace(/^\d+[\.\):\-]\s*/, '')        // Remove "1. " or "1) " or "1: " or "1- "
            .replace(/^[\*\-\•]\s*/, '')            // Remove "* " or "- " or "• "
            .replace(/^\*\*/, '')                   // Remove "**"
            .replace(/\*\*$/, '')                   // Remove trailing "**"
            .replace(/^["']/, '')                   // Remove leading quotes
            .replace(/["']$/, '')                   // Remove trailing quotes
            .replace(/^\s*Caption\s*\d*:\s*/i, '')  // Remove "Caption 1:" etc
            .trim();
        })
        .filter(line => line.length > 0 && line.length < 100)  // Valid length captions only
        .map(line => line.toUpperCase())
        .slice(0, count);

      console.log('✅ Gemini-generated captions:', captions);
      console.log('💰 Cost: $0.00 (FREE!)');

      return captions;
    } catch (error) {
      console.error('❌ Gemini error:', error.message);
      throw error;
    }
  }

  /**
   * Generate captions using OpenAI GPT (Paid fallback)
   */
  async generateWithOpenAI(idea, imageAnalysis, count) {
    console.log('🤖 Generating AI-powered captions with GPT...');

    // Build context from image analysis if available
    let context = `Meme idea: ${idea}`;
    
    if (imageAnalysis) {
      context += `\n\nImage contains:`;
      if (imageAnalysis.objects?.length > 0) {
        context += `\n- Objects: ${imageAnalysis.objects.join(', ')}`;
      }
      if (imageAnalysis.scene) {
        context += `\n- Scene: ${imageAnalysis.scene}`;
      }
      if (imageAnalysis.emotion) {
        context += `\n- Emotion/Mood: ${imageAnalysis.emotion}`;
      }
      if (imageAnalysis.description) {
        context += `\n- Description: ${imageAnalysis.description}`;
      }
    }

    // Craft the prompt for GPT
    const prompt = `You are a meme caption generator. Generate ${count} funny, witty meme captions for this scenario:

${context}

Requirements:
- Make it FUNNY and RELATABLE
- Use internet meme culture and humor
- Keep it concise (max 10 words per caption)
- Use ALL CAPS (classic meme style)
- Be creative and original
- Capture the emotion/situation perfectly

Generate ${count} caption${count > 1 ? 's' : ''} (one per line, just the text, no numbering):`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meme creator who understands internet humor, relatability, and viral content. You create captions that are funny, concise, and perfectly capture the moment.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Higher creativity
      max_tokens: 150,
      n: 1
    });

    // Parse the response
    const generatedText = response.choices[0].message.content.trim();
    const captions = generatedText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove numbering
      .map(line => line.toUpperCase()) // Ensure all caps
      .slice(0, count);

    console.log('✅ AI-generated captions:', captions);
    
    // Cost tracking
    const cost = (response.usage.total_tokens / 1000) * 0.002; // $0.002 per 1K tokens
    console.log(`💰 Cost: $${cost.toFixed(4)} (~₹${(cost * 83).toFixed(2)})`);

    return captions;
  }

  /**
   * Fallback template-based generation (when AI not available)
   */
  generateFallbackCaptions(idea, count) {
    console.log('📋 Using fallback template-based captions');
    console.warn('⚠️  AI caption generation failed - check your GOOGLE_GEMINI_API_KEY in .env');
    
    const lowerIdea = idea.toLowerCase();
    const captions = [];

    // Try to extract key elements and generate ACTUAL captions (not just the input!)
    const hasWhen = lowerIdea.includes('when');
    const hasCat = lowerIdea.includes('cat');
    const hasDog = lowerIdea.includes('dog');
    const hasCode = lowerIdea.includes('code') || lowerIdea.includes('program') || lowerIdea.includes('engineer');
    const hasWork = lowerIdea.includes('work') || lowerIdea.includes('job');
    const hasConfused = lowerIdea.includes('confus') || lowerIdea.includes('lost');

    // Generate context-aware captions (NOT just repeating the input!)
    if (hasCat && hasConfused) {
      captions.push('WHEN YOU FORGET WHY YOU CAME HERE');
      if (count > 1) captions.push('EVERY SINGLE TIME');
    } else if (hasCat && hasCode) {
      captions.push('WHEN YOU FINALLY UNDERSTAND THE CODE');
      if (count > 1) captions.push('JK STILL CONFUSED');
    } else if (hasCode && hasConfused) {
      captions.push('TRYING TO UNDERSTAND');
      if (count > 1) captions.push('THIS LEGACY CODE');
    } else if (hasCode || hasWork) {
      captions.push(this.randomChoice([
        'WHEN THE CODE WORKS',
        'ME DEBUGGING AT 3AM',
        'CODING LIFE BE LIKE'
      ]));
      if (count > 1) {
        captions.push(this.randomChoice([
          'BUT YOU DON\'T KNOW WHY',
          'SUFFERING FROM SUCCESS',
          'THIS IS FINE'
        ]));
      }
    } else if (hasWhen) {
      captions.push('ME WHEN');
      if (count > 1) {
        captions.push(this.randomChoice([
          'RELATABLE CONTENT',
          'EVERY SINGLE TIME',
          'WHY THO'
        ]));
      }
    } else {
      // Generic funny captions
      captions.push(this.randomChoice([
        'NOBODY:',
        'ME:',
        'THAT MOMENT WHEN'
      ]));
      if (count > 1) {
        captions.push(this.randomChoice([
          'RELATABLE CONTENT',
          'BIG MOOD',
          'THIS IS FINE',
          'SUFFERING FROM SUCCESS'
        ]));
      }
    }

    return captions.slice(0, count);
  }

  /**
   * Generate captions with suggested positions
   */
  async generateCaptionsWithPositions(idea, imageAnalysis = null, count = 2) {
    const captions = await this.generateCaptions(idea, imageAnalysis, count);
    const positions = this.suggestPositions(count);

    return {
      captions,
      positions,
      aiGenerated: !!this.openai
    };
  }

  /**
   * Suggest optimal text positions based on image analysis
   */
  suggestPositions(count, imageAnalysis = null) {
    // Default positions
    const defaultPositions = ['top', 'bottom', 'center'];

    // TODO: Use image analysis to suggest better positions
    // For now, use defaults
    return defaultPositions.slice(0, count);
  }

  /**
   * Random choice helper
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Check if AI is available
   */
  isAIAvailable() {
    return !!(this.geminiKey || this.openai);
  }

  /**
   * Get model info for documentation
   */
  getModelInfo() {
    if (this.geminiKey) {
      return {
        available: true,
        model: 'Gemini 1.5 Flash',
        type: 'Large Language Model (LLM)',
        purpose: 'Generate creative, context-aware meme captions',
        cost: 'FREE (1500 requests/day)',
        provider: 'Google Gemini (FREE!)'
      };
    } else if (this.openai) {
      return {
        available: true,
        model: 'GPT-3.5-Turbo',
        type: 'Transformer (Large Language Model)',
        purpose: 'Generate creative, context-aware meme captions',
        cost: '$0.002 per generation',
        provider: 'OpenAI'
      };
    } else {
      return {
        available: false,
        model: 'Template-based (fallback)',
        type: 'Rule-based matching',
        purpose: 'Generate captions from templates',
        cost: 'FREE',
        provider: 'Local templates'
      };
    }
  }
}

export default new AICaptionGenerator();

