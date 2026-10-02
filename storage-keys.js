/**
 * storage-keys.js - مدير مفاتيح الـ API والتخزين الآمن محلياً
 * يحفظ المفاتيح في localStorage مع طبقة تعتيم (Obfuscation) لمنع القراءة المباشرة
 */

class StorageKeysManager {
  constructor() {
    this.storagePrefix = "vcs_secure_";
    this.modal = document.getElementById("apiKeyModal");
    this.providerSelect = document.getElementById("providerSelect");
    this.openaiGroup = document.getElementById("openaiKeyGroup");
    this.geminiGroup = document.getElementById("geminiKeyGroup");
    this.openaiInput = document.getElementById("openAiKeyInput");
    this.geminiInput = document.getElementById("geminiKeyInput");
    this.missingKeyBanner = document.getElementById("missingKeyBanner");
    this.statusDot = document.getElementById("apiKeyStatusDot");

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadInitialKeys();
    this.updateStatusIndicator();
  }

  // تشفير وتعتيم أساسي للبيانات المحلية
  encodeKey(str) {
    if (!str) return "";
    return btoa(encodeURIComponent(str).split("").reverse().join(""));
  }

  decodeKey(encoded) {
    if (!encoded) return "";
    try {
      return decodeURIComponent(atob(encoded).split("").reverse().join(""));
    } catch (e) {
      return "";
    }
  }

  bindEvents() {
    // فتح وإغلاق النافذة المنبثقة
    const openBtn = document.getElementById("openApiSettingsBtn");
    const closeBtn = document.getElementById("closeApiModalBtn");
    const bannerBtn = document.getElementById("bannerSetupKeyBtn");

    if (openBtn) openBtn.addEventListener("click", () => this.openModal());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
    if (bannerBtn) bannerBtn.addEventListener("click", () => this.openModal());

    // إغلاق عند النقر خارج الصندوق
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // تبديل المزود
    if (this.providerSelect) {
      this.providerSelect.addEventListener("change", (e) => {
        this.switchProviderView(e.target.value);
      });
    }

    // زر إظهار/إخفاء كلمة المرور
    document.querySelectorAll(".btn-toggle-eye").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === "password" ? "text" : "password";
        }
      });
    });

    // حفظ المفاتيح
    const saveBtn = document.getElementById("saveKeysBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveKeys());
    }

    // مسح المفاتيح
    const clearBtn = document.getElementById("clearKeysBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearKeys());
    }
  }

  switchProviderView(provider) {
    if (provider === "openai") {
      this.openaiGroup.classList.remove("hidden");
      this.geminiGroup.classList.add("hidden");
    } else {
      this.openaiGroup.classList.add("hidden");
      this.geminiGroup.classList.remove("hidden");
    }
  }

  openModal() {
    this.loadInitialKeys();
    this.modal.classList.remove("hidden");
  }

  closeModal() {
    this.modal.classList.add("hidden");
  }

  saveKeys() {
    const selectedProvider = this.providerSelect.value;
    const openaiKey = this.openaiInput.value.trim();
    const geminiKey = this.geminiInput.value.trim();

    localStorage.setItem(this.storagePrefix + "provider", selectedProvider);

    if (openaiKey) {
      localStorage.setItem(this.storagePrefix + "openai", this.encodeKey(openaiKey));
    }
    if (geminiKey) {
      localStorage.setItem(this.storagePrefix + "gemini", this.encodeKey(geminiKey));
    }

    this.updateStatusIndicator();
    this.closeModal();
    alert(window.i18n ? (window.i18n.currentLang === "ar" ? "تم حفظ المفاتيح بنجاح محلياً!" : "Keys saved successfully!") : "Saved!");
  }

  clearKeys() {
    const confirmMsg = window.i18n && window.i18n.currentLang === "ar" 
      ? "هل أنت متأكد من رغبتك في حذف مفاتيحك المخزنة محلياً؟" 
      : "Are you sure you want to delete stored keys?";

    if (confirm(confirmMsg)) {
      localStorage.removeItem(this.storagePrefix + "openai");
      localStorage.removeItem(this.storagePrefix + "gemini");
      localStorage.removeItem(this.storagePrefix + "provider");

      this.openaiInput.value = "";
      this.geminiInput.value = "";
      this.updateStatusIndicator();
      this.closeModal();
    }
  }

  loadInitialKeys() {
    const savedProvider = localStorage.getItem(this.storagePrefix + "provider") || "openai";
    this.providerSelect.value = savedProvider;
    this.switchProviderView(savedProvider);

    const savedOpenAI = this.decodeKey(localStorage.getItem(this.storagePrefix + "openai"));
    const savedGemini = this.decodeKey(localStorage.getItem(this.storagePrefix + "gemini"));

    if (savedOpenAI) this.openaiInput.value = savedOpenAI;
    if (savedGemini) this.geminiInput.value = savedGemini;
  }

  getActiveCredentials() {
    const provider = localStorage.getItem(this.storagePrefix + "provider") || "openai";
    let key = "";

    if (provider === "openai") {
      key = this.decodeKey(localStorage.getItem(this.storagePrefix + "openai"));
    } else {
      key = this.decodeKey(localStorage.getItem(this.storagePrefix + "gemini"));
    }

    return { provider, key };
  }

  hasValidKey() {
    const { key } = this.getActiveCredentials();
    return Boolean(key && key.length > 10);
  }

  updateStatusIndicator() {
    const valid = this.hasValidKey();

    if (this.statusDot) {
      this.statusDot.classList.toggle("dot-active", valid);
      this.statusDot.classList.toggle("dot-inactive", !valid);
    }

    if (this.missingKeyBanner) {
      this.missingKeyBanner.classList.toggle("hidden", valid);
    }
  }
}

window.storageKeys = new StorageKeysManager();
