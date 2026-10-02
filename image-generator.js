/**
 * image-generator.js - محرك توليد الصور والاتصال بـ APIs (DALL-E 3 / Google Imagen)
 * معالجة الصور المرجعة، تنزيلها، وتجهيزها للإدراج
 */

class ImageGeneratorEngine {
  constructor() {
    this.generateBtn = document.getElementById("generateVisualBtn");
    this.statusBadge = document.getElementById("generatorStatusBadge");
    this.previewArea = document.getElementById("imagePreviewArea");
    this.resultCard = document.getElementById("imageResultCard");
    this.resultImg = document.getElementById("renderedResultImg");
    this.downloadBtn = document.getElementById("downloadImageBtn");
    this.loader = document.getElementById("globalLoader");
    this.loaderMsg = document.getElementById("loaderMessage");

    this.currentGeneratedImageUrl = "";
    this.currentConceptName = "";

    this.init();
  }

  init() {
    if (this.generateBtn) {
      this.generateBtn.addEventListener("click", () => this.generateVisual());
    }
  }

  setLoading(isLoading, msg = "") {
    if (this.statusBadge) {
      this.statusBadge.textContent = isLoading
        ? (window.i18n ? window.i18n.t("studio_rendering") : "جاري التوليد...")
        : (window.i18n ? window.i18n.t("studio_ready") : "جاهز");
    }

    if (this.loader) {
      if (isLoading) {
        this.loader.classList.remove("hidden");
        if (this.loaderMsg) this.loaderMsg.textContent = msg;
      } else {
        this.loader.classList.add("hidden");
      }
    }

    if (this.generateBtn) {
      this.generateBtn.disabled = isLoading;
    }
  }

  async generateVisual() {
    if (!window.storageKeys || !window.storageKeys.hasValidKey()) {
      alert(window.i18n ? window.i18n.t("missing_key_warning") : "يرجى إدخال مفتاح الـ API أولاً.");
      if (window.storageKeys) window.storageKeys.openModal();
      return;
    }

    if (!window.visualStyles) return;

    const fullPrompt = window.visualStyles.composeFullPrompt();
    this.currentConceptName = document.getElementById("targetConceptDisplay")?.textContent.trim() || "مفهوم دراسي";

    const { provider, key } = window.storageKeys.getActiveCredentials();

    this.setLoading(true, `جاري رسم وتوضيح: "${this.currentConceptName}"...`);

    try {
      let imageUrl = "";
      if (provider === "openai") {
        imageUrl = await this.callOpenAIDallE(key, fullPrompt);
      } else {
        imageUrl = await this.callGeminiImagen(key, fullPrompt);
      }

      this.displayResult(imageUrl);
    } catch (err) {
      console.error("Image Generation Failed:", err);
      alert(`فشل توليد الرسم التوضيحي: ${err.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async callOpenAIDallE(key, prompt) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "خطأ أثناء طلب الصورة من OpenAI");
    }

    const data = await res.json();
    return data.data[0].url;
  }

  async callGeminiImagen(key, prompt) {
    // الاتصال بموديل توليد الصور Imagen 3 من Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: prompt.slice(0, 1000) }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "خطأ أثناء استدعاء Imagen من Google");
    }

    const data = await res.json();
    const base64Data = data.predictions[0].bytesBase64Encoded;
    return `data:image/png;base64,${base64Data}`;
  }

  displayResult(imageUrl) {
    this.currentGeneratedImageUrl = imageUrl;

    if (this.previewArea) {
      this.previewArea.classList.remove("empty");
      const placeholder = this.previewArea.querySelector(".preview-placeholder");
      if (placeholder) placeholder.classList.add("hidden");
    }

    if (this.resultCard) this.resultCard.classList.remove("hidden");
    if (this.resultImg) {
      this.resultImg.src = imageUrl;
      this.resultImg.alt = this.currentConceptName;
    }

    if (this.downloadBtn) {
      this.downloadBtn.href = imageUrl;
      this.downloadBtn.download = `${this.currentConceptName.replace(/\s+/g, "_")}.png`;
    }
  }
}

window.imageGenerator = new ImageGeneratorEngine();
