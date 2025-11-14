# 🎨 AI Meme Generator with Auto Mode

A powerful meme generator that converts text prompts into fully specified meme images with AI-generated captions and images.

## ✨ Features

### 🤖 **Auto Mode** (Full AI)
- Enter a meme idea/prompt
- AI generates the base image
- AI creates witty captions
- Text is automatically overlaid
- Get a complete meme in seconds!

### 🖼️ **Semi-Auto Mode** (Your Image + AI Captions)
- Upload your own image
- AI generates clever captions
- Text is overlaid automatically

### ✍️ **Manual Mode** (Full Control)
- Upload your image
- Write your own captions
- Full customization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment (optional):**
Create a `.env` file in the root directory:
```bash
PORT=5000
NODE_ENV=development

# Optional: Add Replicate API key for AI image generation
# Get one at https://replicate.com/account/api-tokens
REPLICATE_API_KEY=your_key_here
```

> **Note:** Without an API key, the system uses placeholder images. The text overlay still works perfectly!

3. **Start the backend:**
```bash
npm start
```

4. **Open the frontend:**
Open `frontend/index.html` in your browser, or serve it with:
```bash
cd frontend
npx serve
```

## 🎯 How It Works

### Auto Mode Flow

1. **User Input:** "just a normal monkey meme"

2. **Caption Generation:** 
   - AI analyzes the prompt
   - Generates contextual captions
   - Example: "ME WAITING FOR" / "THE WEEKEND"

3. **Meme Specification:**
   - Creates complete JSON spec with:
     - Canvas dimensions (1024×1024)
     - Image generation prompt
     - Text overlay positions (normalized coords)
     - Font styling (Impact, white fill, black stroke)
     - Safety settings

4. **Image Generation:**
   - Generates base image via Replicate/SDXL
   - Or uses placeholder if no API key

5. **Text Composition:**
   - Uses `node-canvas` to render text
   - Applies Impact font with proper stroke
   - Positions text at normalized coordinates
   - Word wrapping and size optimization

6. **Output:**
   - Complete meme image (PNG)
   - Full JSON specification

## 📋 Architecture

```
memebot/
├── backend/
│   ├── server.js                    # Express server
│   └── services/
│       ├── memeOrchestrator.js      # Prompt → JSON spec converter
│       ├── captionGenerator.js      # AI caption generation
│       ├── imageGenerator.js        # Image API integration
│       └── textCompositor.js        # Text overlay rendering
├── frontend/
│   ├── index.html                   # UI
│   ├── app.js                       # Frontend logic
│   └── style.css                    # Styling
└── agents/
    ├── meme_json_orchestrator.agent # Orchestrator instructions
    └── meme_layout_architect.agent  # Layout architect instructions
```

## 🔧 Services

### `memeOrchestrator.js`
Converts user prompts into fully specified meme JSON schemas:
- Position mapping (top/bottom/center)
- Template detection (Drake, Distracted Boyfriend, etc.)
- Style analysis (photo-realistic, cartoon, etc.)
- Validation

### `captionGenerator.js`
Generates contextual meme captions:
- Analyzes idea format (reaction, comparison, classic)
- Creates appropriate captions
- Handles position hints

### `imageGenerator.js`
Integrates with image generation APIs:
- Replicate (SDXL)
- Fallback to placeholders
- Image downloading

### `textCompositor.js`
Renders text overlays on images:
- Uses `node-canvas` for rendering
- Impact font with stroke and shadow
- Word wrapping and alignment
- Normalized coordinate system

## 📊 Meme JSON Schema

Complete specification format:

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
    "references": ["monkey meme"],
    "safety": {
      "nsfw_allowed": false,
      "violence_allowed": "none"
    }
  },
  "source_image": {
    "mode": "generate",
    "prompt": "close-up photo of a monkey...",
    "negative_prompt": "blurry, distorted...",
    "seed": null
  },
  "text_overlays": [
    {
      "id": "caption1",
      "text": "ME WAITING FOR",
      "position_norm": { "x": 0.5, "y": 0.07 },
      "font_family": "Impact",
      "font_size_norm": 0.08,
      "fill_color": "#FFFFFF",
      "stroke": {
        "color": "#000000",
        "width_norm": 0.006
      }
    }
  ]
}
```

## 🎨 Position System

Uses normalized coordinates [0,1] for resolution independence:

| Position | x, y | Bbox |
|----------|------|------|
| `top` | 0.5, 0.07 | 0.05, 0.02, 0.90, 0.20 |
| `bottom` | 0.5, 0.93 | 0.05, 0.78, 0.90, 0.20 |
| `center` | 0.5, 0.5 | 0.10, 0.35, 0.80, 0.30 |
| `top-left` | 0.10, 0.10 | 0.05, 0.05, 0.45, 0.25 |

## 🔌 API Endpoints

### `POST /generate`
Generate a meme

**Request (multipart/form-data):**
- `mode`: "auto" | "semiauto" | "manual"
- `idea`: Meme idea/prompt (required for auto)
- `image`: File (required for semiauto/manual)
- `manualCaption`: Text (required for manual)

**Response:**
```json
{
  "success": true,
  "memeSpec": { /* full JSON spec */ },
  "imageUrl": "data:image/png;base64,...",
  "mode": "auto"
}
```

### `GET /health`
Health check endpoint

## 🧪 Testing

### Test Auto Mode:
1. Select "Full Auto" mode
2. Enter: "a confused cat looking at a computer"
3. Click "Generate Meme"
4. Wait for generation (~10-30 seconds with API, instant with placeholder)

### Test Semi-Auto:
1. Select "Semi Auto" mode
2. Upload any image
3. Enter an idea (optional)
4. AI generates captions for your image

### Test Manual:
1. Select "Manual" mode
2. Upload an image
3. Type your caption
4. Get image with text overlay

## 📦 Dependencies

- **express**: Web server
- **canvas**: Text rendering on images
- **multer**: File upload handling
- **cors**: Cross-origin requests
- **dotenv**: Environment configuration

## 🎯 Future Enhancements

- [ ] Multiple image generation backends (OpenAI DALL-E, Midjourney)
- [ ] Custom font uploads
- [ ] Multi-panel meme support (2-panel, 4-panel)
- [ ] Template library (Drake, Distracted Boyfriend, etc.)
- [ ] Meme history/gallery
- [ ] Social media sharing
- [ ] Advanced text effects (rotation, gradients, animations)

## 🤝 Contributing

Contributions welcome! The modular architecture makes it easy to:
- Add new image generation providers
- Implement new caption generation strategies
- Add meme templates
- Enhance text rendering

## 📝 License

MIT License - feel free to use in your projects!

## 🐛 Troubleshooting

### "Canvas" module errors:
The `canvas` package requires native dependencies. On Windows, you may need:
- Visual Studio Build Tools
- Python 3.x

Install with: `npm install --global windows-build-tools` (as admin)

### Backend not starting:
- Check if port 5000 is available
- Verify Node.js version (18+)
- Run `npm install` to ensure dependencies are installed

### Images not generating:
- Add a Replicate API key to `.env`
- Or use placeholder mode (works without API key)

## 💡 Tips

- **Better captions**: Be specific in your prompt ("a tired programmer debugging at 3am")
- **Image quality**: Use Replicate API key for real AI-generated images
- **Customization**: Edit the JSON spec for fine-grained control
- **Performance**: Placeholder mode is instant, API generation takes 10-30s

---

Made with ❤️ for meme enthusiasts everywhere

