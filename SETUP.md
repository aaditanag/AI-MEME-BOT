# 🚀 Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `canvas` - Image text rendering (requires native build tools)
- `multer` - File uploads
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### 2. Configure Environment (Optional)

Create a `.env` file in the project root:

```bash
PORT=5000
NODE_ENV=development

# Optional: For real AI image generation
# Get free API key at: https://replicate.com/account/api-tokens
REPLICATE_API_KEY=
```

**Without API Key:** System works perfectly with placeholder images. Text overlay functionality is fully operational!

### 3. Install Canvas Dependencies (If Needed)

The `canvas` package requires native dependencies:

#### **Windows:**
```powershell
# Install Windows Build Tools (run as Administrator)
npm install --global windows-build-tools

# Or install Visual Studio Build Tools manually:
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++" workload
```

#### **macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or install via Homebrew
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### 4. Start the Backend

```bash
npm start
```

You should see:
```
🚀 Meme Generator Backend running on http://localhost:5000
📝 Auto mode: AI generates image + captions
🖼️  Semi-auto mode: Your image + AI captions
✍️  Manual mode: Your image + your text
```

### 5. Open the Frontend

**Option A: Direct File**
```bash
# Simply open in browser
open frontend/index.html
# or
start frontend/index.html (Windows)
```

**Option B: Local Server (Recommended)**
```bash
cd frontend
npx serve
```

Then open: `http://localhost:3000`

## 🎯 Testing

### Test Auto Mode:

1. Open the frontend
2. Select **"Full Auto (AI Image + AI Text)"**
3. Enter a prompt:
   ```
   a confused programmer staring at their code at 3am
   ```
4. Click **"Generate Meme"**
5. Wait ~2 seconds (placeholder mode) or ~30 seconds (with Replicate API)

Expected output:
- ✅ Generated meme image with text overlays
- ✅ Complete JSON specification displayed

### Test Semi-Auto Mode:

1. Select **"Semi Auto (Your Image + AI Text)"**
2. Upload any image (JPG, PNG)
3. Optionally enter context: `when you forget to save`
4. Click **"Generate Meme"**

Expected output:
- ✅ Your image with AI-generated captions

### Test Manual Mode:

1. Select **"Manual (Your Image + Your Text)"**
2. Upload an image
3. Enter your caption: `WHEN THE CODE WORKS ON FIRST TRY`
4. Click **"Generate Meme"**

Expected output:
- ✅ Your image with your text at the top

## 🔧 Troubleshooting

### "Canvas" Installation Fails

**Issue:** Native module build errors

**Solutions:**

**Windows:**
1. Install Visual Studio Build Tools
2. Install Python 3.x
3. Run as Administrator:
   ```powershell
   npm install --global windows-build-tools
   npm install canvas
   ```

**macOS:**
1. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
2. Install dependencies:
   ```bash
   brew install pkg-config cairo pango
   npm install canvas
   ```

**Linux:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev
npm install canvas
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:** Change port in `.env`:
```bash
PORT=5001
```

Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Errors in Browser

**Issue:** Frontend can't connect to backend

**Solutions:**
1. Make sure backend is running (`npm start`)
2. Check console for the correct port
3. Verify `cors` is enabled in `backend/server.js`

### Images Not Generating

**Issue:** Only getting placeholder images

**Solution:** This is expected behavior without an API key!

To enable real AI generation:
1. Sign up at https://replicate.com
2. Get API token from https://replicate.com/account/api-tokens
3. Add to `.env`:
   ```
   REPLICATE_API_KEY=r8_your_key_here
   ```
4. Restart backend

### Text Not Appearing on Image

**Issue:** Image shows but no text

**Check:**
1. Canvas module installed correctly (`npm list canvas`)
2. Backend logs for errors
3. Browser console for errors

**Debug:**
```bash
# Test canvas installation
node -e "const { createCanvas } = require('canvas'); console.log('Canvas OK')"
```

## 📊 Verify Installation

### Quick Health Check:

```bash
# Test backend endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Full System Test:

```bash
# Test auto generation with curl
curl -X POST http://localhost:5000/generate \
  -F "mode=auto" \
  -F "idea=a happy cat"

# Should return JSON with memeSpec and imageUrl
```

## 🎨 Optional: Add Custom Fonts

To use custom fonts for text rendering:

1. Create a `backend/fonts/` directory
2. Add font files (e.g., `impact.ttf`, `comic-sans.ttf`)
3. Register in `backend/services/textCompositor.js`:
   ```javascript
   registerFont('./backend/fonts/impact.ttf', { family: 'Impact' });
   ```

Download Impact font:
- Windows: Already installed
- macOS: Available in Font Book
- Linux: `sudo apt-get install ttf-mscorefonts-installer`

## 📦 Production Deployment

### Environment Setup:
```bash
NODE_ENV=production
PORT=5000
REPLICATE_API_KEY=your_production_key
```

### Process Management:
```bash
# Using PM2
npm install -g pm2
pm2 start backend/server.js --name memebot
pm2 save
pm2 startup
```

### Docker (Optional):
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t memebot .
docker run -p 5000:5000 -e REPLICATE_API_KEY=xxx memebot
```

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Canvas module working (no errors on `npm start`)
- [ ] Backend running on port 5000
- [ ] Frontend accessible in browser
- [ ] Auto mode generates memes (with text)
- [ ] Semi-auto mode adds text to uploaded images
- [ ] Manual mode works with custom captions
- [ ] JSON spec displayed in output

## 🆘 Still Having Issues?

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Clean install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check logs:**
   ```bash
   npm start
   # Look for errors in console output
   ```

4. **Test individual services:**
   ```javascript
   // Test orchestrator
   import orchestrator from './backend/services/memeOrchestrator.js';
   console.log(orchestrator.generateMemeSpec('test meme', ['HELLO'], ['top']));
   ```

## 📞 Need Help?

- Check `README.md` for architecture details
- Review `backend/server.js` for API endpoints
- Inspect browser console for frontend errors
- Check backend console logs for service errors

---

Happy meme generating! 🎉

