/**
 * Caption Generator Service
 * Generates witty meme captions based on ideas and context
 */

export class CaptionGenerator {
  /**
   * Generate captions from meme idea
   */
  async generateCaptions(idea, count = 2) {
    // Analyze the idea to generate contextual captions
    const analysis = this.analyzeIdea(idea);
    
    const captions = [];
    
    // Generate top caption
    if (analysis.format === 'classic') {
      captions.push(this.generateTopCaption(analysis));
      if (count > 1) {
        captions.push(this.generateBottomCaption(analysis));
      }
    } else if (analysis.format === 'reaction') {
      captions.push(this.generateReactionCaption(analysis));
    } else if (analysis.format === 'comparison') {
      captions.push(this.generateComparisonCaption(analysis, 'before'));
      if (count > 1) {
        captions.push(this.generateComparisonCaption(analysis, 'after'));
      }
    } else {
      // Default format
      captions.push(this.generateDefaultCaption(analysis));
      if (count > 1) {
        captions.push(this.generateDefaultCaption(analysis, true));
      }
    }

    return captions.slice(0, count);
  }

  /**
   * Analyze idea to determine caption style
   */
  analyzeIdea(idea) {
    const lowerIdea = idea.toLowerCase();
    
    let format = 'classic';
    let subject = '';
    let action = '';
    let emotion = 'neutral';

    // Detect format
    if (lowerIdea.includes('when') || lowerIdea.includes('me when')) {
      format = 'reaction';
    } else if (lowerIdea.includes('before') || lowerIdea.includes('after') || 
               lowerIdea.includes('vs') || lowerIdea.includes('versus')) {
      format = 'comparison';
    }

    // Extract subjects
    const subjects = ['monkey', 'dog', 'cat', 'programmer', 'developer', 'student', 
                     'teacher', 'mom', 'dad', 'friend', 'boss', 'me', 'nobody'];
    for (const s of subjects) {
      if (lowerIdea.includes(s)) {
        subject = s;
        break;
      }
    }

    // Extract actions/contexts
    const actions = ['working', 'coding', 'debugging', 'waiting', 'trying', 
                    'learning', 'studying', 'sleeping', 'eating'];
    for (const a of actions) {
      if (lowerIdea.includes(a)) {
        action = a;
        break;
      }
    }

    // Detect emotion
    const emotions = {
      happy: ['happy', 'excited', 'joy'],
      sad: ['sad', 'crying', 'depressed'],
      angry: ['angry', 'mad', 'furious'],
      confused: ['confused', 'what', 'huh'],
      tired: ['tired', 'exhausted', 'sleepy']
    };

    for (const [emote, keywords] of Object.entries(emotions)) {
      if (keywords.some(kw => lowerIdea.includes(kw))) {
        emotion = emote;
        break;
      }
    }

    return {
      format,
      subject: subject || 'me',
      action,
      emotion,
      original: idea
    };
  }

  /**
   * Generate top caption for classic format
   */
  generateTopCaption(analysis) {
    const templates = [
      `WHEN YOU ${analysis.action.toUpperCase()}`,
      `ME ${analysis.action.toUpperCase()}`,
      `${analysis.subject.toUpperCase()} ${analysis.action.toUpperCase()}`,
      `NOBODY:`,
      `${analysis.subject.toUpperCase()}:`,
      `POV: YOU'RE ${analysis.action.toUpperCase()}`
    ];

    return this.randomChoice(templates);
  }

  /**
   * Generate bottom caption for classic format
   */
  generateBottomCaption(analysis) {
    const templates = [
      `AND IT ACTUALLY WORKS`,
      `FOR THE 10TH TIME TODAY`,
      `AGAIN`,
      `BUT AT WHAT COST`,
      `SUFFERING FROM SUCCESS`,
      `THIS IS FINE`,
      `WHY THO`,
      `${analysis.subject.toUpperCase()} MOMENT`
    ];

    return this.randomChoice(templates);
  }

  /**
   * Generate reaction caption
   */
  generateReactionCaption(analysis) {
    return `WHEN YOU ${analysis.action.toUpperCase()} BUT ${this.randomChoice([
      'IT FAILS',
      'NOBODY ASKED',
      'IT ACTUALLY WORKS',
      'SOMETHING BREAKS',
      'THE WIFI DISCONNECTS'
    ])}`;
  }

  /**
   * Generate comparison caption
   */
  generateComparisonCaption(analysis, phase) {
    if (phase === 'before') {
      return `${analysis.subject.toUpperCase()} BEFORE ${analysis.action.toUpperCase()}`;
    } else {
      return `${analysis.subject.toUpperCase()} AFTER ${analysis.action.toUpperCase()}`;
    }
  }

  /**
   * Generate default caption
   */
  generateDefaultCaption(analysis, isBottom = false) {
    if (isBottom) {
      return `${analysis.subject.toUpperCase()} ENERGY`;
    }
    
    return analysis.original.substring(0, 50).toUpperCase();
  }

  /**
   * Random choice from array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate captions with specific positions
   */
  async generateCaptionsWithPositions(idea, count = 2) {
    const captions = await this.generateCaptions(idea, count);
    const positions = [];

    // Default positions based on count
    if (count === 1) {
      positions.push('center');
    } else if (count === 2) {
      positions.push('top', 'bottom');
    } else {
      positions.push('top', 'center', 'bottom');
    }

    return {
      captions,
      positions: positions.slice(0, count)
    };
  }
}

export default new CaptionGenerator();

