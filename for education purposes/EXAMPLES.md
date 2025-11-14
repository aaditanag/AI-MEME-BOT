# 💡 Example Prompts & Expected Outputs

## 🤖 Auto Mode Examples

### Example 1: Simple Animal Meme
**Prompt:**
```
just a normal monkey meme
```

**Generated Captions:**
- Top: "ME WAITING FOR"
- Bottom: "THE WEEKEND"

**Image:** Close-up photo of monkey looking at camera

**Style:** Classic, photo-realistic

---

### Example 2: Programmer Humor
**Prompt:**
```
a tired programmer debugging code at 3am with coffee
```

**Generated Captions:**
- Top: "WHEN YOU'VE BEEN DEBUGGING"
- Bottom: "FOR 6 HOURS STRAIGHT"

**Image:** Tired person at desk, dark room, monitors glowing, coffee mug

**Style:** Relatable, photo-realistic

---

### Example 3: Reaction Meme
**Prompt:**
```
when you accidentally delete your code and it still works
```

**Generated Captions:**
- Top: "WHEN YOU DELETE YOUR CODE"
- Bottom: "AND IT ACTUALLY WORKS"

**Image:** Confused/surprised person

**Style:** Reaction format

---

### Example 4: Template Detection
**Prompt:**
```
drake meme about choosing pizza over salad
```

**Generated Captions:**
- Panel 1: "SALAD"
- Panel 2: "PIZZA"

**Image:** Drake template reference

**Style:** Two-panel template

---

### Example 5: Wholesome Meme
**Prompt:**
```
a cute dog patiently waiting for treats
```

**Generated Captions:**
- Top: "ME WAITING FOR"
- Bottom: "GOOD THINGS"

**Image:** Patient dog with expectant expression

**Style:** Wholesome, photo-realistic

---

### Example 6: Absurd Humor
**Prompt:**
```
confused cat staring at a computer screen showing error messages
```

**Generated Captions:**
- Top: "ME TRYING TO UNDERSTAND"
- Bottom: "THIS ERROR MESSAGE"

**Image:** Cat looking confused at screen

**Style:** Absurd, relatable

---

## 🎯 More Prompt Ideas to Try

### Work/Study:
```
- "when your code works on the first try"
- "me pretending to understand the meeting"
- "student before vs after finals"
- "boss: we need this done by tomorrow"
```

### Daily Life:
```
- "waking up on Monday vs Friday"
- "me trying to adult"
- "expectation vs reality of cooking"
- "when someone says they'll be ready in 5 minutes"
```

### Tech/Gaming:
```
- "downloading a 100GB game"
- "updating drivers at 2am"
- "one more game before bed"
- "my PC running vs my laptop running"
```

### Animals:
```
- "cat judging your life choices"
- "dog excited about literally anything"
- "hamster running on wheel of life"
- "bird screaming into the void"
```

### Template References:
```
- "distracted boyfriend meme but it's programming languages"
- "expanding brain meme about coffee consumption"
- "two buttons meme: sleep vs one more episode"
- "is this a butterfly meme about bugs in code"
```

---

## 📋 Expected JSON Structure

For prompt: **"just a normal monkey meme"**

```json
{
  "version": "1.0",
  "canvas": {
    "width_px": 1024,
    "height_px": 1024,
    "aspect_ratio": "1:1",
    "background_color": "#000000"
  },
  "style": {
    "meme_family": "classic",
    "visual_style": "photo-realistic",
    "references": ["monkey meme", "return to monke"],
    "safety": {
      "nsfw_allowed": false,
      "violence_allowed": "none"
    }
  },
  "source_image": {
    "mode": "generate",
    "prompt": "close-up photo of a monkey looking directly at camera, neutral expression, clear face, naturalistic lighting, sharp focus, professional wildlife photography",
    "negative_prompt": "blurry, distorted, cartoon, anime, low quality, text, watermark, violence, graphic content",
    "seed": null
  },
  "layout": {
    "panels": 1,
    "grid": {
      "rows": 1,
      "cols": 1,
      "gutter_norm": 0.02,
      "panel_order": [0]
    },
    "safe_margins_norm": {
      "top": 0.05,
      "right": 0.05,
      "bottom": 0.05,
      "left": 0.05
    }
  },
  "text_overlays": [
    {
      "id": "caption1",
      "text": "ME WAITING FOR",
      "case": "uppercase",
      "font_family": "Impact",
      "font_weight": 900,
      "font_style": "normal",
      "font_size_norm": 0.08,
      "letter_spacing_em": 0,
      "line_height_em": 1.05,
      "fill_color": "#FFFFFF",
      "stroke": {
        "color": "#000000",
        "width_norm": 0.006,
        "join": "round"
      },
      "shadow": {
        "color": "#000000",
        "blur_norm": 0.01,
        "dx_norm": 0,
        "dy_norm": 0,
        "opacity": 0.5
      },
      "position_norm": {
        "x": 0.5,
        "y": 0.07
      },
      "anchor": "center",
      "bbox_norm": {
        "x": 0.05,
        "y": 0.02,
        "w": 0.90,
        "h": 0.20
      },
      "align": "center",
      "wrap": "balance",
      "max_lines": 3,
      "rotation_deg": 0,
      "opacity": 1.0,
      "z_index": 10,
      "panel_index": 0
    },
    {
      "id": "caption2",
      "text": "THE WEEKEND",
      "case": "uppercase",
      "font_family": "Impact",
      "font_weight": 900,
      "font_style": "normal",
      "font_size_norm": 0.08,
      "letter_spacing_em": 0,
      "line_height_em": 1.05,
      "fill_color": "#FFFFFF",
      "stroke": {
        "color": "#000000",
        "width_norm": 0.006,
        "join": "round"
      },
      "shadow": {
        "color": "#000000",
        "blur_norm": 0.01,
        "dx_norm": 0,
        "dy_norm": 0,
        "opacity": 0.5
      },
      "position_norm": {
        "x": 0.5,
        "y": 0.93
      },
      "anchor": "center",
      "bbox_norm": {
        "x": 0.05,
        "y": 0.78,
        "w": 0.90,
        "h": 0.20
      },
      "align": "center",
      "wrap": "balance",
      "max_lines": 3,
      "rotation_deg": 0,
      "opacity": 1.0,
      "z_index": 10,
      "panel_index": 0
    }
  ],
  "branding": {
    "watermark_text": "",
    "watermark_opacity": 0.0,
    "watermark_position": "bottom-right"
  },
  "accessibility": {
    "alt_text": "Monkey meme with text ME WAITING FOR at top and THE WEEKEND at bottom",
    "long_desc": "Classic meme format featuring a monkey with white Impact font text overlays expressing anticipation for the weekend"
  },
  "generation": {
    "engine": "generic",
    "cfg_scale": 7.0,
    "steps": 30,
    "sampler": "default",
    "upscale": {
      "enabled": false,
      "target_px": null
    }
  },
  "metadata": {
    "idea_summary": "Normal monkey meme with classic top and bottom text format",
    "inferred_emotion": "deadpan",
    "color_palette": ["#FFFFFF", "#000000"],
    "created_at": "2024-11-14T00:00:00Z"
  }
}
```

---

## 🎨 Visual Layout Examples

### Classic Top/Bottom:
```
┌─────────────────────────────────┐
│                                 │
│     WHEN YOU FORGET TO SAVE    │  ← Top caption (y: 0.07)
│                                 │
│                                 │
│         [  IMAGE  ]             │
│                                 │
│                                 │
│    YOUR WORK FOR 3 HOURS       │  ← Bottom caption (y: 0.93)
│                                 │
└─────────────────────────────────┘
```

### Center Overlay:
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         [  IMAGE  ]             │
│                                 │
│      THIS IS FINE              │  ← Center caption (y: 0.5)
│                                 │
│         [  IMAGE  ]             │
│                                 │
└─────────────────────────────────┘
```

### Two-Panel:
```
┌───────────────┬───────────────┐
│               │               │
│   BEFORE      │   AFTER       │  ← Labels
│               │               │
│  [ IMAGE 1 ]  │  [ IMAGE 2 ]  │
│               │               │
│               │               │
└───────────────┴───────────────┘
```

---

## 🔧 Customization Examples

### Modify Caption Position:
```javascript
// In captionGenerator.js or as API parameter
positions = ['center']  // Single center caption
positions = ['top', 'center', 'bottom']  // Three captions
positions = ['top-left', 'top-right']  // Corner captions
```

### Change Font Style:
```javascript
// In memeOrchestrator.js
overlay.font_family = "Comic Sans MS"
overlay.font_size_norm = 0.10  // 10% of height (larger)
overlay.case = "title"  // Title Case Instead Of UPPERCASE
```

### Adjust Text Effects:
```javascript
// More dramatic stroke
overlay.stroke.width_norm = 0.012  // Double thickness

// Add shadow
overlay.shadow.blur_norm = 0.03
overlay.shadow.dy_norm = 0.01  // Offset downward

// Change colors
overlay.fill_color = "#FFFF00"  // Yellow text
overlay.stroke.color = "#FF0000"  // Red outline
```

---

## 📊 API Usage Examples

### cURL - Auto Mode:
```bash
curl -X POST http://localhost:5000/generate \
  -F "mode=auto" \
  -F "idea=a confused cat looking at code"
```

### JavaScript - Frontend:
```javascript
const formData = new FormData();
formData.append('mode', 'auto');
formData.append('idea', 'programmer drinking coffee at 3am');

const response = await fetch('http://localhost:5000/generate', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.memeSpec);
document.getElementById('image').src = data.imageUrl;
```

### Node.js - Backend:
```javascript
import fetch from 'node-fetch';
import FormData from 'form-data';

const form = new FormData();
form.append('mode', 'auto');
form.append('idea', 'monkey waiting for weekend');

const response = await fetch('http://localhost:5000/generate', {
  method: 'POST',
  body: form
});

const meme = await response.json();
```

---

## 🎯 Expected Behavior

### Successful Generation:
```json
{
  "success": true,
  "memeSpec": { /* full JSON spec */ },
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "mode": "auto"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Please provide a meme idea",
  "details": "mode=auto requires idea parameter"
}
```

---

## 💡 Tips for Best Results

1. **Be Specific:** "tired programmer with coffee" > "programmer"
2. **Include Context:** "debugging at 3am" gives better captions
3. **Mention Emotions:** "confused", "excited", "frustrated"
4. **Reference Templates:** "drake meme", "distracted boyfriend"
5. **Keep It Simple:** One clear idea works better than multiple concepts

---

Happy meme generating! 🎨

