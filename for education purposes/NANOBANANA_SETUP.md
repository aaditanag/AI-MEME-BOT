# 🍌 NanoBanana API Setup Guide

## 💰 Pricing: ₹3 per image!

NanoBanana is an affordable Indian AI image generation service perfect for meme generation.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Sign Up for NanoBanana

1. Visit: **https://nanobanana.com** (or **https://app.nanobanana.com**)
2. Click "Sign Up" or "Get Started"
3. Create account with email/Google
4. Verify your email

### Step 2: Add Credits

1. Go to **Dashboard** → **Billing** or **Credits**
2. Click **"Add Credits"** or **"Recharge"**
3. Choose amount:
   - ₹100 = ~33 images
   - ₹500 = ~166 images
   - ₹1000 = ~333 images
4. Pay via:
   - UPI (Google Pay, PhonePe, Paytm)
   - Credit/Debit Card
   - Net Banking
5. Credits added instantly!

### Step 3: Get API Key

1. Go to **Dashboard** → **API Keys** or **Settings**
2. Click **"Create New API Key"** or **"Generate Key"**
3. Copy your API key (looks like: `nb_xxxxxxxxxxxxxxxxxx`)
4. **Keep it secret!** Don't share publicly

### Step 4: Add to Your Project

Open your `.env` file and add:

```bash
# NanoBanana API (Primary - ₹3 per image)
NANOBANANA_API_KEY=nb_your_key_here_xxxxxxxxxx

# Optional: Replicate as fallback
REPLICATE_API_KEY=
```

**Example:**
```bash
NANOBANANA_API_KEY=nb_sk_1234567890abcdef1234567890abcdef
```

### Step 5: Restart Server

```powershell
# Stop server (Ctrl+C in terminal)
# Then restart:
npm start
```

You'll see:
```
🍌 Using NanoBanana API for image generation...
```

---

## 🎯 How It Works

### When You Generate a Meme:

1. **Backend calls NanoBanana API** with your prompt
2. **NanoBanana generates image** (~10-30 seconds)
3. **Charges ₹3 from your credits**
4. **Returns image URL**
5. **Frontend displays meme**

### Cost Tracking:

- Each generation = ₹3
- Failed generations = Not charged
- Credits deducted only on success

---

## 💳 Billing Details

### How NanoBanana Billing Works:

1. **Prepaid System** - Buy credits first
2. **Per-Image Pricing** - ₹3 per successful generation
3. **Auto-deduct** - Credits deducted after successful generation
4. **No Subscription** - Pay as you go
5. **No Hidden Fees** - Just ₹3 per image

### Example Costs:

| Memes Generated | Cost (₹) |
|----------------|----------|
| 10 memes | ₹30 |
| 50 memes | ₹150 |
| 100 memes | ₹300 |
| 500 memes | ₹1,500 |

### When You're Charged:

✅ **Charged:**
- Successful image generation
- Image delivered to you

❌ **NOT Charged:**
- Failed generation (error)
- Timeout
- Invalid prompt
- Server error

---

## 📊 Monitoring Usage

### Check Credits in Dashboard:

1. Login to https://app.nanobanana.com
2. Dashboard shows:
   - Current credit balance
   - Usage history
   - Cost per generation
   - Total images generated

### In Your App:

The response includes cost info:
```json
{
  "image_url": "https://...",
  "cost": 3,
  "credits_remaining": 247
}
```

---

## 🔧 Configuration Options

### .env File:

```bash
# Required
NANOBANANA_API_KEY=nb_your_key_here

# Optional: Choose model
NANOBANANA_MODEL=sdxl-1.0  # or sd-1.5, flux-schnell

# Optional: Timeout
NANOBANANA_TIMEOUT=120  # seconds
```

### Available Models:

| Model | Quality | Speed | Best For |
|-------|---------|-------|----------|
| `sdxl-1.0` | High | Medium | Memes, detailed images |
| `sd-1.5` | Good | Fast | Quick generations |
| `flux-schnell` | Very High | Slow | Professional quality |

**Recommendation:** Use `sdxl-1.0` (default) for best balance!

---

## 🆘 Troubleshooting

### "API Key Invalid"

**Solution:**
1. Check `.env` file has correct key
2. No spaces around `=`
3. Restart server after adding key
4. Verify key is active in NanoBanana dashboard

### "Insufficient Credits"

**Solution:**
1. Go to NanoBanana dashboard
2. Check credit balance
3. Add more credits if needed
4. Minimum ₹3 required per generation

### "Generation Timeout"

**Solution:**
- NanoBanana might be experiencing high load
- Wait a few minutes and try again
- System will auto-retry or use placeholder

### "Image Not Showing"

**Solution:**
1. Check browser console for errors
2. Verify image URL is valid
3. Check CORS settings
4. Try refreshing page

---

## 💡 Cost Optimization Tips

### 1. Use Layout Mode for Testing
- Generate image once
- Download and reuse
- Add text locally in Photoshop/Canva
- Saves ₹3 per variation!

### 2. Cache Popular Memes
- Save generated images
- Reuse base images
- Only generate new ones when needed

### 3. Test with Placeholder First
- Remove API key temporarily
- Test your prompts with placeholders
- Add API key only when ready

### 4. Buy in Bulk
- Larger credit purchases sometimes have discounts
- Check for promotional offers

---

## 🔐 Security Best Practices

### Protect Your API Key:

✅ **DO:**
- Keep in `.env` file
- Add `.env` to `.gitignore`
- Never commit to Git
- Rotate keys periodically

❌ **DON'T:**
- Share publicly
- Commit to GitHub
- Hardcode in source files
- Share in screenshots

### If Key Leaked:

1. Go to NanoBanana dashboard
2. **Revoke** the leaked key
3. **Generate** new key
4. **Update** your `.env` file

---

## 📈 Scaling Up

### For Production:

1. **Set Budget Limits** in NanoBanana dashboard
2. **Monitor Usage** regularly
3. **Add Rate Limiting** in your app
4. **Cache Results** to avoid re-generation
5. **Implement Queue System** for high volume

### Cost Estimation:

```
Daily memes × ₹3 × 30 days = Monthly cost

Examples:
- 10 memes/day = ₹900/month
- 50 memes/day = ₹4,500/month
- 100 memes/day = ₹9,000/month
```

---

## 🎉 Quick Test

### Test Your Setup:

1. Add API key to `.env`
2. Restart server: `npm start`
3. Open frontend: `start frontend\index.html`
4. Select "Full Auto" mode
5. Enter: **"a happy cat"**
6. Click **"Generate Meme"**
7. Wait 10-30 seconds
8. See your generated meme! 🎨

### Check Console:

```
🍌 Using NanoBanana API for image generation...
⏳ NanoBanana job abc123 - Status: processing (1/60)
✅ NanoBanana image generated successfully!
💾 Meme saved with ID: 1
```

---

## 📞 Support

### NanoBanana Support:

- **Website:** https://nanobanana.com
- **Email:** support@nanobanana.com
- **Discord:** (check their website)
- **Docs:** https://docs.nanobanana.com

### Your App Issues:

- Check `NANOBANANA_SETUP.md` (this file)
- See `README.md` for general setup
- Check backend console for errors

---

## ✅ Setup Checklist

- [ ] Created NanoBanana account
- [ ] Added credits (minimum ₹100)
- [ ] Generated API key
- [ ] Added key to `.env` file
- [ ] Restarted backend server
- [ ] Tested image generation
- [ ] Verified credits deducted
- [ ] Meme displayed successfully

---

## 🎊 You're Ready!

Your meme generator now uses **NanoBanana API** for real AI image generation!

**Cost:** Just ₹3 per meme!

**Start generating amazing memes!** 🚀🎨

---

## 🔄 Alternative: If NanoBanana Doesn't Work

### Other Options:

1. **Replicate** (International, $0.04/image ≈ ₹3.30)
   - Add `REPLICATE_API_KEY` to `.env`
   - System will auto-fallback

2. **Stable Diffusion API** (Various providers)
   - Can integrate similarly

3. **Placeholder Mode** (Free!)
   - Remove all API keys
   - Shows placeholder images
   - Perfect for testing

---

**Happy meme generating!** 🍌✨

