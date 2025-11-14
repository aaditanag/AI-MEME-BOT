# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ index.html  │  │   app.js    │  │      style.css         │  │
│  │             │──│             │  │  (UI Components)       │  │
│  │  UI Form    │  │  API Client │  │                        │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP POST /generate
                              │ (FormData: mode, idea, image)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     server.js                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │ Auto Mode  │  │ Semi-Auto  │  │  Manual Mode     │  │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬────────────┘  │   │
│  └────────┼───────────────┼───────────────┼───────────────┘   │
│           │               │               │                     │
│  ┌────────▼───────────────▼───────────────▼───────────────┐   │
│  │              SERVICE LAYER                              │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  memeOrchestrator.js                             │  │   │
│  │  │  • Prompt → JSON spec conversion                 │  │   │
│  │  │  • Position mapping (top/bottom/center)          │  │   │
│  │  │  • Template detection (Drake, etc.)              │  │   │
│  │  │  • Spec validation                               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  captionGenerator.js                             │  │   │
│  │  │  • Idea analysis (format, emotion, subject)      │  │   │
│  │  │  • Caption generation (contextual)               │  │   │
│  │  │  • Template matching (reaction, comparison)      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  imageGenerator.js                               │  │   │
│  │  │  • Replicate API integration (SDXL)              │  │   │
│  │  │  • Prediction polling                            │  │   │
│  │  │  • Placeholder fallback                          │  │   │
│  │  │  • Image downloading                             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  textCompositor.js                               │  │   │
│  │  │  • Canvas-based text rendering                   │  │   │
│  │  │  • Font management (Impact, fallback)            │  │   │
│  │  │  • Text effects (stroke, shadow)                 │  │   │
│  │  │  • Word wrapping & alignment                     │  │   │
│  │  │  • Normalized coordinate conversion              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────────┐         ┌──────────────────────────┐     │
│  │  Replicate API   │         │  Other APIs (optional)   │     │
│  │  (SDXL Model)    │         │  • OpenAI DALL-E         │     │
│  │                  │         │  • Stability AI          │     │
│  └──────────────────┘         └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Auto Mode

```
1. User Input
   ↓
   "a tired programmer debugging at 3am"
   ↓

2. Caption Generation (captionGenerator.js)
   ↓
   analyze_idea() → format: "reaction", subject: "programmer", action: "debugging"
   ↓
   generate_captions() → ["WHEN YOU'VE BEEN DEBUGGING", "FOR 6 HOURS STRAIGHT"]
   ↓

3. Meme Orchestration (memeOrchestrator.js)
   ↓
   generate_meme_spec(idea, captions, positions)
   ↓
   {
     canvas: { width: 1024, height: 1024 },
     source_image: {
       prompt: "tired programmer at desk, dark room, monitors glowing...",
       negative_prompt: "blurry, distorted..."
     },
     text_overlays: [
       {
         text: "WHEN YOU'VE BEEN DEBUGGING",
         position_norm: { x: 0.5, y: 0.07 },
         font_family: "Impact",
         fill_color: "#FFFFFF",
         stroke: { color: "#000000", width_norm: 0.006 }
       },
       {
         text: "FOR 6 HOURS STRAIGHT",
         position_norm: { x: 0.5, y: 0.93 },
         ...
       }
     ],
     ...
   }
   ↓

4. Image Generation (imageGenerator.js)
   ↓
   generate_image(spec) → Replicate API or placeholder
   ↓
   download_image(url) → Buffer
   ↓

5. Text Composition (textCompositor.js)
   ↓
   compose_meme(imageBuffer, spec)
   ↓
   • Load base image
   • Create canvas (1024×1024)
   • For each text overlay:
     - Calculate absolute positions from normalized coords
     - Set font (Impact, size = 0.08 * height = 82px)
     - Apply text effects (stroke, shadow)
     - Word wrap if needed
     - Render text
   ↓
   Final PNG buffer
   ↓

6. Response
   ↓
   {
     success: true,
     memeSpec: { /* full JSON */ },
     imageUrl: "data:image/png;base64,...",
     mode: "auto"
   }
```

## Component Responsibilities

### Frontend (`frontend/`)

**index.html**
- UI structure
- Mode selector (auto/semiauto/manual)
- File upload
- Text input
- Output display

**app.js**
- Mode switching logic
- Form data collection
- API communication
- Response rendering
- Error handling

**style.css**
- Responsive layout
- Visual styling
- Code display formatting

### Backend (`backend/`)

**server.js**
- Express app setup
- Route handling (`/generate`, `/health`)
- Mode routing (auto/semiauto/manual)
- Service orchestration
- Error handling
- Response formatting

### Services (`backend/services/`)

**memeOrchestrator.js**
- **Input:** idea (string), captions (array), positions (array)
- **Output:** Complete meme JSON spec
- **Responsibilities:**
  - Analyze idea (template detection, format, emotion)
  - Generate image prompt
  - Map positions to normalized coords
  - Create text overlay specs
  - Validate final spec
- **Key Methods:**
  - `generateMemeSpec()` - Main entry point
  - `analyzeIdea()` - Detect templates and characteristics
  - `generateTextOverlays()` - Create overlay specs
  - `validateSpec()` - Ensure spec correctness

**captionGenerator.js**
- **Input:** idea (string), count (number)
- **Output:** captions (array), positions (array)
- **Responsibilities:**
  - Analyze idea format (reaction, comparison, classic)
  - Extract subjects, actions, emotions
  - Generate contextual captions
  - Determine positions
- **Key Methods:**
  - `generateCaptions()` - Create captions
  - `analyzeIdea()` - Parse idea structure
  - `generateTopCaption()` - Top text templates
  - `generateBottomCaption()` - Bottom text templates

**imageGenerator.js**
- **Input:** meme spec (object)
- **Output:** image result (url + buffer)
- **Responsibilities:**
  - Call Replicate API (or alternatives)
  - Poll for completion
  - Download image
  - Fallback to placeholder
- **Key Methods:**
  - `generateImage()` - Main generation
  - `generateWithReplicate()` - Replicate integration
  - `pollPrediction()` - Wait for completion
  - `downloadImage()` - Fetch image

**textCompositor.js**
- **Input:** imageBuffer (Buffer), meme spec (object)
- **Output:** final meme buffer (Buffer)
- **Responsibilities:**
  - Load and render base image
  - Convert normalized coords to absolute pixels
  - Render text with effects
  - Handle word wrapping
  - Apply stroke, shadow, opacity
- **Key Methods:**
  - `composeMeme()` - Main composition
  - `drawTextOverlay()` - Render single overlay
  - `wrapText()` - Line breaking
  - `toTitleCase()` - Text formatting

## Meme JSON Spec

The core data structure that defines every aspect of a meme:

```javascript
{
  version: "1.0",
  
  // Canvas configuration
  canvas: {
    width_px: 1024,
    height_px: 1024,
    aspect_ratio: "1:1",
    background_color: "#000000"
  },
  
  // Style metadata
  style: {
    meme_family: "classic" | "two-panel" | "four-panel" | "template",
    visual_style: "photo-realistic" | "cartoon" | "screenshot",
    references: ["monkey meme", "return to monke"],
    safety: {
      nsfw_allowed: false,
      violence_allowed: "none"
    }
  },
  
  // Source image generation
  source_image: {
    mode: "generate" | "upload",
    prompt: "detailed image description...",
    negative_prompt: "things to avoid...",
    seed: null
  },
  
  // Layout for multi-panel memes
  layout: {
    panels: 1,
    grid: { rows: 1, cols: 1, gutter_norm: 0.02 },
    safe_margins_norm: { top: 0.05, right: 0.05, bottom: 0.05, left: 0.05 }
  },
  
  // Text overlays (max 3)
  text_overlays: [
    {
      id: "caption1",
      text: "WHEN YOU FORGET TO SAVE",
      case: "uppercase",
      
      // Font properties
      font_family: "Impact",
      font_weight: 900,
      font_size_norm: 0.08,  // 8% of canvas height
      letter_spacing_em: 0,
      line_height_em: 1.05,
      
      // Colors and effects
      fill_color: "#FFFFFF",
      stroke: { color: "#000000", width_norm: 0.006 },
      shadow: { color: "#000000", blur_norm: 0.01, opacity: 0.5 },
      
      // Position (normalized [0,1])
      position_norm: { x: 0.5, y: 0.07 },  // Center-top
      anchor: "center",
      bbox_norm: { x: 0.05, y: 0.02, w: 0.90, h: 0.20 },
      
      // Text layout
      align: "center",
      wrap: "balance",
      max_lines: 3,
      rotation_deg: 0,
      opacity: 1.0,
      z_index: 10,
      panel_index: 0
    }
  ],
  
  // Optional branding
  branding: {
    watermark_text: "",
    watermark_opacity: 0.0,
    watermark_position: "bottom-right"
  },
  
  // Accessibility
  accessibility: {
    alt_text: "Meme showing...",
    long_desc: "Full description..."
  },
  
  // Generation parameters
  generation: {
    engine: "generic",
    cfg_scale: 7.0,
    steps: 30,
    sampler: "default",
    upscale: { enabled: false, target_px: null }
  },
  
  // Metadata
  metadata: {
    idea_summary: "Original idea...",
    inferred_emotion: "deadpan" | "hype" | "wholesome" | "cringe",
    color_palette: ["#FFFFFF", "#000000"],
    created_at: "2024-01-01T00:00:00Z"
  }
}
```

## Normalized Coordinate System

All positions use normalized [0,1] values for resolution independence:

```
(0,0)                    (0.5,0)                     (1,0)
  ┌─────────────────────────┼─────────────────────────┐
  │                                                     │
  │         Top Caption Area (y: 0.02 - 0.22)         │
  │                                                     │
(0,0.5) ──────────────── Center (0.5, 0.5) ──────────── (1,0.5)
  │                                                     │
  │                                                     │
  │       Bottom Caption Area (y: 0.78 - 0.98)        │
  └─────────────────────────┼─────────────────────────┘
(0,1)                   (0.5,1)                      (1,1)
```

**Position Presets:**
```javascript
top:         { x: 0.5,  y: 0.07 }  // Center-top
bottom:      { x: 0.5,  y: 0.93 }  // Center-bottom
center:      { x: 0.5,  y: 0.50 }  // Center-center
top-left:    { x: 0.10, y: 0.10 }  // Upper left corner
center-left: { x: 0.20, y: 0.50 }  // Left side, centered vertically
```

**Conversion to pixels:**
```javascript
absoluteX = position_norm.x * canvas.width_px
absoluteY = position_norm.y * canvas.height_px
fontSize = font_size_norm * canvas.height_px
strokeWidth = stroke.width_norm * canvas.height_px
```

## Error Handling

```
User Request
     ↓
Server Validation
     ├─ Invalid mode → 400 Bad Request
     ├─ Missing required fields → 400 Bad Request
     └─ Valid ✓
           ↓
Service Processing
     ├─ Spec validation fails → 400 Bad Request
     ├─ Image generation fails → Use placeholder
     ├─ Text composition fails → 500 Server Error
     └─ Success ✓
           ↓
Response
     {
       success: true,
       memeSpec: {...},
       imageUrl: "..."
     }
```

## Performance Considerations

**Auto Mode:**
- Caption generation: ~50ms (local)
- Spec generation: ~10ms (local)
- Image generation: 
  - Placeholder: instant
  - Replicate API: 10-30 seconds
- Text composition: ~200ms (local)

**Optimization Strategies:**
1. Cache frequently used templates
2. Parallel API calls where possible
3. Stream large images instead of buffering
4. Implement rate limiting for API calls
5. Add Redis for session/spec caching

## Extension Points

### Add New Image Provider
```javascript
// backend/services/imageGenerator.js
async generateWithOpenAI(sourceImage, canvas) {
  // Implement OpenAI DALL-E integration
}
```

### Add Custom Font
```javascript
// backend/services/textCompositor.js
registerFont('./fonts/comic-sans.ttf', { family: 'Comic Sans' });
```

### Add New Caption Style
```javascript
// backend/services/captionGenerator.js
generateSarcasticCaption(analysis) {
  return `OH SURE, ${analysis.action.toUpperCase()} ALWAYS WORKS`;
}
```

### Add Template
```javascript
// backend/services/memeOrchestrator.js
templates = {
  ...existing,
  'success-kid': ['success', 'victory', 'winning']
}
```

## Security Considerations

1. **Input Validation:**
   - Sanitize user prompts
   - Validate file uploads (type, size)
   - Limit prompt length

2. **Content Safety:**
   - Check prompts for inappropriate content
   - Filter NSFW/violent imagery
   - Set safety flags in spec

3. **Rate Limiting:**
   - Limit requests per IP
   - Throttle expensive operations
   - Queue system for API calls

4. **API Keys:**
   - Store in environment variables
   - Never commit to version control
   - Rotate regularly

## Testing Strategy

**Unit Tests:**
- memeOrchestrator: spec generation, validation
- captionGenerator: caption creation, idea analysis
- textCompositor: coordinate conversion, text rendering

**Integration Tests:**
- Full auto mode flow
- Image upload + text overlay
- API integration (mock)

**E2E Tests:**
- Frontend → Backend → Response
- All three modes
- Error scenarios

---

This architecture is designed to be:
- ✅ **Modular:** Each service has a single responsibility
- ✅ **Extensible:** Easy to add new features
- ✅ **Testable:** Clear interfaces and dependencies
- ✅ **Scalable:** Can handle concurrent requests
- ✅ **Maintainable:** Well-documented and organized

