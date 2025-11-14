# ⚡ Quick Start - Get Running in 60 Seconds

## 1. Install (20 seconds)
```bash
npm install
```

## 2. Start Backend (5 seconds)
```bash
npm start
```

You should see:
```
🚀 Meme Generator Backend running on http://localhost:5000
```

## 3. Open Frontend (5 seconds)
Double-click: `frontend/index.html`

Or use a local server:
```bash
cd frontend
npx serve
```

## 4. Generate Your First Meme (30 seconds)

### Try This:

1. **Keep "Full Auto" selected**
2. **Paste this prompt:**
   ```
   a tired programmer debugging code at 3am with coffee
   ```
3. **Click "Generate Meme"**

In a few seconds, you'll see:
- ✅ A meme image with text overlays
- ✅ The complete JSON specification

### More Prompts to Try:

```
just a normal monkey meme
```

```
a confused cat staring at a computer screen
```

```
drake meme but about choosing pizza over salad
```

```
a dog waiting patiently for treats
```

## 🎨 How It Works

**You type:** "a tired programmer debugging at 3am"

**AI does:**
1. Generates image prompt
2. Creates witty captions ("WHEN YOU'VE BEEN DEBUGGING", "FOR 6 HOURS STRAIGHT")
3. Generates or uses placeholder image
4. Overlays text with Impact font
5. Returns complete meme!

## 📋 Three Modes

### 🤖 Auto Mode (Default)
- Just type your idea
- AI does everything
- Get instant memes!

### 🖼️ Semi-Auto Mode
- Upload YOUR image
- AI writes captions
- Perfect for reaction memes

### ✍️ Manual Mode
- Upload YOUR image
- Write YOUR text
- Full control!

## 🎯 Pro Tips

✨ **Be specific:** "a confused developer reading Stack Overflow at 2am" is better than "programmer"

🎨 **Try templates:** Mention "drake", "distracted boyfriend", or "expanding brain" for template styles

🚀 **No API key needed:** Works perfectly with placeholder images for testing

💡 **Check the JSON:** Learn the meme specification format for advanced customization

## 🔥 Advanced: Add Real AI Images

1. Sign up at https://replicate.com (free tier)
2. Get API token: https://replicate.com/account/api-tokens
3. Create `.env` file:
   ```bash
   REPLICATE_API_KEY=r8_your_key_here
   ```
4. Restart backend
5. Generate memes with real AI images! 🎨

## 🐛 Troubleshooting

**Backend won't start?**
- Install dependencies: `npm install`
- Check Node.js version: `node -v` (need 18+)

**Canvas errors?**
- Windows: Install Visual Studio Build Tools
- Mac: `xcode-select --install`
- Linux: `sudo apt-get install build-essential libcairo2-dev`

**Port 5000 in use?**
- Change port in `.env`: `PORT=5001`
- Update frontend: Change port in `app.js` line 52

## ✅ Success!

You should now see:
- ✅ Backend running
- ✅ Frontend opened
- ✅ Memes generating
- ✅ Text overlays working

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `SETUP.md` for detailed setup guide
- Explore the JSON spec to understand the format
- Customize caption generation in `backend/services/captionGenerator.js`
- Add your own meme templates

---

**Need help?** Check the full docs in README.md or SETUP.md

