import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

// Import services
import memeOrchestrator from "./services/memeOrchestrator.js";
import imageGenerator from "./services/imageGenerator.js";
import captionGenerator from "./services/captionGenerator.js";
import database from "./services/database.js";
// Note: Text composition moved to browser (no canvas dependency needed!)

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const mode = req.body.mode;
    const idea = req.body.idea;
    const manualCaption = req.body.manualCaption || "";
    const file = req.file;

    if (!idea && (mode === "auto" || mode === "layout")) {
      return res.status(400).json({ error: "Please provide a meme idea" });
    }

    let memeSpec = null;
    let finalImageBuffer = null;
    let imageUrl = null;

    // 1️⃣ FULL AUTO MODE - Generate everything
    if (mode === "auto" || mode === "layout") {
      const isLayoutOnly = mode === "layout";
      const addTextOverlay = req.body.addTextOverlay === "true" || req.body.addTextOverlay === true;
      console.log(`🤖 ${isLayoutOnly ? 'LAYOUT' : 'AUTO'} MODE: Generating meme from idea...`);
      
      // Step 1: Generate captions from idea (or use placeholders for layout-only)
      let captions, positions;
      if (isLayoutOnly && !addTextOverlay) {
        // Layout only - create text placeholders but don't render them
        captions = ["PLACEHOLDER TEXT"];
        positions = ["top"];
        console.log("📐 Layout-only mode: Creating placeholders without text");
      } else {
        // Generate actual captions
        const result = await captionGenerator.generateCaptionsWithPositions(idea, 2);
        captions = result.captions;
        positions = result.positions;
        console.log("📝 Generated captions:", captions);
      }

      // Step 2: Create full meme specification
      memeSpec = memeOrchestrator.generateMemeSpec(idea, captions, positions);
      
      // If layout-only without text, clear text overlays
      if (isLayoutOnly && !addTextOverlay) {
        memeSpec.text_overlays = [];
        console.log("📐 Removed text overlays for layout-only mode");
      }
      
      console.log("📋 Created meme spec");

      // Validate spec
      const validation = memeOrchestrator.validateSpec(memeSpec);
      if (!validation.valid) {
        console.error("❌ Spec validation failed:", validation.errors);
        return res.status(400).json({ error: "Invalid meme spec", details: validation.errors });
      }

      // Step 3: Generate base image
      console.log("🎨 Generating base image...");
      const imageResult = await imageGenerator.generateImage(memeSpec);
      
      // Return base image URL - text will be rendered in browser (if applicable)!
      imageUrl = imageResult.url;
      if (isLayoutOnly && !addTextOverlay) {
        console.log("✅ Base image ready! (Layout-only, no text)");
      } else {
        console.log("✅ Base image ready! Text will be overlaid in browser.");
      }
    }

    // 2️⃣ SEMI AUTO MODE - User image + AI captions
    else if (mode === "semiauto") {
      if (!file) {
        return res.status(400).json({ error: "Please upload an image" });
      }

      console.log("🤖 SEMI-AUTO MODE: Generating captions for uploaded image...");

      // Generate captions
      const { captions, positions } = await captionGenerator.generateCaptionsWithPositions(
        idea || "funny meme",
        2
      );
      console.log("📝 Generated captions:", captions);

      // Create meme spec
      memeSpec = memeOrchestrator.generateMemeSpec(idea || "uploaded image meme", captions, positions);
      
      // Convert uploaded image to base64 - text will be rendered in browser
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      console.log("✅ Image ready! Text will be overlaid in browser.");
    }

    // 3️⃣ MANUAL MODE - User image + User text
    else if (mode === "manual") {
      if (!file) {
        return res.status(400).json({ error: "Please upload an image" });
      }

      if (!manualCaption) {
        return res.status(400).json({ error: "Please provide caption text" });
      }

      console.log("✍️ MANUAL MODE: Adding user text to image...");

      // Split manual caption into lines if needed
      const captions = [manualCaption];
      const positions = ['top'];

      // Create meme spec
      memeSpec = memeOrchestrator.generateMemeSpec(
        idea || "manual meme",
        captions,
        positions
      );

      // Convert uploaded image to base64 - text will be rendered in browser
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      console.log("✅ Image ready! Text will be overlaid in browser.");
    }

    // Save to database (optional - only if successful)
    let memeId = null;
    try {
      if (memeSpec && imageUrl) {
        memeId = database.saveMeme(mode, idea, imageUrl, memeSpec);
      }
    } catch (dbErr) {
      console.warn('⚠️  Database save failed (continuing):', dbErr.message);
    }

    // Return response
    return res.json({
      success: true,
      memeSpec,
      imageUrl,
      mode,
      memeId  // Include database ID if saved
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ========================================
// DATABASE ENDPOINTS
// ========================================

// Get all memes
app.get("/memes", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const memes = await database.getAllMemes(limit, offset);
    res.json({ success: true, memes, count: memes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single meme by ID
app.get("/memes/:id", async (req, res) => {
  try {
    const meme = await database.getMeme(parseInt(req.params.id));
    if (meme) {
      res.json({ success: true, meme });
    } else {
      res.status(404).json({ success: false, error: "Meme not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get memes by mode
app.get("/memes/mode/:mode", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const memes = await database.getMemesByMode(req.params.mode, limit);
    res.json({ success: true, memes, count: memes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Search memes
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: "Query parameter 'q' required" });
    }
    const limit = parseInt(req.query.limit) || 50;
    const memes = await database.searchMemes(query, limit);
    res.json({ success: true, memes, count: memes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete meme
app.delete("/memes/:id", async (req, res) => {
  try {
    const deleted = await database.deleteMeme(parseInt(req.params.id));
    if (deleted) {
      res.json({ success: true, message: "Meme deleted" });
    } else {
      res.status(404).json({ success: false, error: "Meme not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get statistics
app.get("/stats", async (req, res) => {
  try {
    const stats = await database.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent memes
app.get("/recent", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const memes = await database.getRecentMemes(days);
    res.json({ success: true, memes, count: memes.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Meme Generator Backend running on http://localhost:${PORT}`);
  console.log(`📝 Auto mode: AI generates image + captions`);
  console.log(`🖼️  Semi-auto mode: Your image + AI captions`);
  console.log(`✍️  Manual mode: Your image + your text`);
});
