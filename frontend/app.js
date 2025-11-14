document.addEventListener("DOMContentLoaded", () => {
    const modeSelect = document.getElementById("mode");
    const uploadBox = document.getElementById("upload-box");
    const manualTextBox = document.getElementById("manual-text-box");
    const generateBtn = document.getElementById("generateBtn");
    
    // Initialize compositor
    const compositor = new MemeCompositor();
  
    // Mode switching logic
    modeSelect.addEventListener("change", () => {
      const mode = modeSelect.value;
      const textOverlayToggle = document.getElementById("text-overlay-toggle");
  
      if (mode === "auto") {
        uploadBox.style.display = "none";
        manualTextBox.style.display = "none";
        textOverlayToggle.style.display = "none";
      }
      else if (mode === "layout") {
        uploadBox.style.display = "none";
        manualTextBox.style.display = "none";
        textOverlayToggle.style.display = "block";
      }
      else if (mode === "semiauto") {
        uploadBox.style.display = "block";
        manualTextBox.style.display = "none";
        textOverlayToggle.style.display = "none";
      }
      else if (mode === "manual") {
        uploadBox.style.display = "block";
        manualTextBox.style.display = "block";
        textOverlayToggle.style.display = "none";
      }
    });
  
    // Generate button logic
    generateBtn.addEventListener("click", async () => {
      const mode = modeSelect.value;
      const idea = document.getElementById("idea").value;
  
      let formData = new FormData();
      formData.append("mode", mode);
      formData.append("idea", idea);
  
      // If layout mode, check if user wants text overlay
      if (mode === "layout") {
        const addTextOverlay = document.getElementById("addTextOverlay").checked;
        formData.append("addTextOverlay", addTextOverlay);
      }
  
      // If semi-auto or manual → add file
      const file = document.getElementById("imageInput").files[0];
      if (file) {
        formData.append("image", file);
      }
  
      // If manual → add user caption
      if (mode === "manual") {
        const manualCaption = document.getElementById("manualCaption").value;
        formData.append("manualCaption", manualCaption);
      }
  
    // Show loading state
    generateBtn.textContent = "Generating...";
    generateBtn.disabled = true;

    try {
      // BACKEND CALL
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Error: ${data.error}\n${data.details || ''}`);
        return;
      }

      // Hide placeholder, show result
      document.getElementById("placeholder").style.display = "none";
      
      // Display meme spec JSON
      const jsonOutput = document.getElementById("jsonOutput");
      jsonOutput.textContent = JSON.stringify(data.memeSpec, null, 2);
      document.getElementById("copyJsonBtn").style.display = "block";

      // Render meme with text overlays in browser (or just show image)
      if (data.imageUrl && data.memeSpec) {
        const resultImage = document.getElementById("resultImage");
        const resultContainer = document.getElementById("resultContainer");
        
        // Check if this is layout-only mode without text
        const shouldAddText = mode !== "layout" || document.getElementById("addTextOverlay")?.checked !== false;
        
        if (shouldAddText && data.memeSpec.text_overlays && data.memeSpec.text_overlays.length > 0) {
          console.log("🎨 Composing meme with text overlays...");
          
          try {
            const finalMeme = await compositor.composeMeme(data.imageUrl, data.memeSpec);
            resultImage.src = finalMeme;
            resultContainer.style.display = "block";
            
            // Store for download
            window.currentMemeUrl = finalMeme;
            window.currentMemeSpec = data.memeSpec;
            
            console.log("✅ Meme generated successfully!");
          } catch (err) {
            console.error("Error composing meme:", err);
            // Fallback: show base image without text
            resultImage.src = data.imageUrl;
            resultContainer.style.display = "block";
            window.currentMemeUrl = data.imageUrl;
            window.currentMemeSpec = data.memeSpec;
            alert("Text overlay failed. Showing base image.");
          }
        } else {
          // Layout only - no text overlays
          console.log("📐 Layout-only mode: Showing base image without text");
          resultImage.src = data.imageUrl;
          resultContainer.style.display = "block";
          window.currentMemeUrl = data.imageUrl;
          window.currentMemeSpec = data.memeSpec;
          console.log("✅ Layout generated! You can add text later.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate meme. Make sure the backend is running on port 5000.");
    } finally {
      // Reset button
      generateBtn.textContent = "Generate Meme";
      generateBtn.disabled = false;
    }
    });

    // Download meme button
    document.getElementById("downloadBtn").addEventListener("click", () => {
      if (window.currentMemeUrl) {
        const link = document.createElement('a');
        link.download = `meme-${Date.now()}.png`;
        link.href = window.currentMemeUrl;
        link.click();
        console.log("💾 Meme downloaded!");
      }
    });

    // Download JSON button
    document.getElementById("downloadJsonBtn").addEventListener("click", () => {
      if (window.currentMemeSpec) {
        const dataStr = JSON.stringify(window.currentMemeSpec, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `meme-spec-${Date.now()}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        console.log("📄 JSON spec downloaded!");
      }
    });

    // Copy JSON button
    document.getElementById("copyJsonBtn").addEventListener("click", async () => {
      const jsonText = document.getElementById("jsonOutput").textContent;
      try {
        await navigator.clipboard.writeText(jsonText);
        const btn = document.getElementById("copyJsonBtn");
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>✓</span> Copied!';
        btn.style.background = 'var(--success)';
        btn.style.color = 'white';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });
  