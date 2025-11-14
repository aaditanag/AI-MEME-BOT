# API Key Setup Guide
## Get Your AI Models Running in 15 Minutes! 🚀

This guide will help you set up all three AI models for the competition.

---

## 🎯 Quick Start Checklist

- [ ] OpenAI API Key (GPT - Caption Generation) - **CRITICAL**
- [ ] Replicate API Key (CLIP - Image Analysis) - **CRITICAL**
- [ ] NanoBanana API Key (Image Generation) - **Recommended**

**Minimum Required:** OpenAI + Replicate = ~₹10 ($0.12) for 3-4 demo memes

---

## 1️⃣ OpenAI API Key (GPT Caption Generation)

### Why You Need This:
✅ **REQUIRED for competition** - This is the NLP/Transformer model  
✅ Generates creative, funny captions (not templates!)  
✅ Very cheap: ~₹0.17 per meme

### Setup Steps:

#### Step 1: Sign Up
1. Go to: https://platform.openai.com/signup
2. Create account (use email or Google)
3. Verify your email

#### Step 2: Add Billing
1. Go to: https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Add credit/debit card (international cards work)
4. Add minimum $5 credit (₹415) - this will last for 2000+ memes!

#### Step 3: Create API Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "Meme Generator Competition"
4. Copy the key (starts with `sk-`)
5. **IMPORTANT:** Save it immediately! You can't see it again!

#### Step 4: Add to .env
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Testing:
```bash
# Should work immediately after setup
npm start
# Visit: http://localhost:5000/ai-models
# Check: captionGeneration.available = true
```

### Cost Examples:
- 1 meme: $0.002 (~₹0.17)
- 10 memes: $0.02 (~₹1.70)
- 100 memes: $0.20 (~₹17)
- **$5 credit = ~2500 memes!** 🎉

---

## 2️⃣ Replicate API Token (CLIP Image Analysis)

### Why You Need This:
✅ **REQUIRED for competition** - Computer Vision component  
✅ Understands image content and emotions  
✅ Helps GPT generate better captions  
✅ Very cheap: ~₹0.08 per meme

### Setup Steps:

#### Step 1: Sign Up
1. Go to: https://replicate.com/signup
2. Create account (GitHub login recommended)
3. Verify email

#### Step 2: Get Free Credits
- **FREE TIER:** $0.10 free credits (10-100 images)
- No credit card required for free tier!

#### Step 3: Add Billing (Optional)
1. Go to: https://replicate.com/account/billing
2. Add payment method if you want more credits
3. Pay-as-you-go pricing

#### Step 4: Get API Token
1. Go to: https://replicate.com/account/api-tokens
2. Your default token is already created!
3. Copy the token (starts with `r8_`)

#### Step 5: Add to .env
```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Testing:
```bash
npm start
# Visit: http://localhost:5000/ai-models
# Check: imageAnalysis.available = true
```

### Cost Examples:
- 1 image analysis: $0.001 (~₹0.08)
- 10 analyses: $0.01 (~₹0.80)
- 100 analyses: $0.10 (~₹8)

---

## 3️⃣ NanoBanana API Key (Image Generation)

### Why You Need This:
✅ Indian service, supports Indian payment methods  
✅ Very affordable: ₹3 per image  
✅ Fast generation (30-60 seconds)  
✅ Good quality (Stable Diffusion XL)

### Setup Steps:

#### Step 1: Sign Up
1. Go to: https://nanobanana.ai/
2. Click "Sign Up" or "Get Started"
3. Create account with email

#### Step 2: Add Credits
1. Go to Dashboard → Billing
2. Select credit package:
   - ₹300 = 100 images (₹3 each)
   - ₹600 = 200 images
   - ₹1500 = 500 images
3. Pay using:
   - UPI (PhonePe, Google Pay, Paytm)
   - Indian Debit/Credit Cards
   - NetBanking

#### Step 3: Get API Key
1. Go to Dashboard → API Keys
2. Click "Create New Key"
3. Copy the key (starts with `nb_`)

#### Step 4: Add to .env
```env
NANOBANANA_API_KEY=nb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Testing:
```bash
npm start
# Try generating a meme in Auto mode
# Should use NanoBanana for image generation
```

### Cost Examples:
- 1 meme: ₹3
- 10 memes: ₹30
- 100 memes: ₹300

---

## 💰 Total Cost for Competition Demo

### Recommended Package:
```
OpenAI:      $5 credit    = ₹415   (2500 memes worth)
Replicate:   $0 (FREE)    = ₹0     (free tier)
NanoBanana:  ₹300 package = ₹300   (100 images)
─────────────────────────────────────────────────
TOTAL:                      ₹715   (~$8.50)

This gives you 100 FULL DEMO MEMES! 🎉
```

### Minimum Package (for testing):
```
OpenAI:      $5 credit    = ₹415
Replicate:   FREE tier    = ₹0
NanoBanana:  Skip         = ₹0 (use Replicate fallback)
─────────────────────────────────────────────────
TOTAL:                      ₹415   (~$5)

This gives you 10-20 demo memes
```

---

## ⚙️ Complete .env File

After getting all keys, your `.env` should look like:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# AI Models (COMPETITION REQUIRED!)

# 1️⃣ Caption Generation (GPT)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx

# 2️⃣ Image Analysis (CLIP)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxx

# 3️⃣ Image Generation (Optional but recommended)
NANOBANANA_API_KEY=nb_xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### 1. Check AI Status
```bash
curl http://localhost:5000/ai-models
```

Should return:
```json
{
  "competition": {
    "satisfied": {
      "computerVision": true,     ← Should be true
      "nlpTextGeneration": true,  ← Should be true
      "imageGeneration": true     ← Should be true
    }
  }
}
```

### 2. Test Caption Generation
Generate a meme in **Auto Mode**:
- Open: http://localhost:3000 (frontend)
- Select: "Auto Mode"
- Enter idea: "when your code works on first try"
- Click: "Generate Meme"
- Check logs for: `🤖 Generating AI-powered captions with GPT...`

### 3. Test Image Analysis
Generate a meme in **Semi-Auto Mode**:
- Select: "Semi-Auto Mode"
- Upload an image
- Enter idea: "me trying to debug"
- Check logs for: `👁️  Analyzing image with CLIP...`

### 4. Check Costs
After generating a few memes, check your usage:
- OpenAI: https://platform.openai.com/usage
- Replicate: https://replicate.com/account
- NanoBanana: Dashboard → Usage

---

## 🚨 Troubleshooting

### Error: "OPENAI_API_KEY not found"
- Make sure `.env` file is in project root (not `ENV_TEMPLATE.txt`)
- Remove the `#` before the key
- Restart the server after editing `.env`

### Error: "Insufficient quota"
- OpenAI: Add more credits at https://platform.openai.com/account/billing
- Replicate: Add billing or wait for free tier reset
- NanoBanana: Add more credits in dashboard

### Error: "Invalid API key"
- Double-check you copied the entire key
- Make sure no spaces before/after the key
- Try regenerating the API key

### Server won't start after adding keys
```bash
# Stop any running servers
# Windows:
taskkill /F /IM node.exe

# Restart
npm start
```

---

## 💡 Tips for Competition Demo

1. **Test Before Demo Day**
   - Generate 5-10 test memes
   - Ensure all AI models are working
   - Check response times

2. **Prepare Backup**
   - Keep extra credits loaded
   - Have screenshots of working memes
   - Save generated memes in database

3. **Show the AI in Action**
   - Open browser console to show logs
   - Visit `/ai-models` endpoint during demo
   - Explain each AI model's role

4. **Cost Transparency**
   - Show the `/ai-models` endpoint
   - Mention the low cost per meme
   - Compare to other solutions

---

## 📞 Support

- **OpenAI:** https://help.openai.com/
- **Replicate:** support@replicate.com
- **NanoBanana:** Check website for support contact

---

## 🎉 You're Ready!

Once all three checkmarks are green in `/ai-models`, you have:
- ✅ Computer Vision (CLIP)
- ✅ NLP (GPT)
- ✅ Image Generation (Stable Diffusion)

**Your AI Meme Generator is competition-ready!** 🏆

Good luck! 🚀

